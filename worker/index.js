const DEFAULT_MODEL = "@cf/zai-org/glm-4.7-flash";
const GRAPH_BASE_URL = "https://graph.facebook.com";

function getAllowedOrigin(request, env) {
  const origin = request.headers.get("Origin");
  const configured = (env.ALLOWED_ORIGINS || "*").split(",").map((value) => value.trim()).filter(Boolean);
  if (configured.includes("*") || (origin && configured.includes(origin))) return configured.includes("*") ? "*" : origin;
  return "null";
}

function corsHeaders(request, env) {
  return {
    "Access-Control-Allow-Origin": getAllowedOrigin(request, env),
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Hub-Signature-256, X-Test-Endpoint-Token",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store",
    Vary: "Origin"
  };
}

function json(request, env, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=UTF-8", ...corsHeaders(request, env) }
  });
}

function text(request, env, value, status = 200) {
  return new Response(value, { status, headers: corsHeaders(request, env) });
}

function requestId(request) {
  return request.headers.get("CF-Ray") || crypto.randomUUID();
}

function log(level, message, details = {}) {
  console[level](JSON.stringify({ service: "follower-ai", level, message, ...details }));
}

function extractCompletionText(value) {
  if (!value || typeof value !== "object") return "";

  const content = value.choices?.[0]?.message?.content;

  if (typeof content === "string") return content;

  if (Array.isArray(content)) {
    return content.map((part) => typeof part === "string" ? part : part?.text || "").join("");
  }

  if (typeof value.output_text === "string") return value.output_text;
  if (typeof value.text === "string") return value.text;

  return "";
}

function getAiText(result) {
  if (typeof result === "string") {
    try {
      const parsed = JSON.parse(result);
      const completion = extractCompletionText(parsed);

      if (completion) return completion;
    } catch {
      // Plain text response.
    }

    return result;
  }

  return extractCompletionText(result) || (typeof result?.response === "string" ? result.response : "");
}

function parseRules(env) {
  const raw = env.KEYWORD_RULES || "[]";
  try {
    const rules = JSON.parse(raw);
    if (!Array.isArray(rules)) throw new Error("KEYWORD_RULES must be a JSON array");
    return rules
      .filter((rule) => rule && Array.isArray(rule.keywords))
      .map((rule, index) => ({
        id: String(rule.id || `rule-${index + 1}`),
        keywords: rule.keywords.filter((keyword) => typeof keyword === "string").map((keyword) => keyword.trim().toLocaleLowerCase()).filter(Boolean),
        reply: typeof rule.reply === "string" ? rule.reply.trim() : "",
        sendDm: rule.sendDm === true,
        dm: typeof rule.dm === "string" ? rule.dm.trim() : ""
      }))
      .filter((rule) => rule.keywords.length > 0);
  } catch (error) {
    throw new Error(`Invalid KEYWORD_RULES: ${error.message}`);
  }
}

function findKeywordRule(textValue, rules) {
  const normalized = String(textValue || "").toLocaleLowerCase();
  return rules.find((rule) => rule.keywords.some((keyword) => normalized.includes(keyword))) || null;
}

async function generateAiReply(env, commentText, rule) {
  if (!env.AI) throw new Error("Workers AI binding is missing");
  const result = await env.AI.run(env.AI_MODEL || DEFAULT_MODEL, {
    messages: [
      { role: "system", content: "تو دستیار رسمی یک پیج اینستاگرام هستی. فقط یک پاسخ کوتاه، محترمانه و طبیعی به زبان فارسی بنویس. پاسخ نباید اسپم، فریبنده، حاوی وعده قطعی یا دعوت به فالو/آنفالو باشد. حداکثر 280 کاراکتر." },
      { role: "user", content: `کامنت کاربر: ${commentText}\nراهنمای پاسخ برند: ${rule.reply || "به کامنت مرتبط و مفید پاسخ بده."}` }
    ]
  });
  const answer = getAiText(result).trim();
  if (!answer) throw new Error("Cloudflare AI returned an empty response");
  return answer.slice(0, 280);
}

