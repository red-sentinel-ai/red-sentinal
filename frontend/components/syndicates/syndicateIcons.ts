import { Shield, Hexagon, EyeOff, Server, Zap } from 'lucide-react'
import type React from 'react'

export type SyndicateIconKey = 'shield' | 'hexagon' | 'eyeOff' | 'server' | 'zap'

export const ICON_KEYS: SyndicateIconKey[] = ['shield', 'hexagon', 'eyeOff', 'server', 'zap']

export const ICON_MAP: Record<SyndicateIconKey, React.ElementType> = {
  shield: Shield,
  hexagon: Hexagon,
  eyeOff: EyeOff,
  server: Server,
  zap: Zap,
}

/** Deterministically pick an icon from the first byte of the contract address */
export function iconForAddress(address: string): SyndicateIconKey {
  const byte = parseInt(address.slice(2, 4), 16)
  return ICON_KEYS[byte % ICON_KEYS.length]
}
