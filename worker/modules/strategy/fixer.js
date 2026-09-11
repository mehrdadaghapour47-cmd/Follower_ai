export function buildFixPlan(audit = {}) {
	const fixes = [];

	for (const weakness of audit.weaknesses || []) {
		fixes.push({
			problem: weakness,
			action: "بررسی دقیق علت و اجرای اصلاح هدفمند",
			priority: "high"
		});
	}

	if (!fixes.length) {
		fixes.push({
			problem: "مشکل بحرانی شناسایی نشد.",
			action: "بهینه‌سازی مستمر بر اساس داده‌های جدید",
			priority: "medium"
		});
	}

	return fixes.slice(0, 10);
}
