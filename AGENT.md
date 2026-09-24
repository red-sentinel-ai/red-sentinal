## Project Overview

Red Sentinel is a crowdsourced, gamified AI red teaming platform. We are building on the premise that AI agents are everywhere in 2026 and we all need to learn how these agents behave and learn about security as well.

As a user, you can interact with Red Sentinel platform by either launching a sentinel (defend) or attacking existing sentinels.

**Multi-Chain Support:**
- **Sui** - Primary chain, fully supported (mainnet + testnet)
- **Solana** - Supported with wallet integration
- **EVM** - Supported with wallet integration

**Tech Stack:**
- Next.js 15 (App Router) + TypeScript
- Bun (package manager)
- Tailwind CSS + shadcn/ui components
- Supabase (PostgreSQL database)
- Custom wallet-based auth via backend API
- React Query (@tanstack/react-query)
- @mysten/dapp-kit (Sui wallet)

**Development Commands:**
```bash
bun install              # Install dependencies
bun dev                  # Start development server
bun build                # Build for production
bun start                # Start production server
bun lint                 # Run ESLint
bun run generate:types:prod  # Generate Supabase TypeScript types from database
```

## Quick Start

### 1. Clone and Install
```bash
git clone <repo-url>
cd nautilus/frontend
bun install
```

### 2. Environment Setup
```bash
cp .env.example .env.local
```

Required environment variables:
| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `NEXT_PUBLIC_SUI_SENTINEL_API_URL` | Backend API URL |
| `NEXT_PUBLIC_APP_NETWORK` | `mainnet` or `testnet` |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog analytics key |

Optional:
| Variable | Description |
|----------|-------------|
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Vercel KV for rate limiting |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | Private Solana RPC (recommended for production) |

### 3. Run Development Server
```bash
bun dev
```

### 4. Generate Types (after DB schema changes)
```bash
bun run generate:types:prod
```

## Architecture

### High-Level Structure

```
Frontend (Next.js) → Supabase (Database) → TEE Backend API → Blockchain
                                    ↘
                                   Auth API (wallet signature-based)
```

**Key Concepts:**
- **On-chain data**: Agent deployments, funding, bounties via blockchain
- **Off-chain data**: User profiles, agents metadata, rewards tracked in Supabase
- **AI Interactions**: Proxied through the unified TEE backend (`https://tee-evm.redsentinel.xyz`), shared by Sui, Solana and every EVM chain

### Backend API

The frontend proxies AI agent interactions through a Trusted Execution Environment (TEE) backend:
- **Production URL**: `https://tee-evm.redsentinel.xyz` — one TEE for all chains
- Defined in `constants/tee.ts` as `UNIFIED_TEE_API_PATH`; `buildTeeUrl(chain, action, chainId)` resolves the
  full `/{environment}/{network}/{action}` URL, where `network` is the chain's TEE network id
  (`sui-testnet`, `solana-devnet`, `bsc-testnet`, …)
- Agent prompts are sent via `POST /api/consume-prompt`
- Agent registration via `POST /api/register-agent`

### Data Flow

**Attack Mode:**
1. User browses agents at `/attack/[slug]`
2. Submits prompt to agent via `POST /api/consume-prompt` (proxies to TEE backend)
3. Backend returns response with attack success/failure
4. Successful attacks trigger on-chain bounty claim transaction

**Defend Mode:**
1. User creates agent at `/defend` with system prompt, model, and cost settings
2. Funds agent with tokens via wallet transaction
3. Agent deployed to blockchain
4. Defender earns passive income when their agent resists attacks
5. Withdrawal available after **14-day lock period** via `useWithdrawAgentModal` hook

**Rewards System:**
- Missions tracked in Supabase (`ss_rewards_activity`, `ss_rewards_leaderboard`)
- Complete missions via `POST /api/rewards/complete`
- Leaderboard fetched from `GET /api/rewards/leaderboard`

### Supported AI Models

Defined in `constants/index.ts` under `PROVIDER_MODELS`:

