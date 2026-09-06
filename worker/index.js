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

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // Only GET requests are allowed
    if (request.method !== "GET") {
      return json({
        success: false,
        error: "Only GET is allowed"
      }, 405);
    }

    try {
      const url = new URL(request.url);
      const prompt = (url.searchParams.get("prompt") || "").trim();

      // Health check
      if (!prompt) {
        return json({
          success: true,
          message: "🔥 Follower AI is online",
          ai: !!env.AI
        });
      }

      // Check Workers AI binding
      if (!env.AI) {
        return json({
          success: false,
          error: "Workers AI binding is missing"
        }, 500);
      }

      // Send request to Cloudflare Workers AI
      const result = await env.AI.run(
        "@cf/zai-org/glm-4.7-flash",
        {
          messages: [
            {
              role: "system",
              content:
                "تو Follower AI هستی؛ یک استراتژیست حرفه‌ای رشد ارگانیک اینستاگرام. همیشه فارسی، دقیق، کاربردی و حرفه‌ای پاسخ بده. روی فالوور هدفمند، ایده ریلز، Hook، CTA، Retention، تعامل، Share، Save و برند شخصی تمرکز کن. هرگز اسپم، فالو/آنفالو خودکار یا دایرکت انبوه پیشنهاد نده. پاسخ نهایی را فقط برای کاربر بنویس و هرگز reasoning یا فرایند فکر کردن داخلی را نمایش نده."
            },
            {
              role: "user",
              content: prompt
            }
          ]
        }
      );

      // Extract ONLY the final AI response text
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

      // Make sure AI returned actual text
      if (!aiText || !aiText.trim()) {
        return json({
          success: false,
          error: "Cloudflare AI returned an empty response"
        }, 502);
      }

      // Return clean response to frontend
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
