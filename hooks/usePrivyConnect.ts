'use client'

import { useCallback } from 'react'
import { useConnectWallet, useLogin, usePrivy } from '@privy-io/react-auth'

/**
 * Unified entry point to Privy's wallet modal — replaces the old
 * RainbowKit `useConnectModal` and Solana adapter `useWalletModal`.
 *
 * - No Privy user yet: opens the full login modal (wallet / email).
 * - Already logged in: prompts connecting an additional wallet
 *   (shows EVM + Solana options per `walletChainType`).
 */
export function usePrivyConnect() {
  const { user, ready } = usePrivy()
  const { connectWallet } = useConnectWallet()
  const { login } = useLogin()

  const openConnectModal = useCallback(() => {
    if (ready && user) {
      connectWallet()
    } else {
      login()
    }
  }, [ready, user, connectWallet, login])

  return { openConnectModal, ready }
}