function graphVersion(env) {
  return (env.META_GRAPH_API_VERSION || "v23.0").replace(/^\//, "");
}

async function metaRequest(env, path, body) {
  if (!env.META_ACCESS_TOKEN) throw new Error("META_ACCESS_TOKEN is not configured");
  const response = await fetch(`${GRAPH_BASE_URL}/${graphVersion(env)}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.META_ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const raw = await response.text();
  let data;
  try { data = JSON.parse(raw); } catch { data = { raw: raw.slice(0, 300) }; }
  if (!response.ok || data.error) throw new Error(`Meta API ${response.status}: ${data.error?.message || "request failed"}`);
  return data;
}

async function replyToComment(env, commentId, message) {
  return metaRequest(env, `/${encodeURIComponent(commentId)}/replies`, { message });
}

async function sendInstagramDm(env, recipientId, message) {
  if (!env.META_INSTAGRAM_ACCOUNT_ID) throw new Error("META_INSTAGRAM_ACCOUNT_ID is not configured");
  return metaRequest(env, `/${encodeURIComponent(env.META_INSTAGRAM_ACCOUNT_ID)}/messages`, {
    recipient: { id: recipientId },
    message: { text: message }
  });
}

function timingSafeEqual(left, right) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return result === 0;
}

async function verifySignature(body, signature, secret) {
  if (!signature || !secret) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const expected = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return timingSafeEqual(signature, `sha256=${expected}`);
}

function extractCommentEvents(payload) {
  const events = [];
  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      if (change.field !== "comments" || !change.value?.id) continue;
      events.push({ commentId: String(change.value.id), text: String(change.value.text || ""), senderId: change.value.from?.id ? String(change.value.from.id) : "" });
    }
  }
  return events;
}

async function handleWebhook(request, env, id) {
  if (!env.META_APP_SECRET) return json(request, env, { success: false, error: "Webhook signature secret is not configured" }, 503);
  const body = await request.text();
  if (!await verifySignature(body, request.headers.get("X-Hub-Signature-256"), env.META_APP_SECRET)) return json(request, env, { success: false, error: "Invalid webhook signature" }, 401);
  let payload;
  try { payload = JSON.parse(body); } catch { return json(request, env, { success: false, error: "Invalid JSON payload" }, 400); }

  let rules;
  try { rules = parseRules(env); } catch (error) {
    log("error", error.message, { requestId: id });
    return json(request, env, { success: false, error: "Webhook configuration is invalid" }, 500);
  }

  const events = extractCommentEvents(payload);
  let processed = 0;
  for (const event of events) {
    if (event.senderId && event.senderId === String(env.META_INSTAGRAM_ACCOUNT_ID || "")) continue;
    const rule = findKeywordRule(event.text, rules);
    if (!rule) continue;
    try {
      const reply = await generateAiReply(env, event.text, rule);
      await replyToComment(env, event.commentId, reply);
      if (rule.sendDm && event.senderId && rule.dm) await sendInstagramDm(env, event.senderId, rule.dm);
      processed += 1;
      log("info", "Processed comment automation", { requestId: id, ruleId: rule.id, commentId: event.commentId });
    } catch (error) {
      log("error", "Comment automation failed", { requestId: id, ruleId: rule.id, error: error.message });
    }
  }
  return json(request, env, { success: true, received: events.length, processed });
}

async function handleTestKeyword(request, env) {
  const url = new URL(request.url);
  const supplied = request.headers.get("X-Test-Endpoint-Token") || url.searchParams.get("token");
  if (!env.TEST_ENDPOINT_TOKEN || !timingSafeEqual(String(supplied || ""), String(env.TEST_ENDPOINT_TOKEN))) return json(request, env, { success: false, error: "Not found" }, 404);
  try {
    const rule = findKeywordRule(url.searchParams.get("text") || "", parseRules(env));
    return json(request, env, { success: true, matched: Boolean(rule), rule: rule ? { id: rule.id, sendDm: rule.sendDm } : null });
  } catch {
    return json(request, env, { success: false, error: "Invalid keyword configuration" }, 500);
  }
}

async function handleAiPrompt(request, env, prompt) {
  if (!env.AI) return json(request, env, { success: false, error: "Workers AI binding is missing" }, 500);
  const result = await env.AI.run(env.AI_MODEL || DEFAULT_MODEL, {
    messages: [
      { role: "system", content: "تو Follower AI هستی؛ یک استراتژیست حرفه‌ای رشد ارگانیک اینستاگرام. همیشه فارسی، دقیق، کاربردی و حرفه‌ای پاسخ بده. هرگز اسپم، فالو/آنفالو خودکار یا دایرکت انبوه پیشنهاد نده." },
      { role: "user", content: prompt }
    ]
  });
  const answer = getAiText(result).trim();
  if (!answer) return json(request, env, { success: false, error: "Cloudflare AI returned an empty response" }, 502);
  return json(request, env, { success: true, response: answer });
}

export const internals = { getAiText, findKeywordRule, parseRules, extractCommentEvents, timingSafeEqual, verifySignature };

export default {
  async fetch(request, env) {
    const id = requestId(request);
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    try {
      if (request.method === "GET" && (url.pathname === "/webhook" || url.pathname === "/webhooks/instagram")) {
        const verifyToken = env.META_VERIFY_TOKEN || env.INSTAGRAM_VERIFY_TOKEN;
        if (url.searchParams.get("hub.mode") !== "subscribe" || url.searchParams.get("hub.verify_token") !== verifyToken) return text(request, env, "Forbidden", 403);
        return text(request, env, url.searchParams.get("hub.challenge") || "");
      }
      if (request.method === "POST" && (url.pathname === "/webhook" || url.pathname === "/webhooks/instagram")) return handleWebhook(request, env, id);
      if (request.method === "GET" && url.pathname === "/api/test/keyword") return handleTestKeyword(request, env);
      if (request.method === "GET") {
        const prompt = (url.searchParams.get("prompt") || "").trim();
        if (!prompt) return json(request, env, { success: true, message: "🔥 Follower AI is online", ai: Boolean(env.AI) });
        return handleAiPrompt(request, env, prompt);
      }
      return json(request, env, { success: false, error: "Method not allowed" }, 405);
    } catch (error) {
      log("error", "Unhandled request error", { requestId: id, path: url.pathname, error: error.message });
      return json(request, env, { success: false, error: "Internal server error", requestId: id }, 500);
    }
  }
};
