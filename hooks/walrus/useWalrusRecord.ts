'use client'

import { useCallback } from 'react'
import { useCurrentAccount, useSignTransaction } from '@mysten/dapp-kit'
import { APP_NETWORK, SUI_SENTINEL_API_URL } from '@/constants'
import { useAuth } from '@/context/AuthContext'

export interface WalrusRecordResult {
  recordId: string
  blobId: string
  registerDigest: string
  certifyDigest: string
}

interface PrepareResponse {
  record_id: string
  blob_id: string
  tx_bytes: string
  sponsor_address: string
  gas_budget: number
}

interface ConfirmResponse {
  record_id: string
  register_digest: string
  /** Present in older responses; the async confirm returns status: 'processing'. */
  certify_tx_bytes?: string | null
  status?: string
}

interface StatusResponse {
  record_id: string
  status: string
  blob_id: string | null
  register_digest: string | null
  certify_tx_bytes: string | null
  error: string | null
}

interface CertifyResponse {
  record_id: string
  blob_id: string
  digest: string
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string; error?: string }
    if (body?.message) return body.message
    if (body?.error) return body.error
  } catch {
    // Fall through to the status text below.
  }
  return `Walrus record request failed (${response.status})`
}

/**
 * Stores an attack record on Walrus with the user's wallet as the blob owner,
 * using the backend's user-signed sponsored flow:
 *
 *   1. prepare  — backend builds the register transaction (sender = user,
 *                 gas owner = sponsor) and returns it for signing
 *   2. confirm  — user's signature is attached, the sponsor co-signs, the
 *                 register tx executes and slivers are uploaded to the
 *                 storage nodes; returns the certify transaction
 *   3. certify  — user signs the certificate, sponsor pays gas; the blob is
 *                 permanently stored and owned by the user's address
 *
 * Storage (WAL) is also sponsored: prepare tops the user's wallet up with
 * the storage + write cost from a sponsor-owned WAL coin, and the register
 * transaction pays Walrus from those coins. The user's wallet only needs to
 * be connected — no SUI or WAL required.
 */
export function useWalrusRecord() {
  const account = useCurrentAccount()
  const { user } = useAuth()
  const { mutateAsync: signTransaction } = useSignTransaction()

  const storeRecord = useCallback(
    async (attackId: string | null | undefined): Promise<WalrusRecordResult | null> => {
      if (!attackId || !account?.address || !user?.id) return null

      const base = `${SUI_SENTINEL_API_URL}/walrus/${APP_NETWORK}/records`
      const headers = {
        'Content-Type': 'application/json',
        'x-user-id': user.id,
      }

      // 1. Prepare — get the register transaction built for this wallet.
      const prepareResponse = await fetch(`${base}/prepare`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          attack_id: attackId,
          attacker_address: account.address,
        }),
      })
      if (!prepareResponse.ok) throw new Error(await readErrorMessage(prepareResponse))
      const prepared = (await prepareResponse.json()) as PrepareResponse

      // 2. Sign the register transaction and confirm — the sponsor co-signs,
      //    executes it, and responds immediately; the slivers upload + certify
      //    build run in the background.
      const { signature: registerSignature } = await signTransaction({
        transaction: prepared.tx_bytes,
        account,
      })
      const confirmResponse = await fetch(`${base}/${prepared.record_id}/confirm`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          sender: account.address,
          user_signature: registerSignature,
        }),
      })
      if (!confirmResponse.ok) throw new Error(await readErrorMessage(confirmResponse))
      const confirmed = (await confirmResponse.json()) as ConfirmResponse

      // 3. Wait for the background finalize (slivers → storage nodes, certify
      //    build), polling the status endpoint for the certify transaction.
      let certifyTxBytes = confirmed.certify_tx_bytes ?? null
      if (!certifyTxBytes) {
        const deadline = Date.now() + 120_000
        while (!certifyTxBytes && Date.now() < deadline) {
          await new Promise(resolve => setTimeout(resolve, 4_000))
          const statusResponse = await fetch(`${base}/${prepared.record_id}`, {
            credentials: 'include',
            headers,
          })
          if (!statusResponse.ok) throw new Error(await readErrorMessage(statusResponse))
          const status = (await statusResponse.json()) as StatusResponse
          if (status.status === 'failed') {
            throw new Error(status.error || 'Walrus record failed to finalize')
          }
          certifyTxBytes = status.certify_tx_bytes
        }
        if (!certifyTxBytes) {
          throw new Error('Walrus record finalize timed out — try again shortly')
        }
      }

      // 4. Sign the certify transaction and finalize.
      const { signature: certifySignature } = await signTransaction({
        transaction: certifyTxBytes,
        account,
      })
      const certifyResponse = await fetch(`${base}/${prepared.record_id}/certify`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({ user_signature: certifySignature }),
      })
      if (!certifyResponse.ok) throw new Error(await readErrorMessage(certifyResponse))
      const certified = (await certifyResponse.json()) as CertifyResponse

      return {
        recordId: certified.record_id,
        blobId: certified.blob_id,
        registerDigest: confirmed.register_digest,
        certifyDigest: certified.digest,
      }
    },
    [account, signTransaction, user?.id]
  )

  return { storeRecord }
}
