# Red Sentinel — Rewards Page UI Spec

## Context & Purpose

This is a **public-facing page** accessible from the main header navigation at `/rewards`. It does NOT require wallet connection to view. Its job is to:

1. Explain the full reward system (Booster → Spin → SENTINEL tokens)
2. Host social missions where users submit tweet/content links to earn boosters
3. Drive visitors toward connecting their wallet and participating

**This page is NOT:**
- The in-profile slot machine / spin UI (already exists in Profile → Rewards)
- The active boosters dashboard (already in Profile)
- The spin history viewer (already in Profile)

When the user is logged in (wallet connected), mission submission forms become active and quest progress is shown. When not logged in, everything is visible but CTAs say "Connect Wallet to Start Earning."

---

## Page Structure

```
/rewards
├── Sticky Tab Navigation (anchors to sections below)
│   ├── How It Works
│   ├── Missions
│   └── Rewards Reference
│
├── Section 1: Hero
├── Section 2: How It Works
├── Section 3: Social Missions (interactive, main section)
└── Section 4: Platform Rewards Reference
```

---

## Section 1: Hero

### Layout
Full-width banner at top of page. No background image needed — use brand gradients or dark background consistent with the app.

### Content

**Headline:** "Every Action Earns SENTINEL"
**Subheadline:** "Complete missions, attack Sentinels, create content, and spin the slot machine to earn SENTINEL tokens."

**Three stat cards in a row (live data from backend):**

| Stat | Example Value | Source |
|------|---------------|--------|
| Total SENTINEL Distributed | 12,450,000 | Backend aggregate |
| Active Missions | 14 | Count of currently available missions |
| Biggest Spin This Week | 97,800 SENTINEL | Backend leaderboard |

**Primary CTA:**
- If wallet NOT connected: "Connect Wallet to Start Earning" → triggers wallet connection
- If wallet connected: "View My Boosters" → links to Profile → Rewards section

---

## Section 2: How It Works

### Layout
Three-step horizontal flow (stacks vertically on mobile). Each step is a card with an icon/illustration, title, and short description.

### Content

**Step 1: Earn Boosters**
- Icon: Gift/ticket icon
- Title: "Earn Boosters"
- Description: "Complete social missions, attack Sentinels, create content, or refer friends to earn Booster Coupons ranging from 1x to 100x."

**Step 2: Spin the Slot Machine**
- Icon: Slot machine icon
- Title: "Spin to Multiply"
- Description: "Each Booster gives you a slot machine spin. Base range is 100–1,000 SENTINEL, multiplied by your booster tier. A 25x Legendary booster? That's 2,500–25,000 SENTINEL."

**Step 3: Collect SENTINEL**
- Icon: Token/coin icon
- Title: "Collect Instantly"
- Description: "SENTINEL tokens land in your wallet immediately after spinning. Share your spin on Twitter for a bonus +100 SENTINEL."

### Booster Tier Reference (below the 3 steps)

A horizontal scrollable card row (or responsive grid) showing all 7 booster tiers. Each card shows:

| Field | Display |
|-------|---------|
| Tier Name | e.g. "Legendary" |
| Color indicator | Matches tier color (see below) |
| Multiplier | e.g. "25x" |
| Spin Range | e.g. "2,500 – 25,000 SENTINEL" |
| Average Payout | e.g. "~13,750" |
| Expiration | e.g. "30 days" |

**Tier Colors:**

| Tier | Color Code | Emoji (for reference) |
|------|------------|----------------------|
| Common (1x) | Gray/White | ⚪ |
| Uncommon (2x) | Green | 🟢 |
| Rare (5x) | Blue | 🔵 |
| Epic (10x) | Purple | 🟣 |
| Legendary (25x) | Orange | 🟠 |
| Mythic (50x) | Red | 🔴 |
| Divine (100x) | Gold/Yellow | 🌟 |

### Daily Streak Info (collapsed/expandable)

Small expandable section below the tier cards:

**"Daily Spin Streaks"** — explain that spinning on consecutive days earns bonus multipliers:

| Consecutive Days | Bonus |
|------------------|-------|
| Day 1 | +0% |
| Day 2 | +5% |
| Day 3 | +10% |
| Day 7 | +25% |
| Day 14 | +35% |
| Day 30 | +50% |

