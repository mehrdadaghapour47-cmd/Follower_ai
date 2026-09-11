import test from "node:test";
import assert from "node:assert/strict";
import {
	normalizeUsername,
	validateInstagramInput,
	clampScore
} from "../worker/modules/security/validation.js";

test("normalizes username", () => {
	assert.equal(normalizeUsername("@Test_User"), "test_user");
});

test("validates instagram profile", () => {
	assert.equal(validateInstagramInput("https://instagram.com/test_user/").valid, true);
});

test("clamps score", () => {
	assert.equal(clampScore(150), 100);
	assert.equal(clampScore(-5), 0);
});
