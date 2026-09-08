# Follower AI 2.0

Follower AI is a Cloudflare Worker for Instagram growth assistance and opt-in comment automation using official Meta APIs and Cloudflare Workers AI.

It does not scrape Instagram, automate browsers, use unofficial APIs, or perform spam/follow-unfollow automation.

## Existing web app

`index.html` calls the Worker with the existing `GET /?prompt=...` contract. The bare `GET /` response remains the health check:

```json
{"success":true,"message":"🔥 Follower AI is online","ai":true}
```

## Worker routes

- `GET /` or `GET /?prompt=...`: health check or the existing Workers AI prompt endpoint.
- `GET /webhook`: Meta webhook verification using `META_VERIFY_TOKEN`.
- `POST /webhook`: verifies `X-Hub-Signature-256`, detects comment keywords, generates a short AI reply, and replies through the official Graph API. A rule can optionally send a configured DM.
- `GET /api/test/keyword?text=...`: protected, side-effect-free keyword matching check. Requires `TEST_ENDPOINT_TOKEN` in the query string or `X-Test-Endpoint-Token` header.
- `OPTIONS *`: CORS preflight.

## Deploy

From `worker/`:

```bash
npx wrangler deploy
```

The Workers AI binding is retained in `wrangler.jsonc`. Non-secret defaults are declared there; tokens and signing material must be stored as Wrangler secrets.

```bash
npx wrangler secret put META_VERIFY_TOKEN
npx wrangler secret put META_APP_SECRET
npx wrangler secret put META_ACCESS_TOKEN
npx wrangler secret put META_INSTAGRAM_ACCOUNT_ID
npx wrangler secret put TEST_ENDPOINT_TOKEN
```

Set non-secret variables for the deployment. `KEYWORD_RULES` is JSON and may be set as a Wrangler variable or secret when its reply/DM text should not be public:

```bash
npx wrangler deploy --var ALLOWED_ORIGINS:https://your-frontend.example
npx wrangler deploy --var KEYWORD_RULES:'[{"id":"price","keywords":["قیمت","price"],"reply":"به سوال قیمت محترمانه پاسخ بده.","sendDm":true,"dm":"سلام، راهنمای کامل برای شما ارسال شد."}]'
```

For repeatable deployments, put these non-secret values in an environment-specific Wrangler configuration rather than committing credentials. Never put `META_ACCESS_TOKEN`, `META_APP_SECRET`, or `META_VERIFY_TOKEN` in source control or frontend code.

## Meta setup

1. Create/configure a Meta app with the Instagram API product and an Instagram professional account.
2. Generate a token with the permissions required by the current official Instagram API flow for your account, including comment management and messaging where DM automation is enabled.
3. Subscribe the app to the Instagram comments webhook field.
4. Set the callback URL to `https://<worker-domain>/webhook`.
5. Use the exact `META_VERIFY_TOKEN` value in Meta's webhook configuration.
6. Set `ALLOWED_ORIGINS` to a comma-separated list of the real frontend origins. The default `*` is intended only for initial development.
7. Set `META_GRAPH_API_VERSION` to a currently supported Graph API version when deploying. The config currently defaults to `v23.0`.

The Worker uses these official Graph API operations:

- `POST /{comment-id}/replies` for comment replies.
- `POST /{ig-user-id}/messages` with an Instagram-scoped recipient ID for DMs.

Meta permissions, account eligibility, recipient consent/window rules, and version availability are controlled by Meta and must be confirmed in the current Meta documentation before production activation.

## Keyword rules

`KEYWORD_RULES` must be a JSON array. Each matching rule has an ID, one or more case-insensitive substring keywords, an AI reply instruction, and optional DM settings:

```json
[
  {
    "id": "price",
    "keywords": ["قیمت", "price"],
    "reply": "مختصر و مفید درباره قیمت و راهنمای خرید پاسخ بده.",
    "sendDm": true,
    "dm": "سلام، راهنمای کامل در دایرکت برای شما ارسال شد."
  }
]
```

The AI writes the public comment response; the `dm` value is a fixed configured message. The Worker ignores comments sent by the configured Instagram account to prevent reply loops, and it logs request IDs and operational errors without logging tokens or message bodies.

## Local tests

```bash
node --test worker/index.test.js
node --check worker/index.js
```

The tests cover the health contract, prompt contract, webhook challenge, HMAC rejection/validation, CORS-compatible routing, and protected keyword matching without calling Meta or sending external messages.
