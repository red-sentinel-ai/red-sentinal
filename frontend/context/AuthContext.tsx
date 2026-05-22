'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { UserProfile, ChainType, WalletConnection } from '@/lib/auth-api'
import {
  getNonce,
  walletConnect,
  addWallet as addWalletApi,
  removeWallet as removeWalletApi,
  getProfile,
  AuthApiError,
} from '@/lib/auth-api'

const AUTH_USER_STORAGE_KEY = 'rs_auth_user'

type AuthState = {
  user: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
}

type SignMessageFn = (message: string) => Promise<string>

type AuthContextValue = AuthState & {
  /**
   * Authenticate with a wallet by signing a message
   */
  authenticateWallet: (
    chainType: ChainType,
    walletAddress: string,
    signMessage: SignMessageFn,
    chainId?: string
  ) => Promise<UserProfile>

  /**
   * Add a new wallet to the authenticated user
   */
  addWallet: (
    chainType: ChainType,
    walletAddress: string,
    signMessage: SignMessageFn,
    chainId?: string
  ) => Promise<WalletConnection>

  /**
   * Remove a wallet from the user's account
   */
  removeWallet: (walletId: string) => Promise<void>

  /**
   * Refresh user profile from the server
   */
  refreshProfile: () => Promise<void>

  /**
   * Clear the current session (logout)
   */
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_USER_STORAGE_KEY)
      if (stored) {
        const user = JSON.parse(stored) as UserProfile
        setState({
          user,
          isLoading: false,
          isAuthenticated: true,
        })
      } else {
        setState(prev => ({ ...prev, isLoading: false }))
      }
    } catch {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [])

  // Persist user to localStorage when it changes
  useEffect(() => {
    if (state.user) {
      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(state.user))
    } else {
      localStorage.removeItem(AUTH_USER_STORAGE_KEY)
    }
  }, [state.user])

  const setUser = useCallback((user: UserProfile | null) => {
    setState({
      user,
      isLoading: false,
      isAuthenticated: !!user,
    })
  }, [])

  const authenticateWallet = useCallback(
    async (
      chainType: ChainType,
      walletAddress: string,
      signMessage: SignMessageFn,
      chainId?: string
    ): Promise<UserProfile> => {
      setState(prev => ({ ...prev, isLoading: true }))

      try {
        // Step 1: Get nonce and message to sign
        const { message } = await getNonce({
          chain_type: chainType,
          chain_id: chainId ?? null,
          wallet_address: walletAddress,
        })

        // Step 2: Sign the message with wallet
        const signature = await signMessage(message)

        // Step 3: Verify signature and get/create user
        const response = await walletConnect({
          chain_type: chainType,
          chain_id: chainId ?? null,
          wallet_address: walletAddress,
          message,
          signature,
        })

        setUser(response.user)
        return response.user
      } catch (error) {
        setState(prev => ({ ...prev, isLoading: false }))
        throw error
      }
    },
    [setUser]
  )

  const addWallet = useCallback(
    async (
      chainType: ChainType,
      walletAddress: string,
      signMessage: SignMessageFn,
      chainId?: string
    ): Promise<WalletConnection> => {
      if (!state.user) {
        throw new Error('Not authenticated')
      }

      // Step 1: Get nonce and message to sign
      const { message } = await getNonce({
        chain_type: chainType,
        chain_id: chainId ?? null,
        wallet_address: walletAddress,
      })

      // Step 2: Sign the message with wallet
      const signature = await signMessage(message)

      // Step 3: Add wallet to user
      const response = await addWalletApi(state.user.id, {
        chain_type: chainType,
        chain_id: chainId ?? null,
        wallet_address: walletAddress,
        message,
        signature,
      })

      // Refresh profile to get updated wallet list
      await refreshProfile()

      return response.wallet
    },
    [state.user]
  )

  const removeWallet = useCallback(
    async (walletId: string): Promise<void> => {
      if (!state.user) {
        throw new Error('Not authenticated')
      }

      await removeWalletApi(state.user.id, walletId)

      // Refresh profile to get updated wallet list
      await refreshProfile()
    },
    [state.user]
  )

  const refreshProfile = useCallback(async (): Promise<void> => {
    if (!state.user) return

    try {
      const { user } = await getProfile(state.user.id)
      setUser(user)
    } catch (error) {
      // If profile fetch fails with 404, user was deleted
      if (error instanceof AuthApiError && error.statusCode === 404) {
        setUser(null)
      }
      throw error
    }
  }, [state.user, setUser])

  const logout = useCallback(() => {
    setUser(null)
  }, [setUser])

  const value: AuthContextValue = {
    ...state,
    authenticateWallet,
    addWallet,
    removeWallet,
    refreshProfile,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/**
 * Hook to check if the current wallet is linked to the authenticated user
 */
export function useIsWalletLinked(walletAddress: string | undefined): boolean {
  const { user } = useAuth()

  if (!user || !walletAddress) return false

  return user.wallets.some(
    w => w.wallet_address.toLowerCase() === walletAddress.toLowerCase()
  )
}
