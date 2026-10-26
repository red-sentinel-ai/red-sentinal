'use client'

import { useCallback } from 'react'
import { useCurrentAccount, useSignTransaction, useSuiClient } from '@mysten/dapp-kit'
import { WalrusClient } from '@mysten/walrus'
import { Transaction } from '@mysten/sui/transactions'
import { toBase64 } from '@mysten/sui/utils'
import type { SuiTransactionBlockResponse } from '@mysten/sui/jsonRpc'
import { APP_NETWORK, SUI_SENTINEL_API_URL } from '@/constants'
import { SUI_COIN_TYPE } from '@/constants/tokens'
import { useAuth } from '@/context/AuthContext'

export interface WalrusRecordResult {
  blobId: string
  registerDigest: string
  certifyDigest: string
}

export type WalrusStorageStep =
  | 'fetching'
  | 'encoding'
  | 'registering'
  | 'uploading'
  | 'certifying'
  | 'finalizing'

export const WALRUS_STEP_LABELS: Record<WalrusStorageStep, string> = {
  fetching: 'Fetching attack record…',
  encoding: 'Encoding blob…',
  registering: 'Sign the register transaction in your wallet…',
  uploading: 'Uploading to Walrus storage nodes…',
  certifying: 'Sign the certify transaction in your wallet…',
  finalizing: 'Verifying and linking the record…',
}

