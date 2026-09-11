import { clampScore } from "../security/validation.js";

export function calculateScore(categories = {}) {
	const weights = {
		profile: 15,
		content: 20,
		reels: 20,
		visual: 15,
		engagement: 15,
		conversion: 15
	};

	const result = {};
	let total = 0;

	for (const [key, weight] of Object.entries(weights)) {
		const score = clampScore(categories[key] ?? 0);
		result[key] = score;
		total += score * weight;
	}

	return {
		categories: result,
		overall: Math.round(total / 100),
		level:
			total / 100 >= 80 ? "excellent" :
				total / 100 >= 65 ? "strong" :
					total / 100 >= 50 ? "needs_work" :
						"critical"
	};
}
