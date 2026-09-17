import { createHmac, timingSafeEqual } from "node:crypto";
import { analyzeWithAI } from "./modules/ai/analyzer.js";
import { fetchInstagramData } from "./modules/instagram/connector.js";
import { validateInstagramInput } from "./modules/security/validation.js";

export function getAllowedOrigin(request, env = {}) {
  const origin = request.headers.get("Origin");
  const configured = (env.ALLOWED_ORIGINS || "*")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (configured.includes("*")) return "*";
  if (origin && configured.includes(origin)) return origin;

  return "null";
}

export async function verifySignature(body, providedSignature, secret) {
  if (!body || !providedSignature || !secret) return false;

  const expectedPrefix = "sha256=";
  if (!providedSignature.startsWith(expectedPrefix)) return false;

  const expected = createHmac("sha256", secret).update(body).digest("hex");
  const actual = providedSignature.slice(expectedPrefix.length);

  if (expected.length !== actual.length) return false;

  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(actual, "hex"));
  } catch {
    return false;
  }
}

export const internals = {
  getAllowedOrigin,
  verifySignature
};

function jsonResponse(payload, init = {}, request, env) {
  const headers = new Headers(init.headers || {});
  const origin = getAllowedOrigin(request, env);
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Test-Endpoint-Token, X-Hub-Signature-256");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Content-Type", "application/json;charset=UTF-8");

  return new Response(JSON.stringify(payload), { ...init, headers });
}

function parseKeywordRules(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function matchKeywordRule(text, rules) {
  const normalized = String(text || "").trim().toLowerCase();
  if (!normalized) return null;

  for (const rule of rules) {
    const keywords = Array.isArray(rule?.keywords) ? rule.keywords : [];
    const matched = keywords.some((keyword) => String(keyword || "").toLowerCase().includes(normalized) || normalized.includes(String(keyword || "").toLowerCase()));
    if (matched) return { ...rule, matchedKeywords: keywords };
  }

  return null;
}

const worker = {
  async fetch(request, env = {}, ctx) {
    const url = new URL(request.url);
    const origin = getAllowedOrigin(request, env);
    const corsHeaders = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Test-Endpoint-Token, X-Hub-Signature-256",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === "/") {
      const prompt = url.searchParams.get("prompt");

      if (prompt) {
        const aiResult = await analyzeWithAI(env, { prompt });
        if (!aiResult.available) {
          return jsonResponse({ success: true, response: "AI binding unavailable" }, { status: 200 }, request, env);
        }

        return jsonResponse({ success: true, response: aiResult.result?.summary || JSON.stringify(aiResult.result) }, { status: 200 }, request, env);
      }

      return jsonResponse({ success: true, message: "🔥 Follower AI is online", ai: Boolean(env.AI) }, { status: 200 }, request, env);
    }

    if (url.pathname === "/webhook") {
      if (request.method === "GET") {
        const mode = url.searchParams.get("hub.mode");
        const token = url.searchParams.get("hub.verify_token");
        const challenge = url.searchParams.get("hub.challenge");

        if (mode === "subscribe" && token && challenge) {
          if (token === (env.META_VERIFY_TOKEN || "")) {
            return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain", ...corsHeaders } });
          }

          return new Response("Forbidden", { status: 403, headers: corsHeaders });
        }

        return new Response("Instagram Webhook is ready", { status: 200, headers: corsHeaders });
      }

      if (request.method === "POST") {
        const signatureHeader = request.headers.get("X-Hub-Signature-256");
        const rawBody = await request.text();

        if (!signatureHeader || !(await verifySignature(rawBody, signatureHeader, env.META_APP_SECRET || ""))) {
          return new Response("Unauthorized", { status: 401, headers: corsHeaders });
        }

        try {
          const payload = JSON.parse(rawBody || "{}");
          return jsonResponse({ success: true, received: true, payload }, { status: 200 }, request, env);
        } catch {
          return new Response("Bad Request", { status: 400, headers: corsHeaders });
        }
      }
    }

    if (url.pathname === "/api/test/keyword") {
      const tokenFromQuery = url.searchParams.get("token");
      const tokenFromHeader = request.headers.get("X-Test-Endpoint-Token");
      const providedToken = tokenFromQuery || tokenFromHeader;

      if (!providedToken || providedToken !== (env.TEST_ENDPOINT_TOKEN || "")) {
        return jsonResponse({ success: false, error: "Unauthorized" }, { status: 401 }, request, env);
      }

      const text = url.searchParams.get("text") || "";
      const rules = parseKeywordRules(env.KEYWORD_RULES);
      const matchedRule = matchKeywordRule(text, rules);

      if (!matchedRule) {
        return jsonResponse({ success: true, matched: false }, { status: 200 }, request, env);
      }

      return jsonResponse({
        success: true,
        matched: true,
        rule: { id: matchedRule.id, sendDm: Boolean(matchedRule.sendDm) }
      }, { status: 200 }, request, env);
    }

    if (url.pathname === "/api/audit") {
      if (request.method !== "POST") {
        return jsonResponse({ success: false, error: "Method not allowed" }, { status: 405 }, request, env);
      }

      let payload = {};
      try {
        payload = await request.json();
      } catch {
        payload = {};
      }

      const input = payload?.input || payload?.profile?.username || "";
      const profile = payload?.profile || {};
      const content = payload?.content || profile?.bio || "";
      const validated = validateInstagramInput(input || profile.username || "");
      const baseAudit = {
        integration: {
          instagram: { status: "not_configured" }
        },
        coverage: {
          instagramApi: false
        },
        audit: {
          profile: {
            checks: {
              username: Boolean(validated.valid || profile.username)
            },
            score: validated.valid ? 85 : 60
          }
        }
      };

      if (env.META_ACCESS_TOKEN && env.META_INSTAGRAM_ACCOUNT_ID) {
        const result = await fetchInstagramData(env, { fetcher: globalThis.fetch });
        if (result?.integration?.configured) {
          baseAudit.integration.instagram = {
            status: result.integration.status || "connected",
            instagramUserId: result.integration.instagramUserId || env.META_INSTAGRAM_ACCOUNT_ID
          };
          baseAudit.coverage.instagramApi = true;
          baseAudit.audit.profile.checks.username = true;
          baseAudit.audit.profile.score = 85;
        }
      }

      const aiResult = await analyzeWithAI(env, {
        input,
        profile,
        content,
        audit: baseAudit.audit,
        integration: baseAudit.integration,
        coverage: baseAudit.coverage
      });

      let response = "";
      if (aiResult?.available) {
        const result = aiResult.result;

        if (typeof result === "string") {
          response = result;
        } else if (result?.summary) {
          response = String(result.summary);
        } else if (result && typeof result === "object") {
          response = JSON.stringify(result, null, 2);
        }
      }

      if (!response) {
        response =
          `تحلیل پایه Follower AI 2.0\n\n` +
          `امتیاز پروفایل: ${baseAudit.audit.profile.score}/100\n` +
          `وضعیت اینستاگرام: ${baseAudit.integration.instagram.status}\n\n` +
          "برای تحلیل دقیق‌تر، داده‌های بیشتری وارد کنید.";
      }

      return jsonResponse({
        success: true,
        response,
        ai: Boolean(aiResult?.available),
        model: aiResult?.model || null,
        ...baseAudit
      }, { status: 200 }, request, env);
    }

    return jsonResponse({ success: false, error: "Not found" }, { status: 404 }, request, env);
  }
};

export default worker;
