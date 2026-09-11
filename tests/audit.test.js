import test from "node:test";
import assert from "node:assert/strict";
import { auditProfile } from "../worker/modules/audit/profile.js";
import { auditContent } from "../worker/modules/audit/content.js";

test("profile audit returns score", () => {
	const result = auditProfile({
		username: "test",
		bio: "این یک Bio مناسب برای تست تحلیل پیج اینستاگرام است."
	});

	assert.equal(typeof result.score, "number");
});

test("content audit ranks content", () => {
	const result = auditContent([
		{ likes: 100, comments: 10, shares: 5, saves: 2 },
		{ likes: 500, comments: 20, shares: 20, saves: 10 }
	]);

	assert.equal(result.topContent[0].likes, 500);
});
