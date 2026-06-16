# Sentinel Syndicate — Feature Documentation

> **Chain**: BNB only
> **Status**: Implemented — backend webhook-driven, frontend reads everything from a single API doc
> **Last updated**: May 2026

---

## What Is a Syndicate?

A **Sentinel Syndicate** is a group-managed bounty pool on BNB Chain. Instead of one person deploying and fully funding an AI sentinel, multiple contributors can pool tokens together into a shared vault. The vault owner (the person who created the syndicate) then launches a sentinel that guards the collective pool.

Key properties:
- Each syndicate is **its own deployed contract** (`SentinelSyndicate.sol`) — no factory or registry on-chain.
- Members deposit ERC-20 tokens and receive **shares** proportional to their contribution.
- Fees earned by the sentinel are distributed to all shareholders via a `feePerShare` accumulator (1e27 precision).
- The **14-day withdrawal lock** kicks in after the sentinel is funded — the owner cannot drain the bounty pool during that window.
- The owner can optionally enable a **whitelist** so only approved addresses can deposit.

---

## Architecture: One Doc, Webhook-Driven

The defining design choice: **`syndicates_{network}` is the single source of truth for everything the UI needs**. The frontend reads one document and renders the whole syndicate page. No RPC reads for syndicate-level state, no aggregation queries, no joining collections at request time.

The doc starts empty and is mutated by two paths:

1. **REST writes (initial state)** — `POST /syndicates/create` seeds the doc when the contract is deployed; `PATCH /syndicates/:address/agent` sets `agent_id` + `agent_path` when the sentinel is launched.
2. **Webhook writes (on-chain truth)** — Every event QuickNode delivers (`Deposited`, `Redeemed`, `ContributorWhitelistUpdated`, `AgentFundedThroughSyndicate`, etc.) does two things atomically:
   - Upserts the raw event into its own collection (`syndicate_deposits_{network}`, etc.) keyed by `(txDigest, eventSeq)` for dedup.
   - Mutates the corresponding aggregate field on the syndicate doc using `$inc` / `$addToSet` / `$pull`, but **only on the first successful insert** — so QuickNode retries can't double-count.

Token amounts are stored as **BSON Decimal128** (wei) so `$inc` stays atomic and precision-safe at 18 decimals.

```
       ┌──── POST /syndicates/create  (seeds doc with zeros)
       │
       │     PATCH /syndicates/:address/agent  (sets agent_id + agent_path)
       │
on-chain event ─→ QuickNode webhook ─→ /webhooks/events
                                             │
                                             ├─→ raw collection (dedup by txDigest+eventSeq)
                                             │
                                             └─→ syndicates_{network} aggregate mutation
                                                 (only if event was freshly inserted)
                                                            │
                                                            ▼
                                                    Frontend reads
                                                    GET /syndicates/:address
```

---

## End-to-End Flow

### Creation Path (3-Step Wizard)

```
User on /defend → clicks "Syndicate Mode" tab
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │  Step 1 · Deploy Contract                                │
   │  Fill: Name, Description, Social Link, Token, Whitelist  │
   │        │                                                  │
   │  walletClient.deployContract(SYNDICATE_BYTECODE, args)    │
   │        │  ← waits for receipt                            │
   │  POST ${API}/syndicates/create                           │
   │        │  ← seeds MongoDB doc with all aggregates at 0,  │
   │        │    members = [owner], agent_id = null           │
   │  → contractAddress saved in React state                  │
   └──────────────────────────────────────────────────────────┘
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │  Step 2 · Initial Deposit                                │
   │  ERC20.approve(syndicateAddress, amount)                 │
   │  Syndicate.deposit(amount)                               │
   │        │  ← mints shares to owner's wallet               │
   │        │  ← emits Deposited event                        │
   │        ▼                                                  │
   │  QuickNode webhook fires asynchronously:                  │
   │   • raw event → syndicate_deposits_{network}             │
   │   • doc.$inc { total_funds, total_shares,                │
   │                total_deposits_count }                     │
   └──────────────────────────────────────────────────────────┘
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │  Step 3 · Launch Sentinel                                │
   │  POST https://tee.suisentinel.xyz/register-agent         │
   │        │  creator = syndicateAddress (not wallet!)        │
   │        │  ← returns agent_id, prompt_hash, signature     │
   │  Syndicate.registerAgent(agent_id, ts, cost, hash,       │
   │                          initialFund, signature)          │
   │        │  ← emits AgentRegisteredThroughSyndicate        │
   │        ▼                                                  │
   │  PATCH ${API}/syndicates/${address}/agent                │
   │        │  body: { agent_id, agent_path: "/attack/<slug>" }│
   │        │  ← agent_path mirrors the slug formula in       │
   │        │    app/api/agents/create/route.ts so the doc    │
   │        │    can link straight to the attack page         │
   │  createAgent (Supabase) → agent record with image        │
   │        ▼                                                  │
   │  Webhook also confirms: doc.$set agent_id,               │
   │   $inc agent_initial_fund                                 │
   └──────────────────────────────────────────────────────────┘
        │
        ▼
   Step 4 · Success screen → links to /syndicate/[address]
```

