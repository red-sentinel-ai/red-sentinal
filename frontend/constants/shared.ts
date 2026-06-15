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
