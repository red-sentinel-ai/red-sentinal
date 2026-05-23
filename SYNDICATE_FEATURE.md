# Sentinel Syndicate — Feature Documentation

> **Chain**: BNB only  
> **Status**: Implemented — build passing, backend routes live, frontend integrated  
> **Last updated**: May 2026

---

## What Is a Syndicate?

A **Sentinel Syndicate** is a group-managed bounty pool on BNB Chain. Instead of one person deploying and fully funding an AI sentinel, multiple contributors can pool tokens together into a shared vault. The vault owner (the person who created the syndicate) then launches a sentinel that guards the collective pool.

Key properties:
- Each syndicate is **its own deployed contract** (`SentinelSyndicate.sol`) — there is no factory or registry on-chain.
- Members deposit ERC-20 tokens and receive **shares** proportional to their contribution.
- Fees earned by the sentinel are distributed to all shareholders via a `feePerShare` accumulator (1e27 precision).
- The **14-day withdrawal lock** kicks in after the sentinel is funded — the owner cannot drain the bounty pool during that window.
- The owner can optionally enable a **whitelist** so only approved addresses can deposit.

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
   │        │  ← saves metadata to MongoDB                    │
   │  → contractAddress saved in React state                  │
   └──────────────────────────────────────────────────────────┘
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │  Step 2 · Initial Deposit                                │
   │  ERC20.approve(syndicateAddress, amount)                 │
   │        │  ← waits for receipt                            │
   │  Syndicate.deposit(amount)                               │
   │        │  ← mints shares to owner's wallet               │
   └──────────────────────────────────────────────────────────┘
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │  Step 3 · Launch Sentinel                                │
   │  POST https://tee.suisentinel.xyz/register-agent         │
   │        │  creator = syndicateAddress (not wallet!)        │
   │        │  ← returns agent_id, prompt_hash, signature     │
   │  ERC20.approve(syndicateAddress, initialFund)            │
   │  Syndicate.registerAgent(agent_id, ts, cost, hash,       │
   │                          initialFund, signature)          │
   │        │  ← waits for receipt                            │
   │  PATCH ${API}/syndicates/${address}/agent                │
   │        │  ← saves agent_id to MongoDB                    │
   │  createAgent (Supabase) → agent record with image        │
   └──────────────────────────────────────────────────────────┘
        │
        ▼
   Step 4 · Success screen → links to /syndicate/[address]
```

---

### Manage Path (Owner + Members)

After creation, anyone can navigate to **`/syndicate/[contractAddress]`** to interact with the syndicate.

---

## Where Data Lives

| Data | Storage | Collection / Table | Written by |
|------|---------|-------------------|------------|
| Syndicate metadata (name, description, owner, token, whitelist flag) | **MongoDB** | `syndicates_{network}` | Backend API on `POST /syndicates/create` |
| `agent_id` link | **MongoDB** | `syndicates_{network}` | Backend API on `PATCH /syndicates/:address/agent` |
| Join requests | **MongoDB** | `syndicate_join_requests_{network}` | Backend API on `POST /syndicates/join-request` |
| Agent image + name | **Supabase** | `ss_agents` (via `useCreateAgent`) | Frontend after sentinel registration |
| All on-chain state (shares, balances, whitelist, lock) | **BNB Chain** (contract storage) | — | Smart contract |

---

## File Map

### Smart Contract
```
contracts/evm-contracts/src/SentinelSyndicate.sol
contracts/evm-contracts/out/SentinelSyndicate.sol/SentinelSyndicate.json  ← bytecode source
```

### Backend API
```
backend-service/api/routes/syndicates/
├── index.js       ← 6 Fastify routes auto-loaded at /syndicates prefix
└── schemas.js     ← Fastify JSON schemas for all endpoints
```

### Frontend — Hooks
```
sui-sentinel/frontend/hooks/syndicate/
├── useDeploySyndicate.ts        ← Step 1: deploy contract + save metadata
├── useDepositToSyndicate.ts     ← Step 2: ERC20 approve + deposit
├── useDeploySyndicateAgent.ts   ← Step 3: TEE register + Syndicate.registerAgent
├── useSyndicateInfo.ts          ← Read-only contract state (owner, shares, TVL, etc.)
├── useSyndicateOwnerActions.ts  ← fundAgent, withdrawFromSentinel, whitelist ops
└── useSyndicateMemberActions.ts ← deposit, redeem, claimFees, requestToJoin
```

### Frontend — Components
```
sui-sentinel/frontend/components/syndicate/
├── SyndicateLaunchFlow.tsx  ← Orchestrator: steps 1→2→3→success
├── SyndicateStepper.tsx     ← Progress indicator (gold active, check on done)
├── SyndicateStep1.tsx       ← Deploy form
├── SyndicateStep2.tsx       ← Initial deposit form
├── SyndicateStep3.tsx       ← Sentinel config + launch
├── OwnerPanel.tsx           ← Fund / Withdraw / Whitelist management
└── MemberPanel.tsx          ← Deposit / Redeem / Claim / Request to join
```

### Frontend — Pages
```
sui-sentinel/frontend/app/
├── defend/DefendPageClient.tsx          ← Mode toggle (Individual ↔ Syndicate)
└── syndicate/[address]/
    ├── page.tsx                         ← Next.js 15 async params wrapper
    └── SyndicatePageClient.tsx          ← Syndicate detail page (stats + panels)