| Provider | Models |
|----------|--------|
| OpenAI | gpt-4o, gpt-4.1, gpt-4o-mini, gpt-3.5-turbo |
| Anthropic | claude-opus-4-6, claude-sonnet-4-6, claude-haiku-4-5 |
| DeepSeek | deepseek-chat, deepseek-reasoner |
| Amazon Bedrock | mistral.mistral-large-3-675b-instruct, openai.gpt-oss-120b-1:0, us.meta.llama4-maverick-17b-instruct-v1:0, us.meta.llama3-2-90b-instruct-v1:0, us.meta.llama3-3-70b-instruct-v1:0 |
| Custom | User-provided endpoints |

### Directory Structure

```
app/
├── api/                    # API routes (Supabase queries + backend proxy)
│   ├── agents/             # Agent CRUD operations
│   ├── auth/               # Auth helper endpoints (disconnect-provider)
│   └── rewards/            # Missions and leaderboard
├── attack/                 # Attack mode pages
├── defend/                 # Defend mode pages
├── profile/                # User profile management
├── rewards/                # Leaderboard and missions
└── layout.tsx              # Root layout (providers, fonts, analytics)

components/
├── agents/                 # Agent-specific components
├── defend/                 # Defense mode components
├── profile/                # Profile components
├── rewards/                # Rewards system components
└── ui/                     # Reusable shadcn/ui components
    ├── common/            # Shared components
    └── skeletons/         # Loading states

hooks/
├── agents/                 # Agent management hooks (CRUD, withdrawal)
├── profile/                # Profile hooks
└── rewards/                # Rewards hooks (missions, leaderboard)

lib/
├── database.types.ts       # Supabase generated types (run generate:types:prod)
├── auth-api.ts             # Backend auth API client (wallet-based auth)
├── sui-utils.ts            # Sui blockchain utilities
└── utils.ts                # General utilities (cn, formatting)

constants/
├── index.ts                # App-level constants, Sui contract config, URLs
├── shared.ts               # Shared types and APP_NETWORK
├── chains.ts               # Chain registry, family helpers, EVM chain IDs
├── tokens.ts               # All supported tokens and chain-aware token helpers
├── solana.ts               # Solana runtime config (RPC, program ID, mints)
└── evm.ts                  # EVM runtime config (contracts, RPCs, TEE network)
```

## Key Files to Understand First

1. **`/constants/index.ts`** - App-level constants and Sui contract config
   - **`/constants/chains.ts`** - Chain registry (`CHAINS`), chain family helpers, and EVM chainId mapping
   - **`/constants/tokens.ts`** - All supported tokens and chain-aware helpers (`getSupportedTokens`, `getNativeToken`, `getTokenForCoinType`)
2. **`/lib/database.types.ts`** - Supabase schema (auto-generated)
3. **`/app/providers.tsx`** - Provider hierarchy (PostHog → Query → EVM → Sui → Solana → ActiveChain → Auth)
4. **`/lib/auth-api.ts`** - Backend auth API client (wallet signature-based)
5. **`/context/AuthContext.tsx`** - Auth state management
6. **`/hooks/agents/`** - Agent business logic hooks
7. **`/types.ts`** - Core type definitions

## Development Patterns

### Component Patterns
- Most components use `'use client'` directive (App Router with client interactivity)
- Provider pattern for context sharing (nested in `app/providers.tsx`)
- Skeleton components in `components/ui/skeletons/` for loading states
- Modal components for success states (e.g., `AgentCreatedModal.tsx`)

### State Management
- **React Query** for server state (agents, rewards, leaderboard) with 60s stale time
- **Custom hooks** per feature in `hooks/` directories
- **Context providers** at root: PostHog → QueryClient → SuiClient → Wallet

### Styling
- **Tailwind-first** with utility classes
- **`cn()` utility** for merging Tailwind classes (clsx + tailwind-merge)
- **CSS variables** for theming (defined in `tailwind.config.ts` and `globals.css`)
- **shadcn/ui** components as base (customized via `components.json`)

### Type Safety
- Supabase types auto-generated from database schema (run `bun run generate:types:prod`)
- NextAuth types extended in `/types/next-auth.d.ts`
- Core types exported from `/types.ts`

### API Routes
- RESTful design with standard HTTP methods
- Error handling via try-catch with NextResponse.json
- Service client used for Supabase queries in server routes
- Some routes proxy to external backend (LOCAL_API_PATH)

## Wallet Integration

### Sui (Primary)
- Uses `@mysten/dapp-kit` with `WalletProvider`
- Auto-connect enabled
- Supports all Sui-compatible wallets (Slush, Sui Wallet, etc.)
- Connect button: `components/SuiConnectButton.tsx`

