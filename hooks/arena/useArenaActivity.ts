import { useQuery } from '@tanstack/react-query'

/**
 * Arena activity feed — the event model the landing page's Live Activity Feed
 * renders. The provider below is placeholder data with the exact shape the
 * backend event-log endpoint should emit; swap `queryFn` when it lands.
 */

export type ArenaEventKind = 'attack_failed' | 'attack_broke' | 'deployed'

export interface ArenaEvent {
  id: string
  kind: ArenaEventKind
  /** Wallet address — truncated at render time, never shown in full. */
  actor: string
  /** Sentinel display name. */
  targetName: string
  /** Attack severity 0–10, attacks only. */
  severity?: number
  /** Human-readable money delta, e.g. "+2 MON", "890 MON". */
  amount?: string
  /** ms epoch — used for the "2h ago" column. */
  timestamp: number
}

export const ARENA_ACTIVITY_QUERY_KEY = 'arenaActivity'
export const ARENA_FEED_VISIBLE_ROWS = 8
export const ARENA_FEED_ROTATE_MS = 3500

/** "just now" → "2m ago" → "3h ago" → "2d ago". */
export function timeAgo(timestamp: number, now = Date.now()): string {
  const seconds = Math.max(0, Math.floor((now - timestamp) / 1000))
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const minutesAgo = (m: number) => Date.now() - m * 60_000

// Placeholder feed — same shape the real endpoint will emit. Mix of failed
// attacks, breaks, and deployments so every row template is exercised.
const buildDummyEvents = (): ArenaEvent[] => [
  { id: 'e01', kind: 'attack_failed', actor: '0x7a3f…9c2d', targetName: 'Rex AF', severity: 7, amount: '+2 MON', timestamp: minutesAgo(2) },
  { id: 'e02', kind: 'deployed', actor: '0x91b2…44aa', targetName: 'Sentinel #9', amount: '500 MON seeded', timestamp: minutesAgo(9) },
  { id: 'e03', kind: 'attack_broke', actor: '0x3d87…f01b', targetName: 'Gatekeeper X', amount: '890 MON claimed', timestamp: minutesAgo(14) },
  { id: 'e04', kind: 'attack_failed', actor: '0xbe21…7e90', targetName: 'Sentinel Prime', severity: 3, amount: '+1 MON', timestamp: minutesAgo(21) },
  { id: 'e05', kind: 'attack_failed', actor: '0x99de…f01b', targetName: 'Vault Keeper', severity: 8, amount: '+5 MON', timestamp: minutesAgo(33) },
  { id: 'e06', kind: 'attack_failed', actor: '0x41cd…3f1c', targetName: 'Rex AF', severity: 5, amount: '+2 MON', timestamp: minutesAgo(47) },
  { id: 'e07', kind: 'deployed', actor: '0xd802…88b1', targetName: 'Oracle-7', amount: '250 MON seeded', timestamp: minutesAgo(58) },
  { id: 'e08', kind: 'attack_failed', actor: '0x7f19…22c4', targetName: 'Gatekeeper X', severity: 9, amount: '+3 MON', timestamp: minutesAgo(64) },
  { id: 'e09', kind: 'attack_broke', actor: '0xc4e0…0d7a', targetName: 'Vault Keeper', amount: '412 MON claimed', timestamp: minutesAgo(79) },
  { id: 'e10', kind: 'attack_failed', actor: '0x55ab…91f3', targetName: 'Sentinel #9', severity: 2, amount: '+1 MON', timestamp: minutesAgo(93) },
  { id: 'e11', kind: 'attack_failed', actor: '0x2f8c…b6d0', targetName: 'Oracle-7', severity: 6, amount: '+2 MON', timestamp: minutesAgo(111) },
  { id: 'e12', kind: 'deployed', actor: '0x8d3e…4a29', targetName: 'Iron Warden', amount: '1.2K MON seeded', timestamp: minutesAgo(128) },
  { id: 'e13', kind: 'attack_failed', actor: '0x6c77…e5b2', targetName: 'Sentinel Prime', severity: 4, amount: '+1 MON', timestamp: minutesAgo(150) },
  { id: 'e14', kind: 'attack_failed', actor: '0x09fa…73c8', targetName: 'Iron Warden', severity: 10, amount: '+4 MON', timestamp: minutesAgo(167) },
  { id: 'e15', kind: 'attack_broke', actor: '0xbb40…5e17', targetName: 'Sentinel #4', amount: '1.1K MON claimed', timestamp: minutesAgo(190) },
  { id: 'e16', kind: 'attack_failed', actor: '0xe2d5…c9f6', targetName: 'Rex AF', severity: 1, amount: '+1 MON', timestamp: minutesAgo(214) },
  { id: 'e17', kind: 'deployed', actor: '0x47ce…20ad', targetName: 'Null Guardian', amount: '75 MON seeded', timestamp: minutesAgo(240) },
  { id: 'e18', kind: 'attack_failed', actor: '0xa9b8…d341', targetName: 'Vault Keeper', severity: 7, amount: '+2 MON', timestamp: minutesAgo(268) },
  { id: 'e19', kind: 'attack_failed', actor: '0x31f0…6a9c', targetName: 'Null Guardian', severity: 5, amount: '+1 MON', timestamp: minutesAgo(290) },
  { id: 'e20', kind: 'attack_failed', actor: '0xf6d2…8b05', targetName: 'Oracle-7', severity: 8, amount: '+3 MON', timestamp: minutesAgo(320) },
]

export function useArenaActivity() {
  return useQuery<ArenaEvent[], Error>({
    queryKey: [ARENA_ACTIVITY_QUERY_KEY],
    // TODO(backend): replace with the event-log endpoint — see
    // docs/ARENA_ACTIVITY_API.md for the full contract. Placeholder below.
    queryFn: async () => buildDummyEvents(),
    staleTime: 30_000,
  })
}
