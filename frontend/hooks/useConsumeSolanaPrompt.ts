import { useState, useCallback } from 'react'
import { Transaction, PublicKey, SystemProgram } from '@solana/web3.js'
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  NATIVE_MINT,
  createSyncNativeInstruction,
} from '@solana/spl-token'
import { useSolanaWallet, useSolanaConnection } from '@/hooks/useSolanaWallet'
import { NATIVE_SOL_MINT } from '@/constants/solana'
import { getTokenForCoinType } from '@/constants/tokens'
import { toast } from 'sonner'
import { type ConsumePromptApiResponse } from '@/types'
import { type AgentDetails } from './agents/useAllAgents'
import {
  buildRequestAttackInstruction,
  buildConsumePromptInstruction,
  buildConsumePromptMessage,
  buildEd25519VerifyInstruction,
  deriveAgentPda,
  deriveAttackPda,
  fetchEnclavePubkey,
  fetchProtocolWallet,
} from '@/lib/solana/program'

// Solana TEE returns a different response shape than Sui TEE
interface SolanaConsumePromptResponse {
  response: {
    intent: number
    timestamp: number // seconds (not ms like Sui)
    data: {
      agent_id: string
      success: boolean
      score: number
      attacker: number[]
      nonce: number
      message_hash: number[]
      agent_response?: string
      fun_response?: string
      jury_response?: string
    }
  }
  signature: string
}

interface UseConsumeSolanaPromptOptions {
  onError?: (error: Error) => void
  onApiSuccess?: (response: ConsumePromptApiResponse) => void
  onComplete?: (args: {
    apiResponse: ConsumePromptApiResponse
    transactionDigest: string
  }) => void
  showToasts?: boolean
}

// Convert Solana TEE response to the shared ConsumePromptApiResponse format
function toConsumePromptApiResponse(solana: SolanaConsumePromptResponse): ConsumePromptApiResponse {
  return {
    response: {
      intent: solana.response.intent,
      timestamp_ms: solana.response.timestamp * 1000,
      data: {
        agent_id: solana.response.data.agent_id,
        success: solana.response.data.success,
        score: solana.response.data.score,
        agent_response: solana.response.data.agent_response ?? '',
        fun_response: solana.response.data.fun_response ?? '',
        jury_response: solana.response.data.jury_response ?? '',
      },
    },
    signature: solana.signature,
  }
}

interface ConsumePromptParams {
  agentDetails: AgentDetails
  message: string
}