### Solana
- Uses `@privy-io/react-auth/solana` (`useWallets`, wallet-standard `signAndSendTransaction`)
- Provider: `app/PrivyWalletProvider.tsx` (Privy owns EVM + Solana wallet connection)
- Connect button: `components/SolanaConnectButton.tsx`
- Abstraction hooks: `hooks/useSolanaWallet.ts` + `hooks/useSolanaConnection` (adapter-compatible interface)
- **Note**: Use a private RPC for production (public endpoints are rate-limited)

### EVM
- Provider: `app/PrivyWalletProvider.tsx` — `PrivyProvider` + `WagmiProvider` from `@privy-io/wagmi`
- wagmi config: `lib/wagmi.ts` (`createConfig` from `@privy-io/wagmi`; connectors driven by Privy)
- Connect button: `components/EVMConnectButton.tsx` (modal via `hooks/usePrivyConnect.ts`)

### Auth (Privy)
- Login modal: wallet (EVM + Solana) and email; embedded wallets created on login for users without one
- Connect modal entry point: `hooks/usePrivyConnect.ts` (replaces old RainbowKit/Solana-adapter modals)

### Active Chain Context
- `context/ActiveChainContext.tsx` tracks which chain the user is currently interacting with
- Components can use this to show relevant wallet/token options

## Blockchain Integration

**Key Transaction Types:**
- Agent funding (deploy + stake)
- Bounty claims (successful attacks)
- Withdrawals (after 14-day lock period)

**Key Constants:**
- `WITHDRAWAL_LOCK_MS`: 14 days (1,209,600,000 ms)
- `MIST_PER_SUI`: 1,000,000,000 (SUI has 9 decimals)
- Token lists and minimum amounts live in `/constants/tokens.ts`:
  - `getSupportedTokens(chain)` returns the token list for any `SupportedChain`
  - `getNativeToken(chain)` returns the native gas token for a chain
  - `getTokenForCoinType(coinType, chainHint?)` resolves a token identifier with an optional chain-scoped fallback

**Sui Contract Configs:**
- Mainnet: `SUI_MAINNET_CONFIG`
- Testnet: `SUI_TESTNET_CONFIG`
- Legacy (single-token): `SUI_MAINNET_LEGACY_CONFIG` / `SUI_TESTNET_LEGACY_CONFIG`

**Chain Registry:**
- `/constants/chains.ts` defines `CHAINS` with a `family` discriminator (`sui` | `solana` | `evm`)
- Use `isEvmChain(chain)`, `isSolanaChain(chain)`, and `getChainFamily(chain)` instead of inline string checks
- EVM chain IDs are centralized in `EVM_CHAIN_IDS` with helpers `getEvmChainIdForActive` and `getEvmChainKey`

## Database Schema (Supabase)

See `lib/database.types.ts` for full schema.

Key tables:
- `ss_agents` - Agent metadata
- `ss_rewards_activity` - User mission completions
- `ss_rewards_leaderboard` - Leaderboard data
- `ss_profiles` - User profiles linked to wallets

## Engineering Principles

### Single source of truth for config
Never hardcode values that already exist in constants. Always trace back to the canonical definition:
- If a value needs to change in the future, it should change in exactly one place

### Extract pure components into their own files
If a component is purely presentational (takes props, renders UI, no side effects), give it its own file even if it starts small. Inline helper components inside a parent file are harder to find, test, and reuse. The rule of thumb: if you'd name it with a capital letter and it renders JSX, it belongs in its own file under `components/ui/common/` (generic) or the relevant feature folder.

```tsx
// bad — SubMenuList buried inside DesktopNav.tsx, invisible to other consumers
function SubMenuList({ items }) { ... }
export function DesktopNav() { ... }

// good — NavSubMenuList.tsx in components/ui/common/, importable anywhere
export function NavSubMenuList({ items }) { ... }
```

### Avoid dead code
Before adding logic to a hook (e.g. tier calculation), verify it's actually consumed by a caller. If no caller uses it, don't add it. If it was added and is unused, delete it — dead code is a maintenance burden and misleads future readers.

### Name things for what they actually do
A hook named `useSentinelBalance` that also computes a rewards tier is misnamed. Rename or split when a hook's responsibilities grow beyond its name. If a "specialized" hook only wraps a generic one without adding real value, delete the wrapper and call the generic hook directly at the call site.

