'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana'
import type { PrivyClientConfig } from '@privy-io/react-auth'

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''

// Privy now owns wallet connection for EVM (embedded + external, via wagmi
// bindings) and Solana (embedded + external). Sui stays on @mysten/dapp-kit —
// Privy has no browser-side Sui connectors.
//
// NOTE: the wagmi `WagmiProvider` is rendered by app/providers.tsx, below the
// TanStack QueryClientProvider (wagmi requires Query above it).
export function PrivyWalletProvider({ children }: { children: React.ReactNode }) {
  const privyConfig: PrivyClientConfig = {
    appearance: {
      theme: 'dark',
      walletChainType: 'ethereum-and-solana',
      showWalletLoginFirst: true,
    },
    loginMethods: ['wallet', 'email'],
    embeddedWallets: {
      ethereum: { createOnLogin: 'users-without-wallets' },
      solana: { createOnLogin: 'users-without-wallets' },
    },
    externalWallets: {
      solana: {
        connectors: toSolanaWalletConnectors({ shouldAutoConnect: true }),
      },
    },
  }

  if (!PRIVY_APP_ID) {
    throw new Error('NEXT_PUBLIC_PRIVY_APP_ID is not set')
  }

  return (
    <PrivyProvider appId={PRIVY_APP_ID} config={privyConfig}>
      {children}
    </PrivyProvider>
  )
}
