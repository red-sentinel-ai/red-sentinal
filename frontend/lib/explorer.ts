import { APP_NETWORK, EXPLORER_BASE_URL, SUIVISION_TXBLOCK_URL } from '@/constants'
import { isEvmChain, type SupportedChain } from '@/constants/chains'
import { BNB_CONFIG, BOT_CHAIN_CONFIG, ARB_CONFIG } from '@/constants/evm'

const SOLANA_EXPLORER = 'https://explorer.solana.com'
const SOLANA_CLUSTER_SUFFIX = APP_NETWORK === 'mainnet' ? '' : '?cluster=devnet'

function evmExplorer(chain: SupportedChain): string {
  if (chain === 'bot') return BOT_CHAIN_CONFIG.explorerUrl
  if (chain === 'arb') return ARB_CONFIG.explorerUrl
  return BNB_CONFIG.explorerUrl
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
