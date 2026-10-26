import { APP_NETWORK, EXPLORER_BASE_URL, SUIVISION_TXBLOCK_URL } from '@/constants'
import { isEvmChain, toEvmChainKey, type SupportedChain } from '@/constants/chains'
import { STELLAR_CONFIG } from '@/constants/stellar'
import { BNB_CONFIG, getEvmConfigForChainKey } from '@/constants/evm'

const SOLANA_EXPLORER = 'https://explorer.solana.com'
const SOLANA_CLUSTER_SUFFIX = APP_NETWORK === 'mainnet' ? '' : '?cluster=devnet'

const WALRUS_AGGREGATOR_URL =
  process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL ||
  'https://aggregator.walrus-mainnet.walrus.space'

/** Public URL for reading a stored attack record blob back from Walrus. */
export function getWalrusBlobUrl(blobId: string): string {
  return `${WALRUS_AGGREGATOR_URL}/v1/blobs/${blobId}`
}

function evmExplorer(chain: SupportedChain): string {
  const evmChainKey = toEvmChainKey(chain)
  return evmChainKey ? getEvmConfigForChainKey(evmChainKey).explorerUrl : BNB_CONFIG.explorerUrl
}

export function getExplorerTxUrl(txHash: string, chain: SupportedChain = 'sui'): string {
  if (chain === 'solana') return `${SOLANA_EXPLORER}/tx/${txHash}${SOLANA_CLUSTER_SUFFIX}`
  if (chain === 'stellar') return `${STELLAR_CONFIG.EXPLORER_URL}/tx/${txHash}`
  if (isEvmChain(chain)) return `${evmExplorer(chain)}/tx/${txHash}`
  return `${SUIVISION_TXBLOCK_URL}${txHash}`
}

export function getExplorerAddressUrl(address: string, chain: SupportedChain = 'sui'): string {
  if (chain === 'solana') return `${SOLANA_EXPLORER}/address/${address}${SOLANA_CLUSTER_SUFFIX}`
  if (chain === 'stellar') return `${STELLAR_CONFIG.EXPLORER_URL}/account/${address}`
  if (isEvmChain(chain)) return `${evmExplorer(chain)}/address/${address}`
  return `${EXPLORER_BASE_URL}/address/${address}`
}

export function getExplorerObjectUrl(objectId: string, chain: SupportedChain = 'sui'): string {
  if (chain === 'solana') return `${SOLANA_EXPLORER}/address/${objectId}${SOLANA_CLUSTER_SUFFIX}`
  if (chain === 'stellar') return `${STELLAR_CONFIG.EXPLORER_URL}/tx/${objectId}`
  if (isEvmChain(chain)) return `${evmExplorer(chain)}/address/${objectId}`
  return `${EXPLORER_BASE_URL}/object/${objectId}`
}
