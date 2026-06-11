# Novu Notifications — End-to-End Guide

> **Single source of truth** for the Novu notification feature. If you're new to
> this feature or debugging it, read this top to bottom — it covers the frontend
> Inbox, the backend trigger layer, the Supabase data model, and the Novu
> dashboard (workflows + integrations) as one connected system.
>
> **Keep this doc in sync.** Any change to the Novu feature (files listed in
> [Component Inventory](#component-inventory), the env vars, or the Novu workflow
> setup) MUST update this file in the same change. This is enforced by CLAUDE.md.

---

## 1. TL;DR — the mental model

- We run a **self-hosted Novu** instance at `https://notifications.redsentinel.xyz`
  (API is served under the `/api` path prefix). It is **v3.17**.
- A Novu **subscriber == one Red Sentinel profile** (`ss_users.id`, a UUID). One
  profile spans many wallets + email + telegram, so the profile id is the stable
  identity to notify. **We never use a wallet address as the subscriber.**
- Two things happen in our code:
  1. **Frontend** renders the in-app notification **Inbox** (the bell) using
     `@novu/nextjs`, subscribed as the logged-in profile id.
  2. **Backend** (`backend-service/api`) **triggers workflows** by id via the
     `@novu/api` SDK when real events happen (today: a user connects email/telegram).
- **Workflows are authored in the Novu dashboard UI** (NOT code-first / not a
  bridge). Our backend only triggers them by identifier and passes a payload.

```
                         ┌──────────────────────────────────────────┐
                         │  Self-hosted Novu (notifications.…/api)   │
                         │  • Integrations: Email (SES/SMTP),        │
                         │    Telegram (bot token)                   │
                         │  • Workflow "welcome": in-app/email/chat  │
                         │  • Subscribers (keyed by profile id)      │
                         └───────▲───────────────────────┬──────────┘
        trigger(workflowId, to, payload)                 │ realtime (ws) + REST
        connectTelegram(chatId)                          │ render in-app feed
                 │                                        ▼
   ┌─────────────┴────────────┐               ┌────────────────────────┐
   │  Backend  (Fastify API)  │               │   Frontend (Next.js)   │
   │  services/novu.ts        │               │  NovuInbox.tsx <Inbox> │
   │  routes/auth/index.ts    │               │  (bell in AppTopbar)   │
   └─────────────┬────────────┘               └────────────────────────┘
                 │ reads channel destinations
                 ▼
   ┌──────────────────────────┐
   │  Supabase (sentinel)     │
   │  ss_users (profile id)   │
   │  ss_social_connections   │  platform='email'|'telegram' → platform_user_id
   └──────────────────────────┘
```

---

## 2. Key concepts

| Concept | In our system |
|---|---|
| **Subscriber** | `ss_users.id` (profile UUID). Passed as `subscriberId` everywhere. |
| **Channels** | `in_app` (the bell), `email`, `chat` (Telegram). |
| **Subscriber email** | Set inline on `trigger`'s `to.email`. Sourced from `ss_social_connections` where `platform='email'` → `platform_user_id`. |
| **Telegram chat** | A Novu **channel endpoint** (`type: 'telegram_chat'`) attached to the subscriber, holding the `chatId`. The chatId is `ss_social_connections.platform_user_id` where `platform='telegram'` (the Telegram user id captured when the user DMs our bot `/connect`). |
| **Integration** | A configured provider in the Novu dashboard (Email provider, Telegram bot). The Telegram integration's **identifier** is required to attach chat endpoints → `NOVU_TELEGRAM_INTEGRATION_ID`. |
| **Workflow** | Authored in the Novu UI. Identified by a string id (e.g. `welcome`). Has steps (in-app/email/chat) and a payload schema. |
| **Environment** | Novu has **Development** and **Production** envs, each with its own API keys. The frontend app identifier and the backend secret key MUST be from the **same** env as the workflow you're triggering. |

---

## 3. Component inventory (every file that matters)

### Frontend (`sui-sentinel/frontend`)
| File | Role |
|---|---|
| `components/layout/NovuInbox.tsx` | The `<Inbox>` bell. `subscriber={user.id}` (from `useAuth()`), points at the self-hosted instance via `backendUrl`/`socketUrl`, dark-themed. Renders `null` until authenticated. |
| `components/layout/AppTopbar.tsx` | Mounts `<NovuInbox />` next to the wallet connect button. |
| `constants/index.ts` | `NOVU_APP_IDENTIFIER` (from `NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER`), `NOVU_BACKEND_URL`, `NOVU_WEBSOCKET_HOSTNAME`. |
| dependency | `@novu/nextjs` (Inbox) + `@novu/react/themes` (dark theme). **No `@novu/framework`** — we are not code-first. |

### Backend (`backend-service/api`)
| File | Role |
|---|---|
| `services/novu.ts` | The whole server-side Novu surface. Exports `isNovuConfigured`, `isTelegramConfigured`, `connectTelegram`, `disconnectTelegram`, `triggerWorkflow`. Uses the `@novu/api` SDK. |
| `routes/auth/index.ts` | A trigger site. `WELCOME_WORKFLOW_ID = 'welcome'`. On **`POST /auth/email/verify`** and **`POST /auth/telegram/verify`**, fires the `welcome` workflow (fire-and-forget). |
| `routes/social/index.js` | A trigger site. `NEW_FOLLOWER_WORKFLOW_ID = 'new-follower'`. On a **new** `POST /social/follow`, fires the `new-follower` workflow to the followed user (fire-and-forget). Imports `services/novu.ts` with the literal `.ts` extension (the `.js`-file convention here). |
| `plugins/env.js` | Registers `NOVU_API_URL`, `NOVU_SECRET_KEY`, `NOVU_TELEGRAM_INTEGRATION_ID`. |
| dependency | `@novu/api` (version-matched to the server, 3.17.x). |

### Data (Supabase, schema `sentinel`)
| Table | Role |
|---|---|
| `ss_users` | `id` = the Novu subscriber id. |
| `ss_social_connections` | `platform` (`'email'` / `'telegram'`), `platform_user_id` (email address / Telegram chat id), `user_id`. The source of truth for channel destinations. |

### Novu dashboard (self-hosted)
- **Integration Store**: an **Email** provider (SES/SMTP) and a **Telegram** chat integration (bot token). The Telegram bot token MUST be the same bot users `/connect` to (Telegram bots can only message users who started them).
- **Workflows**: `welcome` (and any future ones). Authored entirely in the UI.

---

## 4. Flow A — the in-app Inbox (the bell)

1. `AppTopbar` renders `<NovuInbox />`.
2. `NovuInbox` reads the logged-in profile from `useAuth()`. If not authenticated
   (or `NOVU_APP_IDENTIFIER` unset), it renders nothing.
3. Otherwise it mounts `@novu/nextjs`'s `<Inbox subscriber={user.id} …>`, pointed
   at the self-hosted instance via `backendUrl` (`…/api`) and `socketUrl` (`wss://…`).
4. The Inbox opens a websocket for realtime unread counts and renders the feed.
   Any workflow with an **in-app step** triggered for that subscriber shows up here.
5. Clicking a notification with a `redirect.url` navigates via `next/navigation`.

**Requirements for the bell to light up:** the triggered workflow must have an
**in-app step**, and the frontend app identifier must match the env where that
workflow lives.

---

## 5. Flow B — "welcome" notification on channel connect (current real flow)

This is the one genuine notification wired today. When a user links a channel,
they get a welcome message on that channel.

### Telegram connect (`POST /auth/telegram/verify`)
1. User DMs the bot `/connect` → bot stores a verification code keyed to their
   Telegram user id (`backend-service/bot/commands/connect.ts`).
2. User enters the code in the app → `POST /auth/telegram/verify`.
3. The route inserts `ss_social_connections` (`platform='telegram'`,
   `platform_user_id = <telegram chat id>`).
4. **Fire-and-forget** (never blocks/fails the connect):
   ```ts
   void connectTelegram(userId, telegramUserId)
     .then(() => triggerWorkflow('welcome', userId, {
       firstName, payload: { channel: 'telegram', name }
     }))
     .catch(log)
   ```
   - `connectTelegram` attaches a `telegram_chat` **channel endpoint** to the
     subscriber. It is **self-healing**: it first lists and **deletes all existing
     Telegram endpoints** for this subscriber, then `channelEndpoints.create`s
     exactly one (identifier `tg-<subscriberId>`, keyed on the subscriber not the
     chatId), using `NOVU_TELEGRAM_INTEGRATION_ID`. Delete-then-create-one
     guarantees a single endpoint → a single delivery, regardless of any leftovers
     from earlier identifier schemes or duplicate attaches.
   - `triggerWorkflow` calls `novu.trigger({ workflowId: 'welcome', to: { subscriberId }, payload })`.
5. Novu runs the `welcome` workflow; its **chat step** delivers to the Telegram endpoint.

### Email connect (`POST /auth/email/verify`)
1. User requests a code (`POST /auth/email/send-code`, sent via AWS SES), enters it.
2. `POST /auth/email/verify` upserts `ss_social_connections` (`platform='email'`).
3. **Fire-and-forget**:
   ```ts
   void triggerWorkflow('welcome', userId, {
     email, firstName, payload: { channel: 'email', name }
   }).catch(log)
   ```
   - Passing `email` inline on `to` upserts the subscriber's email in Novu, so the
     **email step** can resolve a destination. No separate "set email" call needed.
4. Novu runs `welcome`; its **email step** delivers.

### The payload contract
Every `welcome` trigger sends:
```jsonc
to:      { subscriberId, email?, firstName? }   // subscriber identity + email
payload: { channel: "email" | "telegram", name: "<display name / username>" }
```
So the **only** variables available in the workflow templates are:
`{{payload.name}}`, `{{payload.channel}}`, `{{subscriber.firstName}}`, `{{subscriber.email}}`.
Use `{{payload.name}}` for greetings (always populated; falls back to `"Operator"`).

---

## 5b. Flow C — "new follower" notification

When a user follows another user, the **followed** user is notified.

1. `POST /social/follow` (`backend-service/api/routes/social/index.js`) upserts the
   follow edge. The upsert uses `.select('id')`, which returns a row **only on a new
   follow** (an idempotent re-follow returns nothing) — so we never re-notify.
2. On a new follow, **fire-and-forget** `notifyNewFollower(...)` looks up the
   follower's profile and triggers:
   ```ts
   triggerWorkflow('new-follower', followingId /* the followed user */, {
     payload: { followerName, followerUsername, followerAvatar, profileUrl }
   })
   ```
   - Subscriber = the **followed** user's profile id (`following_id`).
   - No email/telegram is attached here — the followed user already has whatever
     channels they connected via their own welcome flow; the `new-follower` workflow
     just needs an **in-app step** (and optionally email/chat if they want those).

**Payload contract** (`new-follower`):
```jsonc
payload: { followerName, followerUsername, followerAvatar, profileUrl }
```
Template variables: `{{payload.followerName}}`, `{{payload.followerUsername}}`,
`{{payload.followerAvatar}}`, `{{payload.profileUrl}}` (e.g. `/u/<username>`, good as
the in-app notification's redirect URL).

---

## 6. Environment variables

### Frontend (`sui-sentinel/frontend/.env.local`)
| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER` | Public app identifier for the `<Inbox>`. Must be from the **same Novu env** as the workflows. |

`NOVU_BACKEND_URL` and `NOVU_WEBSOCKET_HOSTNAME` are currently **hardcoded** in
`constants/index.ts` (point at the self-hosted instance). There is **no**
`NOVU_SECRET_KEY` in the frontend — triggering lives in the backend.

### Backend (`backend-service/api/.env`)
| Var | Purpose |
|---|---|
| `NOVU_API_URL` | Self-hosted API origin **including `/api`** (e.g. `https://notifications.redsentinel.xyz/api`). The SDK appends `/v1/...`. |
| `NOVU_SECRET_KEY` | Secret key from the Novu dashboard. Server-only. Use the key for the **same env** (Dev/Prod) as your workflows. |
| `NOVU_TELEGRAM_INTEGRATION_ID` | Identifier of the Telegram chat integration (Integration Store → Telegram). Required only for Telegram delivery; blank = email/in-app only. |

---

## 7. Novu dashboard setup (what lives in the UI)

1. **Integration Store → Email**: add SES/SMTP, set a verified `from`, mark **Active**.
2. **Integration Store → Telegram (chat)**: paste the **same bot token** users
   `/connect` to. Mark **Active**. Copy its **Identifier** → `NOVU_TELEGRAM_INTEGRATION_ID`.
3. **Workflow `welcome`** (identifier must be exactly `welcome`):
   - **In-app step** — always runs (lights the bell).
   - **Email step** — content + `{{payload.name}}`. Add a **step condition**:
     run only if `payload.channel` **equals** `email`.
   - **Chat step** — bound to the Telegram integration; body uses `{{payload.name}}`.
     Add a **step condition**: run only if `payload.channel` **equals** `telegram`.
   - The step conditions replace the channel-awareness we'd otherwise do in code,
     so connecting email doesn't also send a Telegram message and vice versa.
4. **Publish changes** after editing.

---

## 8. How to add a NEW notification

1. **Author the workflow in the Novu dashboard** (steps, templates, payload schema).
   Note its identifier.
2. **Trigger it from the backend** wherever the event fires:
   ```ts
   import { isNovuConfigured, triggerWorkflow } from '../../services/novu.js'
   if (isNovuConfigured()) {
     void triggerWorkflow('<workflow-id>', subscriberId, {
       email, firstName, payload: { /* matches the workflow's variables */ }
     }).catch(err => fastify.log.error({ action: '<x>_notify_failed', err }))
   }
   ```
   - Always **fire-and-forget** (`void … .catch(log)`) so notifications never block
     or fail the underlying user action.
   - If it needs Telegram, ensure the subscriber has a chat endpoint
     (`connectTelegram` runs on telegram connect already).
3. For on-chain events, the trigger would live in the indexer
   (`backend-service/functions`) and map wallet → profile id first.
4. **Update this doc.**

---

## 9. Debugging / troubleshooting

**First stop: Novu → Activity Feed.** It shows every trigger and per-step status
(delivered / skipped / failed + the provider error). Filter by subscriber id.

| Symptom | Likely cause / fix |
|---|---|
| Nothing arrives, no activity at all | Env mismatch: backend `NOVU_SECRET_KEY` / frontend app identifier are from a different Novu **environment** than the workflow. |
| Activity shows the run but **email step** says *"Subscriber missing email address"* | That profile has no `email` row in `ss_social_connections` (telegram-only user), or the trigger didn't pass `to.email`. |
| Triggered but **no Telegram message** | The `welcome` workflow has **no chat step**, or `NOVU_TELEGRAM_INTEGRATION_ID` is unset/wrong, or the bot token in Novu isn't the bot the user started. |
| The connect/verify route **hangs for a long time** | Notifications must be **fire-and-forget**. If someone re-`await`s them in the request path, a slow/failing Novu call (or SDK retries) blocks the response. The client is configured with `timeoutMs: 10000` + `retryConfig: { strategy: 'none' }` to fail fast. |
| **Duplicate** Telegram messages | The subscriber has multiple `telegram_chat` channel endpoints (a chat step fans out to all of them) — e.g. an old `tg-<chatId>` endpoint sitting next to the new `tg-<subscriberId>` one. `connectTelegram` self-heals by deleting all existing Telegram endpoints for the subscriber before creating one, so reconnecting Telegram collapses it back to a single endpoint. To fix without reconnecting, delete the extras in the dashboard (Subscribers → endpoints). |
| **No message on a 2nd/re-linked profile** (worked on the first) | The same Telegram account was linked to profile A, then re-linked to profile B. The endpoint identifier was keyed on the chatId (`tg-<chatId>`), shared across profiles → B's create 409'd and was swallowed → B had no endpoint. Fixed by keying the identifier on the subscriber (`tg-<subscriberId>`) so each profile gets its own endpoint, and by removing the endpoint on disconnect (`disconnectTelegram`). |
| **Same chat gets notifications for *multiple* of your profiles** | Each profile you linked this Telegram to has its own `telegram_chat` endpoint with the same chatId. Disconnecting used to leave those endpoints behind, so every such profile kept delivering to your chat. `disconnectTelegram` now removes the endpoint on disconnect. To clear endpoints left over from *before* this fix, delete them on each old profile's subscriber in the dashboard (Subscribers → endpoints), or reconnect+disconnect Telegram on each. |
| In-app bell never updates | Workflow has no **in-app step**, or app identifier is from the wrong env, or the user isn't authenticated (Inbox renders `null`). |
| Backend logs `welcome_telegram_notify_failed` / `welcome_email_notify_failed` | The fire-and-forget `.catch` logged the real error — read it; usually integration id or missing destination. |

---

## 10. Design decisions & gotchas (why it's built this way)

- **Subscriber = profile id, not wallet.** One profile spans many wallets + email
  + telegram; the profile id is the only stable identity.
- **`@novu/api`, not `@novu/node`.** `@novu/node` is the legacy SDK and its types
  predate this server (e.g. no Telegram `chatId`). `@novu/api@3.17` is version-matched.
- **Dashboard-managed workflows, not code-first.** We evaluated the `@novu/framework`
  bridge (code-defined workflows) but chose UI-authored workflows. There is **no**
  bridge endpoint and no `@novu/framework` dependency. The backend triggers by id.
- **Telegram `chatId` via `channelEndpoints.create`, not `credentials.update`.**
  The SDK's `ChannelCredentials` type (used by `credentials.update`) has no `chatId`
  field and its zod schema strips unknown keys — so `chatId` would be silently
  dropped. The typed `channelEndpoints.create({ type: 'telegram_chat', endpoint: { chatId } })`
  path is the only one that preserves it, and it requires the integration identifier.
- **Telegram endpoint identity = subscriber, and self-heal.** The chat endpoint
  identifier is `tg-<subscriberId>` (NOT `tg-<chatId>`). Keying on the chatId made
  the identifier collide when the same Telegram account was re-linked to a new
  profile, so the second profile's `create` 409'd and got no endpoint. Because a
  chat step fans out to *every* endpoint on a subscriber, `connectTelegram` also
  deletes all existing Telegram endpoints for the subscriber before creating one
  (delete-then-create-one) — this guarantees exactly one delivery and cleans up
  any leftovers from older schemes.
- **Telegram disconnect removes the Novu endpoint.** When a profile disconnects
  Telegram (`DELETE /auth/social/:id` with `platform='telegram'`), the handler calls
  `disconnectTelegram(userId)` to delete that subscriber's Telegram endpoint. Without
  this, the endpoint lingers and the profile keeps receiving chat notifications (e.g.
  `new-follower`) even after "disconnecting" — and if the same chat was linked to
  several profiles over time, every one of them would deliver to that chat.
- **Fire-and-forget triggers.** Notification delivery must never block or fail a
  user action (connecting a channel). All triggers are `void … .catch(log)`.
- **Fail-fast client.** `timeoutMs: 10000` + `retryConfig: { strategy: 'none' }`
  so a bad Novu call errors quickly instead of retry-hanging.
- **Env matching is the #1 footgun.** Dev and Prod are separate Novu environments
  with separate keys and separate copies of each workflow. Mismatched keys =
  "nothing happens" with no obvious error.
- **Telegram bot identity.** Novu's Telegram integration must use the *same* bot
  token users `/connect` to — bots can only message users who started a chat with them.

---

## 11. Quick reference — file paths

```
sui-sentinel/frontend/
  components/layout/NovuInbox.tsx        # <Inbox> bell
  components/layout/AppTopbar.tsx        # mounts the bell
  constants/index.ts                     # NOVU_APP_IDENTIFIER, NOVU_BACKEND_URL, NOVU_WEBSOCKET_HOSTNAME

backend-service/api/
  services/novu.ts                       # @novu/api client + connectTelegram + triggerWorkflow
  routes/auth/index.ts                   # WELCOME_WORKFLOW_ID; triggers welcome on email/telegram verify
  routes/social/index.js                 # NEW_FOLLOWER_WORKFLOW_ID; triggers new-follower on POST /social/follow
  plugins/env.js                         # NOVU_API_URL, NOVU_SECRET_KEY, NOVU_TELEGRAM_INTEGRATION_ID

backend-service/bot/
  commands/connect.ts                    # /connect → telegram verification code (captures chat id)
```