export const useConsumeSolanaPrompt = (options: UseConsumeSolanaPromptOptions = {}) => {
  const { onError, onApiSuccess, onComplete, showToasts = true } = options

  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<any>(null)

  const { publicKey, sendTransaction } = useSolanaWallet()
  const { connection } = useSolanaConnection()

  // Step 1: Request attack on-chain — creates Attack PDA, pays fees
  const requestAttack = async (agentDetails: AgentDetails): Promise<{ attackPda: string; nonce: bigint }> => {
    if (!publicKey) throw new Error('Solana wallet not connected')

    const agentId = agentDetails.agent_id
    // Solana agents store token_mint as coin_type
    const token = getTokenForCoinType(agentDetails.coin_type)
    const tokenMint = new PublicKey(token.coinType)
    const isNativeSol = token.coinType === NATIVE_SOL_MINT

    // Generate random nonce
    const nonce = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER))

    // Get or create attacker's ATA
    const attackerAta = await getAssociatedTokenAddress(tokenMint, publicKey)

    // Fetch protocol wallet from on-chain config
    const protocolWallet = await fetchProtocolWallet(connection)
    const protocolWalletAta = await getAssociatedTokenAddress(tokenMint, protocolWallet)

    const tx = new Transaction()

    // If native SOL, ensure wrapped SOL ATAs exist (attacker's and protocol wallet's)
    if (isNativeSol) {
      const [ataInfo, protocolWalletAtaInfo] = await Promise.all([
        connection.getAccountInfo(attackerAta),
        connection.getAccountInfo(protocolWalletAta),
      ])
      if (!ataInfo) {
        tx.add(createAssociatedTokenAccountInstruction(publicKey, attackerAta, publicKey, NATIVE_MINT))
      }
      if (!protocolWalletAtaInfo) {
        tx.add(createAssociatedTokenAccountInstruction(publicKey, protocolWalletAta, protocolWallet, NATIVE_MINT))
      }

      // Transfer enough SOL to cover the cost + buffer for dynamic pricing
      const costInBaseUnits = BigInt(agentDetails.current_cost_per_message ?? agentDetails.cost_per_message)
      // Add 10% buffer for dynamic cost fluctuation
      const transferAmount = costInBaseUnits + costInBaseUnits / BigInt(10)

      tx.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: attackerAta,
          lamports: transferAmount,
        })
      )
      tx.add(createSyncNativeInstruction(attackerAta))
    }

    const requestAttackIx = await buildRequestAttackInstruction({
      agentId,
      nonce,
      agentTokenMint: tokenMint,
      attacker: publicKey,
      attackerTokenAccount: attackerAta,
      protocolWallet,
      protocolWalletTokenAccount: protocolWalletAta,
    })
    tx.add(requestAttackIx)

    tx.feePayer = publicKey
    const latestBlockhash = await connection.getLatestBlockhash('confirmed')
    tx.recentBlockhash = latestBlockhash.blockhash

    const signature = await sendTransaction(tx, connection)
    const confirmation = await connection.confirmTransaction(
      { signature, blockhash: latestBlockhash.blockhash, lastValidBlockHeight: latestBlockhash.lastValidBlockHeight },
      'confirmed'
    )

    if (confirmation.value.err) {
      throw new Error(`request_attack transaction failed: ${JSON.stringify(confirmation.value.err)}`)
    }

    const agentPda = deriveAgentPda(agentId)
    const attackPda = deriveAttackPda(agentPda, publicKey, nonce)

    return { attackPda: attackPda.toBase58(), nonce }
  }

  // Step 2: Call Solana TEE consume prompt API (with retry for RPC propagation delay)
  const callConsumePromptApi = async (
    agentId: string,
    message: string,
    attackAccountPubkey: string
  ): Promise<SolanaConsumePromptResponse> => {
    const maxRetries = 6
    const retryDelayMs = 5000

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const response = await fetch('/api/solana/consume-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: `${agentId}`,
          message,
          attack_account_pubkey: attackAccountPubkey,
        }),
      })

      if (response.ok) {
        const apiResponse: SolanaConsumePromptResponse = await response.json()
        onApiSuccess?.(toConsumePromptApiResponse(apiResponse))
        return apiResponse
      }

      const errBody = await response.json().catch(() => ({}))
      const errorMsg = errBody.error || `API request failed: ${response.status}`

      // "already been used" means the TEE already evaluated this attack_account_pubkey
      // in a previous attempt but we didn't get the response. This is not recoverable
      // for this attack — we need to abort and let the user retry (new request_attack).
      const isAlreadyUsed = errorMsg.includes('already been used')
      if (isAlreadyUsed) {
        throw new Error(
          'The TEE already processed this attack but the response was lost due to RPC delay. ' +
          'Please try again — a new attack ticket will be created.'
        )
      }

      // Retry on "does not exist" errors (RPC propagation delay between our node and TEE's node)
      const isNotFoundError = errorMsg.includes('does not exist') || errorMsg.includes('not found')
      if (isNotFoundError && attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelayMs))
        continue
      }

      throw new Error(errorMsg)
    }

    throw new Error('Failed to call consume prompt API after retries')
  }

  // Step 3: Execute consume_prompt on-chain with Ed25519 verification
  const executeConsumePrompt = async (
    agentDetails: AgentDetails,
    apiResponse: SolanaConsumePromptResponse,
    nonce: bigint
  ): Promise<string> => {
    if (!publicKey) throw new Error('Solana wallet not connected')

    const { response: apiData } = apiResponse
    const token = getTokenForCoinType(agentDetails.coin_type)
    const tokenMint = new PublicKey(token.coinType)
    const attackerAta = await getAssociatedTokenAddress(tokenMint, publicKey)

    // Fetch enclave pubkey
    const enclavePubkey = await fetchEnclavePubkey(connection)

    // Solana TEE returns timestamp in seconds (not ms)
    const timestampSec = BigInt(apiData.timestamp)
    // Use the message_hash from TEE response (must match what was signed)
    const messageHash = new Uint8Array(apiData.data.message_hash)
    const signatureBytes = Buffer.from(apiResponse.signature, 'hex')

    const consumePromptMsg = buildConsumePromptMessage({
      timestamp: timestampSec,
      agentId: apiData.data.agent_id,
      success: apiData.data.success,
      score: BigInt(apiData.data.score),
      attacker: publicKey,
      nonce,
      messageHash,
    })

    const tx = new Transaction()

    // Ed25519 signature verification pre-instruction
    const ed25519Ix = buildEd25519VerifyInstruction({
      enclavePubkey,
      message: consumePromptMsg,
      signature: signatureBytes,
    })
    tx.add(ed25519Ix)

    // consume_prompt instruction
    const consumePromptIx = await buildConsumePromptInstruction({
      agentId: apiData.data.agent_id,
      success: apiData.data.success,
      score: BigInt(apiData.data.score),
      messageHash,
      timestamp: timestampSec,
      signature: signatureBytes,
      attacker: publicKey,
      attackerTokenAccount: attackerAta,
      attackNonce: nonce,
    })
    tx.add(consumePromptIx)

    tx.feePayer = publicKey
    const latestBlockhash = await connection.getLatestBlockhash('confirmed')
    tx.recentBlockhash = latestBlockhash.blockhash

    const txSignature = await sendTransaction(tx, connection)
    const confirmation = await connection.confirmTransaction(
      { signature: txSignature, blockhash: latestBlockhash.blockhash, lastValidBlockHeight: latestBlockhash.lastValidBlockHeight },
      'confirmed'
    )

    if (confirmation.value.err) {
      throw new Error(`consume_prompt transaction failed: ${JSON.stringify(confirmation.value.err)}`)
    }

    return txSignature
  }

  // Main orchestrator
  const consumePrompt = useCallback(
    async ({ agentDetails, message }: ConsumePromptParams) => {
      if (!publicKey) {
        const errorMsg = 'Solana wallet not connected'
        setError(errorMsg)
        if (showToasts) toast.error(errorMsg)
        return
      }

      if (!agentDetails?.agent_id || !message?.trim()) {
        const errorMsg = 'Invalid agent ID or message'
        setError(errorMsg)
        if (showToasts) toast.error(errorMsg)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Step 1: Request attack on-chain
        setCurrentStep('Requesting attack ticket...')
        if (showToasts) toast.info('Processing payment...')
        const { attackPda, nonce } = await requestAttack(agentDetails)

        // Wait for the attack PDA to propagate to the TEE's RPC node
        setCurrentStep('Waiting for network confirmation...')
        await new Promise(resolve => setTimeout(resolve, 15000))

        // Step 2: Call TEE API
        setCurrentStep('Processing prompt...')
        if (showToasts) toast.info('Processing prompt...')
        const apiResponse = await callConsumePromptApi(
          agentDetails.agent_id,
          message,
          attackPda
        )

        // Step 3: Execute consume_prompt on-chain
        setCurrentStep('Finalizing transaction...')
        if (showToasts) toast.info('Finalizing transaction...')
        const txSignature = await executeConsumePrompt(agentDetails, apiResponse, nonce)

        if (showToasts) {
          if (apiResponse.response.data.success) {
            toast.success('Agent defeated! You won the challenge!')
          } else {
            toast.success('Prompt processed successfully')
          }
        }

        const normalizedResponse = toConsumePromptApiResponse(apiResponse)
        setLastResult(txSignature)
        onComplete?.({ apiResponse: normalizedResponse, transactionDigest: txSignature })

        setCurrentStep('')
        return txSignature
      } catch (err) {
        console.error('Error in Solana consume prompt process:', err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to consume prompt'
        setError(errorMessage)
        if (showToasts) toast.error(errorMessage)

        const finalError = err instanceof Error ? err : new Error(errorMessage)
        onError?.(finalError)
        throw finalError
      } finally {
        setIsLoading(false)
        setCurrentStep('')
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [publicKey, connection, sendTransaction, onError, onApiSuccess, onComplete, showToasts]
  )

  const reset = useCallback(() => {
    setError(null)
    setLastResult(null)
    setCurrentStep('')
  }, [])

  return {
    consumePrompt,
    isLoading,
    currentStep,
    error,
    lastResult,
    reset,
    isConnected: !!publicKey,
  }
}
