'use client'
import '@mysten/dapp-kit/dist/index.css'
import React, { useState } from 'react'
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit'
import { getFullnodeUrl } from '@mysten/sui/client'
import { Header } from '@/components/Header'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProfileInitializer } from '@/components/profile/ProfileInitializer'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  const networks = {
    testnet: { url: getFullnodeUrl('testnet') },
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider
        networks={networks}
        defaultNetwork="testnet"
      >
        <WalletProvider autoConnect>
          <div>
            {/* <LaunchMainnetBanner /> */}
            <Header />
            <ProfileInitializer />
            {children}
          </div>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  )
}
