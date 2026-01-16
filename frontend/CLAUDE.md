# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sui Sentinel** is a decentralized AI security platform built on Sui blockchain. Users create AI agents ("sentinels") that must resist prompt injection attacks, or attack other agents to claim bounties.

**Tech Stack:**
- Next.js 15 (App Router) + TypeScript
- Bun (package manager)
- Tailwind CSS + shadcn/ui components
- @mysten/dapp-kit (Sui blockchain SDK)
- Supabase (PostgreSQL database)
- NextAuth.js (Twitter & Discord OAuth)
- React Query (@tanstack/react-query)
- Slush wallet integration

**Development Commands:**
```bash
bun install              # Install dependencies
bun dev                  # Start development server
bun build                # Build for production
bun start                # Start production server
bun lint                 # Run ESLint
bun run generate:types:prod  # Generate Supabase TypeScript types from database
```

## Architecture

### High-Level Structure

```
Frontend (Next.js) → Supabase (Database) → Custom Backend API → Sui Blockchain
                                    ↘
                                   NextAuth (OAuth)
```

**Key Concepts:**
- **On-chain data**: Agent deployments, funding, bounties via Sui blockchain
- **Off-chain data**: User profiles, agents metadata, rewards tracked in Supabase
- **Authentication**: Wallet-first (Slush) with optional social linking via NextAuth
- **AI Interactions**: Proxied through external backend API (LOCAL_API_PATH env var)

### Data Flow

**Attack Mode:**
1. User browses agents at `/attack/[slug]`
2. Submits prompt to agent via `POST /api/consume-prompt` (proxies to backend)
3. Backend returns response with attack success/failure
4. Successful attacks trigger on-chain bounty claim transaction

**Defend Mode:**
1. User creates agent at `/defend` with system prompt, model, and cost settings
2. Funds agent with SUI tokens via wallet transaction
3. Agent deployed to blockchain
4. Defender earns passive income when their agent resists attacks
5. Withdrawal available after lock period via `useWithdrawAgentModal` hook

**Rewards System:**
- Missions tracked in Supabase (`ss_rewards_activity`, `ss_rewards_leaderboard`)
- Complete missions via `POST /api/rewards/complete`
- Leaderboard fetched from `GET /api/rewards/leaderboard`

### Directory Structure

```
app/
├── api/                    # API routes (Supabase queries + backend proxy)
│   ├── agents/             # Agent CRUD operations
│   ├── auth/               # NextAuth OAuth endpoints
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
├── auth.ts                 # NextAuth configuration (Twitter/Discord)
├── sui-utils.ts            # Sui blockchain utilities
└── utils.ts                # General utilities (cn, formatting)

constants/
└── index.ts                # All constants (package IDs, URLs, config)
```

## Key Files to Understand First

1. **`/constants/index.ts`** - All package IDs, URLs, and configuration
2. **`/lib/database.types.ts`** - Supabase schema (auto-generated)
3. **`/app/providers.tsx`** - Provider hierarchy (QueryClient, SuiClient, Wallet)
4. **`/lib/auth.ts`** - NextAuth OAuth setup
5. **`/hooks/agents/`** - Agent business logic hooks
6. **`/types.ts`** - Core type definitions

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

## Environment Setup

Required environment variables (see `.env.example`):
- **Supabase**: URL, anon key, service role key
- **OAuth**: Twitter/Discord client IDs and secrets
- **NextAuth**: URL and secret
- **Vercel KV**: REST API URL and token
- **Application**: Base URL, PostHog key, admin API URL
- **Supabase Project Ref**: For type generation

## Blockchain Integration

**Sui SDK Usage:**
- Wallet connection via `@mysten/dapp-kit` (Slush wallet)
- Transactions executed via `signAndExecuteTransaction`
- On-chain events queried via `useSuiClientQuery`
- Object reading for agent details
- **Network**: Sui testnet (hardcoded in providers)

**Key Transaction Types:**
- Agent funding (deploy + stake)
- Bounty claims (successful attacks)
- Withdrawals (after lock period)

## Database Schema (Supabase)

Key tables:
- `ss_agents`: Agent registry (owner, name, slug, model, prompt, funding)
- `ss_users`: User profiles (wallet address, social links)
- `ss_rewards_leaderboard`: User points and tier tracking
- `ss_rewards_activity`: Mission completion history
- `ss_social_connections`: OAuth account linking
- `ss_feature_requests`: Agent feature requests

## Important Notes

- **No testing framework** is currently configured
- **TypeScript strict mode** is disabled
- **Wallet connection required** for core features (Slush wallet)
- **Social authentication optional** but encouraged for profile completion
- **Service role key** used in server-side API routes (admin access)
- **Package IDs** stored in constants and may need updates
