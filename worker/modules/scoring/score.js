export function calculateScore(categories = {}) {
	const weights = {
		profile: 15,
		content: 20,
		reels: 20,
		visual: 15,
		engagement: 15,
		conversion: 15
	};

	const available = {};
	let weighted = 0;
	let totalWeight = 0;

	for (const [key, weight] of Object.entries(weights)) {
		const value = Number(categories[key]);

		if (Number.isFinite(value) && value >= 0) {
			const score = Math.max(0, Math.min(100, value));
			available[key] = score;
			weighted += score * weight;
			totalWeight += weight;
		}
	}

	if (!totalWeight) {
		return {
			overall: null,
			level: "insufficient_data",
			availableCategories: [],
			missingCategories: Object.keys(weights)
		};
	}

	const overall = Math.round(weighted / totalWeight);

	return {
		overall,
		level:
				overall >= 80 ? "excellent" :
					overall >= 65 ? "strong" :
					overall >= 50 ? "needs_work" :
							"critical",
		availableCategories: Object.keys(available),
		missingCategories: Object.keys(weights).filter(key => !(key in available)),
		categories: available
	};
}
