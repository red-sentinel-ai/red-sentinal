# Arena Activity Feed — API Spec

Consumer: the landing page's **Live Activity Feed** section
(`components/attack/LiveActivityFeed.tsx` via `hooks/arena/useArenaActivity.ts`).
Purpose: prove the arena is alive within 5 seconds of landing — real attacks,
verdicts, deployments, and money movement, newest first.

Status: **proposed**. Until this ships, the frontend runs on the placeholder
provider in `useArenaActivity.ts` (marked `TODO(backend)`).

---

## Endpoint

```
GET {SUI_SENTINEL_API_URL}/activity/:network?limit=20
```

- `:network` — `mainnet` | `testnet` (same convention as `/agents/:network`).
- `limit` — optional, default `20`, max `50`. The feed renders up to 20.
- Auth: none (public). Called with `credentials: 'include'` like the other
  public endpoints.
- Cache: `Cache-Control: s-maxage=10, stale-while-revalidate=30` is ideal —
  the frontend polls every 15–30s and tolerates ~30s staleness.

## Response

```jsonc
{
  "events": [ /* ArenaEvent[], newest first, see below */ ]
}
```

Empty volume is **not** an error: return `"events": []`. The frontend decides
how to render quiet periods.

### ArenaEvent

```ts
interface ArenaEvent {
  id: string            // stable, unique, sortable-by-recency proxy if possible
  kind: 'attack_failed' | 'attack_broke' | 'deployed'
  chain: 'sui' | 'solana' | 'arb' | /* ...SupportedChain */

  actor: string         // full wallet address; display truncation is client-side
  actor_username?: string  // platform username if the wallet has one

  target_name: string       // sentinel display name, e.g. "Rex AF"
  target_agent_path?: string // /attack/<agent_path> slug, when resolvable

  severity?: number     // attacks only, integer 0–10 (verdict score)
  amount_display: string // pre-formatted money string, e.g. "+2 MON"
  amount_raw?: string    // base units, for future precise rendering
  token_symbol?: string  // e.g. "MON"

  tx_hash?: string      // on-chain tx digest/hash for the event, when public

  occurred_at: string   // ISO-8601 UTC, e.g. "2026-09-04T09:41:02Z"
}
```

### Field semantics

| Field | Rules |
|---|---|
| `id` | Unique across kinds. Used as a React key and for poll de-duplication — re-delivering the same event with a different `id` will render it as a new arrival. |
| `kind` | `attack_failed` = attack submitted, sentinel survived. `attack_broke` = sentinel defeated and pool claimed (claim is part of the break; no separate claim event). `deployed` = new sentinel launched. |
| `actor` | **Full address.** The frontend truncates for display (`0x7a3…f2`) and may link the row to `/u/{actor}`. If policy ever requires server-side anonymization, return the pre-truncated form — the frontend's truncation is idempotent on it. |
| `severity` | Present only on `attack_failed` (and optionally `attack_broke`). Integer 0–10 from the verdict. |
| `amount_display` | Exactly what the UI shows. Per kind: `attack_failed` → pool growth, **50% of the fee paid** (per the fee split), e.g. `"+2 MON"`; `attack_broke` → claimed pool, e.g. `"890 MON"`; `deployed` → seeded pool, e.g. `"500 MON"`. Signed/gold-formatted styling is the frontend's job — keep the string plain. |
| `tx_hash` | Optional but strongly wanted for breaks and deployments — the landing page's promise is "every break is public." |
| `occurred_at` | Event time, not ingestion time. Frontend converts to epoch and renders "2h ago". |

### Examples

```jsonc
{
  "events": [
    {
      "id": "evt_01HV2K3...",
      "kind": "attack_failed",
      "chain": "sui",
      "actor": "0x7a3f5c2e8b1d4f6a9c3e5b7d2f4a6c8e0b1d3f5a",
      "actor_username": "prompt_samurai",
      "target_name": "Rex AF",
      "target_agent_path": "rex-af",
      "severity": 7,
      "amount_display": "+2 MON",
      "amount_raw": "2000000000",
      "token_symbol": "MON",
      "tx_hash": "HA2xK9...",
      "occurred_at": "2026-09-04T09:41:02Z"
    },
    {
      "id": "evt_01HV2K2...",
      "kind": "deployed",
      "chain": "arb",
      "actor": "0x91b244aa...",
      "target_name": "Sentinel #9",
      "target_agent_path": "sentinel-9",
      "amount_display": "500 MON",
      "occurred_at": "2026-09-04T09:33:57Z"
    },
    {
      "id": "evt_01HV2K1...",
      "kind": "attack_broke",
      "chain": "sui",
      "actor": "0x3d87f01b...",
      "target_name": "Gatekeeper X",
      "target_agent_path": "gatekeeper-x",
      "severity": 10,
      "amount_display": "890 MON",
      "tx_hash": "Fk3pQ7...",
      "occurred_at": "2026-09-04T09:28:11Z"
    }
  ]
}
```

## Behavioral contract

1. **Newest first**, strictly ordered by `occurred_at` descending.
2. **No age cutoff.** Even at low volume, return the last `limit` events
   regardless of age. Silence (empty list) is the only bad answer — age is
   fine, the UI renders "5h ago".
3. **Cross-chain by default.** All chains the arena supports, interleave by
   time. (A `?chain=` filter is optional sugar; the landing feed doesn't use
   it today.)
4. **Stable pagination is not required for v1.** The feed only ever reads the
   head of the log. If trivial, support `?before_id=<id>` for future
   "view all activity" pages.

## Polling & realtime

- v1: plain polling. The frontend refetches every ~15–30s (react-query,
  `staleTime` 30s). Responses should be cheap: ≤50 rows, no joins beyond
  name/username resolution.
- v2 (optional): `GET /activity/:network?since_id=<id>` returning only newer
  events, enabling efficient long-poll; or an SSE channel pushing the same
  payload. The frontend adapter is isolated to `queryFn` in
  `useArenaActivity.ts` — either upgrade is a one-function change.

## Errors

Standard error envelope used by the other endpoints. `404` only for an
unknown `:network` — never for "no events yet".

## Frontend integration (when this ships)

`useArenaActivity.ts`: replace the placeholder `queryFn` with the fetch,
map `occurred_at` → `timestamp: Date.parse(...)`, `amount_display` →
`amount`, and delete the dummy builder + `suppressHydrationWarning`-era
mount gating if timestamps become server-renderable. Everything else in the
UI is already shaped to this contract.

## Future extensions (non-binding)

- `funded` kind — pool top-ups on live sentinels ("0x.. added 100 MON to Rex AF").
- `syndicate_deployed` kind — syndicate launches, linking to the syndicate.
- Aggregate flags per event (`is_first_break`, `record_pool`) for highlighting.