```

### Frontend — ABI + Bytecode
```
sui-sentinel/frontend/lib/evm/abi.ts
  → SYNDICATE_ABI      (all functions)
  → SYNDICATE_BYTECODE (Foundry-compiled, required for deployContract)
```

---

## Backend API Endpoints

All routes are auto-loaded by `@fastify/autoload` at the `/syndicates` prefix.  
Base URL: `https://api.suisentinel.xyz/syndicates`

| Method | Path | What it does |
|--------|------|-------------|
| `POST` | `/create` | Save syndicate metadata after on-chain deploy |
| `GET` | `/` | List syndicates (filter by `network`, `owner`) |
| `GET` | `/:address` | Get one syndicate by contract address |
| `PATCH` | `/:address/agent` | Set `agent_id` after sentinel launch |
| `POST` | `/join-request` | Submit an off-chain join request |
| `GET` | `/:address/join-requests` | List join requests for a syndicate |

MongoDB collection naming follows the same pattern as the rest of the project:
- `syndicates_mainnet` / `syndicates_testnet`
- `syndicate_join_requests_mainnet` / `syndicate_join_requests_testnet`

---

## How On-Chain Reading Works

`useSyndicateInfo.ts` exports three hooks that use wagmi's `useReadContracts`:

### `useSyndicateContractInfo(address)`
Reads in a single multicall:
- `owner()` — who deployed the contract
- `agentId()` — registered sentinel ID (empty string if none)
- `whitelistEnabled()` — boolean toggle
- `token()` — ERC-20 token address
- `totalShares()` — total shares minted
- `idlePrincipal()` — `tokenBalance - reservedFeeBalance` (the redeemable amount)
- `totalManagedAssets()` — total TVL (idle + deployed to sentinel)

### `useSyndicateMemberInfo(address, memberAddress)`
Reads for a specific wallet:
- `sharesOf(member)` — member's share balance
- `pendingFees(member)` — claimable fee earnings
- `contributorWhitelist(member)` — whether they're whitelisted

### `useSyndicateWithdrawalUnlock(address, agentId)`
- Reads `getAgent(agentId)` from the Sentinel contract (`BNB_CONFIG.contractAddress`)
- Extracts `lastFundedTimestamp`
- Computes `unlockTime = lastFundedTimestamp + 14 days`
- Returns `{ isLocked, unlockTime, remaining }` for UI display

---

## Owner Operations

All owner actions go through `useSyndicateOwnerActions(syndicateAddress)`.

