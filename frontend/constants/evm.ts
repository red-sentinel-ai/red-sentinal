import { APP_NETWORK } from './shared'
import type { SupportedToken } from './shared'
import { getEvmChainKey, type EvmChainKey } from './chains'
import { getSupportedTokens } from './tokens'

export const EVM_TEE_API_PATH = 'https://tee-evm.suisentinel.xyz'
// Kept for backwards compatibility with hooks that haven't been migrated to
// resolveEvmTeeNetwork(chainId) yet. Defaults to the BSC network for the
// current APP_NETWORK.
export const EVM_TEE_NETWORK = APP_NETWORK === 'testnet' ? 'bsc-testnet' : 'bsc-mainnet'

export function resolveEvmTeeNetwork(chainId: number | undefined): string {
  switch (chainId) {
    case 968:
      return 'bot-testnet'
    case 677:
      return 'bot-mainnet'
    case 421614:
    case 42161:
      // The EVM TEE + red-team API namespace Arbitrum under 'arbitrum-sepolia'.
      return 'arbitrum-sepolia'
    case 56:
      return 'bsc-mainnet'
    case 97:
    default:
      return 'bsc-testnet'
  }
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

// ─── BOT Chain ───────────────────────────────────────────────────────────────

export const BOT_CHAIN_TESTNET_CONFIG = {
  chainId: 968,
  rpcUrl: process.env.NEXT_PUBLIC_BOT_TESTNET_RPC_URL ?? 'https://rpc.bohr.life',
  contractAddress: '0x5edD3650E090192f0f54EddC870B25536F5CaB29' as `0x${string}`,
  explorerUrl: 'https://scan.bohr.life',
}

export const BOT_CHAIN_MAINNET_CONFIG = {
  chainId: 677,
  rpcUrl: process.env.NEXT_PUBLIC_BOT_MAINNET_RPC_URL ?? 'https://rpc.botchain.ai',
  contractAddress: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  explorerUrl: 'https://scan.botchain.ai',
}

export const BOT_CHAIN_CONFIG = APP_NETWORK === 'testnet' ? BOT_CHAIN_TESTNET_CONFIG : BOT_CHAIN_MAINNET_CONFIG

// ─── Arbitrum ────────────────────────────────────────────────────────────────
// Testnet = Arbitrum Sepolia (chainId 421614). Native gas token is ETH.

export const ARB_TESTNET_CONFIG = {
  chainId: 421614,
  rpcUrl: process.env.NEXT_PUBLIC_ARB_TESTNET_RPC_URL ?? 'https://sepolia-rollup.arbitrum.io/rpc',
  contractAddress: (process.env.NEXT_PUBLIC_ARB_TESTNET_CONTRACT_ADDRESS ??
    '0x68D60E86Ae1DA4c26cc3B1EA680745500451fD2c') as `0x${string}`,
  explorerUrl: 'https://sepolia.arbiscan.io',
}

export const ARB_MAINNET_CONFIG = {
  chainId: 42161,
  rpcUrl: process.env.NEXT_PUBLIC_ARB_MAINNET_RPC_URL ?? 'https://arb1.arbitrum.io/rpc',
  contractAddress: (process.env.NEXT_PUBLIC_ARB_MAINNET_CONTRACT_ADDRESS ??
    '0x0000000000000000000000000000000000000000') as `0x${string}`,
  explorerUrl: 'https://arbiscan.io',
}

export const ARB_CONFIG = APP_NETWORK === 'testnet' ? ARB_TESTNET_CONFIG : ARB_MAINNET_CONFIG

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
    case 421614:
      return ARB_TESTNET_CONFIG
    case 42161:
      return ARB_MAINNET_CONFIG
    case 56:
      return BNB_MAINNET_CONFIG
    case 97:
      return BNB_TESTNET_CONFIG
    default:
      return BNB_CONFIG
  }
}

export function getEvmSupportedTokens(chainId: number | undefined): SupportedToken[] {
  const key = getEvmChainKey(chainId) ?? 'bnb'
  return getSupportedTokens(key)
}
