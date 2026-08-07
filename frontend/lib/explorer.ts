import { APP_NETWORK, EXPLORER_BASE_URL, SUIVISION_TXBLOCK_URL } from '@/constants'
import { isEvmChain, toEvmChainKey, type SupportedChain } from '@/constants/chains'
import { BNB_CONFIG, getEvmConfigForChainKey } from '@/constants/evm'

const SOLANA_EXPLORER = 'https://explorer.solana.com'
const SOLANA_CLUSTER_SUFFIX = APP_NETWORK === 'mainnet' ? '' : '?cluster=devnet'

function evmExplorer(chain: SupportedChain): string {
  const evmChainKey = toEvmChainKey(chain)
  return evmChainKey ? getEvmConfigForChainKey(evmChainKey).explorerUrl : BNB_CONFIG.explorerUrl
}

export function getExplorerTxUrl(txHash: string, chain: SupportedChain = 'sui'): string {
  if (chain === 'solana') return `${SOLANA_EXPLORER}/tx/${txHash}${SOLANA_CLUSTER_SUFFIX}`
  if (isEvmChain(chain)) return `${evmExplorer(chain)}/tx/${txHash}`
  return `${SUIVISION_TXBLOCK_URL}${txHash}`
}

export function getExplorerAddressUrl(address: string, chain: SupportedChain = 'sui'): string {
  if (chain === 'solana') return `${SOLANA_EXPLORER}/address/${address}${SOLANA_CLUSTER_SUFFIX}`
  if (isEvmChain(chain)) return `${evmExplorer(chain)}/address/${address}`
  return `${EXPLORER_BASE_URL}/address/${address}`
}

export function getExplorerObjectUrl(objectId: string, chain: SupportedChain = 'sui'): string {
  if (chain === 'solana') return `${SOLANA_EXPLORER}/address/${objectId}${SOLANA_CLUSTER_SUFFIX}`
  if (isEvmChain(chain)) return `${evmExplorer(chain)}/address/${objectId}`
  return `${EXPLORER_BASE_URL}/object/${objectId}`
}
