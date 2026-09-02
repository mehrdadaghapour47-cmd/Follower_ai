const ALLOWED_ORIGIN = "https://mehrdadaghapour47-cmd.github.io";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      ...corsHeaders()
    }
  });
}

export default {
  async fetch(request, env) {

    // CORS PREFLIGHT
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders()
      });
    }

    // HEALTH CHECK
    if (request.method === "GET") {
      return json({
        success: true,
        message: "🔥 Follower AI is online",
        ai: !!env.AI
      });
    }

    // ONLY POST
    if (request.method !== "POST") {
      return json({
        success: false,
        error: "Method Not Allowed"
      }, 405);
    }

    try {

      // Check AI binding
      if (!env.AI) {
        return json({
          success: false,
          error: "Workers AI binding is missing"
        }, 500);
      }

      const body = await request.json();

      const prompt =
        typeof body.prompt === "string"
          ? body.prompt.trim()
          : "";

      if (!prompt) {
        return json({
          success: false,
          error: "Prompt is required"
        }, 400);
      }

      const result = await env.AI.run(
        "@cf/zai-org/glm-4.7-flash",
        {
          messages: [
            {
              role: "system",
              content:
                "تو Follower AI هستی؛ یک استراتژیست حرفه‌ای رشد ارگانیک اینستاگرام. همیشه فارسی، دقیق، کاربردی و حرفه‌ای پاسخ بده. روی فالوور هدفمند، ایده ریلز، Hook، CTA، Retention، تعامل، Share، Save و برند شخصی تمرکز کن. هرگز اسپم، فالو/آنفالو خودکار یا دایرکت انبوه پیشنهاد نده."
            },
            {
              role: "user",
              content: prompt
            }
          ]
        }
      );

      let aiText = "";

      if (typeof result === "string") {
        aiText = result;
      } else if (result && typeof result.response === "string") {
        aiText = result.response;
      } else if (result && typeof result.output_text === "string") {
        aiText = result.output_text;
      } else if (result && typeof result.text === "string") {
        aiText = result.text;
      }

      if (!aiText && result) {
        aiText = JSON.stringify(result);
      }

      if (!aiText || !aiText.trim()) {
        return json({
          success: false,
          error: "Cloudflare AI returned an empty response"
        }, 502);
      }

      return json({
        success: true,
        response: aiText
      });

    } catch (error) {

      console.error("Follower AI ERROR:", error);

      return json({
        success: false,
        error: error?.message || "AI request failed"
      }, 500);
    }
  }
};
