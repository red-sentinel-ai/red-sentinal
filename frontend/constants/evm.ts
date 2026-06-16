import { APP_NETWORK } from '@/constants/shared'
import type { SupportedToken } from '@/constants/shared'

export const EVM_TEE_API_PATH = 'https://tee-evm.redsentinel.xyz'
// Kept for backwards compatibility with hooks that haven't been migrated to
// resolveEvmTeeNetwork(chainId) yet. Defaults to the BSC network for the
// current APP_NETWORK.
export const EVM_TEE_NETWORK = APP_NETWORK === 'testnet' ? 'bsc-testnet' : 'bsc-mainnet'

export type EvmChainKey = 'bnb' | 'bot'

export function getEvmChainKey(chainId: number | undefined): EvmChainKey {
  switch (chainId) {
    case 968:
    case 677:
      return 'bot'
    case 97:
    case 56:
    default:
      return 'bnb'
  }
}

export function resolveEvmTeeNetwork(chainId: number | undefined): string {
  switch (chainId) {
    case 968:
      return 'bot-testnet'
    case 677:
      return 'bot-mainnet'
    case 56:
      return 'bsc-mainnet'
    case 97:
    default:
      return 'bsc-testnet'
  }
}

export const WBNB_TESTNET_ADDRESS = '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd' as `0x${string}`
export const WBNB_MAINNET_ADDRESS = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' as `0x${string}`

export const WBNB_TOKEN: SupportedToken = {
  symbol: 'WBNB',
  name: 'Wrapped BNB',
  coinType: APP_NETWORK === 'testnet' ? WBNB_TESTNET_ADDRESS : WBNB_MAINNET_ADDRESS,
  decimals: 18,
  icon: '/icons/tokens/bnb.png',
  minimumAmount: 0.01,
}

export const USDC_TESTNET_ADDRESS = '0x64544969ed7EBf5f083679233325356EbE738930' as `0x${string}`
export const USDC_MAINNET_ADDRESS = '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d' as `0x${string}`

export const USDC_TOKEN: SupportedToken = {
  symbol: 'USDC',
  name: 'USD Coin',
  coinType: APP_NETWORK === 'testnet' ? USDC_TESTNET_ADDRESS : USDC_MAINNET_ADDRESS,
  decimals: 18,
  icon: '/icons/tokens/usdc.png',
  minimumAmount: 0.01,
}

export const BNB_TOKEN: SupportedToken = {
  symbol: 'BNB',
  name: 'BNB',
  coinType: '0x0000000000000000000000000000000000000000',
  decimals: 18,
  icon: '/icons/tokens/bnb.png',
  minimumAmount: 0,
}

export const BNB_TESTNET_CONFIG = {
  chainId: 97,
  rpcUrl: process.env.NEXT_PUBLIC_BNB_TESTNET_RPC_URL ?? 'https://data-seed-prebsc-1-s1.bnbchain.org:8545',
  contractAddress: '0x41730fab3F81Dd50Fbab78150C52Cc5fFFCEeB42' as `0x${string}`,
  explorerUrl: 'https://testnet.bscscan.com',
}

export const BNB_MAINNET_CONFIG = {
  chainId: 56,
  rpcUrl: process.env.NEXT_PUBLIC_BNB_MAINNET_RPC_URL ?? 'https://bsc-dataseed.binance.org/',
  contractAddress: '0x41730fab3F81Dd50Fbab78150C52Cc5fFFCEeB42' as `0x${string}`,
  explorerUrl: 'https://bscscan.com',
}

export const BNB_CONFIG = APP_NETWORK === 'testnet' ? BNB_TESTNET_CONFIG : BNB_MAINNET_CONFIG

export const EVM_SUPPORTED_TOKENS: SupportedToken[] = [USDC_TOKEN]

// ─── BOT Chain ───────────────────────────────────────────────────────────────

export const BOT_TOKEN: SupportedToken = {
  symbol: 'BOT',
  name: 'BOT',
  coinType: '0x0000000000000000000000000000000000000000',
  decimals: 18,
  icon: '/icons/tokens/bot.png',
  minimumAmount: 0,
}

export const BOT_CHAIN_USDC_ADDRESS = '0xAA3091862373B4ae9cd25FfC94DeFA4bbC5f59a6' as `0x${string}`

export const BOT_CHAIN_USDC_TOKEN: SupportedToken = {
  symbol: 'USDC',
  name: 'USD Coin',
  coinType: BOT_CHAIN_USDC_ADDRESS,
  decimals: 6,
  icon: '/icons/tokens/usdc.png',
  minimumAmount: 0.01,
}

export const BOT_CHAIN_TESTNET_CONFIG = {
  chainId: 968,
  rpcUrl: process.env.NEXT_PUBLIC_BOT_TESTNET_RPC_URL ?? 'https://rpc.bohr.life',
  contractAddress: '0x5edD3650E090192f0f54EDdC870B25536F5CaB29' as `0x${string}`,
  explorerUrl: 'https://scan.bohr.life',
}

export const BOT_CHAIN_MAINNET_CONFIG = {
  chainId: 677,
  rpcUrl: process.env.NEXT_PUBLIC_BOT_MAINNET_RPC_URL ?? 'https://rpc.botchain.ai',
  contractAddress: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  explorerUrl: 'https://scan.botchain.ai',
}

export const BOT_CHAIN_CONFIG = APP_NETWORK === 'testnet' ? BOT_CHAIN_TESTNET_CONFIG : BOT_CHAIN_MAINNET_CONFIG

export const BOT_CHAIN_SUPPORTED_TOKENS: SupportedToken[] = [BOT_CHAIN_USDC_TOKEN]

// ─── Chain-aware resolver ────────────────────────────────────────────────────

export type EvmConfig = typeof BNB_TESTNET_CONFIG

/**
 * Returns the EVM contract / RPC / explorer config for the connected chainId.
 * Falls back to BNB_CONFIG when the chainId is unknown so callers that haven't
 * been migrated yet keep working.
 */
export function getEvmConfig(chainId: number | undefined): EvmConfig {
  switch (chainId) {
    case 968:
      return BOT_CHAIN_TESTNET_CONFIG
    case 677:
      return BOT_CHAIN_MAINNET_CONFIG
    case 56:
      return BNB_MAINNET_CONFIG
    case 97:
      return BNB_TESTNET_CONFIG
    default:
      return BNB_CONFIG
  }
}

export function getEvmSupportedTokens(chainId: number | undefined): SupportedToken[] {
  return getEvmChainKey(chainId) === 'bot' ? BOT_CHAIN_SUPPORTED_TOKENS : EVM_SUPPORTED_TOKENS
}

export function getEvmNativeSymbol(chainId: number | undefined): string {
  return getEvmChainKey(chainId) === 'bot' ? 'BOT' : 'BNB'
}