Note: "Streak resets if no spin for 48 hours"

**"Lucky Hour"** — 1–2 random hours per day, all spins get +20%. Announced in Discord/Telegram.

**"First Spin of Day"** — guaranteed minimum 300 base instead of 100.

---

## Section 3: Social Missions

This is the **primary interactive section** of the page. It's where users go to complete social tasks and submit proof (tweet links, content URLs) to earn boosters.

### Layout

**Tab navigation within the section:**

```
[ Twitter/X ]  [ Content Creation ]  [ Community ]  [ Referrals ]
```

Each tab contains a list of mission cards. On mobile, tabs become a dropdown or horizontal scroll.

### Mission Card Component

Every mission is rendered as a card with these fields:

```
┌──────────────────────────────────────────────────────────┐
│  [Tier Color Dot] [Booster Badge: "5x Rare"]            │
│                                                          │
│  Mission Title                                           │
│  Short description of what to do                         │
│                                                          │
│  Requirements: Min 50 chars, 2/day max                   │
│  Reward: 500 – 5,000 SENTINEL                            │
│                                                          │
│  ┌────────────────────────────────────┐  ┌────────────┐ │
│  │  Paste your tweet link here...     │  │  Submit  ↗ │ │
│  └────────────────────────────────────┘  └────────────┘ │
│                                                          │
│  Status: 1/2 completed today                             │
└──────────────────────────────────────────────────────────┘
```

**Card Fields:**

| Field | Description |
|-------|-------------|
| `tierColor` | Color dot matching booster tier |
| `boosterBadge` | e.g. "5x Rare" — styled pill/badge |
| `title` | Mission name |
| `description` | What the user needs to do |
| `requirements` | Character minimums, frequency limits, account age, etc. |
| `rewardRange` | Spin range text, e.g. "500 – 5,000 SENTINEL" |
| `submissionInput` | URL input field (for tweet/content link) OR verify button (for follow/join actions) |
| `status` | "Available", "Pending Review", "Completed", "Limit Reached", "Requires Wallet" |
| `dailyLimit` | e.g. "1/3 today" |
| `lifetimeLimit` | For one-time missions like "Follow Twitter" |

**States:**

| State | Visual Treatment |
|-------|-----------------|
| Available | Active card, submit button enabled |
| Requires Wallet | Card visible, input disabled, CTA says "Connect Wallet" |
| Pending Review | Yellow/amber badge, "Under Review" label, no resubmit |
| Completed | Green checkmark, grayed out or moved to bottom |
| Limit Reached | "Come back tomorrow" message, daily counter shown |
| Expired | Only relevant for time-limited event missions |

### Tab 1: Twitter/X Missions

| # | Mission | Type | Booster | Input | Requirements | Limit |
|---|---------|------|---------|-------|--------------|-------|
| 1 | Follow @suisentinal | Verify | 1x Common | [Verify] button (OAuth or manual check) | Verified account, one-time | Lifetime: 1 |
| 2 | Like official tweet | Submit link | 1x Common | Tweet URL input | Must be an official Red Sentinel tweet | 3/day |
| 3 | Repost official tweet | Submit link | 2x Uncommon | Tweet URL input | Must be an official Red Sentinel tweet | 3/day |
| 4 | Quote tweet with insight | Submit link | 5x Rare | Tweet URL input | Min 50 characters of original text | 2/day |
| 5 | Tag 3 friends | Submit link | 2x Uncommon | Tweet URL input | Tagged accounts must be real | 1/day |
| 6 | Create thread (5+ tweets) | Submit link | 10x Epic | Thread URL input | Must be educational/informational about Red Sentinel | 1/day |
| 7 | Thread goes viral (1K+ impressions) | Auto-detected | 25x Legendary | N/A (auto-verified from previously submitted threads) | Verified analytics | Unlimited |

**Note:** Missions 1–6 are user-submitted. Mission 7 is auto-detected by the backend when a previously submitted thread hits the impression threshold — no separate submission needed. Show it as an info card explaining the bonus exists.

### Tab 2: Content Creation

