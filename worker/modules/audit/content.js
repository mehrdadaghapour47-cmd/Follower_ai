export function auditContent(items = []) {
	const list = Array.isArray(items) ? items : [];

	if (!list.length) {
		return {
			score: 0,
			count: 0,
			strengths: [],
			weaknesses: ["محتوای قابل تحلیل دریافت نشده است."],
			topContent: [],
			bottomContent: []
		};
	}

	const scored = list.map((item) => {
		const likes = Number(item.likes) || 0;
		const comments = Number(item.comments) || 0;
		const shares = Number(item.shares) || 0;
		const saves = Number(item.saves) || 0;

		return {
			...item,
			engagementScore: likes + comments * 2 + shares * 3 + saves * 3
		};
	}).sort((a, b) => b.engagementScore - a.engagementScore);

	const average = scored.reduce((sum, item) => sum + item.engagementScore, 0) / scored.length;

	return {
		score: Math.min(100, Math.round(Math.min(1, average / 1000) * 100)),
		count: scored.length,
		strengths: scored.length >= 10
			? ["تعداد محتوای کافی برای تحلیل وجود دارد."]
			: ["نمونه محتوای محدود است."],
		weaknesses: scored.length < 10
			? ["برای تحلیل قابل اتکاتر، محتوای بیشتری لازم است."]
			: [],
		topContent: scored.slice(0, 5),
		bottomContent: scored.slice(-5).reverse()
	};
}
