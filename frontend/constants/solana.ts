import { clusterApiUrl } from '@solana/web3.js'
import { APP_NETWORK } from '@/constants'

export const SOLANA_CLUSTER = APP_NETWORK === 'mainnet' ? 'mainnet-beta' : 'devnet'

export const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? clusterApiUrl(SOLANA_CLUSTER)

export const SOLANA_SUPPORTED_WALLETS = [
  'Phantom',
  'Solflare',
  'Coinbase Wallet',
  'Trust',
  'Torus',
] as const

export type SolanaSupportedWallet = (typeof SOLANA_SUPPORTED_WALLETS)[number]

export const SOL_TOKEN = {
  symbol: 'SOL',
  name: 'Solana',
  decimals: 9,
  icon: '/icons/tokens/sol.png',
} as const
