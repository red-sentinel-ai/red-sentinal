import { ARBITRUM_ONLY } from '@/constants/shared'

// Every chain the codebase knows about — drives the SupportedChain type.
export const ALL_CHAINS = ['sui', 'solana', 'bnb', 'bot', 'arb'] as const
export type SupportedChain = (typeof ALL_CHAINS)[number]

// Chains actually shown/selectable in the UI. Arbitrum-only mode locks this to
// just Arbitrum (for a chain-specific deployment); otherwise the full set.
// Note: 'arb' is intentionally absent from the default list — it's surfaced only
// when ARBITRUM_ONLY is enabled.
export const SUPPORTED_CHAINS: readonly SupportedChain[] = ARBITRUM_ONLY
  ? ['arb']
  : ['sui', 'solana', 'bnb', 'bot']

export const EVM_CHAINS: SupportedChain[] = ['bnb', 'bot', 'arb']

export function isEvmChain(chain: SupportedChain | undefined): boolean {
  return chain === 'bnb' || chain === 'bot' || chain === 'arb'
}

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
  bot: {
    id: 'bot' as const,
    name: 'BOT Chain',
    icon: '/icons/tokens/bot.png',
    logo: '/chain-logos/bot.png',
    active: true,
    nativeToken: 'BOT',
    rounded: true,
    iconFilterClass: '',
  },
  arb: {
    id: 'arb' as const,
    name: 'Arbitrum',
    icon: '/chain-logos/arb.svg',
    logo: '/chain-logos/arb.svg',
    active: true,
    nativeToken: 'ETH',
    rounded: true,
    iconFilterClass: '',
  },
} satisfies Record<SupportedChain, ChainConfig>

/**
 * The wagmi chainId that corresponds to a given SupportedChain on the current
 * APP_NETWORK. Returns null for non-EVM chains.
 */
export function getEvmChainIdForActive(
  active: SupportedChain | undefined,
  appNetwork: 'testnet' | 'mainnet'
): number | null {
  if (active === 'bnb') return appNetwork === 'testnet' ? 97 : 56
  if (active === 'bot') return appNetwork === 'testnet' ? 968 : 677
  if (active === 'arb') return appNetwork === 'testnet' ? 421614 : 42161
  return null
}
