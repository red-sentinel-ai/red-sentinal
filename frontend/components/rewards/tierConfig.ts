export type DefenderTier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Legendary'
export type AttackerTier = 'Recruit' | 'Hunter' | 'Specialist' | 'Elite' | 'Apex Predator'

export interface TierStyle {
  bg: string
  text: string
  border: string
  dot: string
  label: string
}

export const DEFENDER_TIER_CONFIG: Record<DefenderTier, TierStyle> = {
  Bronze: {
    bg: 'bg-amber-900/20',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    dot: 'bg-amber-500',
    label: 'Bronze',
  },
  Silver: {
    bg: 'bg-slate-700/30',
    text: 'text-slate-300',
    border: 'border-slate-500/30',
    dot: 'bg-slate-400',
    label: 'Silver',
  },
  Gold: {
    bg: 'bg-yellow-900/20',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
    dot: 'bg-yellow-500',
    label: 'Gold',
  },
  Diamond: {
    bg: 'bg-cyan-900/20',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    dot: 'bg-cyan-500',
    label: 'Diamond',
  },
  Legendary: {
    bg: 'bg-purple-900/20',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    dot: 'bg-purple-500',
    label: 'Legendary',
  },
}

export const ATTACKER_TIER_CONFIG: Record<AttackerTier, TierStyle> = {
  Recruit: {
    bg: 'bg-white/10',
    text: 'text-white/60',
    border: 'border-white/15',
    dot: 'bg-white/40',
    label: 'Recruit',
  },
  Hunter: {
    bg: 'bg-green-900/20',
    text: 'text-green-400',
    border: 'border-green-500/30',
    dot: 'bg-green-500',
    label: 'Hunter',
  },
  Specialist: {
    bg: 'bg-blue-900/20',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    dot: 'bg-blue-500',
    label: 'Specialist',
  },
  Elite: {
    bg: 'bg-orange-900/20',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
    dot: 'bg-orange-500',
    label: 'Elite',
  },
  'Apex Predator': {
    bg: 'bg-red-900/20',
    text: 'text-red-400',
    border: 'border-red-500/30',
    dot: 'bg-red-500',
    label: 'Apex Predator',
  },
}