interface RecordPayloadResponse {
  attack_id: string
  sentinel_id: number
  epochs: number
  blob_bytes: string
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

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

/**
 * Per-network Walrus clients, each bound to the dapp-kit Sui client so all
 * RPC traffic goes through the app's retrying transport.
 */
const walrusClients: Partial<Record<string, WalrusClient>> = {}

function getWalrusClient(suiClient: ReturnType<typeof useSuiClient>): WalrusClient {
  const cached = walrusClients[APP_NETWORK]
  if (cached) return cached
  const client = new WalrusClient({ network: APP_NETWORK, suiClient })
  walrusClients[APP_NETWORK] = client
  return client
}

/**
 * Sign a transaction with the connected wallet and execute it (the wallet is
 * sender and gas payer — gas comes from its own coins at build time).
 */
async function signAndExecute(options: {
  transaction: Transaction
  suiClient: ReturnType<typeof useSuiClient>
  account: NonNullable<ReturnType<typeof useCurrentAccount>>
  signTransaction: ReturnType<typeof useSignTransaction>['mutateAsync']
}): Promise<SuiTransactionBlockResponse> {
  const { transaction, suiClient, account, signTransaction } = options

  transaction.setSender(account.address)
  let bytes: Uint8Array
  try {
    bytes = await transaction.build({ client: suiClient })
  } catch (error) {
    if (error instanceof Error && error.message.includes('No valid gas coins found')) {
      throw new Error(
        `No SUI gas coins found for ${account.address} on ${APP_NETWORK}. Claim SUI gas credit from your profile or fund your wallet with SUI, and check your wallet is connected to ${APP_NETWORK}.`
      )
    }
    throw error
  }
  const txBytes = toBase64(bytes)
  const { signature } = await signTransaction({ transaction: txBytes, account })

  return suiClient.executeTransactionBlock({
    transactionBlock: txBytes,
    signature,
    options: { showEffects: true, showObjectChanges: true },
  })
}

/**
 * Stores an attack record on Walrus entirely from the browser:
 *
 *   1. fetch    — backend returns the exact canonical record bytes for the
 *                 attack (server-authoritative content)
 *   2. encode   — blob encoding happens locally
 *   3. register — the wallet signs and pays the register transaction
 *                 (reserve_space + register_blob, WAL storage fee)
 *   4. upload   — slivers go to the Walrus storage nodes from this connection
 *   5. certify  — the wallet signs and pays the certify transaction
 *   6. finalize — the backend reads the blob back, verifies its content
 *                 against the canonical record, and links it to the attack
 *
 * The wallet pays the SUI gas and the WAL storage + write fees from its own
 * balance; Walrus or SUI credit claimed on the profile is the expected source.
 * There is no server-side resume — an interrupted flow is simply re-run
 * (encoding is deterministic).
 */
export function useWalrusRecord() {
  const account = useCurrentAccount()
  const suiClient = useSuiClient()
  const { user } = useAuth()
  const { mutateAsync: signTransaction } = useSignTransaction()

  const storeRecord = useCallback(
    async (
      attackId: string | null | undefined,
      onStep?: (step: WalrusStorageStep) => void
    ): Promise<WalrusRecordResult | null> => {
      if (!attackId || !account?.address || !user?.id) return null

      const base = `${SUI_SENTINEL_API_URL}/walrus/${APP_NETWORK}/records`
      const walrus = getWalrusClient(suiClient)

      // 1. Fetch the canonical record bytes for this attack.
      onStep?.('fetching')
      const payloadResponse = await fetch(
        `${base}/${attackId}/payload?attacker_address=${encodeURIComponent(account.address)}`,
        { credentials: 'include' }
      )
      if (!payloadResponse.ok) throw new Error(await readErrorMessage(payloadResponse))
      const payload = (await payloadResponse.json()) as RecordPayloadResponse
      const blob = base64ToBytes(payload.blob_bytes)

      // 2. Encode the blob locally.
      onStep?.('encoding')
      const encoded = await walrus.encodeBlob(blob)

      // Storage fees are paid from the wallet's own WAL. Check up front so a
      // missing balance surfaces as guidance instead of a raw build failure.
      const storageCost = await walrus.storageCost(blob.length, payload.epochs)
      const balances = await suiClient.getAllBalances({ owner: account.address })
      const walBalance = balances.find(balance =>
        balance.coinType.toLowerCase().endsWith('::wal::wal')
      )
      const walAvailable = BigInt(walBalance?.totalBalance ?? 0)
      const formatWal = (base: bigint) => `${Number(base) / 1e9} WAL`
      if (walAvailable < storageCost.totalCost) {
        throw new Error(
          `Your wallet holds ${formatWal(walAvailable)} WAL but the record needs ${formatWal(storageCost.totalCost)} for Walrus storage fees. Claim the Walrus usage credit on your profile or fund your wallet with WAL and try again.`
        )
      }

      // 3. Sign and pay the register transaction (reserve_space +
      //    register_blob in one transaction; the blob is owned by the wallet).
      onStep?.('registering')
      const registerTx = walrus.registerBlobTransaction({
        size: blob.length,
        epochs: payload.epochs,
        blobId: encoded.blobId,
        rootHash: encoded.rootHash,
        deletable: false,
        owner: account.address,
      })
      const registerResult = await signAndExecute({
        transaction: registerTx,
        suiClient,
        account,
        signTransaction,
      })
      if (registerResult.effects?.status?.status !== 'success') {
        throw new Error(
          `Walrus register transaction failed: ${registerResult.effects?.status?.error ?? 'unknown error'}`
        )
      }
      const blobType = await walrus.getBlobType()
      const blobObject = registerResult.objectChanges?.find(
        (obj: any) =>
          obj.type === 'created' &&
          typeof obj.objectType === 'string' &&
          obj.objectType.toLowerCase() === blobType.toLowerCase()
      ) as { objectId?: string } | undefined
      if (!blobObject?.objectId) {
        throw new Error('Blob object not found in register transaction effects')
      }

      // 4. Upload the slivers to the Walrus storage nodes.
      onStep?.('uploading')
      const confirmations = await walrus.writeEncodedBlobToNodes({
        blobId: encoded.blobId,
        objectId: blobObject.objectId,
        metadata: encoded.metadata,
        sliversByNode: encoded.sliversByNode,
        deletable: false,
      })
      const certificate = await walrus.certificateFromConfirmations({
        confirmations,
        blobId: encoded.blobId,
        blobObjectId: blobObject.objectId,
        deletable: false,
      })

      // 5. Sign and pay the certify transaction — the blob is then permanent.
      onStep?.('certifying')
      const certifyTx = walrus.certifyBlobTransaction({
        certificate,
        blobId: encoded.blobId,
        blobObjectId: blobObject.objectId,
        deletable: false,
      })
      const certifyResult = await signAndExecute({
        transaction: certifyTx,
        suiClient,
        account,
        signTransaction,
      })
      if (certifyResult.effects?.status?.status !== 'success') {
        throw new Error(
          `Walrus certify transaction failed: ${certifyResult.effects?.status?.error ?? 'unknown error'}`
        )
      }

      // 6. The backend verifies the stored blob against the canonical record
      //    and links it to the attack doc.
      onStep?.('finalizing')
      const finalizeResponse = await fetch(
        `${base}/${attackId}/finalize?attacker_address=${encodeURIComponent(account.address)}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blob_id: encoded.blobId,
            register_digest: registerResult.digest,
            certify_digest: certifyResult.digest,
          }),
        }
      )
      if (!finalizeResponse.ok) throw new Error(await readErrorMessage(finalizeResponse))

      return {
        blobId: encoded.blobId,
        registerDigest: registerResult.digest,
        certifyDigest: certifyResult.digest,
      }
    },
    [account, signTransaction, suiClient, user?.id]
  )

  return { storeRecord }
}
