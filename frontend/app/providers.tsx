'use client'

import '@mysten/dapp-kit/dist/index.css'
import React, { useState, useEffect } from 'react'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { SuiClientProvider, WalletProvider, lightTheme } from '@mysten/dapp-kit'
import { AppShell } from '@/components/layout/AppShell'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProfileInitializer } from '@/components/profile/ProfileInitializer'
import { ConnectSocialPrompt } from '@/components/notifications/ConnectSocialPrompt'
import { APP_NETWORK } from '@/constants'
import { SUI_RPC_URLS } from '@/constants/sui-rpc'
import { SolanaWalletProvider } from '@/app/SolanaWalletProvider'
import { EVMWalletProvider } from '@/app/EVMWalletProvider'
import { ActiveChainProvider } from '@/context/ActiveChainContext'
import { AuthProvider } from '@/context/AuthContext'

const suiNetworks = {
  testnet: { url: SUI_RPC_URLS.testnet },
  mainnet: { url: SUI_RPC_URLS.mainnet },
}

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

  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: '/ingest',
      ui_host: 'https://us.posthog.com',
      defaults: '2025-05-24',
      capture_exceptions: true, //
      debug: process.env.NODE_ENV === 'development',
    })
  }, [])

  return (
    <PHProvider client={posthog}>
      <QueryClientProvider client={queryClient}>
        <EVMWalletProvider>
          <SuiClientProvider networks={suiNetworks} defaultNetwork={APP_NETWORK}>
            <WalletProvider autoConnect theme={lightTheme}>
              <SolanaWalletProvider>
                <ActiveChainProvider>
                  <AuthProvider>
                    <ProfileInitializer />
                    <AppShell>{children}</AppShell>
                    <ConnectSocialPrompt />
                  </AuthProvider>
                </ActiveChainProvider>
              </SolanaWalletProvider>
            </WalletProvider>
          </SuiClientProvider>
        </EVMWalletProvider>
      </QueryClientProvider>
    </PHProvider>
  )
}
