'use client'

import '@mysten/dapp-kit/dist/index.css'
import React, { useState, useEffect } from 'react'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { SuiClientProvider, WalletProvider as SuiWalletProvider, lightTheme } from '@mysten/dapp-kit'
import { WagmiProvider } from '@privy-io/wagmi'
import { AppShell } from '@/components/layout/AppShell'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProfileInitializer } from '@/components/profile/ProfileInitializer'
import { ConnectSocialPrompt } from '@/components/notifications/ConnectSocialPrompt'
import { wagmiConfig } from '@/lib/wagmi'
import { APP_NETWORK } from '@/constants'
import { SUI_RPC_URLS } from '@/constants/sui-rpc'
import { createSuiClient } from '@/lib/sui/rpc-client'
import { PrivyWalletProvider } from '@/app/PrivyWalletProvider'
import { ActiveChainProvider } from '@/context/ActiveChainContext'
import { AuthProvider } from '@/context/AuthContext'
import { InstallPromptProvider } from '@/context/InstallPromptContext'

const suiNetworks = {
  testnet: { url: SUI_RPC_URLS.testnet, network: 'testnet' as const },
  mainnet: { url: SUI_RPC_URLS.mainnet, network: 'mainnet' as const },
}

// Build every dapp-kit client through createSuiClient so all Sui RPC traffic —
// hooks, wallet queries, the attack flow — goes through the retrying transport.
const createClient = (_name: string, config: { url: string }) =>
  createSuiClient(config.url, APP_NETWORK)

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
      <PrivyWalletProvider>
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={wagmiConfig}>
            <SuiClientProvider
              networks={suiNetworks}
              defaultNetwork={APP_NETWORK}
              createClient={createClient}
            >
              <SuiWalletProvider autoConnect theme={lightTheme}>
                <ActiveChainProvider>
                  <AuthProvider>
                    <ProfileInitializer />
                    <InstallPromptProvider>
                      <AppShell>{children}</AppShell>
                    </InstallPromptProvider>
                    <ConnectSocialPrompt />
                  </AuthProvider>
                </ActiveChainProvider>
              </SuiWalletProvider>
            </SuiClientProvider>
          </WagmiProvider>
        </QueryClientProvider>
      </PrivyWalletProvider>
    </PHProvider>
  )
}
