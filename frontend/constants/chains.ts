export const SUPPORTED_CHAINS = ['sui', 'solana', 'bnb', 'bot'] as const
export type SupportedChain = (typeof SUPPORTED_CHAINS)[number]

export const EVM_CHAINS: SupportedChain[] = ['bnb', 'bot']

export function isEvmChain(chain: SupportedChain | undefined): boolean {
  return chain === 'bnb' || chain === 'bot'
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
  return null
}
