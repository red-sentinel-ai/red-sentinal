import { messageWithIntent, toSerializedSignature } from '@mysten/sui/cryptography'
import { publicKeyFromRawBytes } from '@mysten/sui/verify'
import { Transaction } from '@mysten/sui/transactions'
import { SuiClient, SuiTransactionBlockResponse } from '@mysten/sui/client'

interface PrivySuiWallet {
  id: string
  address: string
  publicKey: string
  sign: (params: { hash: string }) => Promise<string>
}

export async function signAndExecuteWithPrivy(
  tx: Transaction,
  client: SuiClient,
  privyWallet: PrivySuiWallet,
  options?: {
    showRawEffects?: boolean
    showObjectChanges?: boolean
  }
): Promise<SuiTransactionBlockResponse> {
  // Set sender address
  tx.setSender(privyWallet.address)

  // 1. Build transaction bytes
  const rawBytes = await tx.build({ client })

  // 2. Create intent message (Sui-specific)
  const intentMessage = messageWithIntent('TransactionData', rawBytes)
  const bytes = Buffer.from(intentMessage).toString('hex')

  // 3. Sign with Privy raw sign (blake2b256 hash)
  const signatureHex = await privyWallet.sign({
    hash: `0x${bytes}`,
  })

  // 4. Decode signature and public key
  const rawSignature = Buffer.from(signatureHex.slice(2), 'hex')
  const publicKey = publicKeyFromRawBytes('ED25519', Buffer.from(privyWallet.publicKey, 'hex'))

  // 5. Create serialized signature
  const txSignature = toSerializedSignature({
    signature: rawSignature,
    signatureScheme: 'ED25519',
    publicKey,
  })

  // 6. Execute transaction
  return client.executeTransactionBlock({
    transactionBlock: rawBytes,
    signature: txSignature,
    options: {
      showRawEffects: options?.showRawEffects ?? true,
      showObjectChanges: options?.showObjectChanges ?? true,
    },
  })
}
