import assert from "node:assert/strict";
import test from "node:test";
import {
	fetchInstagramData,
	normalizeMediaItem,
	normalizeProfile
} from "../worker/modules/instagram/connector.js";
import {
	REQUIRED_PERMISSIONS,
	validateMetaConfiguration
} from "../worker/modules/instagram/permissions.js";

const permissionList = REQUIRED_PERMISSIONS.join(",");

function response(data, status = 200) {
	return {
		ok: status >= 200 && status < 300,
		status,
		text: async () => JSON.stringify(data)
	};
}

test("normalizes profile and media API responses across pages", async () => {
	const calls = [];
	const result = await fetchInstagramData({
		META_ACCESS_TOKEN: "secret-token",
		META_INSTAGRAM_ACCOUNT_ID: "17841400000000000",
		META_PERMISSIONS: permissionList
	}, {
		fetcher: async (url, init) => {
			calls.push({ url, init });
			if (url.includes("/media?")) {
				if (calls.filter((call) => call.url.includes("/media?")).length === 1) {
					return response({
						data: [{ id: "m1", caption: "First", media_type: "IMAGE", like_count: 12 }],
						paging: { next: "https://graph.facebook.com/v23.0/media?page=2&access_token=secret-token" }
					});
				}
				return response({ data: [{ id: "m2", media_type: "VIDEO", media_product_type: "REELS", comments_count: 3 }] });
			}
			return response({
				id: "17841400000000000",
				username: "example",
				biography: "A real bio",
				followers_count: 42
			});
		}
	});

	assert.deepEqual(result.profile, {
		id: "17841400000000000",
		username: "example",
		bio: "A real bio",
		followers: 42
	});
	assert.equal(result.content.length, 2);
	assert.equal(result.reels.length, 1);
	assert.equal(result.integration.status, "connected");
	assert.equal(calls.length, 3);
	assert.ok(calls.every(({ url }) => !url.includes("secret-token")));
	assert.ok(calls.every(({ init }) => init.headers.Authorization === "Bearer secret-token"));
});

test("returns a safe integration error for Meta API failures", async () => {
	const result = await fetchInstagramData({
		META_ACCESS_TOKEN: "secret-token",
		META_INSTAGRAM_ACCOUNT_ID: "17841400000000000",
		META_PERMISSIONS: permissionList
	}, {
		fetcher: async () => response({ error: { message: "invalid token secret-token", code: 190 } }, 400)
	});

	assert.equal(result.integration.status, "error");
	assert.equal(result.integration.statusCode, 400);
	assert.equal(result.integration.reason, "190");
	assert.ok(!JSON.stringify(result).includes("secret-token"));
});

test("reports missing token without making an API request", async () => {
	let called = false;
	const result = await fetchInstagramData({
		META_INSTAGRAM_ACCOUNT_ID: "17841400000000000",
		META_PERMISSIONS: permissionList
	}, { fetcher: async () => { called = true; return response({}); } });

	assert.equal(result.integration.reason, "MISSING_CONFIGURATION");
	assert.deepEqual(result.integration.missingConfiguration, ["META_ACCESS_TOKEN"]);
	assert.equal(called, false);
});

test("reports missing permissions and account configuration", () => {
	const result = validateMetaConfiguration({ META_ACCESS_TOKEN: "secret-token" });

	assert.equal(result.configured, false);
	assert.equal(result.reason, "MISSING_PERMISSIONS");
	assert.ok(result.missingConfiguration.includes("META_INSTAGRAM_ACCOUNT_ID"));
	assert.deepEqual(result.missingPermissions, REQUIRED_PERMISSIONS);
});

test("omits unavailable fields during normalization", () => {
	assert.deepEqual(normalizeProfile({ username: "example" }), { username: "example" });
	assert.deepEqual(normalizeMediaItem({ id: "m1", media_type: "IMAGE" }), {
		id: "m1",
		mediaType: "IMAGE"
	});
});