### Manage Path

After creation, anyone can navigate to **`/syndicate/[contractAddress]`** to interact with the syndicate. The detail page does **one fetch** (`GET /syndicates/:address`) plus a small handful of per-wallet RPC reads for the connected user only. See [The Syndicate Detail Page](#the-syndicate-detail-page) below.

---

## The Syndicate Document

Every field on `syndicates_{network}`, who writes it, and what UI consumes it.

| Field | Type | Written by | Used for |
|-------|------|-----------|----------|
| `contract_address` | string (lowercased) | `POST /create` | Doc identity |
| `owner` | string (lowercased) | `POST /create` | Permission checks, "SYNDICATE_OWNER" tag in members list |
| `name`, `description`, `social_link`, `token_address`, `token_symbol` | string | `POST /create` | Header + token display |
| `whitelist_enabled` | bool | `POST /create`, then `WhitelistEnabledUpdated` webhook | Visibility toggle, deposit gating |
| `agent_id` | string \| null | `PATCH /:address/agent` + `AgentRegisteredThroughSyndicate` webhook | View Sentinel link, owner controls (fund/withdraw enabled only when set) |
| `agent_path` | string \| null | `PATCH /:address/agent` | Direct link `/attack/<slug>` — no Supabase lookup needed |
| `total_funds` | Decimal128 (wei) | `Deposited` (+amount), `Redeemed` (−amount) | "Total Managed Assets" card |
| `total_shares` | Decimal128 | `Deposited` (+minted_shares), `Redeemed` (−shares) | Share-supply display |
| `total_deposits_count`, `total_redemptions_count` | int | `Deposited`/`Redeemed` (`+1` each) | Activity metrics |
| `agent_initial_fund` | Decimal128 | `AgentRegisteredThroughSyndicate` | Sentinel seed amount |
| `agent_total_funded` | Decimal128 | `AgentFundedThroughSyndicate` (+amount) | Idle Principal derivation |
| `agent_total_withdrawn` | Decimal128 | `AgentFundsWithdrawnToSyndicate` (+amount) | Idle Principal derivation |
| `creator_fees_claimed_total` | Decimal128 | `CreatorFeesClaimedFromSentinel` (+amount) | Fee analytics |
| `contributor_fees_claimed_total` | Decimal128 | Syndicate `FeesClaimed` (+amount) | Fee analytics |
| `members` | string[] (lowercased) | `POST /create` (seeded with owner), `ContributorWhitelistUpdated` (`$addToSet` / `$pull`) | Members table on detail page |
| `members_count` | int | Same as `members` | Header count |
| `network`, `created_at`, `updated_at` | — | Standard | — |

### Derived display values (computed client-side)

| UI label | Formula | Notes |
|----------|---------|-------|
| Total Managed Assets | `total_funds` | Net contributor capital — deposits minus redemptions |
| Idle Principal | `total_funds − (agent_initial_fund + agent_total_funded − agent_total_withdrawn)` | Mirrors the contract's `idlePrincipal` exactly. `agent_initial_fund` must be subtracted because `registerAgent` transfers it from the vault straight to the sentinel and does NOT emit `AgentFundedThroughSyndicate` (so it isn't in `agent_total_funded`) |
| Active in Sentinel | `agent_initial_fund + agent_total_funded − agent_total_withdrawn` | What's currently deployed to the agent |

