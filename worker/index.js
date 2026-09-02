export default {
  async fetch(request, env) {

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Max-Age": "86400"
    };

    // CORS PREFLIGHT
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // HEALTH CHECK
    if (request.method === "GET") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "🔥 Follower AI is online"
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
            ...corsHeaders
          }
        }
      );
    }

    // ONLY POST
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Method Not Allowed"
        }),
        {
          status: 405,
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
            ...corsHeaders
          }
        }
      );
    }

    try {

      const body = await request.json();

      const prompt =
        typeof body.prompt === "string"
          ? body.prompt.trim()
          : "";

      if (!prompt) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Prompt is required"
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json; charset=UTF-8",
              ...corsHeaders
            }
          }
        );
      }

      // CALL CLOUDFLARE AI
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

      // استخراج مطمئن متن AI
      let aiText = "";

      if (typeof result === "string") {
        aiText = result;
      }

      else if (result && typeof result.response === "string") {
        aiText = result.response;
      }

      else if (result && typeof result.output_text === "string") {
        aiText = result.output_text;
      }

      else if (result && typeof result.text === "string") {
        aiText = result.text;
      }

      else if (
        result &&
        result.response &&
        typeof result.response === "object"
      ) {

        if (typeof result.response.response === "string") {
          aiText = result.response.response;
        }

        else if (typeof result.response.output_text === "string") {
          aiText = result.response.output_text;
        }

        else if (typeof result.response.text === "string") {
          aiText = result.response.text;
        }
      }

      // اگر ساختار متفاوت بود، کل خروجی را به متن تبدیل کن
      if (!aiText && result) {
        try {
          aiText = JSON.stringify(result);
        } catch (e) {
          aiText = "";
        }
      }

      // اگر واقعاً خروجی خالی بود
      if (!aiText || !aiText.trim()) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Cloudflare AI returned an empty response"
          }),
          {
            status: 502,
            headers: {
              "Content-Type": "application/json; charset=UTF-8",
              ...corsHeaders
            }
          }
        );
      }

      // SUCCESS
      return new Response(
        JSON.stringify({
          success: true,
          response: aiText
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
            ...corsHeaders
          }
        }
      );

    } catch (error) {

      return new Response(
        JSON.stringify({
          success: false,
          error:
            error && error.message
              ? error.message
              : "AI request failed"
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
            ...corsHeaders
          }
        }
      );
    }
  }
};
