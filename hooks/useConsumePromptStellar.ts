'use client'

import { useState, useCallback } from 'react'
import { toast } from '@/lib/toast'
import { type ConsumePromptApiResponse } from '@/types'
import { type Agent } from '@/types/agents'
import {
  fetchStellarEffectiveCost,
  stellarInvoke,
  type StellarSigner,
} from '@/lib/stellar/client'
import { useStellarWallet } from './useStellarWallet'

// Stellar TEE response — same Ed25519 scheme as Solana (timestamps in seconds).
interface StellarConsumePromptResponse {
  response: {
    intent: number
    timestamp: number
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

// Convert the Stellar TEE response to the shared ConsumePromptApiResponse format
function toConsumePromptApiResponse(
  stellar: StellarConsumePromptResponse
): ConsumePromptApiResponse {
  return {
    response: {
      intent: stellar.response.intent,
      timestamp_ms: stellar.response.timestamp * 1000,
      data: {
        agent_id: stellar.response.data.agent_id,
        success: stellar.response.data.success,
        score: stellar.response.data.score,
        agent_response: stellar.response.data.agent_response ?? '',
        fun_response: stellar.response.data.fun_response ?? '',
        jury_response: stellar.response.data.jury_response ?? '',
      },
    },
    signature: stellar.signature,
  }
}

interface UseConsumeStellarPromptOptions {
  onError?: (error: Error) => void
  onApiSuccess?: (response: ConsumePromptApiResponse) => void
  onComplete?: (args: {
    apiResponse: ConsumePromptApiResponse
    transactionDigest: string
  }) => void
  showToasts?: boolean
}

interface ConsumePromptParams {
  agentDetails: Agent
  message: string
}

export const useConsumePromptStellar = (options: UseConsumeStellarPromptOptions = {}) => {
  const { onError, onApiSuccess, onComplete, showToasts = true } = options

  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<any>(null)

  const { address, signTransaction } = useStellarWallet()

  const getSigner = (): StellarSigner => {
    if (!address || !signTransaction) throw new Error('Stellar wallet not connected')
    return { address, signTransaction }
  }

  // Step 1: request_attack on-chain — pays the effective cost, creates the attack record
  const requestAttack = async (
    agentDetails: Agent,
    signer: StellarSigner
  ): Promise<bigint> => {
    const agentId = agentDetails.agent_id

    const effectiveCost = await fetchStellarEffectiveCost(agentId)
    // The contract charges the dynamic cost; a stale read just means the tx
    // pays slightly more than needed is impossible — it re-validates on-chain.
    if (effectiveCost <= BigInt(0)) throw new Error('Invalid effective cost for agent')

    const nonce = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER))
    await stellarInvoke(signer, 'request_attack', {
      attacker: signer.address,
      agent_id: agentId,
      nonce,
    })
    return nonce
  }

  // Step 2: call the Stellar TEE consume prompt API (retry for RPC propagation)
  const callConsumePromptApi = async (
    agentId: string,
    message: string,
    nonce: bigint
  ): Promise<StellarConsumePromptResponse> => {
    const maxRetries = 6
    const retryDelayMs = 5000

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const response = await fetch('/api/consume-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chain: 'stellar',
          agent_id: `${agentId}`,
          message,
          attack_nonce: nonce.toString(),
          attacker: address,
        }),
      })

      if (response.ok) {
        const apiResponse: StellarConsumePromptResponse = await response.json()
        onApiSuccess?.(toConsumePromptApiResponse(apiResponse))
        return apiResponse
      }

      const errBody = await response.json().catch(() => ({}))
      const errorMsg = errBody.error || `API request failed: ${response.status}`

      const isAlreadyUsed = errorMsg.includes('already been used')
      if (isAlreadyUsed) {
        throw new Error(
          'The TEE already processed this attack but the response was lost due to RPC delay. ' +
          'Please try again — a new attack ticket will be created.'
        )
      }

      const isNotFoundError = errorMsg.includes('does not exist') || errorMsg.includes('not found')
      if (isNotFoundError && attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelayMs))
        continue
      }

      throw new Error(errorMsg)
    }

    throw new Error('Failed to call consume prompt API after retries')
  }

  // Step 3: consume_prompt on-chain with the enclave verdict
  const executeConsumePrompt = async (
    apiResponse: StellarConsumePromptResponse,
    nonce: bigint,
    signer: StellarSigner
  ): Promise<string> => {
    const { response: apiData } = apiResponse

    return stellarInvoke(signer, 'consume_prompt', {
      attacker: signer.address,
      agent_id: apiData.data.agent_id,
      nonce,
      success: apiData.data.success,
      score: BigInt(apiData.data.score),
      message_hash: Uint8Array.from(apiData.data.message_hash),
      timestamp: BigInt(apiData.timestamp),
      signature: Uint8Array.from(Buffer.from(apiResponse.signature, 'hex')),
    })
  }

  // Main orchestrator
  const consumePrompt = useCallback(
    async ({ agentDetails, message }: ConsumePromptParams) => {
      if (!address) {
        const errorMsg = 'Stellar wallet not connected'
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
        const signer = getSigner()

        // Step 1: Request attack on-chain
        setCurrentStep('Requesting attack ticket...')
        if (showToasts) toast.info('Processing payment...')
        const nonce = await requestAttack(agentDetails, signer)

        // Wait for the attack record to propagate to the TEE's RPC node
        setCurrentStep('Waiting for network confirmation...')
        await new Promise(resolve => setTimeout(resolve, 10000))

        // Step 2: Call TEE API
        setCurrentStep('Processing prompt...')
        if (showToasts) toast.info('Processing prompt...')
        const apiResponse = await callConsumePromptApi(
          agentDetails.agent_id,
          message,
          nonce
        )

        // Step 3: Execute consume_prompt on-chain
        setCurrentStep('Finalizing transaction...')
        if (showToasts) toast.info('Finalizing transaction...')
        const txHash = await executeConsumePrompt(apiResponse, nonce, signer)

        if (showToasts) {
          if (apiResponse.response.data.success) {
            toast.success('Agent defeated! You won the challenge!')
          } else {
            toast.success('Prompt processed successfully')
          }
        }

        const normalizedResponse = toConsumePromptApiResponse(apiResponse)
        setLastResult(txHash)
        onComplete?.({ apiResponse: normalizedResponse, transactionDigest: txHash })

        setCurrentStep('')
        return txHash
      } catch (err) {
        console.error('Error in Stellar consume prompt process:', err)
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
    [address, signTransaction, onError, onApiSuccess, onComplete, showToasts]
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
    isConnected: !!address,
  }
}