| # | Mission | Type | Booster | Input | Requirements | Limit |
|---|---------|------|---------|-------|--------------|-------|
| 1 | Explainer thread | Submit link | 10x Epic | Twitter thread URL | 5+ tweets, accurate info | Review queue |
| 2 | Short video (< 2 min) | Submit link | 25x Legendary | YouTube/Twitter/TikTok URL | Quality production | Review queue |
| 3 | Long video (5+ min) | Submit link | 50x Mythic | YouTube URL | Tutorial quality | Review queue |
| 4 | Written article | Submit link | 25x Legendary | Medium/Mirror/blog URL | 800+ words | Review queue |
| 5 | Infographic | Submit link | 10x Epic | Image hosting URL or Twitter post | Original design | Review queue |
| 6 | Meme (contest winner) | Submit link | 10x Epic | Twitter/image URL | Community voted — contest periods | Contest only |
| 7 | Translation (full docs) | Submit link | 50x Mythic | Google Doc / Notion URL | Native speaker, complete translation | Review queue |
| 8 | Viral content (10K+ views) | Auto-detected | 100x Divine | N/A | Verified metrics from previously submitted content | Unlimited |

**Review Queue Note:** Content missions go into a manual review queue. Show a banner at the top of this tab:
> "Content submissions are reviewed by our team within 48 hours. Quality content that accurately represents Red Sentinel earns boosters."

### Tab 3: Community

| # | Mission | Type | Booster | Input | Requirements | Limit |
|---|---------|------|---------|-------|--------------|-------|
| 1 | Join Discord | Verify | 1x Common | [Join Discord] button → redirect + verification | One-time | Lifetime: 1 |
| 2 | Join Telegram | Verify | 1x Common | [Join Telegram] button → redirect + verification | One-time | Lifetime: 1 |
| 3 | Helpful answer in Discord | Mod-verified | 2x Uncommon | N/A (mod awards this) | Verified by moderator | No user submission |
| 4 | Report valid bug | Submit form | 25x Legendary | Bug description + steps to reproduce (textarea + optional URL) | Confirmed by team | Unlimited |
| 5 | Critical bug / security issue | Submit form | 100x Divine | Detailed report (textarea + optional URL) | Confirmed critical | Unlimited |

**Note:** Missions 3 is mod-triggered, not user-submitted. Show it as an info card:
> "Help others in Discord and our mods will reward you with a 2x booster."

Missions 4–5 should open a simple form modal with: title, description (textarea), reproduction steps (textarea), optional URL, severity dropdown (Bug / Critical / Security).

### Tab 4: Referrals

**Top section: Referral Link Generator**

```
┌──────────────────────────────────────────────────────────┐
│  Your Referral Link                                      │
│  ┌──────────────────────────────────┐  ┌──────────────┐ │
│  │ https://app.suisentinel.xyz/...  │  │  Copy Link 📋│ │
│  └──────────────────────────────────┘  └──────────────┘ │
│                                                          │
│  Share: [Twitter] [Telegram] [Discord]                   │
│                                                          │
│  Your Stats:                                             │
│  Referred: 12 users | Converted: 8 | Total Earned: 45K  │
│                                                          │
│  Your Tier: 10+ referrals → All referral boosters +25%   │
└──────────────────────────────────────────────────────────┘
```

If wallet not connected: "Connect wallet to generate your referral link"

**Below: Referral Reward Table**

| Referral Action | Your Booster | New User Gets |
|-----------------|-------------|---------------|
| Signs up + connects wallet | 2x Uncommon | 2x Uncommon |
| Completes first attack | 10x Epic | 5x Rare |
| Deploys first Sentinel | 25x Legendary | 10x Epic + 1K direct |
| Referred Sentinel survives 7 days | 25x Legendary | — |
| Referred user breaches a Sentinel | 10x Epic | — |
| Referred defender deposits 100+ SUI | 50x Mythic | — |
| Referred defender deposits 1,000+ SUI | 100x Divine | — |

**Tier Multiplier Progression (show as a small info section):**

| Users Referred | Bonus on Referral Boosters |
|----------------|---------------------------|
| 10+ | +25% |
| 50+ | +50% |
| 100+ | +100% (2x) |
| 500+ | +200% (3x) |

---

## Section 4: Platform Rewards Reference

This section is **informational only** — no submission forms. It tells users what they earn automatically by participating on the platform.

### Layout
Two subsections side by side on desktop, stacked on mobile: Attacker Rewards and Defender Rewards.

