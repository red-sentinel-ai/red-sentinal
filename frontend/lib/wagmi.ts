import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { defineChain } from 'viem'
import { bsc, bscTestnet, arbitrum, arbitrumSepolia } from 'viem/chains'
import { APP_NETWORK } from '@/constants/shared'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

export const botChainTestnet = defineChain({
  id: 968,
  name: 'BOT Chain Testnet',
  nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.bohr.life'] },
  },
  blockExplorers: {
    default: { name: 'BOTScan', url: 'https://scan.bohr.life' },
  },
  testnet: true,
})

export const botChainMainnet = defineChain({
  id: 677,
  name: 'BOT Chain',
  nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://rpc.botchain.ai',
        'https://rpc.kfeeswwz.cn',
        'https://rpc.amdixawp.cn',
        'https://rpc.jnhkpbxr.cn',
        'https://rpc.rpynemmx.cn',
        'https://rpc.kzrmeznc.cn',
      ],
    },
  },
  blockExplorers: {
    default: { name: 'BOTScan', url: 'https://scan.botchain.ai' },
  },
})

// Arbitrum-only deployments expose just the Arbitrum chain so the wallet can't
// switch to BSC/BOT. Otherwise the full multi-chain set is available, preferred
// chain first, with Arbitrum included so users can still use it. Array literals
// are kept inline so getDefaultConfig infers the required non-empty tuple type.
export const wagmiConfig = getDefaultConfig({
  appName: 'Red Sentinel',
  projectId,
  chains:
    APP_NETWORK === 'testnet'
      ? [bscTestnet, botChainTestnet, arbitrumSepolia, bsc, botChainMainnet, arbitrum]
      : [bsc, botChainMainnet, arbitrum, bscTestnet, botChainTestnet, arbitrumSepolia],
  ssr: true,
})
