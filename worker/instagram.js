// Instagram Webhook + Keyword Automation
// Follower AI

export async function handleInstagramWebhook(request, env) {
  const url = new URL(request.url);

  // Meta webhook verification
  if (request.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token && challenge) {
      if (token === (env.INSTAGRAM_VERIFY_TOKEN || "")) {
        return new Response(challenge, {
          status: 200,
          headers: { "Content-Type": "text/plain" }
        });
      }

      return new Response("Forbidden", { status: 403 });
    }

    return new Response("Instagram Webhook is ready", { status: 200 });
  }

  // Receive Instagram webhook events
  if (request.method === "POST") {
    try {
      const body = await request.json();

      console.log("Instagram webhook event:", JSON.stringify(body));

      // Process asynchronously so Meta gets a fast response
      const process = processInstagramEvent(body, env);

      if (typeof request.waitUntil === "function") {
        request.waitUntil(process);
      }

      return new Response("EVENT_RECEIVED", { status: 200 });
    } catch (error) {
      console.error("Instagram webhook error:", error);

      return new Response("Bad Request", { status: 400 });
    }
  }

  return new Response("Method Not Allowed", { status: 405 });
}

async function processInstagramEvent(body, env) {
  if (!body || !Array.isArray(body.entry)) return;

  for (const entry of body.entry) {
    const changes = Array.isArray(entry.changes) ? entry.changes : [];

    for (const change of changes) {
      const value = change.value || {};

      // Comment event
      if (change.field === "comments") {
        await handleComment(value, env);
      }
    }
  }
}

async function handleComment(value, env) {
  const commentText =
    value.text ||
    value.message ||
    "";

  const normalized = commentText
    .toString()
    .trim()
    .toLowerCase();

  if (!normalized) return;

  // Demo keyword rules
  const rules = [
    {
      keywords: ["قیمت", "قیمت؟", "price"],
      reply:
        "سلام 🔥 برای دریافت قیمت و اطلاعات بیشتر، پیام خصوصی رو چک کن."
    },
    {
      keywords: ["لینک", "لینک؟", "link"],
      reply:
        "حتماً 🔥 لینک برات ارسال میشه."
    },
    {
      keywords: ["اطلاعات", "info"],
      reply:
        "حتماً رفیق 🔥 اطلاعات کامل رو برات می‌فرستیم."
    }
  ];

  const matchedRule = rules.find(rule =>
    rule.keywords.some(keyword => normalized.includes(keyword))
  );

  if (!matchedRule) return;

  console.log("Matched keyword:", matchedRule);
  
  // Instagram API action will be connected in the next step.
  // We intentionally do not send anything until the Meta credentials
  // and permissions are configured securely.
}
