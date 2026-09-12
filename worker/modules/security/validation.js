export function normalizeUsername(value = "") {
	return String(value).trim().replace(/^@/, "").toLowerCase();
}

export function validateInstagramInput(value = "") {
	const input = String(value).trim();
	if (!input) return { valid: false, type: "empty", value: "" };

	if (/^https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9._]+\/?$/i.test(input)) {
		const username = normalizeUsername(input.replace(/\/+$/, "").split("/").pop());
		return { valid: true, type: "profile_url", value: username };
	}

	if (/^@?[A-Za-z0-9._-]{1,30}$/.test(input)) {
		return { valid: true, type: "username", value: normalizeUsername(input) };
	}

	return { valid: false, type: "invalid", value: input };
}

export function clampScore(value, min = 0, max = 100) {
	const number = Number(value);
	if (!Number.isFinite(number)) return min;
	return Math.min(max, Math.max(min, Math.round(number)));
}
