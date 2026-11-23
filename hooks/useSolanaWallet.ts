'use client'

import { useCallback, useMemo } from 'react'
import {
  WalletReadyState,
  type SendTransactionOptions,
  type WalletName,
} from '@solana/wallet-adapter-base'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  Connection,
  PublicKey,
  VersionedTransaction,
  type SendOptions,
  type Transaction,
} from '@solana/web3.js'
import { SOLANA_RPC_URL } from '@/constants/solana'

// Single import point for Solana wallet state across the app.
// Components should import from here, not directly from @solana/wallet-adapter-react,
// so swapping the underlying library only requires changes in one place.

export function useSolanaConnection() {
  const connection = useMemo(() => new Connection(SOLANA_RPC_URL), [])
  return { connection }
}

export function useSolanaWallet() {
  const {
    publicKey,
    connected,
    connecting,
    wallets,
    sendTransaction: adapterSendTransaction,
    signMessage: adapterSignMessage,
    disconnect,
  } = useWallet()
  const { connection } = useSolanaConnection()

  const sendTransaction = useCallback(
    async (
      transaction: Transaction | VersionedTransaction,
      providedConnection?: Connection,
      options?: SendOptions
    ): Promise<string> =>
      adapterSendTransaction(
        transaction,
        providedConnection ?? connection,
        options as SendTransactionOptions
      ),
    [adapterSendTransaction, connection]
  )

  const signMessage = useCallback(
    async (message: Uint8Array): Promise<Uint8Array> => {
      if (!adapterSignMessage) throw new Error('Solana wallet does not support signMessage')
      return adapterSignMessage(message)
    },
    [adapterSignMessage]
  )

  return {
    publicKey,
    connected: connected && !!publicKey,
    connecting,
    ready: wallets.length > 0,
    connection,
    sendTransaction,
    signMessage,
    disconnect,
  }
}

export type SolanaWalletOption = {
  name: string
  icon: string
  url: string
  /** Installed (or loadable) in this browser — otherwise selection opens the install page. */
  installed: boolean
}

/** Detected browser wallets + connect, for wallet-picker UIs. */
export function useSolanaWalletList() {
  const { wallets, select, connecting } = useWallet()

  const options = useMemo<SolanaWalletOption[]>(
    () =>
      wallets
        .map(({ adapter, readyState }) => ({
          name: adapter.name,
          icon: adapter.icon,
          url: adapter.url,
          installed:
            readyState === WalletReadyState.Installed || readyState === WalletReadyState.Loadable,
        }))
        .sort((a, b) => Number(b.installed) - Number(a.installed)),
    [wallets]
  )

  return { wallets: options, select: (name: string) => select(name as WalletName), connecting }
}
