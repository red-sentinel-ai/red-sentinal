import { clusterApiUrl } from '@solana/web3.js'
import { APP_NETWORK, type SupportedToken } from '@/constants'

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
  minimumAmount: 0.5,
}

export const SOLANA_DEVNET_SUPPORTED_TOKENS: SupportedToken[] = [SOL_TOKEN]

export const SOLANA_MAINNET_SUPPORTED_TOKENS: SupportedToken[] = [
  { ...SOL_TOKEN, minimumAmount: 1 },
]

export const SOLANA_SUPPORTED_TOKENS: SupportedToken[] =
  APP_NETWORK === 'mainnet' ? SOLANA_MAINNET_SUPPORTED_TOKENS : SOLANA_DEVNET_SUPPORTED_TOKENS

export const SOLANA_TEE_API_PATH = 'https://tee-solana.suisentinel.xyz'

export const SOLANA_TEE_NETWORK = APP_NETWORK === 'mainnet' ? 'mainnet' : 'devnet'

const SOLANA_DEVNET_CONFIG = {
  PROGRAM_ID: '761bJeLrxbVJmq3GU6yoJXc8N5rjFqbvRUL53b5dVczj',
}

const SOLANA_MAINNET_CONFIG = {
  PROGRAM_ID: '',
}

export const SOLANA_CONFIG =
  APP_NETWORK === 'mainnet' ? SOLANA_MAINNET_CONFIG : SOLANA_DEVNET_CONFIG

export const SOLANA_EXPLORER_BASE_URL =
  APP_NETWORK === 'mainnet'
    ? 'https://explorer.solana.com'
    : 'https://explorer.solana.com/?cluster=devnet'

export const SOLANA_EXPLORER_TX_URL =
  APP_NETWORK === 'mainnet'
    ? 'https://explorer.solana.com/tx/'
    : 'https://explorer.solana.com/tx/'

export const SOLANA_EXPLORER_TX_SUFFIX = APP_NETWORK === 'mainnet' ? '' : '?cluster=devnet'
