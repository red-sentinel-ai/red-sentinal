import { APP_NETWORK } from './shared'
import type { SupportedToken } from './shared'
import type { EvmChainKey } from './chains'
import { getSupportedTokens } from './tokens'

// Fallback red-team/TEE network when no chainId is available (e.g. register
// before a wallet chain is known). Prefer resolveEvmTeeNetwork(chainId).
// The unified TEE base URL lives in constants/tee.ts (UNIFIED_TEE_API_PATH).
export const EVM_TEE_NETWORK = APP_NETWORK === 'testnet' ? 'bsc-testnet' : 'bsc-mainnet'

export const BNB_TESTNET_CONFIG = {
  chainId: 97,
  rpcUrl:
    process.env.NEXT_PUBLIC_BNB_TESTNET_RPC_URL ??
    'https://data-seed-prebsc-1-s1.bnbchain.org:8545',
  contractAddress: '0x41730fab3F81Dd50Fbab78150C52Cc5fFFCEeB42' as `0x${string}`,
  explorerUrl: 'https://testnet.bscscan.com',
  teeNetwork: 'bsc-testnet',
}

export const BNB_MAINNET_CONFIG = {
  chainId: 56,
  rpcUrl: process.env.NEXT_PUBLIC_BNB_MAINNET_RPC_URL ?? 'https://bsc-dataseed.binance.org/',
  contractAddress: '0x41730fab3F81Dd50Fbab78150C52Cc5fFFCEeB42' as `0x${string}`,
  explorerUrl: 'https://bscscan.com',
  teeNetwork: 'bsc-mainnet',
}

export const BNB_CONFIG = APP_NETWORK === 'testnet' ? BNB_TESTNET_CONFIG : BNB_MAINNET_CONFIG

// ─── BOT Chain ───────────────────────────────────────────────────────────────

export const BOT_CHAIN_TESTNET_CONFIG = {
  chainId: 968,
  rpcUrl: process.env.NEXT_PUBLIC_BOT_TESTNET_RPC_URL ?? 'https://rpc.bohr.life',
  contractAddress: '0x7f0e865187B35ade39dA35963CC855460199ED04' as `0x${string}`,
  explorerUrl: 'https://scan.bohr.life',
  teeNetwork: 'bot-testnet',
}

export const BOT_CHAIN_MAINNET_CONFIG = {
  chainId: 677,
  rpcUrl: process.env.NEXT_PUBLIC_BOT_MAINNET_RPC_URL ?? 'https://rpc.botchain.ai',
  contractAddress: '0xAE3B5C52Aee124F0C9466B8d57f1eED17ccebF6d' as `0x${string}`,
  explorerUrl: 'https://scan.botchain.ai',
  teeNetwork: 'bot-mainnet',
}

export const BOT_CHAIN_CONFIG =
  APP_NETWORK === 'testnet' ? BOT_CHAIN_TESTNET_CONFIG : BOT_CHAIN_MAINNET_CONFIG

// ─── Arbitrum ────────────────────────────────────────────────────────────────
// Testnet = Arbitrum Sepolia (chainId 421614). Native gas token is ETH.

export const ARB_TESTNET_CONFIG = {
  chainId: 421614,
  rpcUrl: process.env.NEXT_PUBLIC_ARB_TESTNET_RPC_URL ?? 'https://sepolia-rollup.arbitrum.io/rpc',
  contractAddress: (process.env.NEXT_PUBLIC_ARB_TESTNET_CONTRACT_ADDRESS ??
    '0x68D60E86Ae1DA4c26cc3B1EA680745500451fD2c') as `0x${string}`,
  explorerUrl: 'https://sepolia.arbiscan.io',
  teeNetwork: 'arbitrum-sepolia',
}

export const ARB_MAINNET_CONFIG = {
  chainId: 42161,
  rpcUrl: process.env.NEXT_PUBLIC_ARB_MAINNET_RPC_URL ?? 'https://arb1.arbitrum.io/rpc',
  contractAddress: (process.env.NEXT_PUBLIC_ARB_MAINNET_CONTRACT_ADDRESS ??
    '0x0000000000000000000000000000000000000000') as `0x${string}`,
  explorerUrl: 'https://arbiscan.io',
  teeNetwork: 'arbitrum-sepolia',
}

export const ARB_CONFIG = APP_NETWORK === 'testnet' ? ARB_TESTNET_CONFIG : ARB_MAINNET_CONFIG

export const MONAD_TESTNET_CONFIG = {
  chainId: 10143,
  rpcUrl: process.env.NEXT_PUBLIC_MONAD_TESTNET_RPC_URL ?? 'https://testnet-rpc.monad.xyz',
  contractAddress: (process.env.NEXT_PUBLIC_MONAD_TESTNET_CONTRACT_ADDRESS ??
    '0x014C5D2e41c7898F8C8734331F873f807b6F8B5F') as `0x${string}`,
  explorerUrl: 'https://testnet.monadexplorer.com',
  teeNetwork: 'monad-testnet',
}

export const MONAD_MAINNET_CONFIG = {
  chainId: 143,
  rpcUrl: process.env.NEXT_PUBLIC_MONAD_MAINNET_RPC_URL ?? 'https://rpc.monad.xyz',
  contractAddress: (process.env.NEXT_PUBLIC_MONAD_MAINNET_CONTRACT_ADDRESS ??
    '0x5edD3650E090192f0f54EDdC870B25536F5CaB29') as `0x${string}`,
  explorerUrl: 'https://monadscan.com',
  teeNetwork: 'monad-mainnet',
}

export const MONAD_CONFIG = APP_NETWORK === 'testnet' ? MONAD_TESTNET_CONFIG : MONAD_MAINNET_CONFIG

// ─── Chain-aware resolvers ───────────────────────────────────────────────────

export type EvmConfig = typeof BNB_TESTNET_CONFIG

const EVM_CONFIG_BY_CHAIN_KEY: Record<EvmChainKey, EvmConfig> = {
  bnb: BNB_CONFIG,
  bot: BOT_CHAIN_CONFIG,
  arb: ARB_CONFIG,
  monad: MONAD_CONFIG,
}

const ALL_EVM_CONFIGS: EvmConfig[] = [
  BNB_TESTNET_CONFIG,
  BNB_MAINNET_CONFIG,
  BOT_CHAIN_TESTNET_CONFIG,
  BOT_CHAIN_MAINNET_CONFIG,
  ARB_TESTNET_CONFIG,
  ARB_MAINNET_CONFIG,
  MONAD_TESTNET_CONFIG,
  MONAD_MAINNET_CONFIG,
]

const TEE_NETWORK_BY_CHAIN_ID: Record<number, string> = Object.fromEntries(
  ALL_EVM_CONFIGS.map(config => [config.chainId, config.teeNetwork])
)

export function resolveEvmTeeNetwork(chainId: number | undefined): string {
  return (chainId && TEE_NETWORK_BY_CHAIN_ID[chainId]) || EVM_TEE_NETWORK
}

export function getEvmConfigForChainKey(chainKey: EvmChainKey): EvmConfig {
  return EVM_CONFIG_BY_CHAIN_KEY[chainKey]
}

export function getEvmSupportedTokens(chainKey: EvmChainKey): SupportedToken[] {
  return getSupportedTokens(chainKey)
}
