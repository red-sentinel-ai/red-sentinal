'use client'

import { useEffect, useRef } from 'react'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'
import { useAuth, useIsWalletLinked } from '@/context/AuthContext'
import { useWalletAuth } from '@/hooks/auth/useWalletAuth'
import { useUserProfile } from '@/hooks/profile/useUserProfile'

/**
 * A client component that handles authentication when a wallet connects.
 *
 * Authentication flow:
 * 1. When wallet connects, check if it's linked to the current user
 * 2. If not authenticated or wallet not linked, prompt for signature
 * 3. On successful signature, user is authenticated
 *
 * Also maintains backward compatibility by calling useUserProfile
 * for the legacy profile system.
 */
export function ProfileInitializer() {
  // Legacy profile hook - maintains backward compatibility
  useUserProfile()

  const { address, isConnected, chain } = useConnectedAddress()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { authenticate, isAuthenticating } = useWalletAuth()
  const isWalletLinked = useIsWalletLinked(address)

  // Track whether we've attempted auth for this wallet
  const authAttemptedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isConnected || !address || authLoading || isAuthenticating) {
      return
    }

    // Skip if already authenticated with this wallet linked
    if (isAuthenticated && isWalletLinked) {
      authAttemptedRef.current = address
      return
    }

    // Skip if already attempted for this wallet
    if (authAttemptedRef.current === address) {
      return
    }

    // Mark as attempted
    authAttemptedRef.current = address

    // Auto-authenticate when wallet connects
    // Note: This will prompt the user to sign a message
    // You may want to make this opt-in instead of automatic
    // by showing a "Verify Wallet" button instead
    authenticate()
  }, [
    isConnected,
    address,
    chain,
    authLoading,
    isAuthenticating,
    isAuthenticated,
    isWalletLinked,
    authenticate,
  ])

  // Reset auth attempt when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      authAttemptedRef.current = null
    }
  }, [isConnected])

  return null
}
