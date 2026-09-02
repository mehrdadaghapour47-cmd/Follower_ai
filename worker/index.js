export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin":
        "https://mehrdadaghapour47-cmd.github.io",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    if (request.method === "GET") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "🔥 Follower AI is online"
        }),
        {
          headers: {
            "Content-Type": "application/json",
            ...cors
          }
        }
      );
    }

    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Method Not Allowed"
        }),
        {
          status: 405,
          headers: {
            "Content-Type": "application/json",
            ...cors
          }
        }
      );
    }

    try {
      const body = await request.json();
      const prompt = body.prompt || "";

      if (!prompt) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Prompt is required"
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              ...cors
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
                "تو Follower AI هستی؛ یک استراتژیست حرفه‌ای رشد ارگانیک اینستاگرام. همیشه فارسی، دقیق و کاربردی پاسخ بده. روی فالوور هدفمند، ایده ریلز، Hook، CTA، کپشن، تعامل، برند شخصی و تحلیل ریلز تمرکز کن. هرگز اسپم، فالو/آنفالو خودکار یا دایرکت انبوه پیشنهاد نده."
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
          headers: {
            "Content-Type": "application/json",
            ...cors
          }
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message || "AI request failed"
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...cors
          }
        }
      );
    }
  }
};
