'use client'

import '@mysten/dapp-kit/dist/index.css'
import React, { useState, useEffect } from 'react'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { SuiClientProvider, WalletProvider, lightTheme } from '@mysten/dapp-kit'
import { getFullnodeUrl } from '@mysten/sui/client'
import { Header } from '@/components/Header'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProfileInitializer } from '@/components/profile/ProfileInitializer'
import { FeedbackButton } from '@/components/feedback/FeedbackButton'

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

  const networks = {
    testnet: { url: getFullnodeUrl('testnet') },
  }

  return (
    <PHProvider client={posthog}>
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider
          networks={networks}
          defaultNetwork="testnet"
        >
          <WalletProvider
            autoConnect
            theme={lightTheme}
          >
            <div>
              {/* <LaunchMainnetBanner /> */}
              <Header />
              <div className='mt-11'></div>
              <ProfileInitializer />
              {children}
              <FeedbackButton />
            </div>
          </WalletProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </PHProvider>
  )
}
