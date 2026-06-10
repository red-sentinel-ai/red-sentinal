# Followers / Following Feature

A Twitter-style social graph for Sui Sentinel: every profile shows a **follower count** and a
**following count**, each clickable to reveal an enriched list of users, plus a **Follow / Unfollow**
button on other people's public profiles.

> Status: **implemented** (Jun 2026).
>
> As-built deviations from the original spec:
> - Public GET endpoints take `:identifier` that accepts **either a user id (uuid) or a
>   username** (resolved internally), not username-only. The frontend passes the uuid it
>   already holds.
> - `useFollowers` and `useFollowing` live in a single file `hooks/social/useFollowers.ts`.
> - An extra `components/profile/FollowListPanel.tsx` holds the per-tab infinite list so the
>   modal stays lean and hooks only mount when the dialog is open.

---

## 1. Context & constraints

This feature fits the existing identity model rather than inventing a new one.

- **User identity** = `ss_users.id` (UUID). A user owns many wallets (`ss_wallet_connections`) and
  many social links (`ss_social_connections`). `username` is unique but **mutable**.
- **Authenticated actor** = `useAuth().user.id` on the frontend, obtained through the
  signature-verified `/auth/wallet-connect` flow and persisted in `localStorage` (`rs_auth_user`).
  Every user-attributed write to the backend carries this id in the **`x-user-id` header** — the
  same pattern used by `addWallet`, `verifyEmail`, `removeSocial` in
  `backend-service/api/routes/auth/index.ts`.
- The follow graph is purely off-chain social metadata → it lives in **Supabase (`sentinel`
  schema)**, written **only from the backend Fastify API** with the service-role client. It must
  **not** be written from the Next.js `/api/profile/*` routes, which trust a body-supplied wallet
  address and are the insecure path.

### Decisions
1. **Backend home:** backend-service Fastify API (new `/social` route), reusing the `x-user-id`
   user-attributed write pattern.
2. **Follow surfaces (v1):** public profile `/u/[identifier]` only (counts + Follow button).
   Leaderboard rows and agent cards are out of scope for v1.
3. **List rows:** rich — avatar + display name/@username + follow-back button, enriched via the
   `ss_rewards_leaderboard` view (the same enrichment the leaderboard already uses).

---

## 2. Data model — new Supabase table (`sentinel` schema)

### `ss_user_follows`

| column         | type        | notes                                              |
|----------------|-------------|----------------------------------------------------|
| `id`           | uuid PK     | `default gen_random_uuid()`                        |
| `follower_id`  | uuid        | FK → `ss_users.id` ON DELETE CASCADE (the actor)   |
| `following_id` | uuid        | FK → `ss_users.id` ON DELETE CASCADE (the target)  |
| `created_at`   | timestamptz | `default now()`                                    |

