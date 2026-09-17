function extractJson(text) {
	const cleaned = String(text || "")
		.replace(/```json/gi, "")
		.replace(/```/g, "")
		.trim();

	try {
		return JSON.parse(cleaned);
	} catch {}

	const start = cleaned.indexOf("{");
	const end = cleaned.lastIndexOf("}");

	if (start >= 0 && end > start) {
		try {
			return JSON.parse(cleaned.slice(start, end + 1));
		} catch {}
	}

	return null;
}

function extractAIText(value) {
	if (typeof value === "string") return value.trim();

	if (Array.isArray(value)) {
		return value.map(extractAIText).filter(Boolean).join("\n").trim();
	}

	if (value && typeof value === "object") {
		for (const key of ["response", "output_text", "text", "content", "message"]) {
			const text = extractAIText(value[key]);
			if (text) return text;
		}
	}

	return "";
}

export async function analyzeWithAI(env, payload = {}) {
	if (!env?.AI?.run) {
		return {
			available: false,
			reason: "AI_BINDING_UNAVAILABLE"
		};
	}

	const model = env.AI_MODEL || "@cf/zai-org/glm-4.7-flash";
	const prompt = [
		"You are Follower AI 2.0.",
		"Analyze ONLY the supplied Instagram data.",
		"Never invent unavailable data.",
		"Return valid JSON only.",
		"",
		JSON.stringify(payload)
	].join("\n");

	try {
		const result = await env.AI.run(model, {
			messages: [
				{
					role: "system",
					content: "Return JSON only. Never fabricate unavailable Instagram data."
				},
				{ role: "user", content: prompt }
			]
		});

		const text = extractAIText(
			result?.response ??
				result?.result ??
					result?.output_text ??
						result?.text ??
							result
		);

		const fallbackText = text.trim();
		const extracted = extractJson(fallbackText);
		const parsed =
			extracted && typeof extracted === "object"
				? extracted
				: result && typeof result === "object" && result.response && typeof result.response === "object"
					? result.response
					: result && typeof result === "object" && result.result && typeof result.result === "object"
						? result.result
						: null;

		return {
			available: true,
			model,
			result: parsed || {
				summary: fallbackText || "پاسخ AI دریافت شد اما متن قابل استخراج نبود.",
				raw: result ?? null
			}
		};
	} catch (error) {
		return {
			available: false,
			reason: "AI_REQUEST_FAILED",
			message: error instanceof Error ? error.message : "Unknown AI error"
		};
	}
}

export { extractJson };
