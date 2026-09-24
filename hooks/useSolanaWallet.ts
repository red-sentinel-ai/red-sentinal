'use client'

import { useCallback, useMemo } from 'react'
import bs58 from 'bs58'
import { useWallets } from '@privy-io/react-auth/solana'
import {
  Connection,
  PublicKey,
  VersionedTransaction,
  type SendOptions,
  type Transaction,
} from '@solana/web3.js'
import { SOLANA_CLUSTER, SOLANA_RPC_URL } from '@/constants/solana'

// CAIP-2 chain id used by wallet-standard signAndSendTransaction.
const SOLANA_CHAIN = SOLANA_CLUSTER === 'mainnet-beta' ? 'solana:mainnet' : 'solana:devnet'

// Single import point for Solana wallet state across the app.
// Components should import from here, not directly from @privy-io/react-auth/solana,
// so swapping the underlying library only requires changes in one place.

export function useSolanaConnection() {
  const connection = useMemo(() => new Connection(SOLANA_RPC_URL), [])
  return { connection }
}

/**
 * Drop-in replacement for the old @solana/wallet-adapter interface, backed by
 * the connected Privy Solana wallet (external via wallet-standard, or embedded).
 */
export function useSolanaWallet() {
  const { wallets, ready } = useWallets()
  const { connection } = useSolanaConnection()

  // Privy has no explicit "active" Solana wallet — use the first connected one.
  const wallet = wallets[0] ?? null

  const publicKey = useMemo(
    () => (wallet ? new PublicKey(wallet.address) : null),
    [wallet]
  )

  const sendTransaction = useCallback(
    async (
      transaction: Transaction | VersionedTransaction,
      _connection?: Connection,
      _options?: SendOptions
    ): Promise<string> => {
      if (!wallet) throw new Error('Solana wallet not connected')

      // The wallet signs and submits; consumers confirm on their own connection.
      const serialized =
        transaction instanceof VersionedTransaction
          ? transaction.serialize()
          : transaction.serialize({ requireAllSignatures: false, verifySignatures: false })

      const { signature } = await wallet.signAndSendTransaction({
        chain: SOLANA_CHAIN,
        transaction: new Uint8Array(serialized),
      })
      return bs58.encode(signature)
    },
    [wallet]
  )

  const signMessage = useCallback(
    async (message: Uint8Array): Promise<Uint8Array> => {
      if (!wallet) throw new Error('Solana wallet not connected')
      const { signature } = await wallet.signMessage({ message })
      return signature
    },
    [wallet]
  )

  const disconnect = useCallback(async () => {
    if (wallet) await wallet.disconnect()
  }, [wallet])

  return {
    publicKey,
    connected: !!wallet,
    ready,
    connection,
    sendTransaction,
    signMessage,
    disconnect,
  }
}