### Attacker Rewards

**Auto-earned Boosters (from on-chain activity):**

| Action | Booster | SENTINEL Range |
|--------|---------|----------------|
| Complete any attack | 5x Rare | 500 – 5,000 |
| Attack score 70–89 | 7x Rare+ | 700 – 7,000 |
| Attack score 90–99 | 10x Epic | 1,000 – 10,000 |
| Successful breach (score 100) | 15x Epic+ | 1,500 – 15,000 + SUI Prize Pool |
| First attack ever | 5x Rare | 500 – 5,000 |
| First Blood (first to breach a new Sentinel) | 25x Legendary | 2,500 – 25,000 |
| Streak Breaker (break 14+ day undefeated) | 25x Legendary | 2,500 – 25,000 |
| Legend Slayer (break 30+ day undefeated) | 50x Mythic | 5,000 – 50,000 |
| Daily 5 attacks | 5x Rare | 500 – 5,000 |
| Weekly 25 attacks | 10x Epic | 1,000 – 10,000 |

**CTA:** "Start Attacking →" links to `/attack` page.

### Defender Rewards

**Direct Rewards (no spin):**

| Action | Reward |
|--------|--------|
| Deploy a Sentinel | 1,000 SENTINEL |
| Deposit SUI to Sentinel | 5,000 SENTINEL × SUI amount |

**Ongoing Staking Rewards:**

Show the formula in a clean, readable format:

```
Daily SENTINEL = (Pool Size × 50) × Duration Multiplier × Defense Multiplier
```

**Duration Multipliers:**

| Duration | Multiplier |
|----------|-----------|
| 0–7 days | 1.0x |
| 8–30 days | 1.25x |
| 31–90 days | 1.5x |
| 91–180 days | 2.0x |
| 180+ days | 2.5x |

**Defense Multipliers:**

| Condition | Multiplier |
|-----------|-----------|
| Base | 1.0x |
| 25+ attacks survived | 1.15x |
| 100+ attacks survived | 1.3x |
| 7-day undefeated | 1.2x |
| 30-day undefeated | 1.5x |
| Resilience score 80+ | 1.35x |
| Resilience score 95+ | 1.75x |

**Defender Milestone Boosters:**

| Milestone | Booster | SENTINEL Range |
|-----------|---------|----------------|
| Survive 100 attacks | 10x Epic | 1,000 – 10,000 |
| Survive 500 attacks | 25x Legendary | 2,500 – 25,000 |
| Survive 1,000 attacks | 50x Mythic | 5,000 – 50,000 |
| 7-day undefeated streak | 10x Epic | 1,000 – 10,000 |
| 30-day undefeated streak | 50x Mythic | 5,000 – 50,000 |
| 90-day undefeated streak | 100x Divine | 10,000 – 100,000 |
| Top 10 leaderboard (first time) | 25x Legendary | 2,500 – 25,000 |
| #1 defender of month | 100x Divine | 10,000 – 100,000 |

**CTA:** "Deploy a Sentinel →" links to `/defend` page.
**Secondary CTA:** "Calculate Your Rewards →" links to reward calculator at `https://www.suisentinel.xyz/reward-calculator`

---

## API Endpoints (Backend Already Implemented)

These are the endpoints the frontend needs to integrate with. Verify exact shapes with your backend.

### Missions

```
GET    /missions/:network/list
       → Returns all available missions with status for connected wallet

POST   /missions/:network/submit
       Body: { missionId, walletAddress, proofUrl, proofType }
       → Submits mission completion proof (tweet link, content URL, etc.)

GET    /missions/:network/submissions/:walletAddress
       → Returns user's submission history with statuses
```

### Boosters

```
GET    /boosters/:network/active/:walletAddress
       → Returns active (unspun) boosters for user

GET    /boosters/:network/spins/:walletAddress?limit=20&offset=0
       → Returns spin history
```

### Referrals

```
GET    /referrals/:network/:walletAddress
       → Returns referral link, stats, tier

GET    /referrals/:network/:walletAddress/referred
       → Returns list of referred users and their conversion status
```

### Stats (Public, no wallet needed)

```
GET    /stats/:network/rewards
       → Returns { totalDistributed, activeMissions, biggestSpinThisWeek }

GET    /stats/:network/live-spins?limit=10
       → Returns recent spins for the live feed
```

