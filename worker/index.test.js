import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import worker, { internals } from "./index.js";

const rules = JSON.stringify([
  { id: "price", keywords: ["قیمت", "price"], reply: "راهنما", sendDm: true, dm: "سلام" }
]);
const env = {
  META_VERIFY_TOKEN: "verify-me",
  META_APP_SECRET: "app-secret",
  TEST_ENDPOINT_TOKEN: "test-token",
  KEYWORD_RULES: rules,
  AI: null
};

async function fetchWorker(path, init = {}) {
  return worker.fetch(new Request(`https://worker.test${path}`, init), env);
}

test("keeps the health check contract", async () => {
  const response = await fetchWorker("/");
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    success: true,
    message: "🔥 Follower AI is online",
    ai: false
  });
});

test("verifies the Meta webhook challenge", async () => {
  const response = await fetchWorker("/webhook?hub.mode=subscribe&hub.verify_token=verify-me&hub.challenge=12345");
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "12345");
});

test("rejects unsigned webhook events", async () => {
  const response = await fetchWorker("/webhook", {
    method: "POST",
    body: JSON.stringify({ object: "instagram", entry: [] }),
    headers: { "Content-Type": "application/json" }
  });
  assert.equal(response.status, 401);
});

test("matches configured keywords through the protected test endpoint", async () => {
  const response = await fetchWorker("/api/test/keyword?text=قیمت%20لطفا&token=test-token");
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    success: true,
    matched: true,
    rule: { id: "price", sendDm: true }
  });
});

test("keeps the prompt response contract", async () => {
  const promptEnv = {
    ...env,
    AI: { run: async () => ({ response: "پاسخ آزمایشی" }) }
  };
  const response = await worker.fetch(new Request("https://worker.test/?prompt=سلام"), promptEnv);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true, response: "پاسخ آزمایشی" });
});

test("validates Meta HMAC signatures", async () => {
  const body = JSON.stringify({ hello: "world" });
  const signature = `sha256=${createHmac("sha256", "app-secret").update(body).digest("hex")}`;
  assert.equal(await internals.verifySignature(body, signature, "app-secret"), true);
  assert.equal(await internals.verifySignature(body, `${signature}0`, "app-secret"), false);
});
