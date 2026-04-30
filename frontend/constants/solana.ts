import { clusterApiUrl } from '@solana/web3.js'
import { APP_NETWORK, type SupportedToken } from './shared'

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

export const NATIVE_SOL_MINT = 'So11111111111111111111111111111111111111112'

// Solana tokens reuse the shared SupportedToken type from constants/index.ts.
// On Solana, `coinType` holds the SPL mint address (e.g. the native SOL wrapped mint).
// On Sui, `coinType` holds the Move type string (e.g. "0x2::sui::SUI").
// This lets us reuse TokenSelectDropdown, TokenAmount, and all token-related components
// across chains without duplication.

export const SOL_TOKEN: SupportedToken = {
  symbol: 'SOL',
  name: 'Solana',
  coinType: NATIVE_SOL_MINT,
  decimals: 9,
  icon: '/icons/tokens/sol.png',
  minimumAmount: 0.001,
}

export const SOLANA_DEVNET_SUPPORTED_TOKENS: SupportedToken[] = [SOL_TOKEN]

export const SOLANA_MAINNET_SUPPORTED_TOKENS: SupportedToken[] = [
  { ...SOL_TOKEN, minimumAmount: 0.001 },
]

export const SOLANA_SUPPORTED_TOKENS: SupportedToken[] =
  APP_NETWORK === 'mainnet' ? SOLANA_MAINNET_SUPPORTED_TOKENS : SOLANA_DEVNET_SUPPORTED_TOKENS

export const SOLANA_TEE_API_PATH = 'https://tee-solana.suisentinel.xyz'

export const SOLANA_TEE_NETWORK = APP_NETWORK === 'mainnet' ? 'mainnet' : 'devnet'

const SOLANA_DEVNET_CONFIG = {
  PROGRAM_ID: 'Di4JaK3QBbA869f6UNGYMef5RFcxxXyxTMiBymnMb5Gz',
}

const SOLANA_MAINNET_CONFIG = {
  PROGRAM_ID: 'Di4JaK3QBbA869f6UNGYMef5RFcxxXyxTMiBymnMb5Gz',
}

export const SOLANA_CONFIG =
  APP_NETWORK === 'mainnet' ? SOLANA_MAINNET_CONFIG : SOLANA_DEVNET_CONFIG

