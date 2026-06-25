import { APP_NETWORK } from './shared'

// Every chain the codebase knows about — drives the SupportedChain type.
export const ALL_CHAINS = ['sui', 'solana', 'bnb', 'bot', 'arb'] as const
export type SupportedChain = (typeof ALL_CHAINS)[number]

export type ChainFamily = 'sui' | 'solana' | 'evm'

// Chains actually shown/selectable in the UI. Arbitrum-only mode locks this to
// just Arbitrum (for a chain-specific deployment); otherwise the full set.
// Note: 'arb' is intentionally absent from the default list — it's surfaced only
// when ARBITRUM_ONLY is enabled.
export const SUPPORTED_CHAINS: readonly SupportedChain[] = ['sui', 'solana', 'bnb', 'bot', 'arb']

export type ChainConfig = {
  id: SupportedChain
  family: ChainFamily
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
    family: 'sui' as const,
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
    family: 'solana' as const,
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
    family: 'evm' as const,
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
    family: 'evm' as const,
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
    family: 'evm' as const,
    name: 'Arbitrum',
    icon: '/chain-logos/arb.svg',
    logo: '/chain-logos/arb.svg',
    active: true,
    nativeToken: 'ETH',
    rounded: true,
    iconFilterClass: '',
  },
} satisfies Record<SupportedChain, ChainConfig>

export const EVM_CHAINS: SupportedChain[] = Object.values(CHAINS)
  .filter(c => c.family === 'evm')
  .map(c => c.id)

export function getChainFamily(chain: SupportedChain | undefined): ChainFamily | undefined {
  return chain ? CHAINS[chain].family : undefined
}

export function isEvmChain(chain: SupportedChain | undefined): boolean {
  return getChainFamily(chain) === 'evm'
}

export function isSolanaChain(chain: SupportedChain | undefined): boolean {
  return getChainFamily(chain) === 'solana'
}

export const ACTIVE_CHAIN_STORAGE_KEY = 'ss-active-chain'

export type EvmChainKey = 'bnb' | 'bot' | 'arb'

// Single source of truth for EVM chain IDs per network.
export const EVM_CHAIN_IDS: Record<'testnet' | 'mainnet', Record<EvmChainKey, number>> = {
  testnet: { bnb: 97, bot: 968, arb: 421614 },
  mainnet: { bnb: 56, bot: 677, arb: 42161 },
}

/**
 * The wagmi chainId that corresponds to a given SupportedChain on the current
 * APP_NETWORK. Returns null for non-EVM chains.
 */
export function getEvmChainIdForActive(
  active: SupportedChain | undefined,
  appNetwork: 'testnet' | 'mainnet'
): number | null {
  if (!active || !isEvmChain(active)) return null
  return EVM_CHAIN_IDS[appNetwork][active as EvmChainKey]
}

/**
 * Maps a wagmi chainId back to our internal EVM chain key for the current
 * APP_NETWORK. Returns null when the chainId is unknown.
 */
export function getEvmChainKey(chainId: number | undefined): EvmChainKey | null {
  if (chainId === undefined) return null
  const map = EVM_CHAIN_IDS[APP_NETWORK]
  return (Object.keys(map) as EvmChainKey[]).find(k => map[k] === chainId) ?? null
}

const EVM_CHAIN_ID_TO_KEY: Record<string, EvmChainKey> = Object.fromEntries(
  (['testnet', 'mainnet'] as const).flatMap(network =>
    (Object.keys(EVM_CHAIN_IDS[network]) as EvmChainKey[]).map(key => [
      String(EVM_CHAIN_IDS[network][key]),
      key,
    ])
  )
)

export type WalletChainDisplay = { name: string; logo: string; rounded: boolean }

const GENERIC_EVM_CHAIN: WalletChainDisplay = {
  name: 'EVM',
  logo: '/chain-logos/eth.webp',
  rounded: false,
}

function toChainDisplay(chain: ChainConfig): WalletChainDisplay {
  return { name: chain.name, logo: chain.logo, rounded: !!chain.rounded }
}

export function resolveWalletChain(
  chainType: ChainFamily,
  chainId?: string | null
): WalletChainDisplay {
  if (chainType === 'sui') return toChainDisplay(CHAINS.sui)
  if (chainType === 'solana') return toChainDisplay(CHAINS.solana)

  const evmKey = chainId ? EVM_CHAIN_ID_TO_KEY[chainId] : undefined
  return evmKey ? toChainDisplay(CHAINS[evmKey]) : GENERIC_EVM_CHAIN
}