Constraints / indexes:
- `UNIQUE (follower_id, following_id)` — idempotent follow, prevents duplicates.
- `CHECK (follower_id <> following_id)` — no self-follow at the DB level.
- Index on `following_id` (list a user's **followers** fast).
- Index on `follower_id` (list who a user is **following** fast).

**Why uuid, not username, as the stored key.** Usernames are mutable (`app/api/profile/update`), so
keying the graph on them would break or cascade on every rename. `ss_users.id` is immutable and is
what every other table + the `ss_rewards_leaderboard` view already key on, which keeps enrichment a
clean `in('user_id', ids)`. Usernames live at the **boundary** instead — URLs stay `/u/<username>`,
and the public list endpoints accept a `:username` param and resolve it to an id once (the same
lookup `app/u/[identifier]/page.tsx` already does). Net: **usernames everywhere the user looks, uuid
everywhere the data lives.**

Counts are computed with `count` queries against this table (`head: true, count: 'exact'`), **not**
denormalized onto `ss_users` in v1 — keeps writes simple and avoids drift. Revisit only if counts
become a hot path.

### Migration SQL (run manually in Supabase — no migration runner exists for the `sentinel` schema)

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

After it lands, regenerate types from the frontend with `bun run generate:types:prod` so
`lib/database.types.ts` includes `ss_user_follows`.

---

## 3. Backend — `backend-service/api/routes/social/`

New autoloaded route folder (folder name → `/social` prefix, per `@fastify/autoload` in `app.js`),
structured like `routes/rewards/` (`index.js` + `schemas.js`). Reuse:

- `request.headers['x-user-id']` + a user-exists check, exactly like `routes/auth/index.ts` `/wallet`.
- `this.supabase` (service client, `sentinel` schema) from `plugins/supabase.js`.
- The Supabase enrichment join pattern in `routes/rewards/index.js` (`ss_rewards_leaderboard` view
  for username/avatar/socials).
- JSON-schema validation objects in `schemas.js` (`$id`, `tags: ['SOCIAL']`, `params`,
  `querystring`, `headers.required: ['x-user-id']`, `response`).

A small shared `preHandler` `requireUserAuth` (new `shared/user-auth.js`) asserts the `x-user-id`
header is present and is a real `ss_users.id`, mirroring `shared/auth.js`'s `requireAdminAuth`.

### Endpoints

| Method & path | Auth | Purpose |
|---|---|---|
| `POST /social/follow` | `x-user-id` | Body `{ following_id }` (uuid). Guards: target exists, not self, upsert-ignore if already following. Inserts row. Returns `{ status: 'followed' }`. |
| `DELETE /social/follow/:following_id` | `x-user-id` | Deletes the `(follower_id, following_id)` row. Idempotent. Returns `{ status: 'unfollowed' }`. |
| `GET /social/:username/followers` | public | `:username` → id once (reuse the `ss_users.username` lookup from `app/u/[identifier]/page.tsx`). Paginated (`limit`, `offset`). Returns enriched follower users + `total`. With `viewerId` query, also returns `is_following` per row. |
| `GET /social/:username/following` | public | Same shape, lists who the user follows. |
| `GET /social/:username/counts` | public | `{ followers, following }`. Optional `viewerId` query → also `viewer_is_following: boolean`. Single cheap call for profile headers. |

> Public GET endpoints take a `:username` for friendly URLs and resolve it to a uuid internally.
> The follow/unfollow writes take the target **uuid** in the body/path, since the Follow button
> already holds the resolved `user.id` of the viewed profile.

**Handler notes**
- Lists: query `ss_user_follows` for the id set, then one `ss_rewards_leaderboard` (or `ss_users`)
  `in('user_id', ids)` fetch for enrichment — avoid N+1, same as the leaderboard route.
- `is_following` for the viewer: one extra `in`-query of the viewer's follow rows intersected with
  the page's ids; map in memory.
- Validate `following_id` as uuid in the schema.

---

## 4. Frontend — `sui-sentinel/frontend/`

### 4.1 API client — extend `lib/auth-api.ts`
Add typed functions beside `addWallet` / `verifyEmail` (same `x-user-id` header,
`credentials: 'include'`, `handleResponse` helper):
- `followUser(userId, followingId)`
- `unfollowUser(userId, followingId)`
- `getFollowers(username, { limit, offset, viewerId? })`
- `getFollowing(username, { limit, offset, viewerId? })`
- `getFollowCounts(username, viewerId?)`
- Plus `FollowListUser` / `FollowCounts` types.

### 4.2 Hooks — `hooks/social/`
React Query, 60s stale time like the rest of the app:
- `useFollowCounts(username)` — drives the header counts; reads `viewerId` from `useAuth()`.
- `useFollowers(username)` / `useFollowing(username)` — `useInfiniteQuery` with `total`, mirroring
  `hooks/rewards/useRewardsLeaderboard.ts`.
- `useFollowMutation()` / `useUnfollowMutation()` — optimistic toggle; on settle invalidate the
  counts + list queries for both viewer and target. Throws if `!user`.

### 4.3 Components — `components/profile/` (one main component per file, per repo convention)
- `FollowButton.tsx` — **client island**, props `{ targetUserId }`. Uses `useAuth()`: hidden when
  not authenticated or `user.id === targetUserId`; shows Follow / Following (hover→Unfollow) via the
  mutations; reuses the `Button` primitive in `components/ui/`.
- `FollowStats.tsx` — the two clickable counts (`12 Followers · 8 Following`), opens `FollowListModal`.
- `FollowListModal.tsx` — wraps the radix `Dialog` (`components/ui/dialog`); tabbed Followers /
  Following (radix `Tabs`); infinite-scroll list of `FollowListRow`.
- `FollowListRow.tsx` — avatar + display name/@username linking to `/u/<username>` + inline
  `FollowButton` for follow-back.

### 4.4 Wire into the two profile pages
- **Public `app/u/[identifier]/page.tsx`** (server component): `getUserProfile` already resolves
  `userId`. Render `<FollowStats>` and `<FollowButton targetUserId={user.id} />` in the header block
  (next to the username). Counts can be fetched server-side and passed as `initialData` to avoid a
  flash; the client islands hydrate from there.
- **Private `app/profile/page.tsx`** (client): add `<FollowStats>` to the header stat area. No
  Follow button on your own profile.

---

## 5. Security / correctness notes
- All writes go through the backend with the `x-user-id` pattern — consistent with the rest of the
  app. The header is asserted, not cryptographically re-verified per request (same limitation as
  `addWallet`/`verifyEmail` today); acceptable because it matches the established trust boundary.
  **Do not** add these writes to the Next.js `/api/profile/*` routes.
- DB-level `UNIQUE` + `CHECK` make follow idempotent and self-follow impossible even if a client
  bypasses the API.
- Lists/counts are public (Twitter-style); only follow/unfollow require auth.

---

## 6. Files to create / modify

**Backend (`backend-service/api/`)**
- `routes/social/index.js` *(new)* — the 5 endpoints.
- `routes/social/schemas.js` *(new)* — JSON schemas.
- `shared/user-auth.js` *(new)* — `requireUserAuth` preHandler.

**Frontend (`sui-sentinel/frontend/`)**
- `lib/auth-api.ts` *(edit)* — follow client functions + types.
- `hooks/social/useFollowCounts.ts`, `useFollowers.ts`, `useFollowing.ts`,
  `useFollowMutation.ts` *(new)*.
- `components/profile/FollowButton.tsx`, `FollowStats.tsx`, `FollowListModal.tsx`,
  `FollowListRow.tsx` *(new)*.
- `app/u/[identifier]/page.tsx` *(edit)* — header counts + follow button.
- `app/profile/page.tsx` *(edit)* — header counts.
- `lib/database.types.ts` *(regenerated)* after the migration.

**Database (manual)** — `ss_user_follows` table via the SQL in §2.

---

## 7. Verification (end-to-end)
1. Run the migration SQL in Supabase; confirm `ss_user_follows` exists in `sentinel` and regenerate
   types.
2. Start backend API (`cd backend-service/api && bun run dev`, port 3005). With `curl`:
   - `POST /social/follow`, `x-user-id: <userA>`, body `{ following_id: <userB> }` → row created.
   - Re-POST → idempotent, no duplicate.
   - `GET /social/<userB-username>/counts?viewerId=<userA>` → `{ followers: 1, viewer_is_following: true }`.
   - `GET /social/<userB-username>/followers?viewerId=<userA>` → userA enriched, `is_following` correct.
   - `DELETE /social/follow/<userB>`, `x-user-id: <userA>` → count back to 0.
   - Self-follow (`following_id === x-user-id`) → 400.
3. Start frontend (`cd sui-sentinel/frontend && bun dev`). Log in (signature flow), open another
   user's `/u/<username>`:
   - Follow button appears (hidden on your own profile and when logged out).
   - Click Follow → optimistic Following; counts increment; reload persists.
   - Click the follower count → modal lists you with a working follow-back button.
   - Unfollow → reverts.

   (Per `frontend/CLAUDE.md`, do not run `build`/`tsc` — hand off for manual verification.)
