'use client'

import { useMemo, type ReactNode } from 'react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack'
import { GlowWalletAdapter } from '@solana/wallet-adapter-glow'
import { SOLANA_CLUSTER, SOLANA_RPC_URL } from '@/constants/solana'

// Solana connects straight to browser wallets (Phantom, Solflare, Backpack,
// Glow) via wallet-adapter — Privy only handles EVM + email login.
export function SolanaWalletProvider({ children }: { children: ReactNode }) {
  const network =
    SOLANA_CLUSTER === 'mainnet-beta' ? WalletAdapterNetwork.Mainnet : WalletAdapterNetwork.Devnet

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new BackpackWalletAdapter(),
      new GlowWalletAdapter(),
    ],
    [network]
  )

  return (
    <ConnectionProvider endpoint={SOLANA_RPC_URL}>
      {/* autoConnect silently reconnects the last-used wallet on page load —
          no popup, unlike the Privy auto-connect this replaces. */}
      <WalletProvider wallets={wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  )
}
