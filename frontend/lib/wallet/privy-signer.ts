import { messageWithIntent, toSerializedSignature } from '@mysten/sui/cryptography'
import { publicKeyFromRawBytes } from '@mysten/sui/verify'
import { Transaction } from '@mysten/sui/transactions'
import { SuiClient, SuiTransactionBlockResponse } from '@mysten/sui/client'
import { base58 } from '@scure/base'

interface PrivySuiWallet {
  address: string
  publicKey: string // base58 encoded public key from Privy
  rawSign: (hash: string) => Promise<string>
}

export async function signAndExecuteWithPrivy(
  tx: Transaction,
  client: SuiClient,
  wallet: PrivySuiWallet
): Promise<SuiTransactionBlockResponse> {
  // Set sender address
  tx.setSender(wallet.address)

  // 1. Build transaction bytes
  const rawBytes = await tx.build({ client })

  // 2. Create intent message (Sui-specific)
  // The intent message is what gets signed - it's the transaction data prefixed with intent bytes
  const intentMessage = messageWithIntent('TransactionData', rawBytes)
  const bytes = Buffer.from(intentMessage).toString('hex')

  // 3. Sign with Privy raw sign
  // Privy's raw_sign expects the hash as hex with 0x prefix
  const signatureHex = await wallet.rawSign(`0x${bytes}`)

  // 4. Decode signature and public key
  // Remove 0x prefix if present and convert to Uint8Array
  const rawSignature = new Uint8Array(
    Buffer.from(signatureHex.startsWith('0x') ? signatureHex.slice(2) : signatureHex, 'hex')
  )

  // Decode public key from base58
  const publicKey = publicKeyFromRawBytes('ED25519', base58.decode(wallet.publicKey))

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
      showRawEffects: true,
      showObjectChanges: true,
    },
  })
}
