'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  getAddress,
  getNetwork,
  isConnected as freighterIsConnected,
  setAllowed,
  signMessage as freighterSignMessage,
  signTransaction as freighterSignTransaction,
} from '@stellar/freighter-api'
import { APP_NETWORK } from '@/constants/shared'
import { STELLAR_CONFIG } from '@/constants/stellar'

/**
 * Stellar wallet access via the Freighter browser extension — the counterpart
 * of useSolanaWallet. Exposes the connected G... address and a signTransaction
 * callback compatible with lib/stellar's StellarSigner.
 */
export function useStellarWallet() {
  const [address, setAddress] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  // Pick up an already-granted connection on mount (no popup).
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const connected = await freighterIsConnected()
        if (connected) {
          const { address: addr, error } = await getAddress()
          if (!cancelled && addr && !error) setAddress(addr)
        }
      } catch {
        // Freighter not installed — stay disconnected.
      } finally {
        if (!cancelled) setReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const connect = useCallback(async (): Promise<string> => {
    const installed = await freighterIsConnected()
    if (!installed) {
      throw new Error('Freighter wallet not found. Install the extension from freighter.app.')
    }

    const expectedNetwork = APP_NETWORK === 'mainnet' ? 'PUBLIC' : 'TESTNET'
    const { network } = await getNetwork()
    if (network !== expectedNetwork) {
      throw new Error(
        `Freighter is on the wrong network (${network}). Switch it to ${expectedNetwork} and try again.`
      )
    }

    // Pops the permission grant if this site isn't allowlisted yet.
    await setAllowed()
    const { address: addr, error } = await getAddress()
    if (error || !addr) throw new Error(error ?? 'Failed to get Freighter address')
    setAddress(addr)
    return addr
  }, [])

  const disconnect = useCallback(() => setAddress(null), [])

  const signTransaction = useCallback(
    async (txXdr: string): Promise<{ signedTxXdr: string }> => {
      if (!address) throw new Error('Stellar wallet not connected')
      const res = await freighterSignTransaction(txXdr, {
        address,
        networkPassphrase: STELLAR_CONFIG.NETWORK_PASSPHRASE,
      })
      if (res.error) throw new Error(res.error.message ?? 'Freighter failed to sign the transaction')
      return res
    },
    [address]
  )

  /** Signs a UTF-8 message; resolves to the base64 detached signature. */
  const signMessage = useCallback(
    async (message: string): Promise<{ signedMessage: string }> => {
      if (!address) throw new Error('Stellar wallet not connected')
      const res = await freighterSignMessage(message, {
        address,
        networkPassphrase: STELLAR_CONFIG.NETWORK_PASSPHRASE,
      })
      if (res.error) throw new Error(res.error.message ?? 'Freighter failed to sign the message')
      const signed = typeof res.signedMessage === 'string'
        ? res.signedMessage
        : Buffer.from(res.signedMessage as unknown as Uint8Array).toString('base64')
      return { signedMessage: signed }
    },
    [address]
  )

  return {
    address,
    isConnected: !!address,
    ready,
    connect,
    disconnect,
    signTransaction,
    signMessage,
  }
}
