# Instagram Handler

Standalone FastAPI service for the Instagram side of HiCore Slotify: comment
automation, DM handoff, vendor onboarding, token lifecycle.

Instagram is a funnel, not a place business gets done. Every path here ends by
handing the conversation to WhatsApp — a comment gets a public reply plus a DM
carrying a `wa.me` link, and a DM gets the same link. No conversation engine,
no sessions, no sequences.

```
python main.py           # or: uvicorn main:app --port 8002
```

## What it depends on

Almost nothing. It imports no code from `Backend/` or `Workflows/`.

Its one cross-service read is the catalogue join — `products.reel_id` → a
product — isolated in `services/catalog_client.py`. Today that reads the shared
SQLite file; swap the body for an HTTP call to Backend and nothing else
changes. A failed lookup is never fatal: the handoff falls back to a plain
booking link.

Everything else it owns:

| Table | Holds |
|---|---|
| `instagram_connections` | account → business, encrypted token, per-account policy |
| `instagram_processed_events` | duplicate-delivery claims and our own reply ids |
| `instagram_oauth_states` | single-use CSRF state, stored as a digest |
| `instagram_reply_actions` | the durable reply queue |

## The comment flow

```
POST /webhook/instagram
  size → signature → JSON → object == "instagram"
  ↓
  TenantResolver.resolve(entry[].id)      ← the only trustworthy tenant signal
  ↓
  CommentGate.evaluate()                  ← 7 gates, each with a named reason
  ↓
  HandoffBuilder.build()                  ← wa.me link, product-aware
  ↓
  ReplyQueue.enqueue()                    → 200, fast
```

Then out of band: the worker claims due actions every 5s, sends via Meta, and
retries transient failures with 2s/4s/8s…60s backoff up to 5 attempts.

### Why a comment might not get a reply

Every rejection is logged with a reason, and returned in the response body:

| Reason | Means |
|---|---|
| `no_connection` | Unknown account and no global token |
| `own_reply` | Our own reply came back to us — replying would loop |
| `own_comment` | The business commented on itself |
| `nested_comment` | A reply to a comment; enable `reply_to_nested_comments` |
| `no_keyword_match` | Failed the `comment_match_mode` rule |
| `reply_mode_none` | This account has replies switched off |
| `duplicate_delivery` | Meta redelivered a comment already handled |
| `no_reply_text` | No WhatsApp number configured for the account |

## Two deliberate differences from the bot engine's version

**Errors are not swallowed.** The old webhook caught everything and returned
`200 {"status": "error"}`. Meta reads 200 as success and never retries, so a
crash was indistinguishable from a healthy delivery — a real bug hid behind
that for weeks. Here an unexpected failure returns `500`, Meta retries, and the
claim in the funnel stops the retry becoming a duplicate reply.

**Everything keys on the Instagram account id.** The account id is the only
value in the webhook envelope, the only one that cannot be spoofed by payload
content, and now the only lookup key. The WhatsApp number is data about a
connection, never a path parameter — which also means two Instagram accounts
belonging to one business can be configured separately.

## Onboarding a vendor

```
GET  /integrations/instagram/connect?business_phone_number=91...   (X-API-Key)
     → send the vendor to the returned authorization_url
GET  /integrations/instagram/callback                              (Meta)
     → exchanges the code, subscribes `comments`, stores the token encrypted
```

Or register an existing token directly:

```
POST /integrations/instagram/connections                           (X-API-Key)
     {"instagram_account_id": "...", "business_phone_number": "...",
      "access_token": "..."}
```

Tokens last ~60 days; a background job refreshes them 7 days before expiry.
Meta requires a token to be at least 24h old before it can be refreshed.

## Deployment note

Meta must reach **this** service — not the Backend API on 8003, not the bot
engine on 8001. Point the tunnel at 8002 and set `PUBLIC_BASE_URL` to match
what is registered in the Meta dashboard. The service warns at startup if the
configured OAuth redirect points at a path it does not serve.
