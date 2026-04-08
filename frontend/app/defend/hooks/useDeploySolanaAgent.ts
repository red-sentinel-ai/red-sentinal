import {
  Transaction,
  PublicKey,
  Connection,
} from '@solana/web3.js'
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  NATIVE_MINT,
  createSyncNativeInstruction,
} from '@solana/spl-token'
import { useSolanaWallet, useSolanaConnection } from '@/hooks/useSolanaWallet'
import { NATIVE_SOL_MINT } from '@/constants/solana'
import { type SupportedToken } from '@/constants'
import {
  buildRegisterAgentInstruction,
  buildInitAgentVaultsInstruction,
  buildFundAgentInstruction,
  buildEd25519VerifyInstruction,
  buildRegisterAgentMessage,
  deriveProtocolConfigPda,
  deriveAgentPda,
} from '@/lib/solana/program'
import type { DefendFormData } from './useDefendForm'
import type { ChainDeployHook, SolanaTeeResponse, DeployTransactionResult } from '../types'

interface UseDeploySolanaAgentOptions {
  formData: DefendFormData
  selectedSolanaToken: SupportedToken
}

export function useDeploySolanaAgent({
  formData,
  selectedSolanaToken,
}: UseDeploySolanaAgentOptions): ChainDeployHook {
  const { publicKey, sendTransaction } = useSolanaWallet()
  const { connection } = useSolanaConnection()

  const fetchEnclavePubkey = async (conn: Connection): Promise<Uint8Array> => {
    const protocolConfigPda = deriveProtocolConfigPda()
    const accountInfo = await conn.getAccountInfo(protocolConfigPda)
    if (!accountInfo) throw new Error('Protocol config account not found on Solana')

    // Parse ProtocolConfig account data (Anchor 8-byte discriminator + fields)
    // Layout after 8-byte discriminator:
    //   admin: 32 bytes (Pubkey)
    //   protocol_wallet: 32 bytes (Pubkey)
    //   agent_balance_fee: 8 bytes (u64)
    //   creator_fee: 8 bytes (u64)
    //   protocol_fee: 8 bytes (u64)
    //   enclave_pubkey: 1 byte (Option tag) + 32 bytes ([u8; 32])
    const data = accountInfo.data
    const enclaveOptionOffset = 8 + 32 + 32 + 8 + 8 + 8 // = 96
    const hasEnclave = data[enclaveOptionOffset] === 1
    if (!hasEnclave) throw new Error('Enclave public key not set in Solana protocol config')

    return Uint8Array.from(data.subarray(enclaveOptionOffset + 1, enclaveOptionOffset + 1 + 32))
  }

  const executeTransaction = async (
    teeResponse: SolanaTeeResponse
  ): Promise<DeployTransactionResult> => {
    if (!publicKey) throw new Error('Solana wallet not connected')

    const { response: teeData, signature: teeSignature } = teeResponse
    const { data } = teeData

    const tokenMint = new PublicKey(selectedSolanaToken.coinType)
    const isNativeSol = selectedSolanaToken.coinType === NATIVE_SOL_MINT

    // Fetch enclave pubkey from on-chain config
    const enclavePubkey = await fetchEnclavePubkey(connection)

    // Build the message that was signed by the enclave
    const promptHash = new Uint8Array(data.prompt_hash)
    const signatureBytes = Buffer.from(teeSignature, 'hex')

    const message = buildRegisterAgentMessage({
      intent: teeData.intent,
      timestamp: BigInt(teeData.timestamp),
      agentId: data.agent_id,
      costPerMessage: BigInt(data.cost_per_message),
      promptHash,
      creator: publicKey,
    })

    // === Transaction 1: Ed25519 verify + register_agent + init_agent_vaults ===
    const tx1 = new Transaction()

    // Ed25519 signature verification pre-instruction
    const ed25519Ix = buildEd25519VerifyInstruction({
      enclavePubkey,
      message,
      signature: signatureBytes,
    })
    tx1.add(ed25519Ix)

    // register_agent instruction
    const registerIx = await buildRegisterAgentInstruction({
      agentId: data.agent_id,
      costPerMessage: BigInt(data.cost_per_message),
      promptHash,
      timestamp: BigInt(teeData.timestamp),
      signature: signatureBytes,
      tokenMint,
      creator: publicKey,
    })
    tx1.add(registerIx)

    // init_agent_vaults instruction (combine into same transaction)
    const initVaultsIx = await buildInitAgentVaultsInstruction({
      agentId: data.agent_id,
      tokenMint,
      payer: publicKey,
    })
    tx1.add(initVaultsIx)

    tx1.feePayer = publicKey
    const { blockhash: blockhash1 } = await connection.getLatestBlockhash()
    tx1.recentBlockhash = blockhash1

    const tx1Signature = await sendTransaction(tx1, connection)
    await connection.confirmTransaction(tx1Signature, 'confirmed')

    // === Transaction 2: Fund agent (transfer tokens to vault) ===
    const fundAmount = BigInt(
      Math.floor(parseFloat(formData.initialBalance) * Math.pow(10, selectedSolanaToken.decimals))
    )

    if (fundAmount > BigInt(0)) {
      const tx2 = new Transaction()

      // Get or create the owner's associated token account
      const ownerAta = await getAssociatedTokenAddress(tokenMint, publicKey)

      if (isNativeSol) {
        // For native SOL, we need to:
        // 1. Create a wrapped SOL ATA if it doesn't exist
        // 2. Transfer SOL into it (sync native)
        // 3. Then fund the agent from the ATA
        const ownerAtaInfo = await connection.getAccountInfo(ownerAta)
        if (!ownerAtaInfo) {
          tx2.add(createAssociatedTokenAccountInstruction(publicKey, ownerAta, publicKey, NATIVE_MINT))
        }

        // Transfer SOL to the ATA and sync
        tx2.add(
          // SystemProgram.transfer
          {
            keys: [
              { pubkey: publicKey, isSigner: true, isWritable: true },
              { pubkey: ownerAta, isSigner: false, isWritable: true },
            ],
            programId: new PublicKey('11111111111111111111111111111111'),
            data: Buffer.concat([
              Buffer.from([2, 0, 0, 0]), // Transfer instruction index
              (() => {
                const buf = Buffer.alloc(8)
                buf.writeBigUInt64LE(fundAmount, 0)
                return buf
              })(),
            ]),
          }
        )
        tx2.add(createSyncNativeInstruction(ownerAta))
      }

      const fundIx = await buildFundAgentInstruction({
        agentId: data.agent_id,
        amount: fundAmount,
        ownerTokenAccount: ownerAta,
        owner: publicKey,
      })
      tx2.add(fundIx)

      tx2.feePayer = publicKey
      const { blockhash: blockhash2 } = await connection.getLatestBlockhash()
      tx2.recentBlockhash = blockhash2

      const tx2Signature = await sendTransaction(tx2, connection)
      await connection.confirmTransaction(tx2Signature, 'confirmed')
    }

    const agentPda = deriveAgentPda(data.agent_id)

    return {
      objectId: agentPda.toBase58(),
      digest: tx1Signature,
    }
  }

  return {
    walletAddress: publicKey?.toBase58() ?? null,
    executeTransaction,
  }
}
