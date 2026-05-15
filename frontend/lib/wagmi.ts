import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { bsc, bscTestnet } from 'viem/chains'
import { APP_NETWORK } from '@/constants/shared'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

export const wagmiConfig = getDefaultConfig({
  appName: 'Sui Sentinel',
  projectId,
  // Preferred chain first; both included so users can switch networks in-wallet
  chains: APP_NETWORK === 'testnet' ? [bscTestnet, bsc] : [bsc, bscTestnet],
  ssr: true,
})
