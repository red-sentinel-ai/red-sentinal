import { APP_ENVIRONMENT, APP_NETWORK } from './shared'
import { isEvmChain, isSolanaChain, toEvmChainKey, type SupportedChain } from './chains'
import { EVM_TEE_NETWORK, getEvmConfigForChainKey, resolveEvmTeeNetwork } from './evm'
import { SOLANA_TEE_NETWORK } from './solana'

export const UNIFIED_TEE_API_PATH = 'https://tee-evm.redsentinel.xyz'

export const SUI_TEE_NETWORK = APP_NETWORK === 'mainnet' ? 'sui-mainnet' : 'sui-testnet'

export type TeeEndpoint = { baseUrl: string; network: string }

export function resolveTeeEndpoint(
  chain: SupportedChain,
  chainId?: number
): TeeEndpoint {
  if (isEvmChain(chain)) {
    const evmChainKey = toEvmChainKey(chain)
    const network = chainId
      ? resolveEvmTeeNetwork(chainId)
      : (evmChainKey && getEvmConfigForChainKey(evmChainKey).teeNetwork) || EVM_TEE_NETWORK
    return { baseUrl: UNIFIED_TEE_API_PATH, network }
  }
  if (isSolanaChain(chain)) {
    return { baseUrl: UNIFIED_TEE_API_PATH, network: SOLANA_TEE_NETWORK }
  }
  return { baseUrl: UNIFIED_TEE_API_PATH, network: SUI_TEE_NETWORK }
}

export function buildTeeUrl(
  chain: SupportedChain,
  action: string,
  chainId?: number
): string {
  const { baseUrl, network } = resolveTeeEndpoint(chain, chainId)
  return `${baseUrl}/${APP_ENVIRONMENT}/${network}/${action}`
}
