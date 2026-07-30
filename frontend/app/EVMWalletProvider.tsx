'use client'

import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { wagmiConfig } from '@/lib/wagmi'
import { useReconnectPreferredWallets } from '@/hooks/evm/useReconnectPreferredWallets'

export function EVMWalletProvider({ children }: { children: React.ReactNode }) {
  useReconnectPreferredWallets()

  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
      <RainbowKitProvider theme={darkTheme()}>{children}</RainbowKitProvider>
    </WagmiProvider>
  )
}
