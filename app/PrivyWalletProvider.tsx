'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import type { PrivyClientConfig } from '@privy-io/react-auth'

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''

// Privy owns EVM wallet connection (embedded + external, via wagmi bindings)
// and email login. Solana connects directly to browser wallets through
// SolanaWalletProvider (wallet-adapter); Sui stays on @mysten/dapp-kit.
//
// NOTE: the wagmi `WagmiProvider` is rendered by app/providers.tsx, below the
// TanStack QueryClientProvider (wagmi requires Query above it).
export function PrivyWalletProvider({ children }: { children: React.ReactNode }) {
  const privyConfig: PrivyClientConfig = {
    appearance: {
      theme: 'dark',
      walletChainType: 'ethereum-only',
      showWalletLoginFirst: true,
    },
    loginMethods: ['wallet', 'email'],
    embeddedWallets: {
      ethereum: { createOnLogin: 'users-without-wallets' },
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
