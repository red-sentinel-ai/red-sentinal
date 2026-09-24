'use client'

import { useEffect, useState } from 'react'

// TODO: wire this to the backend activity/event-log service once available.
// Dummy data for now — same shape the real feed should emit.
type ActivityEvent = {
  attacker: string
  target: string
  result: 'FAILED' | 'SUCCESS'
  severity: string
  poolDelta: string
}

const DUMMY_EVENTS: ActivityEvent[] = [
  {
    attacker: '0x7a3f…9c2d',
    target: 'Rex AF',
    result: 'FAILED',
    severity: '7/10',
    poolDelta: '+2 MON',
  },
  {
    attacker: '0xbe21…44aa',
    target: 'Sentinel Prime',
    result: 'FAILED',
    severity: '3/10',
    poolDelta: '+1 MON',
  },
  {
    attacker: '0x99de…f01b',
    target: 'Vault Keeper',
    result: 'FAILED',
    severity: '8/10',
    poolDelta: '+5 MON',
  },
  {
    attacker: '0x41cd…7e90',
    target: 'Rex AF',
    result: 'FAILED',
    severity: '5/10',
    poolDelta: '+2 MON',
  },
  {
    attacker: '0xd802…3f1c',
    target: 'Gatekeeper X',
    result: 'SUCCESS',
    severity: '10/10',
    poolDelta: 'CLAIMED 412 MON',
  },
]

const ROTATE_INTERVAL_MS = 4_000

export function LiveActivityTicker() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex(prev => (prev + 1) % DUMMY_EVENTS.length)
    }, ROTATE_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  const event = DUMMY_EVENTS[index]

  return (
    <p className="font-body flex items-center justify-center gap-2 text-[11px] font-medium tracking-normal text-[var(--color-text-muted)] sm:text-xs">
      <span className="relative flex size-1.5 shrink-0">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
      </span>
      <span className="min-w-0 truncate">
        <span className="font-mono text-[0.9em]">{event.attacker}</span> attacked {event.target} —{' '}
        <span className={event.result === 'SUCCESS' ? 'text-emerald-400' : 'text-red-400'}>
          {event.result}
        </span>{' '}
        · severity {event.severity} · pool {event.poolDelta}
      </span>
    </p>
  )
}
