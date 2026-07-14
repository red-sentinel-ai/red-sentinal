import { clusterApiUrl } from '@solana/web3.js'
import { APP_NETWORK } from './shared'

export const SOLANA_CLUSTER = APP_NETWORK === 'mainnet' ? 'mainnet-beta' : 'devnet'

export const SOLANA_RPC_URL =
  APP_NETWORK === 'mainnet'
    ? (process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? clusterApiUrl(SOLANA_CLUSTER))
    : clusterApiUrl(SOLANA_CLUSTER)

export const SOLANA_SUPPORTED_WALLETS = [
  'Phantom',
  'Solflare',
  'Coinbase Wallet',
  'Trust',
  'Torus',
] as const

export type SolanaSupportedWallet = (typeof SOLANA_SUPPORTED_WALLETS)[number]

export const NATIVE_SOL_MINT = 'So11111111111111111111111111111111111111112'


export const SOLANA_TEE_NETWORK = APP_NETWORK === 'mainnet' ? 'solana-mainnet' : 'solana-devnet'

const SOLANA_DEVNET_CONFIG = {
  PROGRAM_ID: 'Di4JaK3QBbA869f6UNGYMef5RFcxxXyxTMiBymnMb5Gz',
}

const SOLANA_MAINNET_CONFIG = {
  PROGRAM_ID: 'Di4JaK3QBbA869f6UNGYMef5RFcxxXyxTMiBymnMb5Gz',
}

export const SOLANA_CONFIG =
  APP_NETWORK === 'mainnet' ? SOLANA_MAINNET_CONFIG : SOLANA_DEVNET_CONFIG
