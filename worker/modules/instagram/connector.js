import { validateMetaConfiguration } from "./permissions.js";

const GRAPH_BASE_URL = "https://graph.facebook.com";
const DEFAULT_TIMEOUT_MS = 10000;
const PROFILE_FIELDS = [
	"id",
	"username",
	"name",
	"biography",
	"profile_picture_url",
	"followers_count",
	"follows_count",
	"media_count"
].join(",");
const MEDIA_FIELDS = [
	"id",
	"caption",
	"media_type",
	"media_product_type",
	"media_url",
	"thumbnail_url",
	"permalink",
	"timestamp",
	"username",
	"like_count",
	"comments_count"
].join(",");

function graphVersion(env = {}) {
	return String(env.META_GRAPH_API_VERSION || "v23.0").replace(/^\/+|\/+$/g, "");
}

function timeoutMs(env = {}) {
	const value = Number(env.META_API_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
	return Number.isFinite(value) ? Math.min(30000, Math.max(1000, value)) : DEFAULT_TIMEOUT_MS;
}

function scrub(value, secret = "") {
	const text = String(value || "");
	return secret ? text.split(secret).join("[REDACTED]") : text;
}

function apiError(response, data, secret) {
	const error = new Error(scrub(data?.error?.message || `Meta API request failed (${response.status})`, secret));
	error.code = data?.error?.code;
	error.status = response.status;
	return error;
}

function valueIfPresent(target, key, value) {
	if (value !== undefined && value !== null) target[key] = value;
}

export function normalizeProfile(data = {}) {
	const profile = {};
	valueIfPresent(profile, "id", data.id);
	valueIfPresent(profile, "username", data.username);
	valueIfPresent(profile, "name", data.name);
	valueIfPresent(profile, "bio", data.biography);
	valueIfPresent(profile, "profilePhoto", data.profile_picture_url);
	valueIfPresent(profile, "followers", data.followers_count);
	valueIfPresent(profile, "following", data.follows_count);
	valueIfPresent(profile, "mediaCount", data.media_count);
	return profile;
}

export function normalizeMediaItem(data = {}) {
	const media = {};
	valueIfPresent(media, "id", data.id);
	valueIfPresent(media, "caption", data.caption);
	valueIfPresent(media, "mediaType", data.media_type);
	valueIfPresent(media, "mediaProductType", data.media_product_type);
	valueIfPresent(media, "mediaUrl", data.media_url);
	valueIfPresent(media, "thumbnailUrl", data.thumbnail_url);
	valueIfPresent(media, "permalink", data.permalink);
	valueIfPresent(media, "timestamp", data.timestamp);
	valueIfPresent(media, "username", data.username);
	valueIfPresent(media, "likes", data.like_count);
	valueIfPresent(media, "comments", data.comments_count);
	return media;
}

async function requestJson(env, url, options = {}) {
	const fetcher = options.fetcher || globalThis.fetch;
	if (typeof fetcher !== "function") throw new Error("Fetch is unavailable");

	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs(env));
	try {
		const response = await fetcher(url, {
			method: "GET",
			headers: { Accept: "application/json", Authorization: `Bearer ${env.META_ACCESS_TOKEN}` },
			signal: controller.signal
		});
		const raw = await response.text();
		let data = {};
		try { data = raw ? JSON.parse(raw) : {}; } catch { data = {}; }
		if (!response.ok || data.error) throw apiError(response, data, env.META_ACCESS_TOKEN);
		return data;
	} catch (error) {
		if (error?.name === "AbortError") {
			const timeoutError = new Error("Meta API request timed out");
			timeoutError.code = "META_API_TIMEOUT";
			throw timeoutError;
		}
		throw error;
	} finally {
		clearTimeout(timer);
	}
}

function graphUrl(env, path, params = {}) {
	const url = new URL(`${GRAPH_BASE_URL}/${graphVersion(env)}${path}`);
	for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
	return url.toString();
}

function nextPageUrl(next) {
	if (!next) return null;
	try {
		const url = new URL(next, GRAPH_BASE_URL);
		if (url.protocol !== "https:" || url.hostname !== "graph.facebook.com") return null;
		url.searchParams.delete("access_token");
		return url.toString();
	} catch {
		return null;
	}
}

async function collectMedia(env, userId, options = {}) {
	const items = [];
	let url = graphUrl(env, `/${encodeURIComponent(userId)}/media`, { fields: MEDIA_FIELDS });
	let pages = 0;

	while (url && pages < 100) {
		const page = await requestJson(env, url, options);
		if (Array.isArray(page.data)) items.push(...page.data.map(normalizeMediaItem));
		url = nextPageUrl(page.paging?.next);
		pages += 1;
	}

	return items;
}

export async function fetchInstagramData(env = {}, options = {}) {
	const configuration = validateMetaConfiguration(env, options);
	if (!configuration.configured) {
		return {
			integration: configuration,
			profile: null,
			content: [],
			reels: []
		};
	}

	try {
		const profileData = await requestJson(
			env,
			graphUrl(env, `/${encodeURIComponent(configuration.instagramUserId)}`, { fields: PROFILE_FIELDS }),
			options
		);
		const content = await collectMedia(env, configuration.instagramUserId, options);
		return {
			integration: {
				configured: true,
				status: "connected",
				instagramUserId: configuration.instagramUserId,
				mediaCount: content.length
			},
			profile: normalizeProfile(profileData),
			content,
			reels: content.filter((item) => item.mediaProductType === "REELS")
		};
	} catch (error) {
		return {
			integration: {
				configured: true,
				status: "error",
				reason: error.code ? String(error.code) : "META_API_REQUEST_FAILED",
				statusCode: Number.isInteger(error.status) ? error.status : undefined,
				message: scrub(error.message, env.META_ACCESS_TOKEN)
			},
			profile: null,
			content: [],
			reels: []
		};
	}
}

export { collectMedia, graphUrl, nextPageUrl };