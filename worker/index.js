const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
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

    if (request.method !== "GET") {
      return json({
        success: false,
        error: "Only GET is allowed"
      }, 405);
    }

    try {
      const url = new URL(request.url);
      const prompt = (url.searchParams.get("prompt") || "").trim();

      if (!prompt) {
        return json({
          success: true,
          message: "🔥 Follower AI is online",
          ai: !!env.AI
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

      if (typeof result === "string") {
        aiText = result;
      } else if (result?.response && typeof result.response === "string") {
        aiText = result.response;
      } else if (result?.output_text && typeof result.output_text === "string") {
        aiText = result.output_text;
      } else if (result?.text && typeof result.text === "string") {
        aiText = result.text;
      } else if (result) {
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
      return json({
        success: false,
        error: error?.message || "AI request failed"
      }, 500);
    }
  }
};