| Action | On-chain call | Notes |
|--------|--------------|-------|
| **Fund Sentinel** | `ERC20.approve` → `Syndicate.fundAgent(amount)` | Resets the 14-day lock period |
| **Withdraw from Pool** | `Syndicate.withdrawFromSentinel(amount)` | Only callable after lock expires |
| **Toggle Whitelist** | `Syndicate.setWhitelistEnabled(bool)` | Affects new deposits only |
| **Whitelist Addresses** | `Syndicate.setContributorsWhitelisted(addrs[], bool)` | Max 10 addresses per tx |

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

- **Individual Mode** (default): existing single-wallet sentinel deploy flow, unchanged.
- **Syndicate Mode**: renders `<SyndicateLaunchFlow />` inside a `max-w-[640px]` container.

State: `const [defendMode, setDefendMode] = useState<'individual' | 'syndicate'>('individual')`

---

## The Syndicate Detail Page

Route: `/syndicate/[contractAddress]`

```
SyndicatePage (async, awaits params)
  └── SyndicatePageClient
        ├── React Query: GET /syndicates/:address?network=...  → off-chain metadata
        ├── useSyndicateContractInfo(:address)                 → on-chain state
        ├── useSyndicateMemberInfo(:address, connectedWallet)  → member state
        │
        ├── Header (name, description, social link, badges)
        ├── Stats row
        │     ├── Total Value Locked (totalManagedAssets)
        │     ├── Idle Funds (idlePrincipal)
        │     └── Sentinel ID (agentId truncated)
        │
        ├── OwnerPanel   — shown only when connectedAddress === owner
        └── MemberPanel  — shown for all connected wallets
```

---

## Important Design Decisions

### No Next.js API proxy
All syndicate API calls go **directly** to `https://api.suisentinel.xyz` using `SUI_SENTINEL_API_URL` from `@/constants`. There are no `/api/syndicates/` Next.js routes. This was intentional — the Fastify API is publicly accessible and adding a proxy just adds a round-trip.

### `syndicateAddress` as TEE creator
When registering a sentinel through a syndicate, the TEE receives `syndicateAddress` (not the user's wallet address) as the `creator` parameter. This means the **Syndicate contract is the registered owner of the sentinel** on-chain, not the individual wallet that triggered the tx.

### Contract deployment from the browser
`SentinelSyndicate.sol` is deployed per-syndicate (it's not a factory pattern). The full Foundry-compiled bytecode (`SYNDICATE_BYTECODE`) is bundled in `lib/evm/abi.ts` and sent via wagmi's `walletClient.deployContract(...)`.

### 14-day lock display
`useSyndicateWithdrawalUnlock` reads `lastFundedTimestamp` from the Sentinel contract (not the Syndicate contract) and computes the remaining time. `OwnerPanel` shows a formatted countdown (`formatDuration`) and disables the withdraw button while locked.

### Share-based accounting
- `totalManagedAssets` = full TVL (idle + sentinel bounty pool)
- `idlePrincipal` = `token.balanceOf(syndicate) - reservedFeeBalance`
- A member can only redeem up to their share of `idlePrincipal` (can't pull from the sentinel pool)
- `pendingFees` accumulate via `feePerShare` (1e27 precision) — claimable at any time

---

## Known Gaps / Future Work

- **Telegram notifications** for syndicate events (join requests, fee claims) — explicitly deferred, not implemented.
- **Syndicate listing page** — currently you can only reach a syndicate via direct URL or the success screen after creation. A `/syndicates` browse page is not yet built.
- **Join request approval** — the backend stores pending requests and the owner can list them via `GET /:address/join-requests`, but the OwnerPanel has no UI to review and approve/reject them yet. The approval would call `Syndicate.setContributorsWhitelisted` on-chain.
- **Syndicate indexing** — the blockchain indexer (`backend-service/functions/`) does not yet index Syndicate contract events (deposits, redemptions, fee claims). On-chain data is read directly via `useReadContracts` at page load.
