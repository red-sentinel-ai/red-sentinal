'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'
import {
  getAddress,
  getNetwork,
  isConnected as freighterIsConnected,
  setAllowed,
  signMessage as freighterSignMessage,
  signTransaction as freighterSignTransaction,
} from '@stellar/freighter-api'
import { STELLAR_CONFIG, STELLAR_NETWORK } from '@/constants/stellar'

/**
 * Stellar wallet access via the Freighter browser extension — the counterpart
 * of useSolanaWallet. Exposes the connected G... address and a signTransaction
 * callback compatible with lib/stellar's StellarSigner.
 *
 * Freighter has no React context like Privy or dapp-kit, so the connection is
 * kept in a module-level store: every useStellarWallet() instance (connect
 * button, auth, balance, deploy flows) shares one address.
 */

interface StellarWalletState {
  address: string | null
  /** True once the mount-time "already connected?" probe has settled. */
  ready: boolean
}

let state: StellarWalletState = { address: null, ready: false }
const listeners = new Set<() => void>()

function setState(patch: Partial<StellarWalletState>) {
  state = { ...state, ...patch }
  listeners.forEach(listener => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return state
}

function getServerSnapshot(): StellarWalletState {
  return { address: null, ready: false }
}

// One probe per page load, however many components use the hook — Freighter
// calls are async extension round-trips.
let probePromise: Promise<void> | null = null

function probeConnection(): Promise<void> {
  if (!probePromise) {
    probePromise = (async () => {
      try {
        // Pick up an already-granted connection on mount (no popup).
        if (await freighterIsConnected()) {
          const { address: addr, error } = await getAddress()
          if (addr && !error) setState({ address: addr })
        }
      } catch {
        // Freighter not installed — stay disconnected.
      } finally {
        setState({ ready: true })
      }
    })()
  }
  return probePromise
}

export function useStellarWallet() {
  const { address, ready } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    probeConnection()
  }, [])

  const connect = useCallback(async (): Promise<string> => {
    const installed = await freighterIsConnected()
    if (!installed) {
      throw new Error('Freighter wallet not found. Install the extension from freighter.app.')
    }

    const expectedNetwork = STELLAR_NETWORK === 'mainnet' ? 'PUBLIC' : 'TESTNET'
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
    setState({ address: addr })
    return addr
  }, [])

  const disconnect = useCallback(() => setState({ address: null }), [])

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
