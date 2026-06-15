// Shared constants extracted to break circular dependency between index.ts and solana.ts.
// Both files import from here instead of from each other.

export type SupportedToken = {
  symbol: string
  name: string
  coinType: string
  decimals: number
  icon: string
  minimumAmount: number
}

export const APP_NETWORK: 'mainnet' | 'testnet' =
  process.env.NEXT_PUBLIC_APP_NETWORK === 'testnet' ? 'testnet' : 'mainnet'

// Arbitrum-only mode (e.g. for a chain-specific submission/deployment). When set,
// the app locks to Arbitrum: the chain switcher is hidden, the active chain is
// forced to 'arb', and only Arbitrum sentinels are shown/launchable. Off by
// default, leaving the full multi-chain experience intact.
export const ARBITRUM_ONLY: boolean =
  process.env.NEXT_PUBLIC_ARBITRUM_ONLY === 'true'
