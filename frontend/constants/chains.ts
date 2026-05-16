export const SUPPORTED_CHAINS = ['sui', 'solana', 'bnb'] as const
export type SupportedChain = (typeof SUPPORTED_CHAINS)[number]

export const ACTIVE_CHAIN_STORAGE_KEY = 'ss-active-chain'

export type ChainConfig = {
  id: SupportedChain
  name: string
  icon: string
  nativeToken: string
}

export const CHAINS = {
  sui: {
    id: 'sui' as const,
    name: 'Sui',
    icon: '/icons/tokens/sui.png',
    nativeToken: 'SUI',
  },
  solana: {
    id: 'solana' as const,
    name: 'Solana',
    icon: '/icons/tokens/sol.png',
    nativeToken: 'SOL',
  },
  bnb: {
    id: 'bnb' as const,
    name: 'BNB Chain',
    icon: '/icons/tokens/bnb.png',
    nativeToken: 'BNB',
  },
} satisfies Record<SupportedChain, ChainConfig>