---

## Webhook Pipeline

### Where it lives

```
backend-service/api/
├── routes/webhooks/events.ts       ← QuickNode HMAC verification + dispatch
└── lib/EvmEventStores.ts           ← Per-event store classes (raw write + aggregate)
```

### Idempotency contract

Every store extends `BaseEvmEventStore`. The base method `addEventsReturningFresh()` does the upsert and returns **only events that were newly inserted** (via `bulkWrite.upsertedIds`). Subclasses then mutate the syndicate doc only for those fresh events — so if QuickNode retries a payload, the raw collection is unchanged and the aggregate is not touched a second time.

### Event → store → aggregate mutation table

| Event (Solidity name) | Store class | Mutation on `syndicates_{network}` |
|-----------------------|-------------|-------------------------------------|
| `Deposited` | `EvmSyndicateDepositedStore` | `$inc { total_funds: +amount, total_shares: +minted_shares, total_deposits_count: 1 }` |
| `Redeemed` | `EvmSyndicateRedeemedStore` | `$inc { total_funds: −amount, total_shares: −shares, total_redemptions_count: 1 }` |
| `ContributorWhitelistUpdated` | `EvmSyndicateContributorWhitelistUpdatedStore` | true → `$addToSet members`, `$inc members_count: 1` (guarded). false → `$pull members`, `$inc members_count: -1` |
| `WhitelistEnabledUpdated` | `EvmSyndicateWhitelistEnabledUpdatedStore` | `$set whitelist_enabled` |
| `AgentRegisteredThroughSyndicate` | `EvmAgentRegisteredThroughSyndicateStore` | `$set { agent_id, agent_initial_fund }` |
| `AgentFundedThroughSyndicate` | `EvmAgentFundedThroughSyndicateStore` | `$inc agent_total_funded: +amount` |
| `AgentFundsWithdrawnToSyndicate` | `EvmAgentFundsWithdrawnToSyndicateStore` | `$inc agent_total_withdrawn: +amount` |
| `CreatorFeesClaimedFromSentinel` | `EvmCreatorFeesClaimedFromSentinelStore` | `$inc creator_fees_claimed_total: +amount` |
| `FeesClaimed` (Syndicate variant — disambiguated from Sentinel's `FeesClaimed` by absence of `agentId`) | `EvmSyndicateFeesClaimedStore` | `$inc contributor_fees_claimed_total: +amount` |

Routing key: every event matches the syndicate doc via the QuickNode `address` field (the emitting contract). Aggregate failures are logged but never fail the webhook — raw collections are the recoverable ground truth.

### Backfill / reconciliation

```
backend-service/api/scripts/backfill-syndicate-aggregates.js [mainnet|testnet] [--dry]
```

Rebuilds every aggregate on every syndicate doc by summing the raw event collections. Safe to run repeatedly. Use it to:
- Seed existing syndicates created before the aggregate fields existed.
- Recover from any drift (in practice, only relevant if a webhook permanently failed).

---

## Where Data Lives

| Data | Storage | Collection / Table | Written by |
|------|---------|-------------------|------------|
| Syndicate metadata + aggregates + members | **MongoDB** | `syndicates_{network}` | `POST /create`, `PATCH /:address/agent`, webhook event stores |
| Raw deposit events | **MongoDB** | `syndicate_deposits_{network}` | Webhook |
| Raw redemption events | **MongoDB** | `syndicate_redemptions_{network}` | Webhook |
| Raw whitelist changes | **MongoDB** | `syndicate_whitelist_updates_{network}` | Webhook |
| Raw whitelist toggle | **MongoDB** | `syndicate_whitelist_enabled_updates_{network}` | Webhook |
| Raw agent register / fund / withdraw / creator-fee events | **MongoDB** | `syndicate_agent_registered_{network}`, `syndicate_agent_funded_{network}`, `syndicate_agent_withdrawn_{network}`, `syndicate_creator_fees_{network}` | Webhook |
| Raw contributor fee claims | **MongoDB** | `syndicate_fees_claimed_{network}` | Webhook |
| Join requests | **MongoDB** | `syndicate_join_requests_{network}` | `POST /syndicates/join-request` |
| Agent image + name + slug | **Supabase** | `ss_agents` | Frontend after sentinel registration |
| Per-wallet state (shares, pendingFees, isWhitelisted, withdrawal-unlock) | **BNB Chain** | — | Contract storage |

---

## File Map

### Smart Contract

```
contracts/evm-contracts/src/SentinelSyndicate.sol
contracts/evm-contracts/out/SentinelSyndicate.sol/SentinelSyndicate.json  ← bytecode source
```

### Backend API

```
backend-service/api/
├── routes/syndicates/
│   ├── index.js       ← REST routes auto-loaded at /syndicates
│   └── schemas.js     ← Fastify response schemas (declares every aggregate field
│                       so they aren't stripped by fast-json-stringify)
├── routes/webhooks/
│   └── events.ts      ← QuickNode HMAC verification + dispatch
├── lib/EvmEventStores.ts        ← Base store + per-event store classes
└── scripts/backfill-syndicate-aggregates.js  ← Reconciliation tool
```

### Frontend — Hooks

```
sui-sentinel/frontend/hooks/syndicate/
├── useDeploySyndicate.ts        ← Step 1: deploy contract + POST /create
├── useDepositToSyndicate.ts     ← Step 2: ERC20 approve + deposit
├── useDeploySyndicateAgent.ts   ← Step 3: TEE register + Syndicate.registerAgent
│                                  + PATCH /:address/agent (with agent_path)
├── useSyndicateInfo.ts          ← useSyndicateMemberInfo (per-wallet RPC) +
│                                  useSyndicateWithdrawalUnlock (sentinel lock RPC)
├── useSyndicateOwnerActions.ts  ← fundAgent, withdrawFromSentinel, whitelist ops
└── useSyndicateMemberActions.ts ← deposit, redeem, claimFees, requestToJoin
```

> Note: `useSyndicateContractInfo` (the syndicate-level multicall) has been removed. Owner / agentId / whitelistEnabled / token / TVL all come from the API doc now.

### Frontend — Components / Pages

```
sui-sentinel/frontend/
├── components/syndicate/
│   ├── SyndicateLaunchFlow.tsx     ← Orchestrator: steps 1→2→3→success
│   ├── SyndicateStepper.tsx        ← Progress indicator
│   └── SyndicateStep[1-3].tsx      ← Step forms
├── app/defend/DefendPageClient.tsx ← Mode toggle (Individual ↔ Syndicate)
└── app/syndicate/[address]/
    ├── page.tsx                    ← Next.js 15 async params wrapper
    └── SyndicatePageClient.tsx     ← Detail page
```

### Frontend — ABI + Bytecode

```
sui-sentinel/frontend/lib/evm/abi.ts
  → SYNDICATE_ABI      (all functions)
  → SYNDICATE_BYTECODE (Foundry-compiled, required for deployContract)
```

---

## Backend API Endpoints

Base URL: `https://api.redsentinel.xyz/syndicates`

| Method | Path | What it does |
|--------|------|-------------|
| `POST` | `/create` | Seed the syndicate doc after on-chain deploy. Initialises all aggregates to 0 and `members` to `[owner]`. |
| `GET` | `/` | List syndicates (filter by `network`, `owner`). Returns full docs including aggregates. |
| `GET` | `/:address` | Get one syndicate by contract address. **This is the only call the detail page needs for syndicate-level state.** |
| `PATCH` | `/:address/agent` | Set `agent_id` + optional `agent_path` after sentinel launch. |
| `POST` | `/join-request` | Submit an off-chain join request. |
| `GET` | `/:address/join-requests` | List join requests for a syndicate. |

Webhook endpoint (separate, in `routes/webhooks/events.ts`):

| Method | Path | What it does |
|--------|------|-------------|
| `POST` | `/webhooks/events` | QuickNode Streams ingest (HMAC-verified). Dispatches to event stores. |

Decimal128 fields are serialised to plain numeric strings by `stripId()` in the routes so the frontend receives `"100000000000000000"` instead of `{ $numberDecimal: ... }`.

---

## How Frontend Reading Works

`useSyndicateInfo.ts` exports two hooks. Both are **per-wallet RPC** — there's no syndicate-level multicall anymore.

### `useSyndicateMemberInfo(address, memberAddress)`

Reads for a specific wallet:
- `sharesOf(member)` — member's share balance
- `pendingFees(member)` — claimable fee earnings
- `contributorWhitelist(member)` — whether they're whitelisted

### `useSyndicateWithdrawalUnlock(agentId)`

- Reads `getWithdrawalUnlockTimestamp(agentId)` from the Sentinel contract
- Returns `{ unlockTimestamp, isLocked, lockRemaining }` for UI display

Everything else — owner, agentId, agent_path, whitelistEnabled, token, members, TVL, idle principal, fee totals, deposit/redemption counts — comes from `GET /syndicates/:address`.

---

## Owner Operations

All owner actions go through `useSyndicateOwnerActions(syndicateAddress)`.

| Action | On-chain call | Notes |
|--------|--------------|-------|
| **Fund Sentinel** | `ERC20.approve` → `Syndicate.fundAgent(amount)` | Resets the 14-day lock period |
| **Withdraw from Pool** | `Syndicate.withdrawFromSentinel(amount)` | Only callable after lock expires |
| **Toggle Whitelist** | `Syndicate.setWhitelistEnabled(bool)` | Affects new deposits only |
| **Whitelist Addresses** | `Syndicate.setContributorsWhitelisted(addrs[], bool)` | Max 10 addresses per tx |

All four operations are eventually reflected in the syndicate doc by their respective webhook stores — the UI re-fetches `GET /syndicates/:address` to pick up the change.

---

## Member Operations

All member actions go through `useSyndicateMemberActions(syndicateAddress)`.

| Action | On-chain call | Shown when |
|--------|--------------|-----------|
| **Request to Join** | `POST /syndicates/join-request` (off-chain) | Whitelist enabled + not whitelisted + no pending request |
| **Deposit** | `ERC20.approve` → `Syndicate.deposit(amount)` | Whitelist disabled OR member is whitelisted |
| **Redeem** | `Syndicate.redeem(shares)` | Member has shares > 0 |
| **Claim Fees for Syndicate** | `Syndicate.claimCreatorFeesFromSentinel()` | Syndicate has a sentinel (`agentId` set); callable by anyone |
| **Claim Fees for Self** | `Syndicate.claimFees()` | Member has `pendingFees > 0` |

---

## The Defend Page Tab Toggle

`app/defend/DefendPageClient.tsx` renders a mode toggle above the form:

```
┌─────────────────────────────────────┐
│  Individual Mode  │  Syndicate Mode  │
└─────────────────────────────────────┘
```

- **Individual Mode** (default): existing single-wallet sentinel deploy flow.
- **Syndicate Mode**: renders `<SyndicateLaunchFlow />` inside a `max-w-[640px]` container.

State: `const [defendMode, setDefendMode] = useState<'individual' | 'syndicate'>('individual')`

---

## The Syndicate Detail Page

Route: `/syndicate/[contractAddress]`

```
SyndicatePage (async, awaits params)
  └── SyndicatePageClient
        ├── React Query: GET /syndicates/:address?network=...   → THE syndicate doc
        ├── useSyndicateMemberInfo(:address, connectedWallet)   → per-wallet RPC
        ├── useSyndicateWithdrawalUnlock(agentId)               → sentinel lock RPC
        │
        ├── Header (name, description, social link, View Sentinel → meta.agent_path)
        ├── Metric cards (3-column)
        │     ├── Total Managed Assets   ← meta.total_funds
        │     ├── Idle Principal         ← total_funds − (agent_funded − agent_withdrawn)
        │     └── Pending User Fees      ← pendingFees (RPC)
        │
        ├── Owner Controls   — Fund / Withdraw / Whitelist
        ├── Member Portal    — Deposit / Redeem / Claim Fees / Creator Rewards
        └── Members table    — rendered from meta.members[], owner row tagged
```

---

## Important Design Decisions

### Syndicate doc as single source of truth

The frontend used to do a wagmi `useReadContracts` multicall against the Syndicate contract on every page load to fetch owner, agentId, whitelist, TVL, idle, shares. That's gone. The webhook pipeline keeps the doc in sync — one HTTP fetch covers everything except per-wallet state. Trade-off: a brief delay between an on-chain action and webhook arrival (typically seconds). The UI compensates by re-fetching after each owner/member action it triggers itself.

### Decimal128 for all token amounts

uint256 wei values are stored as **BSON Decimal128**. `$inc` is atomic and precision-safe — JS Number would lose precision past ~9 tokens at 18 decimals. Routes coerce Decimal128 to plain strings via `stripId()` for JSON output; the frontend uses `BigInt(wei)` + `formatUnits` for display.

### Idempotency via `bulkWrite.upsertedIds`

Aggregate fields can only be mutated when the corresponding raw event is **newly inserted** into its event collection. QuickNode retries (free-tier delivery is best-effort) are absorbed by the `(txDigest, eventSeq)` upsert filter — the second delivery is a no-op for both the raw collection AND the aggregate.

### `agent_path` stored at PATCH time

Instead of making the syndicate page resolve `agent_id → agent_path` via a separate Supabase query, the frontend computes the slug at sentinel-launch time (same formula as `app/api/agents/create/route.ts`: `agentName.toLowerCase().replace(/\s+/g, '_')`) and sends `agent_path` in the PATCH body. The doc then has a direct link.

### `syndicateAddress` as TEE creator

When registering a sentinel through a syndicate, the TEE receives `syndicateAddress` (not the user's wallet) as the `creator` parameter. The **Syndicate contract is the registered owner of the sentinel** on-chain.

### Contract deployment from the browser

`SentinelSyndicate.sol` is deployed per-syndicate (no factory). The full Foundry-compiled bytecode (`SYNDICATE_BYTECODE`) is bundled in `lib/evm/abi.ts` and sent via wagmi's `walletClient.deployContract(...)`.

### 14-day lock display

`useSyndicateWithdrawalUnlock` reads `getWithdrawalUnlockTimestamp(agentId)` from the Sentinel contract (not the Syndicate contract). The owner's withdraw button is disabled while locked.

### Share-based accounting

- `total_funds` (doc) = net contributor capital (deposits − redemptions)
- `idlePrincipal` (derived) = `total_funds − (agent_initial_fund + agent_total_funded − agent_total_withdrawn)`, matching the contract's `idlePrincipal()` exactly
- A member can only redeem up to their share of `idlePrincipal` (can't pull from the sentinel pool)
- `pendingFees` accumulate via `feePerShare` (1e27 precision) — claimable at any time

### No Next.js API proxy

All syndicate API calls go **directly** to `https://api.redsentinel.xyz` using `SUI_SENTINEL_API_URL` from `@/constants`. No `/api/syndicates/` Next.js routes.

---

## Known Gaps / Future Work

- **Telegram notifications** for syndicate events — explicitly deferred.
- **Syndicate listing page** — reachable via direct URL or success screen; no `/syndicates` browse page yet.
- **Join request approval UI** — backend stores requests; owner has no in-page review/approve flow yet.
- **Per-member equity share column** — the members table shows owner vs member but not each address's `sharesOf` (would require either an N-call multicall or backing the share ledger into MongoDB via `Deposited` / `Redeemed` deltas).
- **Older test events** — any deposit events captured before the `mintedShares → minted_shares` remap landed will have `mintedShares` and won't roll up into `total_shares` on backfill. New events are correct.
