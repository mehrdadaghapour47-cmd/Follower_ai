export default {
  async fetch(request, env) {

    const origin = request.headers.get("Origin") || "*";

    const corsHeaders = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin"
    };

    // CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // تست آنلاین بودن Worker
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

    // فقط POST
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

      return new Response(
        JSON.stringify({
          success: true,
          response: result
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
