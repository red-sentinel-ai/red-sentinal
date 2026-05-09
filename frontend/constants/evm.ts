import { APP_NETWORK } from '@/constants/shared'
import type { SupportedToken } from '@/constants/shared'

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
  // Placeholder — update to the real contract address once deployed on testnet
  contractAddress: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  explorerUrl: 'https://testnet.bscscan.com',
}

export const BNB_MAINNET_CONFIG = {
  chainId: 56,
  rpcUrl: process.env.NEXT_PUBLIC_BNB_MAINNET_RPC_URL ?? 'https://bsc-dataseed.binance.org/',
  // Placeholder — update to the real contract address once deployed on mainnet
  contractAddress: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  explorerUrl: 'https://bscscan.com',
}

export const BNB_CONFIG = APP_NETWORK === 'testnet' ? BNB_TESTNET_CONFIG : BNB_MAINNET_CONFIG

export const EVM_SUPPORTED_TOKENS: SupportedToken[] = [BNB_TOKEN]
