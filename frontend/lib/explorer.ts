import { APP_NETWORK, EXPLORER_BASE_URL, SUIVISION_TXBLOCK_URL } from '@/constants'

type Chain = 'sui' | 'solana'

const SOLANA_EXPLORER = 'https://explorer.solana.com'
const SOLANA_CLUSTER_SUFFIX = APP_NETWORK === 'mainnet' ? '' : '?cluster=devnet'

export function getExplorerTxUrl(txHash: string, chain: Chain = 'sui'): string {
  if (chain === 'solana') {
    return `${SOLANA_EXPLORER}/tx/${txHash}${SOLANA_CLUSTER_SUFFIX}`
  }
  return `${SUIVISION_TXBLOCK_URL}${txHash}`
}

export function getExplorerAddressUrl(address: string, chain: Chain = 'sui'): string {
  if (chain === 'solana') {
    return `${SOLANA_EXPLORER}/address/${address}${SOLANA_CLUSTER_SUFFIX}`
  }
  return `${EXPLORER_BASE_URL}/address/${address}`
}

export function getExplorerObjectUrl(objectId: string, chain: Chain = 'sui'): string {
  if (chain === 'solana') {
    return `${SOLANA_EXPLORER}/address/${objectId}${SOLANA_CLUSTER_SUFFIX}`
  }
  return `${EXPLORER_BASE_URL}/object/${objectId}`
}