### Prefer skeleton loading over spinners or placeholder text
Always use `<Skeleton />` (`components/ui/skeleton.tsx`) for loading states, not spinners, ellipsis (`...`), or `animate-pulse` on text. Size the skeleton to match the expected content dimensions so the layout doesn't jump when data arrives — match the height to the text size and width to the typical content length. This is the standard across the whole app.

```tsx
// bad — layout jumps, content flashes
{isLoading ? <Loader2 className="animate-spin" /> : <span>{value}</span>}
{isLoading ? <span className="animate-pulse">...</span> : <span>{value}</span>}

// good — stable layout, no jump
{isLoading ? <Skeleton className="h-5 w-24" /> : <span>{value}</span>}
```

### Use existing UI components, don't inline formatting
- For displaying token amounts with icon: use `<TokenAmount rawAmount={...} token={...} />`
- For formatted balance strings in text: use `formattedBalance` from `useTokenBalance`
- Do not inline `toLocaleString(...)` or `formatCompact(...)` at call sites

### Token balance fetching
**Always use `hooks/useTokenBalance.ts`** — never call `client.getBalance()` or `client.getCoins()` inline for display purposes.

```typescript
const { rawBalance, balance, formattedBalance, isLoading } = useTokenBalance(
  token.coinType,   // from SupportedToken or SUI_TOKEN / SUI_CONFIG constants
  token.decimals    // never hardcode the decimal count
)
```

Note: `getCoins()` is still appropriate inside transaction-building hooks (e.g. `useFundAgent`) where actual coin objects are needed for PTBs — this is different from balance display.

## Troubleshooting

### Common Issues

**"Cannot connect wallet"**
- Ensure you have a Sui-compatible wallet extension installed (Slush, Sui Wallet)
- Check that you're on the correct network (mainnet vs testnet) - set via `NEXT_PUBLIC_APP_NETWORK`
- Try refreshing the page or disconnecting/reconnecting

**"Supabase types out of sync"**
- Run `bun run generate:types:prod` to regenerate types
- Ensure your `SUPABASE_URL` points to the correct project

**"Agent creation fails"**
- Verify wallet is connected and has sufficient balance (minimum amounts vary by token)
- Check browser console for specific error messages
- Ensure the TEE backend is reachable (`https://tee-evm.redsentinel.xyz/health_check`)

**"OAuth login not working"**
- Verify `NEXTAUTH_URL` matches your current environment
- Check that OAuth app credentials are correctly set
- For local dev, ensure `NEXTAUTH_URL=http://localhost:3000`

**"Transaction failed"**
- Check you have enough SUI for gas fees
- Verify the contract package IDs are up to date in constants
- Check Sui network status if transactions consistently fail

**Build errors with "Module not found"**
- Run `bun install` to ensure all dependencies are installed
- Delete `.next` folder and rebuild: `rm -rf .next && bun build`

### Debugging Tips

1. **Check React Query DevTools** - Enable in development to inspect query states
2. **PostHog** - Check analytics dashboard for error tracking
3. **Supabase Dashboard** - View database logs and API requests
4. **Sui Explorer** - Verify on-chain transactions at `suivision.xyz`
5. **Network tab** - Inspect API calls to `/api/*` routes and TEE backend

### Adding a New Feature Checklist

1. [ ] Create types in `/types.ts` or relevant type file
2. [ ] Add chain-related constants to `/constants/chains.ts` and token constants to `/constants/tokens.ts`; keep app-level constants in `/constants/index.ts`
3. [ ] Create hook in appropriate `/hooks/` subdirectory
4. [ ] Create component(s) in appropriate `/components/` subdirectory
5. [ ] Add API route if needed in `/app/api/`
6. [ ] Update Supabase types if schema changed: `bun run generate:types:prod`
7. [ ] Follow existing patterns (skeletons, error handling, etc.)

## Important Notes

- **No testing framework** is currently configured
- **TypeScript strict mode** is disabled
- **Wallet connection required** for core features
- **Social authentication optional** but encouraged for profile completion
- **Service role key** used in server-side API routes (admin access)
- **Package IDs** stored in constants and may need updates when contracts are redeployed
- **14-day withdrawal lock** applies to all agent funds
