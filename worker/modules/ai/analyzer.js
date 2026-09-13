import { DEEP_AUDIT_SYSTEM_PROMPT } from "./prompts.js";

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

export async function analyzeWithAI(env, payload = {}) {
	if (!env?.AI?.run) {
		return {
			available: false,
			reason: "AI_BINDING_UNAVAILABLE"
		};
	}

	const model = env.AI_MODEL || "@cf/zai-org/glm-4.7-flash";
	const prompt = [
		"Perform a complete Follower AI 2.0 Deep Audit.",
		"Use ONLY the supplied data.",
		"Do not guess or fabricate missing information.",
		"If visual or video evidence is absent, explicitly report it in missingData.",
		"Return JSON matching the requested schema.",
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
				{
					role: "user",
					content: prompt
				}
			]
		});

		const text = result?.response || result?.result?.response || result?.output_text || "";
		const parsed = extractJson(text);

		return {
			available: true,
			model,
			result: parsed || {
				summary: text,
				parseWarning: "AI_RESPONSE_NOT_VALID_JSON"
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
