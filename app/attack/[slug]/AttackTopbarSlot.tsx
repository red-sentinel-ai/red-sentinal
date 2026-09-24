'use client'

import { ChallengeModeToggle, type ChallengeMode } from '@/components/agents/ChallengeModeToggle'

interface AttackTopbarSlotProps {
  agentName: string
  challengeMode: ChallengeMode
  onChangeChallengeMode: (mode: ChallengeMode) => void
}

export const AttackTopbarSlot = ({
  agentName,
  challengeMode,
  onChangeChallengeMode,
}: AttackTopbarSlotProps) => (
  <>
    <h1 className="industrial-header min-w-[3rem] flex-1 truncate text-[11px] tracking-widest text-white">
      {agentName.toUpperCase().replace(/\s+/g, '_')}
    </h1>
    <ChallengeModeToggle mode={challengeMode} onChange={onChangeChallengeMode} compact />
  </>
)
