import { handleInstagramWebhook } from "./instagram.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Cache-Control": "no-store"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      ...corsHeaders
    }
  });
}

export default {
  async fetch(request, env) {

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    const url = new URL(request.url);

    // Instagram Webhook
    if (url.pathname === "/webhooks/instagram") {
      return handleInstagramWebhook(request, env);
    }

    // Only GET for AI endpoint
    if (request.method !== "GET") {
      return json({
        success: false,
        error: "Only GET is allowed on the AI endpoint"
      }, 405);
    }

    try {
      const prompt = (url.searchParams.get("prompt") || "").trim();

      // Health check
      if (!prompt) {
        return json({
          success: true,
          message: "🔥 Follower AI is online",
          ai: !!env.AI,
          instagramWebhook: "/webhooks/instagram"
        });
      }

      if (!env.AI) {
        return json({
          success: false,
          error: "Workers AI binding is missing"
        }, 500);
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

      if (
        result?.choices?.[0]?.message?.content &&
        typeof result.choices[0].message.content === "string"
      ) {
        aiText = result.choices[0].message.content;
      } else if (
        result?.response &&
        typeof result.response === "string"
      ) {
        aiText = result.response;
      } else if (
        result?.output_text &&
        typeof result.output_text === "string"
      ) {
        aiText = result.output_text;
      } else if (
        result?.text &&
        typeof result.text === "string"
      ) {
        aiText = result.text;
      }

      if (!aiText || !aiText.trim()) {
        return json({
          success: false,
          error: "Cloudflare AI returned an empty response"
        }, 502);
      }

      return json({
        success: true,
        response: aiText.trim()
      });

    } catch (error) {
      return json({
        success: false,
        error: error?.message || "AI request failed"
      }, 500);
    }
  }
};
