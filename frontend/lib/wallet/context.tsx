'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  ReactNode,
} from 'react'
import { usePrivy } from '@privy-io/react-auth'
import {
  useCurrentAccount,
  useDisconnectWallet,
  useSignAndExecuteTransaction,
  useSuiClient,
} from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { SuiTransactionBlockResponse } from '@mysten/sui/client'
import { signAndExecuteWithPrivy } from './privy-signer'
import type { WalletContextValue, WalletType, UnifiedWallet } from './types'

const WalletContext = createContext<WalletContextValue | null>(null)

const WALLET_TYPE_STORAGE_KEY = 'sui-sentinel-wallet-type'

interface WalletContextProviderProps {
  children: ReactNode
}

export function WalletContextProvider({ children }: WalletContextProviderProps) {
  const [activeWalletType, setActiveWalletType] = useState<WalletType>(null)
  const [isReady, setIsReady] = useState(false)

  // Slush wallet hooks
  const slushAccount = useCurrentAccount()
  const { mutateAsync: slushSignAndExecute } = useSignAndExecuteTransaction()
  const { mutate: disconnectSlush } = useDisconnectWallet()
  const client = useSuiClient()

  // Privy hooks
  const { login, logout, authenticated, ready: privyReady, user } = usePrivy()
  const { wallets: solanaWallets } = {} as any

  // Get Privy Sui wallet from linked accounts
  // Privy uses Solana wallets infrastructure for Sui as it's a Tier 2 chain
  const privySuiWallet = useMemo(() => {
    if (!authenticated || !user) return null

    // Find embedded wallet from user's linked accounts
    const embeddedWallet = user.linkedAccounts.find(
      account => account.type === 'wallet' && account.walletClientType === 'privy'
    )

    if (!embeddedWallet || embeddedWallet.type !== 'wallet') return null

    // For Sui (Tier 2), we need to derive the address
    // The embedded wallet for Sui uses ED25519
    const solanaEmbedded = solanaWallets.find(w => w.walletClientType === 'privy')

    if (!solanaEmbedded) return null

    return {
      id: solanaEmbedded.address,
      address: embeddedWallet.address,
      // Public key will be fetched when needed
      wallet: solanaEmbedded,
    }
  }, [authenticated, user, solanaWallets])

  // Load persisted wallet type on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(WALLET_TYPE_STORAGE_KEY)
      if (stored === 'slush' || stored === 'privy') {
        setActiveWalletType(stored)
      }
      setIsReady(true)
    }
  }, [])

  // Persist wallet type changes
  useEffect(() => {
    if (typeof window !== 'undefined' && isReady) {
      if (activeWalletType) {
        localStorage.setItem(WALLET_TYPE_STORAGE_KEY, activeWalletType)
      } else {
        localStorage.removeItem(WALLET_TYPE_STORAGE_KEY)
      }
    }
  }, [activeWalletType, isReady])

  // Auto-detect wallet type if one is connected
  useEffect(() => {
    if (!isReady) return

    // If we have an explicit selection, respect it
    if (activeWalletType) return

    // Auto-detect based on what's connected
    if (slushAccount?.address) {
      setActiveWalletType('slush')
    } else if (authenticated && privySuiWallet?.address) {
      setActiveWalletType('privy')
    }
  }, [isReady, activeWalletType, slushAccount?.address, authenticated, privySuiWallet?.address])

  // Unified wallet state
  const wallet: UnifiedWallet = useMemo(() => {
    if (activeWalletType === 'slush' && slushAccount?.address) {
      return { address: slushAccount.address, type: 'slush', isConnected: true }
    }
    if (activeWalletType === 'privy' && authenticated && privySuiWallet?.address) {
      return {
        address: privySuiWallet.address,
        type: 'privy',
        isConnected: true,
      }
    }
    // Check if either wallet is connected even without explicit selection
    if (slushAccount?.address) {
      return { address: slushAccount.address, type: 'slush', isConnected: true }
    }
    if (authenticated && privySuiWallet?.address) {
      return {
        address: privySuiWallet.address,
        type: 'privy',
        isConnected: true,
      }
    }
    return { address: null, type: null, isConnected: false }
  }, [activeWalletType, slushAccount, privySuiWallet, authenticated])

  // Unified sign and execute
  const signAndExecuteTransaction = useCallback(
    async (
      tx: Transaction,
      options?: {
        showRawEffects?: boolean
        showObjectChanges?: boolean
      }
    ): Promise<SuiTransactionBlockResponse> => {
      if (wallet.type === 'slush') {
        const result = await slushSignAndExecute({
          transaction: tx,
        })
        return result as SuiTransactionBlockResponse
      }

      if (wallet.type === 'privy' && privySuiWallet?.wallet) {
        // For Privy, we need to use the raw sign method
        const solanaWallet = privySuiWallet.wallet

        // Get the public key
        const publicKey = await (solanaWallet as any).getPublicKey?.()
        if (!publicKey) {
          throw new Error('Failed to get public key from Privy wallet')
        }

        const privyWalletForSigning = {
          id: solanaWallet.address,
          address: privySuiWallet.address,
          publicKey: typeof publicKey === 'string' ? publicKey : publicKey.toString('hex'),
          sign: async (params: { hash: string }) => {
            // Privy's raw sign for Sui transactions
            const result = await (solanaWallet as any).sign(params.hash)
            return result
          },
        }

        return signAndExecuteWithPrivy(tx, client, privyWalletForSigning, options)
      }

      throw new Error('No wallet connected')
    },
    [wallet.type, slushSignAndExecute, privySuiWallet, client]
  )

  const connect = useCallback(
    async (type: WalletType) => {
      setActiveWalletType(type)
      if (type === 'privy') {
        await login()
      }
      // Slush connection is handled by dapp-kit ConnectButton
    },
    [login]
  )

  const disconnect = useCallback(async () => {
    if (wallet.type === 'slush') {
      disconnectSlush()
    }
    if (wallet.type === 'privy') {
      await logout()
    }
    setActiveWalletType(null)
  }, [wallet.type, disconnectSlush, logout])

  const value: WalletContextValue = useMemo(
    () => ({
      wallet,
      connect,
      disconnect,
      signAndExecuteTransaction,
      isReady: isReady && privyReady,
    }),
    [wallet, connect, disconnect, signAndExecuteTransaction, isReady, privyReady]
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export const useWalletContext = () => {
  const ctx = useContext(WalletContext)
  if (!ctx) {
    throw new Error('useWalletContext must be used within WalletContextProvider')
  }
  return ctx
}
