'use client'

interface AttackTopbarSlotProps {
  agentName: string
}

export const AttackTopbarSlot = ({ agentName }: AttackTopbarSlotProps) => (
  <h1 className="industrial-header min-w-[3rem] flex-1 truncate text-[11px] tracking-widest text-white">
    {agentName.toUpperCase().replace(/\s+/g, '_')}
  </h1>
)
