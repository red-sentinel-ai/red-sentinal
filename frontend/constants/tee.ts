import { APP_ENVIRONMENT, APP_NETWORK } from './shared'
import { isEvmChain, isSolanaChain, type SupportedChain } from './chains'
import { EVM_TEE_NETWORK, resolveEvmTeeNetwork } from './evm'
import { SOLANA_TEE_NETWORK } from './solana'

export const UNIFIED_TEE_API_PATH = 'https://tee-evm.redsentinel.xyz'
export const SUI_TEE_API_PATH = 'https://tee.redsentinel.xyz'

export type TeeEndpoint = { baseUrl: string; network: string }

export function resolveTeeEndpoint(
  chain: SupportedChain,
  chainId?: number
): TeeEndpoint {
  if (isEvmChain(chain)) {
    return {
      baseUrl: UNIFIED_TEE_API_PATH,
      network: chainId ? resolveEvmTeeNetwork(chainId) : EVM_TEE_NETWORK
    }
  }
  if (isSolanaChain(chain)) {
    return { baseUrl: UNIFIED_TEE_API_PATH, network: SOLANA_TEE_NETWORK }
  }
  return { baseUrl: SUI_TEE_API_PATH, network: APP_NETWORK }
}

export function buildTeeUrl(
  chain: SupportedChain,
  action: string,
  chainId?: number
): string {
  const { baseUrl, network } = resolveTeeEndpoint(chain, chainId)
  return `${baseUrl}/${APP_ENVIRONMENT}/${network}/${action}`
}
