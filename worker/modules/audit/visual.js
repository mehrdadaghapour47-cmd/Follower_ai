export function auditVisual(media = {}) {
	const available = Boolean(media.image || media.cover || media.screenshot);

	return {
		available,
		score: available ? null : 0,
		status: available ? "ready_for_visual_ai" : "unavailable",
		checks: {
			cover: Boolean(media.cover),
			image: Boolean(media.image),
			screenshot: Boolean(media.screenshot)
		},
		note: available
			? "رسانه برای تحلیل بصری آماده است."
			: "برای تحلیل بصری باید تصویر، کاور یا اسکرین‌شات دریافت شود."
	};
}