---

## Component Hierarchy

```
RewardsPage
├── RewardsHero
│   ├── StatsRow (totalDistributed, activeMissions, biggestSpin)
│   └── CTAButton (connect wallet / view boosters)
│
├── StickyTabNav (How It Works | Missions | Rewards Reference)
│
├── HowItWorks
│   ├── ThreeStepFlow
│   │   ├── StepCard (Earn Boosters)
│   │   ├── StepCard (Spin to Multiply)
│   │   └── StepCard (Collect Instantly)
│   ├── BoosterTierRow (7 tier cards, horizontally scrollable)
│   └── ExpandableInfo
│       ├── DailyStreakTable
│       ├── LuckyHourInfo
│       └── FirstSpinBonusInfo
│
├── SocialMissions
│   ├── MissionTabNav (Twitter | Content | Community | Referrals)
│   ├── MissionList (filtered by active tab)
│   │   └── MissionCard (repeated)
│   │       ├── BoosterBadge
│   │       ├── MissionInfo (title, description, requirements)
│   │       ├── SubmissionInput (URL input or Verify button or Form trigger)
│   │       └── MissionStatus (available/pending/completed/limit)
│   ├── ReferralSection (when Referrals tab active)
│   │   ├── ReferralLinkGenerator
│   │   ├── ReferralStats
│   │   ├── ReferralRewardTable
│   │   └── ReferralTierProgression
│   └── ContentReviewBanner (shown on Content Creation tab)
│
├── PlatformRewardsReference
│   ├── AttackerRewards
│   │   ├── AutoEarnedBoostersTable
│   │   └── AttackCTA
│   └── DefenderRewards
│       ├── DirectRewardsTable
│       ├── StakingFormulaDisplay
│       ├── DurationMultiplierTable
│       ├── DefenseMultiplierTable
│       ├── MilestoneBoostersTable
│       └── DefenderCTAs
│
└── LiveSpinFeed (floating/sticky bottom bar or sidebar)
    └── SpinFeedItem (repeated, auto-refreshing)
```

---

## Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| Desktop (1024px+) | Full layout, side-by-side sections, horizontal tier cards |
| Tablet (768–1023px) | Stack attacker/defender sections, 2-column mission grid |
| Mobile (<768px) | Single column everything, mission tabs → horizontal scroll or dropdown, tier cards → horizontal scroll, collapsible info sections default to collapsed |

---

## State Management Notes

**Unauthenticated (no wallet):**
- All sections visible and readable
- Mission submission inputs disabled with "Connect Wallet" overlay/tooltip
- Referral link section shows "Connect wallet to generate your link"
- Stats section shows public aggregate data
- No personalized data anywhere

**Authenticated (wallet connected):**
- Mission inputs enabled
- Submission statuses shown per mission
- Referral link generated and shown
- Daily limits and streak data shown
- "View My Boosters" CTA links to profile

---

## Design Notes for Implementation

- Match existing Red Sentinel app styling (dark theme, brand colors)
- Booster tier colors are a core visual element — use them consistently across badges, dots, card accents
- Mission cards should feel like achievable tasks, not a wall of text
- The "How It Works" section should be visually engaging enough to hook someone who's never heard of the system
- Live Spin Feed adds social proof — keep it subtle (bottom bar or small sidebar widget), not distracting
- Consider adding subtle animations: booster badges pulse, spin feed slides in, stat counters animate on load
- Tables in the Rewards Reference section should be clean and scannable — consider using cards instead of raw tables on mobile

---

## Implementation Priority

1. **Page shell + routing** — `/rewards` route, sticky nav, basic layout
2. **Hero section** — stats API integration, CTA logic
3. **How It Works** — static content, booster tier cards
4. **Social Missions — Twitter tab** — mission cards, URL submission, status tracking
5. **Social Missions — Content tab** — similar pattern, review queue banner
6. **Social Missions — Community tab** — join buttons, bug report form
7. **Social Missions — Referrals tab** — link generator, stats, reward tables
8. **Platform Rewards Reference** — informational tables, CTAs
9. **Live Spin Feed** — polling/websocket integration
10. **Polish** — animations, responsive refinements, edge cases
