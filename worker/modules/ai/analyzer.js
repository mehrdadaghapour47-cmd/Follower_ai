const RESULT_KEYS = ["response", "output_text", "generated_text", "text", "content", "message", "choices", "output", "data"];

const SCHEMAS = {
    audit: { summary: "", diagnosis: "", strengths: [], weaknesses: [], priorities: [], limitations: [] },
    strategy: { diagnosis: "", audience: "", content_pillars: [], reel_strategy: [], weekly_plan: [], hooks: [], cta: [], engagement_actions: [], metrics: [], limitations: [] },
    "reel-ideas": { ideas: [], rules: [], limitations: [] },
    "weekly-plan": { days: [], posting_guidance: [], engagement_actions: [], limitations: [] }
};

function cleanText(value) {
    return typeof value === "string" ? value.replace(/\u0000/g, "").trim() : "";
}

function scanJsonValues(text) {
    const source = cleanText(text).replace(/```json/gi, "").replace(/```/g, "");
    const values = [];
    let start = -1;
    let depth = 0;
    let quote = false;
    let escaped = false;

    for (let index = 0; index < source.length; index += 1) {
        const char = source[index];

        if (quote) {
            if (escaped) escaped = false;
            else if (char === "\\") escaped = true;
            else if (char === '"') quote = false;
            continue;
        }

        if (char === '"') {
            quote = true;
            continue;
        }

        if (char === "{" || char === "[") {
            if (depth === 0) start = index;
            depth += 1;
            continue;
        }

        if (char === "}" || char === "]") {
            if (depth === 0) continue;
            depth -= 1;

            if (depth === 0 && start >= 0) {
                try {
                    values.push(JSON.parse(source.slice(start, index + 1)));
                } catch {}
                start = -1;
            }
        }
    }

    return values;
}

function extractJson(text) {
    const cleaned = cleanText(text).replace(/```json/gi, "").replace(/```/g, "");

    try {
        return JSON.parse(cleaned);
    } catch {}

    return scanJsonValues(cleaned).find(
        (value) => value && typeof value === "object" && !Array.isArray(value)
    ) || null;
}

function extractAIText(value) {
    if (typeof value === "string") return cleanText(value);

    if (Array.isArray(value)) {
        return value.map(extractAIText).filter(Boolean).join("\n").trim();
    }

    if (value && typeof value === "object") {
        for (const key of RESULT_KEYS) {
            const text = extractAIText(value[key]);
            if (text) return text;
        }
    }

    return "";
}

function asArray(value) {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined || value === "") return [];
    return [value];
}

function normalizeResult(task, value, rawText = "") {
    const schema = SCHEMAS[task] || SCHEMAS.audit;
    const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    const result = { ...schema };

    for (const key of Object.keys(schema)) {
        if (!(key in source)) continue;

        result[key] = Array.isArray(schema[key])
            ? asArray(source[key])
            : cleanText(source[key]);
    }

    if (task === "reel-ideas") {
        result.ideas = result.ideas.slice(0, 5);
    }

    if (task === "weekly-plan") {
        result.days = result.days.slice(0, 7);
    }

    const hasContent = Object.entries(result).some(
        ([key, value]) =>
            key !== "limitations" &&
            (Array.isArray(value) ? value.length > 0 : Boolean(cleanText(value)))
    );

    if (!hasContent) {
        result.limitations = [
            "پاسخ ساختاریافته AI قابل استخراج نبود؛ داده‌های ورودی را بررسی و دوباره تلاش کنید."
        ];

        if (rawText) {
            result.limitations.push(`متن خام AI: ${cleanText(rawText).slice(0, 500)}`);
        }
    }

    return result;
}

function taskInstructions(task) {
    const common =
        "فقط از داده‌های ورودی استفاده کن. هیچ عدد، علت، نرخ تعامل، مخاطب، وضعیت API، نتیجه یا ادعایی که در داده نیست اختراع نکن. اگر داده کافی نیست، آن را در limitations بنویس.";

    const instructions = {
        audit:
            "تحلیل فارسی شامل خلاصه، تشخیص، نقاط قوت، نقاط ضعف و اولویت‌های اقدام ارائه کن.",
        strategy:
            "یک استراتژی رشد اینستاگرام فارسی شامل تشخیص، مخاطب هدف، ستون‌های محتوا، استراتژی ریلز، برنامه هفتگی، Hook، CTA، اقدامات تعامل و شاخص‌های قابل اندازه‌گیری ارائه کن.",
        "reel-ideas":
            "دقیقاً 5 ایده ریلز فارسی بده. برای هر ایده موضوع، Hook، ساختار ویدئو، متن روی تصویر، CTA و روش افزایش اشتراک‌گذاری یا ذخیره را بده.",
        "weekly-plan":
            "دقیقاً 7 روز برنامه محتوایی فارسی بده. برای هر روز موضوع، نوع محتوا، ایده، Hook، CTA و اقدام تعامل را مشخص کن."
    };

    return `${common}\n${instructions[task] || instructions.audit}`;
}

export async function analyzeWithAI(env, payload = {}) {
    if (!env?.AI?.run) {
        return {
            available: false,
            reason: "AI_BINDING_UNAVAILABLE"
        };
    }

    const model = env.AI_MODEL || "@cf/zai-org/glm-4.7-flash";
    const task = payload.task || "audit";
    const schema = SCHEMAS[task] || SCHEMAS.audit;

    const prompt = [
        "You are Follower AI 2.0.",
        "Return EXACTLY ONE valid JSON object and nothing else.",
        "No markdown. No prose before or after the JSON. No multiple JSON objects.",
        "Write all user-facing content in Persian.",
        taskInstructions(task),
        "Required schema:",
        JSON.stringify(schema),
        "Input:",
        JSON.stringify(payload)
    ].join("\n");

    try {
        const result = await env.AI.run(model, {
            messages: [
                {
                    role: "system",
                    content:
                        "Return exactly one valid JSON object. Never fabricate unavailable Instagram data. User-facing content must be Persian."
                },
                {
                    role: "user",
                    content: prompt
                }
            ]
        });

        const text = extractAIText(
            result?.response ??
            result?.result ??
            result?.output_text ??
            result?.text ??
            result
        );

        const parsed = extractJson(text);
        const isStructuredJson = parsed && typeof parsed === "object" && !Array.isArray(parsed);

        return {
            available: true,
            model,
            result: isStructuredJson ? normalizeResult(task, parsed, text) : text
        };
    } catch (error) {
        return {
            available: false,
            reason: "AI_REQUEST_FAILED",
            message:
                error instanceof Error
                    ? error.message
                    : "Unknown AI error"
        };
    }
}

export {
    extractJson,
    extractAIText,
    normalizeResult
};
