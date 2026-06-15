import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { defineChain } from 'viem'
import { bsc, bscTestnet } from 'viem/chains'
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

export const wagmiConfig = getDefaultConfig({
  appName: 'Red Sentinel',
  projectId,
  // Preferred chain first; both included so users can switch networks in-wallet
  chains:
    APP_NETWORK === 'testnet'
      ? [bscTestnet, botChainTestnet, bsc, botChainMainnet]
      : [bsc, botChainMainnet, bscTestnet, botChainTestnet],
  ssr: true,
})
