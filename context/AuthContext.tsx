'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import type { UserProfile, ChainType, WalletConnection } from '@/lib/auth-api'
import {
  getNonce,
  walletConnect,
  addWallet as addWalletApi,
  removeWallet as removeWalletApi,
  getProfile,
  checkSession,
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

  // Track if we've done the initial profile refresh
  const hasRefreshedRef = useRef(false)

  // Hydrate from localStorage and check session cookie on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First try to restore from localStorage for immediate UI
        const stored = localStorage.getItem(AUTH_USER_STORAGE_KEY)
        if (stored) {
          const user = JSON.parse(stored) as UserProfile
          setState({
            user,
            isLoading: false,
            isAuthenticated: true,
          })
        }

        // The session cookie is authoritative. localStorage can hold a stale
        // profile when a wallet is linked to more than one profile, while
        // server-side flows (e.g. the X OAuth callback) always target the
        // session's profile — trusting the cache alone would never surface
        // those changes.
        try {
          const sessionData = await checkSession()
          if (sessionData.authenticated && sessionData.user) {
            setState({
              user: sessionData.user,
              isLoading: false,
              isAuthenticated: true,
            })
            return
          }
        } catch {
          // Session check failed — keep whatever we hydrated above
        }

        if (!stored) {
          setState(prev => ({ ...prev, isLoading: false }))
        }
      } catch {
        setState(prev => ({ ...prev, isLoading: false }))
      }
    }

    initializeAuth()
  }, [])

  // Fetch fresh profile data after hydration from localStorage
  useEffect(() => {
    // Only run once, after hydration, if we have a user
    if (hasRefreshedRef.current || state.isLoading || !state.user) {
      return
    }

    hasRefreshedRef.current = true

    // Background refresh - fetch fresh data from server
    getProfile(state.user.id)
      .then(({ user }) => {
        setState({
          user,
          isLoading: false,
          isAuthenticated: true,
        })
      })
      .catch(error => {
        // If user was deleted (404), log them out
        if (error instanceof AuthApiError && error.statusCode === 404) {
          setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          })
          localStorage.removeItem(AUTH_USER_STORAGE_KEY)
        }
        // For other errors, silently keep the cached data
      })
  }, [state.isLoading, state.user])

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

  return user.wallets.some(w => w.wallet_address.toLowerCase() === walletAddress.toLowerCase())
}
