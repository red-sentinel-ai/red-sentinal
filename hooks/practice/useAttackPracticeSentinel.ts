import { useMutation } from '@tanstack/react-query'

import type { PracticeAttackResponse, SentinelInteractionMode } from '@/types/practice'

interface AttackArgs {
  sentinelId: number | string
  attackerAddress: string
  userPrompt: string
  sessionId?: string | null
  network?: string
  mode?: SentinelInteractionMode
  /** 'user_signed' → the frontend drives the Walrus record flow after the attack. */
  walrusRecordMode?: 'backend' | 'user_signed'
}

export function useAttackPracticeSentinel() {
  return useMutation<PracticeAttackResponse, Error, AttackArgs>({
    mutationFn: async ({
      sentinelId,
      attackerAddress,
      userPrompt,
      sessionId,
      network,
      mode,
      walrusRecordMode,
    }) => {
      const res = await fetch(`/api/practice-sentinels/${sentinelId}/attack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attacker_address: attackerAddress,
          user_prompt: userPrompt,
          session_id: sessionId ?? undefined,
          network,
          mode,
          walrus_record_mode: walrusRecordMode,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Attack failed')
      }

      return res.json()
    },
  })
}
