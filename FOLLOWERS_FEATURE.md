# Followers / Following — Developer Guide

A Twitter-style social graph for Sui Sentinel. Every profile shows a **follower count** and a
**following count**; each is clickable and opens a tabbed, infinite-scroll list of users. Other
people's public profiles get a **Follow / Unfollow** button, and every row in the list has its own
follow-back button.

This document is the single source of truth for the feature. Read it top-to-bottom and you'll
understand the data model, the auth model, every backend endpoint, every frontend file, and how a
single click travels from the browser to Postgres and back.

---

## Table of contents

1. [What it does (user's view)](#1-what-it-does-users-view)
2. [Architecture at a glance](#2-architecture-at-a-glance)
3. [Identity & auth model — read this first](#3-identity--auth-model--read-this-first)
4. [Data model & migration](#4-data-model--migration)
5. [Backend reference (Fastify)](#5-backend-reference-fastify)
6. [Frontend reference (Next.js)](#6-frontend-reference-nextjs)
7. [End-to-end: one "Follow" click](#7-end-to-end-one-follow-click)
8. [Running & testing locally](#8-running--testing-locally)
9. [How to extend it](#9-how-to-extend-it)
10. [Design decisions & gotchas](#10-design-decisions--gotchas)
11. [File map](#11-file-map)

---

## 1. What it does (user's view)

- On **someone else's** profile (`/u/<username>`): a **Follow** button (toggles to **Following**,
  and **Unfollow** on hover) plus the two counts.
- On **your own** profile (`/profile` and your `/u/<username>`): the counts only — you can't follow
  yourself, so no button.
- Clicking a count opens a modal with **Followers** / **Following** tabs. Each row links to that
  user's profile and carries its own follow-back button.
- Follow state updates **optimistically** (instant UI), then reconciles with the server.

The graph is **one-directional** (like Twitter/X), not mutual friendship: A following B does not
imply B follows A.

---

## 2. Architecture at a glance

The follow graph is pure off-chain social metadata, so it lives in **Supabase Postgres** (the
`sentinel` schema) and is written **only** by the backend Fastify API. The Next.js frontend never
touches the table directly.

```
Browser (React, Next.js App Router)
  │
  │  lib/auth-api.ts  →  fetch()  with `x-user-id` header (writes) / plain GET (reads)
  ▼
Backend Fastify API  (backend-service/api)   base URL = SUI_SENTINEL_API_URL
  │   routes/social/index.js     ← follow / unfollow / followers / following / counts
  │   shared/user-auth.js         ← requireUserAuth preHandler (x-user-id gate)
  │   plugins/supabase.js         ← service-role client, schema: 'sentinel'
  ▼
Supabase Postgres  (sentinel schema)
      ss_user_follows              ← the edge table (follower_id → following_id)
      ss_users / ss_social_connections / ss_wallet_connections  ← joined for enrichment
```

Why the backend and not Next.js API routes? Two reasons:

1. **Trust.** The user-attributed write pattern (the `x-user-id` header + a `ss_users` existence
   check) already lives in the backend `/auth` routes. The Next.js `/api/profile/*` routes trust a
   wallet address passed in the request body — we deliberately do **not** put follow writes there.
2. **Reuse.** The enrichment join (username/avatar/socials/wallets) is the same one the rewards
   leaderboard already does in `routes/rewards/index.js`, using the service-role Supabase client.

---

## 3. Identity & auth model — read this first

Everything about who-can-do-what hinges on understanding the existing identity model. Don't skip
this.

- A **user** is a row in `ss_users`, keyed by `id` (a UUID). One user owns **many wallets**
  (`ss_wallet_connections`) and **many social links** (`ss_social_connections`). `username` is
  unique but **mutable** (users can rename via `app/api/profile/update`).
- A user **logs in by signing a message** with their wallet. The frontend flow:
  `getNonce()` → wallet signs → `walletConnect()` verifies the signature server-side
  (`backend-service/api/routes/auth/index.ts`) and returns the `UserProfile` (including `id`). This
  is the **only** signature-verified step.
- The verified `user.id` is stored client-side in `localStorage` (`rs_auth_user`) and exposed
  app-wide through **`useAuth()`** (`context/AuthContext.tsx`).
- Every **user-attributed write** to the backend carries that id in the **`x-user-id` header** —
  the exact pattern used by `addWallet`, `verifyEmail`, `removeSocial`. The backend trusts the
  header after confirming it maps to a real `ss_users` row (it does **not** re-verify a signature on
  every action). Follow/unfollow use the same boundary, so they're no weaker — and no stronger —
  than the rest of the authenticated API.

**Practical rule for this feature:**
- **Reads** (counts, lists) are **public** — no header needed. An optional `viewerId` query lets the
  API mark which rows the viewer already follows.
- **Writes** (follow, unfollow) **require** the `x-user-id` header. The actor is always the header
  user; you can never follow "as" someone else through the API surface.

---

## 4. Data model & migration

### Table: `sentinel.ss_user_follows`

| column         | type        | notes                                              |
|----------------|-------------|----------------------------------------------------|
| `id`           | uuid PK     | `default gen_random_uuid()`                        |
| `follower_id`  | uuid        | FK → `ss_users.id` ON DELETE CASCADE — the actor   |
| `following_id` | uuid        | FK → `ss_users.id` ON DELETE CASCADE — the target  |
| `created_at`   | timestamptz | `default now()` — also the list sort key (newest first) |

Constraints / indexes:
- `UNIQUE (follower_id, following_id)` — a follow is idempotent; you can't follow twice.
- `CHECK (follower_id <> following_id)` — self-follow is impossible at the DB level.
- index on `following_id` — fast "who follows X" (followers list).
- index on `follower_id` — fast "who does X follow" (following list).

> **Why UUIDs, not usernames, as the edge keys?** Usernames are mutable, so keying the graph on them
> would break or cascade on every rename. `ss_users.id` is immutable and is what every other table +
> the `ss_rewards_leaderboard` view already key on, which keeps the enrichment join a clean
> `.in('user_id', ids)`. Usernames live only at the **URL boundary** (`/u/<username>`); inside the
> data everything is UUID.

### Migration (run once, manually)

There is no migration runner for the `sentinel` schema, so apply this SQL in the Supabase SQL editor:

```sql
create table sentinel.ss_user_follows (
  id           uuid primary key default gen_random_uuid(),
  follower_id  uuid not null references sentinel.ss_users(id) on delete cascade,
  following_id uuid not null references sentinel.ss_users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  constraint ss_user_follows_unique unique (follower_id, following_id),
  constraint ss_user_follows_no_self check (follower_id <> following_id)
);

create index ss_user_follows_following_idx on sentinel.ss_user_follows (following_id);
create index ss_user_follows_follower_idx  on sentinel.ss_user_follows (follower_id);
```

After it lands, regenerate Supabase types from the frontend so `lib/database.types.ts` knows the
table: `bun run generate:types:prod`. (The frontend talks to the backend and doesn't reference the
generated `ss_user_follows` type today, but keeping types in sync is good hygiene.)

**Counts are computed live** with `count: 'exact'` queries — they are *not* denormalized onto
`ss_users`. This keeps writes a single insert/delete with no counters to drift. Revisit only if
counts ever become a measured hot path.

---

## 5. Backend reference (Fastify)

All three files live under `backend-service/api/`. Routes are auto-loaded by `@fastify/autoload`
(`app.js`), so the folder name `routes/social/` becomes the URL prefix `/social`. The full base URL
in the frontend is `SUI_SENTINEL_API_URL` (prod: `https://api.suisentinel.xyz`).

### 5.1 `shared/user-auth.js` — the auth gate

```js
export async function requireUserAuth(request) { … }
```

A Fastify `preHandler`. It:
1. reads `x-user-id` from headers — 401 if missing;
2. confirms it's a real `ss_users.id` via the service-role client — 401 if not;
3. attaches it to `request.userId` for the handler.

This mirrors `shared/auth.js`'s `requireAdminAuth` (the admin-token equivalent). Use it on any new
user-attributed write endpoint, social or otherwise.

### 5.2 `routes/social/schemas.js` — request/response validation

Plain Fastify JSON-schema objects (the repo convention — **not** Zod). Notable bits:
- `userIdHeader` — `headers: { required: ['x-user-id'], 'x-user-id': { format: 'uuid' } }`. Fastify
  validates this before the handler runs.
- List user objects are `{ type: 'object', additionalProperties: true }` on purpose — Fastify's
  response serializer strips unknown keys, and we don't want to lose enriched fields.

### 5.3 `routes/social/index.js` — the endpoints + helpers

**Internal helpers** (not exported, used by the handlers):

| helper | what it does |
|---|---|
| `resolveUser(instance, identifier)` | Accepts a UUID **or** username (regex-detected) and returns the minimal `ss_users` row, 404 if missing. Mirrors the lookup in `app/u/[identifier]/page.tsx`. |
| `buildProfilesByUserId(instance, userIds)` | One batched fetch each of `ss_users` + `ss_social_connections` + `ss_wallet_connections`, returns a `Map<userId, profile>`. No N+1 — same shape the rewards leaderboard returns. |
| `getFollowedSet(instance, viewerId, targetIds)` | One query: of `targetIds`, which does `viewerId` already follow? Returns a `Set`. Powers the per-row `is_following` flag. |
| `listRelations(instance, request, direction)` | Shared body for the followers/following endpoints (they only differ by which column matches vs. selects). |

**Endpoints:**

| Method & path | Auth | Body / Query | Returns |
|---|---|---|---|
| `POST /social/follow` | `x-user-id` | `{ following_id: uuid }` | `{ status: 'followed' }` |
| `DELETE /social/follow/:following_id` | `x-user-id` | — | `{ status: 'unfollowed' }` |
| `GET /social/:identifier/followers` | public | `?limit&offset&viewerId` | `{ users, total, limit, offset }` |
| `GET /social/:identifier/following` | public | `?limit&offset&viewerId` | `{ users, total, limit, offset }` |
| `GET /social/:identifier/counts` | public | `?viewerId` | `{ followers, following, viewer_is_following }` |

`:identifier` is a **UUID or a username**. `limit` is capped at 50 (default 20); list order is
`created_at` descending (most recent follows first).

**`POST /social/follow` guards, in order:** self-follow → 400; target user missing → 404; then an
idempotent `upsert(..., { onConflict: 'follower_id,following_id', ignoreDuplicates: true })` so a
double-follow is a silent no-op. `DELETE` is naturally idempotent.

**Enriched list row shape** (one element of `users`):

```jsonc
{
  "user_id": "uuid",
  "username": "alice",
  "display_name": "Alice",
  "avatar_url": "https://…",
  "wallet_addresses": ["0x…"],
  "twitter_username": "alice_x",
  "twitter_avatar": "https://…",
  "is_following": true   // does the viewer (viewerId) follow this row's user?
}
```

---

## 6. Frontend reference (Next.js)

All paths are under `sui-sentinel/frontend/`. The layering is strict and worth keeping:
**`lib/auth-api.ts`** (transport) → **`hooks/social/*`** (React Query) → **`components/profile/*`**
(UI) → **pages**.

### 6.1 `lib/auth-api.ts` — the transport layer

Adds the follow functions next to the existing auth ones (same `handleResponse` helper,
`credentials: 'include'`, and `x-user-id` header for writes). `SOCIAL_BASE_URL =
`${SUI_SENTINEL_API_URL}/social``.

| function | calls |
|---|---|
| `followUser(userId, followingId)` | `POST /social/follow` |
| `unfollowUser(userId, followingId)` | `DELETE /social/follow/:followingId` |
| `getFollowCounts(identifier, viewerId?)` | `GET /social/:identifier/counts` |
| `getFollowers(identifier, { limit, offset, viewerId })` | `GET /social/:identifier/followers` |
| `getFollowing(identifier, { limit, offset, viewerId })` | `GET /social/:identifier/following` |

Exported types: `FollowCounts`, `FollowListUser`, `FollowListResponse`.

### 6.2 `hooks/social/` — React Query layer

All hooks read the viewer's id from `useAuth()` internally, so callers only pass the **target**
identifier. Stale time is 60 s (the app-wide default).

| hook (file) | type | query key | purpose |
|---|---|---|---|
| `useFollowCounts(identifier, { enabled })` (`useFollowCounts.ts`) | `useQuery` | `['follow-counts', identifier, viewerId]` | the two counts + `viewer_is_following`. `enabled: false` lets a caller mount it without fetching. |
| `useFollowers(identifier, limit?)` (`useFollowers.ts`) | `useInfiniteQuery` | `['followers', identifier, viewerId]` | paginated followers list |
| `useFollowing(identifier, limit?)` (`useFollowers.ts`) | `useInfiniteQuery` | `['following', identifier, viewerId]` | paginated following list |
| `useFollowMutation()` (`useFollowMutation.ts`) | `useMutation` | — | `mutate(targetUserId)` → follow |
| `useUnfollowMutation()` (`useFollowMutation.ts`) | `useMutation` | — | `mutate(targetUserId)` → unfollow |

> `useFollowers` and `useFollowing` deliberately share one file — they're symmetric and import the
> same `getNextPageParam`.

**Cache invalidation:** both mutations, on success, invalidate the `follow-counts`, `followers`, and
`following` query-key *prefixes*. Because the prefix match ignores the trailing `identifier`/
`viewerId`, every mounted counts widget and list refreshes — including the target's counts and any
list you're looking at. Errors surface via a `sonner` toast.

### 6.3 `components/profile/` — the UI (one main component per file)

**`FollowButton.tsx`** — the client island. Props:
`{ targetUserId, seeded?, initialIsFollowing?, size?, className? }`.
- Hidden (`return null`) when logged out **or** when `viewerId === targetUserId` (no self-follow).
- **Two modes** to control where the "am I following?" state comes from:
  - **self-fetch** (default, used in the profile header): calls `useFollowCounts(targetUserId)` and
    reads `viewer_is_following`. One request.
  - **seeded** (`seeded` + `initialIsFollowing`, used in list rows): takes the state from the row
    data — avoids one counts request *per row*. The hook is still called but disabled via its
    `enabled` flag, so the rules-of-hooks are respected.
- **Optimistic:** clicking sets local `optimistic` state immediately, fires the mutation, and only
  reverts on error. The optimistic value is kept (not cleared on success) so it converges smoothly
  with the invalidated server state — no flicker.

**`FollowStats.tsx`** — the two clickable counts. Props `{ identifier, className? }`. Reads
`useFollowCounts(identifier)` for the numbers and opens `FollowListModal` on the tab you clicked.

**`FollowListModal.tsx`** — radix `Dialog` + `Tabs`. Props `{ identifier, open, onClose,
initialTab? }`. The panels render **only while the dialog is open**, so no list data is fetched until
the user opens it. Syncs its active tab to whichever count opened it.

**`FollowListPanel.tsx`** — the infinite list for one tab. Props `{ identifier, direction,
onNavigate? }`. It calls *both* list hooks but disables the inactive one (passing `undefined`
identifier), so only the visible tab fetches. Renders loading / empty / list + a "Load more" button
driven by `hasNextPage`.

**`FollowListRow.tsx`** — one row: avatar + display name/@username linking to `/u/<username>`
(falls back to the wallet address), plus a **seeded** `FollowButton` for follow-back.

### 6.4 Page wiring

- **`app/u/[identifier]/page.tsx`** (server component): `getUserProfile` already resolves the visited
  `user`. The header renders `<FollowButton targetUserId={user.id} />` (self-fetch mode) next to the
  name and `<FollowStats identifier={user.id} />` below it. The button/stats are client islands, so
  they hydrate and read the viewer from `localStorage`/`useAuth()` on the client.
- **`app/profile/page.tsx`** (client, your own profile): renders `<FollowStats identifier={profile.id}
  />` in the meta row. No follow button (it's you).

---

## 7. End-to-end: one "Follow" click

Walking the full path makes the layering concrete:

1. **Click.** On `/u/alice`, you (logged in as Bob) click **Follow**. `FollowButton` is in
   self-fetch mode; `useFollowCounts('alice-id')` already told it `viewer_is_following: false`.
2. **Optimistic UI.** The button sets `optimistic = true` → instantly renders **Following**.
3. **Mutation.** `useFollowMutation().mutate('alice-id')` calls
   `followUser(bobId, 'alice-id')` → `POST /social/follow` with header `x-user-id: bobId`, body
   `{ following_id: 'alice-id' }`.
4. **Backend gate.** `requireUserAuth` confirms `bobId` exists → `request.userId = bobId`.
5. **Backend write.** Handler rejects self-follow, confirms Alice exists, then upserts
   `(follower_id: bobId, following_id: alice-id)` into `ss_user_follows` (idempotent). Returns
   `{ status: 'followed' }`.
6. **Reconcile.** On success the mutation invalidates `follow-counts` / `followers` / `following`.
   Alice's counts widget refetches → her followers count ticks up; if Alice's followers modal is
   open anywhere, Bob now appears with `is_following` reflecting the viewer.
7. **Failure path.** If the POST errors, the button's `onError` reverts `optimistic` to `null`
   (back to server truth) and a toast explains why.

---

## 8. Running & testing locally

**Prereq:** apply the migration in §4 first, or every call 500s on a missing table.

**Backend** (`cd backend-service/api && bun run dev`, port 3005). Smoke-test with curl — grab two
real `ss_users.id`s (Bob = actor, Alice = target):

```bash
# follow
curl -X POST localhost:3005/social/follow \
  -H 'content-type: application/json' -H "x-user-id: $BOB" \
  -d "{\"following_id\":\"$ALICE\"}"          # → {"status":"followed"}

# idempotent — second call is a no-op, still 200
curl -X POST localhost:3005/social/follow \
  -H 'content-type: application/json' -H "x-user-id: $BOB" \
  -d "{\"following_id\":\"$ALICE\"}"

# counts (by id or username), with viewer relationship
curl "localhost:3005/social/$ALICE/counts?viewerId=$BOB"
#   → {"followers":1,"following":0,"viewer_is_following":true}

# followers list, enriched + is_following
curl "localhost:3005/social/$ALICE/followers?viewerId=$BOB"

# unfollow
curl -X DELETE "localhost:3005/social/follow/$ALICE" -H "x-user-id: $BOB"
#   → {"status":"unfollowed"}

# guard: self-follow → 400
curl -X POST localhost:3005/social/follow \
  -H 'content-type: application/json' -H "x-user-id: $BOB" \
  -d "{\"following_id\":\"$BOB\"}"
```

**Frontend** (`cd sui-sentinel/frontend && bun dev`). Log in with a wallet (signature flow), then on
another user's `/u/<username>`:
- The Follow button appears (hidden when logged out or on your own profile).
- Follow → instant **Following**; the count ticks up; a reload persists it.
- Click the followers count → the modal lists you, with a working follow-back button.
- Unfollow → reverts.

> Per `sui-sentinel/frontend/CLAUDE.md`, don't run `build`/`tsc` for the frontend — lint and manual
> verification only.

---

## 9. How to extend it

- **A Follow button somewhere new** (leaderboard row, agent card, etc.): drop in
  `<FollowButton targetUserId={…} />`. If you already know the relationship (e.g. the row payload has
  it), pass `seeded initialIsFollowing={…}` to skip the per-instance counts fetch.
- **Show counts anywhere:** `<FollowStats identifier={userIdOrUsername} />`.
- **A new user-attributed write endpoint:** copy the `requireUserAuth` + `request.userId` pattern;
  never trust an actor id from the body.
- **Notifications on follow:** hook into the `POST /social/follow` handler after the upsert (mirror
  how the indexer fans out Telegram notifications) — out of scope today.
- **Denormalized counts:** only if profiling shows the live `count` queries are hot. Add
  `followers_count`/`following_count` to `ss_users` and maintain them in the follow/unfollow handlers
  (or a DB trigger). Not needed at current scale.

---

## 10. Design decisions & gotchas

- **UUID edges, username URLs.** Don't reintroduce username as a foreign key — see §4.
- **`x-user-id` is asserted, not signature-verified per request.** This matches the whole
  authenticated API. Acceptable trust boundary; don't single this feature out for a stronger scheme
  without upgrading the rest.
- **Never add follow writes to Next.js `/api/profile/*` routes** — they trust a body wallet address.
  All writes go through the backend.
- **Reads are public.** Counts and lists are intentionally not private (Twitter-style). Only
  follow/unfollow require auth.
- **`additionalProperties: true`** on the list-user response schema is load-bearing — without it
  Fastify strips the enriched fields.
- **Seeded vs self-fetch `FollowButton`** exists purely to avoid N counts requests inside a list.
  Keep list rows seeded.
- **Optimistic value is sticky** (only reverts on error) to avoid a flicker between "success" and the
  invalidation refetch landing.

---

## 11. File map

**Backend — `backend-service/api/`**

| file | role |
|---|---|
| `shared/user-auth.js` | `requireUserAuth` preHandler (x-user-id gate) |
| `routes/social/schemas.js` | JSON-schema validation for the 5 endpoints |
| `routes/social/index.js` | the 5 endpoints + enrichment helpers |

**Frontend — `sui-sentinel/frontend/`**

| file | role |
|---|---|
| `lib/auth-api.ts` | transport: follow client functions + types |
| `hooks/social/useFollowCounts.ts` | counts query |
| `hooks/social/useFollowers.ts` | followers + following infinite queries |
| `hooks/social/useFollowMutation.ts` | follow + unfollow mutations |
| `components/profile/FollowButton.tsx` | follow/unfollow toggle (client island) |
| `components/profile/FollowStats.tsx` | clickable counts → opens modal |
| `components/profile/FollowListModal.tsx` | tabbed Followers/Following dialog |
| `components/profile/FollowListPanel.tsx` | one tab's infinite list |
| `components/profile/FollowListRow.tsx` | one user row + follow-back button |
| `app/u/[identifier]/page.tsx` | public profile — button + stats |
| `app/profile/page.tsx` | own profile — stats only |

**Database** — `sentinel.ss_user_follows` (manual migration, §4).
