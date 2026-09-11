import { clampScore } from "../security/validation.js";

export function auditProfile(profile = {}) {
	const bio = String(profile.bio || "").trim();
	const username = String(profile.username || "").trim();
	const strengths = [];
	const weaknesses = [];

	if (username) strengths.push("نام کاربری مشخص است.");
	else weaknesses.push("نام کاربری دریافت نشده است.");

	if (bio.length >= 40) strengths.push("Bio اطلاعات کافی برای تحلیل اولیه دارد.");
	else weaknesses.push("Bio کوتاه یا ناقص است.");

	if (!profile.bio) weaknesses.push("Bio برای تحلیل در دسترس نیست.");

	const score = clampScore(
		(username ? 35 : 0) +
		(bio.length >= 80 ? 65 : bio.length >= 40 ? 50 : 20)
	);

	return {
		score,
		strengths,
		weaknesses,
		checks: {
			username: Boolean(username),
			bio: Boolean(bio),
			profilePhoto: Boolean(profile.profilePhoto),
			followers: Number.isFinite(Number(profile.followers))
		}
	};
}
