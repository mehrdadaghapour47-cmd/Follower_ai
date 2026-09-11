export const REQUIRED_PERMISSIONS = Object.freeze([
	"instagram_basic",
	"pages_show_list",
	"pages_read_engagement"
]);

function parsePermissions(value) {
	if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
	return String(value || "")
		.split(/[\s,]+/)
		.map((item) => item.trim())
		.filter(Boolean);
}

export function getRequiredPermissions(env = {}) {
	const configured = parsePermissions(env.META_REQUIRED_PERMISSIONS);
	return configured.length ? configured : [...REQUIRED_PERMISSIONS];
}

export function validateMetaConfiguration(env = {}, options = {}) {
	const missingConfiguration = [];
	const accessToken = String(env.META_ACCESS_TOKEN || "").trim();
	const instagramUserId = String(
		options.instagramUserId || env.META_INSTAGRAM_ACCOUNT_ID || env.META_INSTAGRAM_USER_ID || ""
	).trim();

	if (!accessToken) missingConfiguration.push("META_ACCESS_TOKEN");
	if (!instagramUserId) missingConfiguration.push("META_INSTAGRAM_ACCOUNT_ID");

	const requiredPermissions = getRequiredPermissions(env);
	const configuredPermissions = parsePermissions(env.META_PERMISSIONS);
	const missingPermissions = requiredPermissions.filter((permission) => !configuredPermissions.includes(permission));

	if (!accessToken || !instagramUserId || missingPermissions.length) {
		return {
			configured: false,
			status: "not_configured",
			reason: missingPermissions.length ? "MISSING_PERMISSIONS" : "MISSING_CONFIGURATION",
			missingConfiguration,
			missingPermissions,
			requiredPermissions,
			usernameLookup: instagramUserId ? "account_id_configured" : "unsupported_without_account_id"
		};
	}

	return {
		configured: true,
		status: "configured",
		instagramUserId,
		requiredPermissions,
		configuredPermissions
	};
}
