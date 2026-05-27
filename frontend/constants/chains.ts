export const SUPPORTED_CHAINS = ['sui', 'solana', 'bnb'] as const
export type SupportedChain = (typeof SUPPORTED_CHAINS)[number]

export const ACTIVE_CHAIN_STORAGE_KEY = 'ss-active-chain'

export type ChainConfig = {
  id: SupportedChain
  name: string
  icon: string
  logo: string
  nativeToken: string
  active: boolean
  rounded?: boolean
  iconFilterClass: string
}

export const CHAINS = {
  sui: {
    id: 'sui' as const,
    name: 'Sui',
    icon: '/icons/tokens/sui.png',
    logo: '/chain-logos/sui.png',
    active: true,
    nativeToken: 'SUI',
    rounded: false,
    iconFilterClass: 'brightness-200',
  },
  solana: {
    id: 'solana' as const,
    name: 'Solana',
    icon: '/icons/tokens/sol.png',
    logo: '/chain-logos/sol.webp',
    active: true,
    nativeToken: 'SOL',
    rounded: false,
    iconFilterClass: 'brightness-200',
  },
  bnb: {
    id: 'bnb' as const,
    name: 'BNB Chain',
    icon: '/icons/tokens/bnb.png',
    logo: '/chain-logos/bnb.png',
    active: true,
    nativeToken: 'BNB',
    rounded: true,
    iconFilterClass: '',
  },
} satisfies Record<SupportedChain, ChainConfig>
