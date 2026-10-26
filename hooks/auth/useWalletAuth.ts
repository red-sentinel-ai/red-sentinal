'use client'

import { useCallback, useState } from 'react'
import { useSignPersonalMessage, useCurrentAccount } from '@mysten/dapp-kit'
import { useSignMessage as useWagmiSignMessage, useAccount as useWagmiAccount } from 'wagmi'
import { useSolanaWallet } from '@/hooks/useSolanaWallet'
import { useStellarWallet } from '@/hooks/useStellarWallet'
import { useActiveChain } from '@/context/ActiveChainContext'
import { isEvmChain } from '@/constants/chains'
import { useEvmChain } from '@/hooks/evm/useEvmChain'
import { useAuth } from '@/context/AuthContext'
import type { ChainType, UserProfile, WalletConnection } from '@/lib/auth-api'
import { toast } from 'sonner'

type UseWalletAuthReturn = {
  /**
   * Authenticate the currently connected wallet
   * Signs a message and verifies ownership with the backend
   */
  authenticate: () => Promise<UserProfile | null>

  /**
   * Add the currently connected wallet to the authenticated user
   */
  addCurrentWallet: () => Promise<WalletConnection | null>

  /**
   * Whether an auth operation is in progress
   */
  isAuthenticating: boolean

  /**
   * Error from the last auth attempt
   */
  error: Error | null
}

/**
 * Hook for wallet authentication with signature verification
 * Automatically detects the active chain and uses the appropriate signing method
 */
export function useWalletAuth(): UseWalletAuthReturn {
  const { activeChain } = useActiveChain()
  const { authenticateWallet, addWallet, isAuthenticated } = useAuth()

  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Sui wallet
  const suiAccount = useCurrentAccount()
  const { mutateAsync: signSuiMessage } = useSignPersonalMessage()

  const { address: evmAddress } = useWagmiAccount()
  const { intendedChainId: evmChainId } = useEvmChain()
  const { signMessageAsync: signEvmMessage } = useWagmiSignMessage()

  // Solana wallet
  const { publicKey: solanaPublicKey, signMessage: signSolanaMessage } = useSolanaWallet()

  // Stellar wallet (Freighter)
  const { address: stellarAddress, signMessage: signStellarMessage } = useStellarWallet()

  // Get current wallet info based on active chain
  const getWalletInfo = useCallback((): {
    chainType: ChainType
    walletAddress: string | undefined
    chainId: string | undefined
    signMessage: (message: string) => Promise<string>
  } | null => {
    if (activeChain === 'sui') {
      if (!suiAccount?.address) return null
      return {
        chainType: 'sui',
        walletAddress: suiAccount.address,
        chainId: undefined,
        signMessage: async (message: string) => {
          const result = await signSuiMessage({
            message: new TextEncoder().encode(message),
          })
          return result.signature
        },
      }
    }

    if (isEvmChain(activeChain)) {
      if (!evmAddress) return null
      return {
        chainType: 'evm',
        walletAddress: evmAddress,
        chainId: evmChainId?.toString(),
        signMessage: async (message: string) => {
          return signEvmMessage({ account: evmAddress, message })
        },
      }
    }

    if (activeChain === 'solana') {
      if (!solanaPublicKey || !signSolanaMessage) return null
      return {
        chainType: 'solana',
        walletAddress: solanaPublicKey.toBase58(),
        chainId: undefined,
        signMessage: async (message: string) => {
          const messageBytes = new TextEncoder().encode(message)
          const signatureBytes = await signSolanaMessage(messageBytes)
          const bs58 = await import('bs58')
          return bs58.default.encode(signatureBytes)
        },
      }
    }

    if (activeChain === 'stellar') {
      if (!stellarAddress || !signStellarMessage) return null
      return {
        chainType: 'stellar',
        walletAddress: stellarAddress,
        chainId: undefined,
        signMessage: async (message: string) => {
          const result = await signStellarMessage(message)
          return result.signedMessage as string
        },
      }
    }

    return null
  }, [
    activeChain,
    suiAccount,
    evmAddress,
    evmChainId,
    solanaPublicKey,
    stellarAddress,
    signSuiMessage,
    signEvmMessage,
    signSolanaMessage,
    signStellarMessage,
  ])

  const authenticate = useCallback(async (): Promise<UserProfile | null> => {
    const walletInfo = getWalletInfo()

    if (!walletInfo || !walletInfo.walletAddress) {
      toast.error('No wallet connected')
      return null
    }

    setIsAuthenticating(true)
    setError(null)

    try {
      const user = await authenticateWallet(
        walletInfo.chainType,
        walletInfo.walletAddress,
        walletInfo.signMessage,
        walletInfo.chainId
      )

      toast.success('Wallet verified successfully!')
      return user
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Authentication failed')
      setError(error)

      // User rejected signature
      if (error.message.includes('rejected') || error.message.includes('cancelled')) {
        toast.error('Signature rejected')
      } else {
        toast.error(error.message)
      }

      return null
    } finally {
      setIsAuthenticating(false)
    }
  }, [getWalletInfo, authenticateWallet])

  const addCurrentWallet = useCallback(async (): Promise<WalletConnection | null> => {
    if (!isAuthenticated) {
      toast.error('Please sign in first')
      return null
    }

    const walletInfo = getWalletInfo()

    if (!walletInfo || !walletInfo.walletAddress) {
      toast.error('No wallet connected')
      return null
    }

    setIsAuthenticating(true)
    setError(null)

    try {
      const wallet = await addWallet(
        walletInfo.chainType,
        walletInfo.walletAddress,
        walletInfo.signMessage,
        walletInfo.chainId
      )

      toast.success('Wallet added successfully!')
      return wallet
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add wallet')
      setError(error)

      if (error.message.includes('already linked')) {
        toast.error('This wallet is already linked to another account')
      } else if (error.message.includes('rejected') || error.message.includes('cancelled')) {
        toast.error('Signature rejected')
      } else {
        toast.error(error.message)
      }

      return null
    } finally {
      setIsAuthenticating(false)
    }
  }, [isAuthenticated, getWalletInfo, addWallet])

  return {
    authenticate,
    addCurrentWallet,
    isAuthenticating,
    error,
  }
}
