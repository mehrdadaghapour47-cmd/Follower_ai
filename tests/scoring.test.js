import test from "node:test";
import assert from "node:assert/strict";
import { calculateScore } from "../worker/modules/scoring/score.js";

test("weighted score is between 0 and 100", () => {
	const result = calculateScore({
		profile: 80,
		content: 70,
		reels: 60,
		visual: 90,
		engagement: 50,
		conversion: 40
	});

	assert.ok(result.overall >= 0 && result.overall <= 100);
});
