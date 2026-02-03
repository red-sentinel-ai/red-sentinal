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
import { usePrivy, useWallets } from '@privy-io/react-auth'
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

  // Slush wallet hooks (external Sui wallet)
  const slushAccount = useCurrentAccount()
  const { mutateAsync: slushSignAndExecute } = useSignAndExecuteTransaction()
  const { mutate: disconnectSlush } = useDisconnectWallet()
  const client = useSuiClient()

  // Privy hooks
  const { login, logout, authenticated, ready: privyReady, user } = usePrivy()
  const { wallets: privyWallets } = useWallets()

  // Find Privy's embedded Sui wallet
  // Privy creates embedded wallets that can be used for Sui (Tier 2 chain)
  const privySuiWallet = useMemo(() => {
    if (!authenticated || !user) return null

    // Find the embedded wallet from Privy
    // For Tier 2 chains like Sui, Privy uses embedded wallets with raw signing
    const embeddedWallet = privyWallets.find(w => w.walletClientType === 'privy')

    if (!embeddedWallet) return null

    // For Sui, we need to derive the address from the public key
    // The wallet should have a public key that can be used for Sui
    return {
      id: embeddedWallet.address,
      // Privy wallets use the same address/public key for signing
      // The actual Sui address derivation happens when we sign
      address: embeddedWallet.address,
      publicKey: (embeddedWallet as any).publicKey || '',
      wallet: embeddedWallet,
    }
  }, [authenticated, user, privyWallets])

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
    // Auto-detect if one is connected
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

  // Sign and execute transaction
  const signAndExecuteTransaction = useCallback(
    async (tx: Transaction): Promise<SuiTransactionBlockResponse> => {
      if (wallet.type === 'slush') {
        const result = await slushSignAndExecute({
          transaction: tx,
        })

        // Get full transaction response with effects
        const txResponse = await client.waitForTransaction({
          digest: result.digest,
          options: {
            showRawEffects: true,
            showObjectChanges: true,
          },
        })

        return txResponse
      }

      if (wallet.type === 'privy' && privySuiWallet?.wallet) {
        // Use Privy's raw sign for Sui transactions
        const privyWalletForSigning = {
          address: privySuiWallet.address,
          publicKey: privySuiWallet.publicKey,
          rawSign: async (hash: string) => {
            // Privy's signMessage with raw bytes for Tier 2 chains
            const signature = await (privySuiWallet.wallet as any).sign(hash)
            return signature
          },
        }

        return signAndExecuteWithPrivy(tx, client, privyWalletForSigning)
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
