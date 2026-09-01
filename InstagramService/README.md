# Instagram Handler

Standalone FastAPI service for the Instagram side of HiCore Slotify: comment
comment automation, WhatsApp handoff, token lifecycle.

Instagram is a funnel, not a place business gets done. Every path here ends by
handing the conversation to WhatsApp — a comment gets a public reply plus a
private reply carrying a `wa.me` link. Inbound DMs are not handled at all: the
account is subscribed to `comments` only, so Meta never delivers them. No
conversation engine,
no sessions, no sequences.

```
python main.py           # or: uvicorn main:app --port 8002
```

## What it depends on

Almost nothing. It imports no code from `Backend/` or `Workflows/`.

It reads no other service's tables either. Where a commenter is sent is one
row per reel in `instagram_reel_links` — the link stored whole and already
URL-encoded, seeded by `seed_reel_links.py`. Each row also carries the account
the reel belongs to, and a reel seeded against a different account is refused
rather than answered, so a mis-typed link cannot send one vendor's customer
into another vendor's WhatsApp. Nothing assembles a URL at
runtime, and a reel with no row gets no reply rather than a guessed one.
Backend's management level takes that table over later; `services/reel_links.py`
is the one interface to swap.

Its own database, `instagram.db`, holding four tables:

| Table | Holds |
|---|---|
| `instagram_connections` | account → business, encrypted token, per-account policy |
| `instagram_processed_events` | duplicate-delivery claims and our own reply ids |
| `instagram_reply_actions` | the durable reply queue |
| `instagram_reel_links` | reel → its owning account and the WhatsApp link seeded for it |

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

By hand, in two calls. There is no OAuth flow — generate a long-lived token
for the account in the Meta dashboard, then:

```
POST /integrations/instagram/connections                           (X-API-Key)
     {"instagram_account_id": "...", "business_phone_number": "...",
      "access_token": "...", "instagram_username": "..."}

POST /integrations/instagram/connections/{id}/subscribe            (X-API-Key)
```

The second call is not optional. Configuring the callback URL in the dashboard
subscribes the *app*; each professional account must additionally be
subscribed to `comments`, and without it the account's comments are never
delivered — which looks exactly like nobody having commented.

Tokens last ~60 days. `token_expires_at` is recorded on create (assumed to be
60 days out when not supplied) and a background job refreshes anything inside
a 7-day margin, so a vendor added once keeps working. Meta requires a token to
be at least 24h old before it can be refreshed. `POST /{id}/refresh-token`
forces it early.

## Deployment note

Meta must reach **this** service — not the Backend API on 8003, not the bot
engine on 8001. Point the tunnel at 8002 and set `PUBLIC_BASE_URL` to match
what is registered in the Meta dashboard. The service logs the webhook URL it
expects Meta to deliver to at startup.
