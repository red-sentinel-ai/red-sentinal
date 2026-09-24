'use client'

import { useState, useCallback } from 'react'
import { decodeEventLog, type PublicClient } from 'viem'
import { toast } from 'sonner'
import { SENTINEL_ABI, ERC20_ABI } from '@/lib/evm/abi'
import { toReadableEvmError } from '@/lib/evm/errors'
import { buildEvmSignature, bytesToHex32 } from '@/lib/evm/signature'
import { isNativeToken } from '@/lib/evm/native-token'
import { useEvmContractWriter } from '@/hooks/evm/useEvmContractWriter'
import type { ConsumePromptApiResponse } from '@/types'
import type { Agent } from '@/types/agents'

interface EvmConsumePromptResponse {
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
      agent_response: string
      jury_response: string
    }
  }
  signature: string
  recovery_id: number
}

interface UseConsumeEvmPromptOptions {
  onError?: (error: Error) => void
  onComplete?: (args: { apiResponse: ConsumePromptApiResponse; transactionDigest: string }) => void
  showToasts?: boolean
}

interface ConsumeEvmPromptParams {
  agentDetails: Agent
  message: string
}

const PAYMENT_BUFFER_PERCENT = 101n

export function useConsumePromptEVM({
  onError,
  onComplete,
  showToasts = true,
}: UseConsumeEvmPromptOptions = {}) {
  const {
    walletAddress,
    requireEvmConfig,
    intendedChainId,
    publicClient,
    writeContract,
    writeContractAndWait,
  } = useEvmContractWriter()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const consumePrompt = useCallback(
    async ({ agentDetails, message }: ConsumeEvmPromptParams) => {
      setIsLoading(true)
      setError(null)

      try {
        if (!publicClient) throw new Error('No public client available')

        const { contractAddress } = requireEvmConfig()
        const tokenAddress = (agentDetails.coin_type ?? '') as `0x${string}`
        const isNativePayment = isNativeToken(tokenAddress)

        const effectiveCost = (await publicClient.readContract({
          address: contractAddress,
          abi: SENTINEL_ABI,
          functionName: 'getEffectiveCost',
          args: [agentDetails.agent_id],
        } as any)) as bigint
        const paymentAmount = (effectiveCost * PAYMENT_BUFFER_PERCENT) / 100n

        if (!isNativePayment) {
          if (showToasts) toast.info('Approving payment...')
          await writeContractAndWait({
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [contractAddress, paymentAmount],
          })
        }

        if (showToasts) toast.info('Processing payment...')
        const attackTxHash = await writeContract({
          address: contractAddress,
          abi: SENTINEL_ABI,
          functionName: 'requestAttack',
          args: [agentDetails.agent_id, paymentAmount],
          value: isNativePayment ? paymentAmount : undefined,
        })

        const attackId = await waitForAttackId(publicClient as PublicClient, attackTxHash)

        if (showToasts) toast.info('Processing prompt...')
        const teeResponse = await fetch('/api/consume-prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chain: agentDetails.chain,
            agent_id: String(agentDetails.agent_id),
            message,
            attack_id: Number(attackId),
            attacker: walletAddress,
            chainId: intendedChainId,
          }),
        })

        if (!teeResponse.ok) {
          throw new Error(`TEE error: ${await teeResponse.text()}`)
        }

        const teeData: EvmConsumePromptResponse = await teeResponse.json()
        const { data: attackResult } = teeData.response

        if (showToasts) toast.info('Finalizing transaction...')
        const consumeTxHash = await writeContract({
          address: contractAddress,
          abi: SENTINEL_ABI,
          functionName: 'consumePrompt',
          args: [
            attackResult.agent_id,
            attackResult.success,
            bytesToHex32(attackResult.message_hash),
            attackResult.score,
            BigInt(teeData.response.timestamp),
            buildEvmSignature(teeData.signature, teeData.recovery_id),
            attackId,
          ],
        })

        const apiResponse: ConsumePromptApiResponse = {
          signature: teeData.signature,
          response: {
            intent: teeData.response.intent,
            timestamp_ms: teeData.response.timestamp,
            data: {
              agent_id: attackResult.agent_id,
              success: attackResult.success,
              score: attackResult.score,
              agent_response: attackResult.agent_response,
              jury_response: attackResult.jury_response,
              fun_response: '',
            },
          },
        }

        if (showToasts) {
          toast.success(
            attackResult.success
              ? 'Agent defeated! You won the challenge!'
              : 'Prompt processed successfully'
          )
        }

        onComplete?.({ apiResponse, transactionDigest: consumeTxHash })
        return consumeTxHash
      } catch (err) {
        const message = toReadableEvmError(err, 'Failed to consume prompt')
        setError(message)
        if (showToasts) toast.error(message)
        const final = err instanceof Error ? err : new Error(message)
        onError?.(final)
        throw final
      } finally {
        setIsLoading(false)
      }
    },
    [
      walletAddress,
      requireEvmConfig,
      intendedChainId,
      publicClient,
      writeContract,
      writeContractAndWait,
      onError,
      onComplete,
      showToasts,
    ]
  )

  return { consumePrompt, isLoading, error }
}

const ATTACK_ID_POLL_ATTEMPTS = 10
const ATTACK_ID_POLL_INTERVAL_MS = 2000

async function waitForAttackId(publicClient: PublicClient, hash: `0x${string}`): Promise<bigint> {
  for (let attempt = 0; attempt < ATTACK_ID_POLL_ATTEMPTS; attempt++) {
    await new Promise(resolve => setTimeout(resolve, ATTACK_ID_POLL_INTERVAL_MS))

    let receipt
    try {
      receipt = await publicClient.getTransactionReceipt({ hash })
    } catch {
      continue // Receipt not indexed yet.
    }
    if (!receipt) continue

    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: SENTINEL_ABI,
          data: log.data,
          topics: log.topics,
        }) as { eventName: string; args: { attackId?: bigint } }

        if (decoded.eventName === 'AttackRequested' && decoded.args.attackId !== undefined) {
          return decoded.args.attackId
        }
      } catch {
        // Not an event from our contract.
      }
    }
  }

  throw new Error('Could not retrieve attackId from AttackRequested event')
}
