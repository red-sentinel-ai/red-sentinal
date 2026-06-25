'use client'

import { useState, useCallback } from 'react'
import { useWriteContract, usePublicClient, useAccount, useChainId } from 'wagmi'
import {  decodeEventLog } from 'viem'
import { toast } from 'sonner'
import { getEvmConfig } from '@/constants/evm'
import { getEvmFeeOverrides } from '@/lib/evm/fees'
import { ethers } from "ethers";
import { SENTINEL_ABI, ERC20_ABI } from '@/lib/evm/abi'
import { useEVMWallet } from '@/hooks/useEVMWallet'
import type { ConsumePromptApiResponse } from '@/types'
import type { AgentDetails } from '@/types/agents'

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
  agentDetails: AgentDetails
  message: string
}

export function useConsumePromptEVM({
  onError,
  onComplete,
  showToasts = true,
}: UseConsumeEvmPromptOptions = {}) {
  const { address: walletAddress } = useEVMWallet()
  const { chain: currentChain } = useAccount()
  const chainId = useChainId()
  const evmCfg = getEvmConfig(chainId)
  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const consumePrompt = useCallback(
    async ({ agentDetails, message }: ConsumeEvmPromptParams) => {
      if (!walletAddress) {
        const msg = 'EVM wallet not connected'
        setError(msg)
        if (showToasts) toast.error(msg)
        return
      }


      const tokenAddress = (agentDetails.coin_type ?? '') as `0x${string}`

      setIsLoading(true)
      setError(null)

      const txArgs = { account: walletAddress, chain: currentChain ?? null }

      try {
        // Fetch effective cost from contract (accounts for attack count multiplier)
        if (!publicClient) throw new Error('No public client available')
        const latestEffectiveCost = await publicClient.readContract({
          address: evmCfg.contractAddress,
          abi: SENTINEL_ABI,
          functionName: 'getEffectiveCost',
          args: [agentDetails.agent_id],
        } as any) as bigint
        const paymentAmount = (latestEffectiveCost * 101n) / 100n
        const paymentFormatted = ethers.formatUnits(paymentAmount, 18)
        console.log({ latestEffectiveCost, paymentAmount, paymentFormatted })
        // Step 1: Approve payment token
        if (showToasts) toast.info('Approving payment...')
        await writeContractAsync({
          ...txArgs,
          ...(await getEvmFeeOverrides(chainId, publicClient)),
          address: tokenAddress,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [evmCfg.contractAddress, paymentAmount],
        })
        // Wait for BSC block (~3s)
        await new Promise(r => setTimeout(r, 3000))

        // Step 2: Request attack — returns attackId via event
        if (showToasts) toast.info('Processing payment...')
        const attackTxHash = await writeContractAsync({
          ...txArgs,
          ...(await getEvmFeeOverrides(chainId, publicClient)),
          address: evmCfg.contractAddress,
          abi: SENTINEL_ABI,
          functionName: 'requestAttack',
          args: [agentDetails.agent_id, paymentAmount],
        })

        // Wait for the tx to be mined and extract attackId from AttackRequested event
        if (!publicClient) throw new Error('No public client available')

        let attackId: bigint | undefined
        for (let attempt = 0; attempt < 10 && attackId === undefined; attempt++) {
          await new Promise(r => setTimeout(r, 2000))
          try {
            const receipt = await publicClient.getTransactionReceipt({ hash: attackTxHash })
            if (receipt) {
              for (const log of receipt.logs) {
                try {
                  const decoded = decodeEventLog({
                    abi: SENTINEL_ABI,
                    data: log.data,
                    topics: (log as any).topics,
                  }) as { eventName: string; args: any }
                  if (decoded.eventName === 'AttackRequested') {
                    attackId = decoded.args.attackId as bigint
                    break
                  }
                } catch {
                  // not this log
                }
              }
            }
          } catch {
            // receipt not yet available
          }
        }

        console.log({attackId})

        if (attackId === undefined) {
          throw new Error('Could not retrieve attackId from AttackRequested event')
        }

        // Step 3: Call EVM TEE consume-prompt
        if (showToasts) toast.info('Processing prompt...')
        const teeRes = await fetch('/api/evm/consume-prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agent_id: String(agentDetails.agent_id),
            message,
            attack_id: Number(attackId),
            attacker: walletAddress,
            chainId,
          }),
        })

        if (!teeRes.ok) {
          const errText = await teeRes.text()
          throw new Error(`TEE error: ${errText}`)
        }

        const teeData: EvmConsumePromptResponse = await teeRes.json()

    // Prepare signature with recovery byte
      let consumeSignature = teeData.signature;
      if (!consumeSignature.startsWith("0x")) {
        consumeSignature = "0x" + consumeSignature;
      }
      // Only add v byte if signature is 64 bytes (130 hex chars with 0x prefix)
      // If it's already 65 bytes (132 hex chars), v is already included
      if (consumeSignature.length === 130) {
        const consumeRecoveryId = teeData.recovery_id;
        const consumeV = (27 + consumeRecoveryId).toString(16).padStart(2, '0');
        consumeSignature = consumeSignature + consumeV;
      }

      const timestampMs = BigInt(teeData.response.timestamp);

      // Convert message_hash from number[] to bytes32 hex string (same logic as promptHash)
      const messageHashArray: number[] = teeData.response.data.message_hash;
      const messageHashBytes = new Uint8Array(32);
      for (let i = 0; i < Math.min(messageHashArray.length, 32); i++) {
        messageHashBytes[i] = messageHashArray[i];
      }
      const messageHash = ethers.hexlify(messageHashBytes);

        // Step 4: Execute consumePrompt on-chain
        if (showToasts) toast.info('Finalizing transaction...')
        const consumeTxHash = await writeContractAsync({
          ...txArgs,
          ...(await getEvmFeeOverrides(chainId, publicClient)),
          address: evmCfg.contractAddress,
          abi: SENTINEL_ABI,
          functionName: 'consumePrompt',
          args: [
            teeData.response.data.agent_id,
            teeData.response.data.success,
            messageHash as any,
            teeData.response.data.score,
            timestampMs,
            consumeSignature as any,
            attackId,
          ],
        })

        // Build a ConsumePromptApiResponse compatible with the existing UI
        const apiResponse: ConsumePromptApiResponse = {
          signature: teeData.signature,
          response: {
            intent: teeData.response.intent,
            timestamp_ms: teeData.response.timestamp,
            data: {
              agent_id: teeData.response.data.agent_id,
              success: teeData.response.data.success,
              score: teeData.response.data.score,
              agent_response: teeData.response.data.agent_response,
              jury_response: teeData.response.data.jury_response,
              fun_response: '',
            },
          },
        }

        if (showToasts) {
          if (teeData.response.data.success) {
            toast.success('Agent defeated! You won the challenge!')
          } else {
            toast.success('Prompt processed successfully')
          }
        }

        onComplete?.({ apiResponse, transactionDigest: consumeTxHash })
        return consumeTxHash
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Failed to consume prompt'
        setError(errMsg)
        if (showToasts) toast.error(errMsg)
        onError?.(err instanceof Error ? err : new Error(errMsg))
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [walletAddress, currentChain, chainId, writeContractAsync, publicClient, onError, onComplete, showToasts]
  )

  return { consumePrompt, isLoading, error }
}
