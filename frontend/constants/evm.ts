import { APP_NETWORK } from '@/constants/shared'
import type { SupportedToken } from '@/constants/shared'

export const EVM_TEE_API_PATH = 'https://tee-evm.suisentinel.xyz'
export const EVM_TEE_NETWORK = APP_NETWORK === 'testnet' ? 'bsc-testnet' : 'bsc-mainnet'

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
  // Testnet USDC (Aave mock 0x64544...) has 6 decimals; BSC mainnet Binance-Peg USDC has 18.
  decimals: APP_NETWORK === 'testnet' ? 6 : 18,
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
  contractAddress: '0x2346caecCcE1dFbca22fD8974Af77CFA42F7238D' as `0x${string}`,
  explorerUrl: 'https://testnet.bscscan.com',
}

export const BNB_MAINNET_CONFIG = {
  chainId: 56,
  rpcUrl: process.env.NEXT_PUBLIC_BNB_MAINNET_RPC_URL ?? 'https://bsc-dataseed.binance.org/',
  contractAddress: '0xAE3B5C52Aee124F0C9466B8d57f1eED17ccebF6d' as `0x${string}`,
  explorerUrl: 'https://bscscan.com',
}

export const BNB_CONFIG = APP_NETWORK === 'testnet' ? BNB_TESTNET_CONFIG : BNB_MAINNET_CONFIG

export const EVM_SUPPORTED_TOKENS: SupportedToken[] = [USDC_TOKEN]
