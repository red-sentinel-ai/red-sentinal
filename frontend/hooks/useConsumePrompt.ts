/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react'
import { Transaction } from '@mysten/sui/transactions'
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import { SUI_CONFIG } from '@/constants'
import { toast } from 'react-toastify'
import { ConsumePromptApiResponse } from '@/types'
import { hexToVector } from '@/lib/utils'
import { type AgentDetails } from './agents/useAllAgents'
import { SuiTransactionBlockResponse, SuiObjectResponse } from '@mysten/sui/client'
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui/utils'

const GAS_BUDGET = 50_000_000

// Define response types

interface UseConsumePromptOptions {
  onSuccess?: (result: any) => void
  onError?: (error: Error) => void
  onAttackRequestSuccess?: (result: any) => void
  onApiSuccess?: (response: ConsumePromptApiResponse) => void
  onComplete?: (args: {
    apiResponse: ConsumePromptApiResponse
    transactionResult: SuiTransactionBlockResponse
  }) => void
  showToasts?: boolean
}

interface ConsumePromptParams {
  agentDetails: AgentDetails
  message: string
}

interface AttackTicket {
  objectId: string
  nonce: string
}

export const useConsumePrompt = (options: UseConsumePromptOptions = {}) => {
  const client = useSuiClient()
  const {
    onSuccess,
    onError,
    onAttackRequestSuccess,
    onApiSuccess,
    onComplete,
    showToasts = true,
  } = options

  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<any>(null)

  const account = useCurrentAccount()
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      await client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showRawEffects: true,
          showObjectChanges: true,
        },
      }),
  })

  // Step 2: Request an Attack Ticket
  const requestAttackTicket = async (agentDetails: AgentDetails): Promise<AttackTicket> => {
    if (!account?.address) {
      throw new Error('Wallet not connected')
    }
    if (!SUI_CONFIG.PROTOCOL_CONFIG_OBJECT_ID) {
      throw new Error('ProtocolConfig Object ID is not set in constants.')
    }

    const costInMist = BigInt(agentDetails.cost_per_message)

    // Check if user has enough balance
    const balance = await client.getBalance({
      owner: account.address,
      coinType: '0x2::sui::SUI',
    })

    const totalBalance = BigInt(balance.totalBalance)
    const gasBuffer = BigInt(GAS_BUDGET)
    const totalNeeded = costInMist + gasBuffer

    if (totalBalance < totalNeeded) {
      throw new Error(`Insufficient balance. Need ${agentDetails.cost_per_message} MIST + gas fees`)
    }

    const tx = new Transaction()

    // Split payment amount from gas coin
    const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(costInMist)])

    const [attackTicket] = tx.moveCall({
      target: `${SUI_CONFIG.EXAMPLES_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::request_attack`,
      arguments: [
        tx.object(SUI_CONFIG.AGENT_REGISTRY),
        tx.object(agentDetails.object_id),
        tx.object(SUI_CONFIG.PROTOCOL_CONFIG_OBJECT_ID),
        paymentCoin,
        tx.object('0x8'),
        tx.object(SUI_CLOCK_OBJECT_ID)
      ],
    })

    tx.transferObjects([attackTicket], tx.pure.address(account.address))

    tx.setGasBudget(GAS_BUDGET)

    return new Promise((resolve, reject) => {
      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: async (result) => {
            onAttackRequestSuccess?.(result)

            const attackObjectChange = result.objectChanges?.find(
              (obj: any) => obj.type === 'created' && obj.objectType.endsWith('::sentinel::Attack')
            ) as { objectId: string } | undefined

            if (!attackObjectChange) {
              return reject(new Error('Failed to create Attack ticket object.'))
            }

            const attackObjectId = attackObjectChange.objectId


            // Wait 1 second (1000ms) for the RPC node to index the new object's content
            await new Promise((resolve) => setTimeout(resolve, 1000))

            let objectResponse: SuiObjectResponse | null = null
            try {
              objectResponse = await client.getObject({
                id: attackObjectId,
                options: { showContent: true },
              })
              console.log({ objectResponse, attackObjectId })
            } catch (error) {
              console.error('Error fetching object after sleep', error)
              return reject(new Error('Failed to fetch Attack ticket after 1s delay.'))
            }

            if (objectResponse?.data?.content?.dataType !== 'moveObject') {
              console.error('Failed to fetch object content after 1s delay.', objectResponse)
              return reject(new Error('Failed to fetch Attack ticket content after 1s delay.'))
            }

            const fields = (objectResponse.data.content as any).fields
            const nonce = fields.nonce

            if (!nonce) {
              return reject(new Error('Failed to retrieve nonce from Attack ticket.'))
            }

            resolve({ objectId: attackObjectId, nonce: nonce as string })
          },
          onError: (txError) => {
            console.error('Attack request transaction failed:', txError)
            reject(new Error(txError?.message || 'Failed to request attack ticket'))
          },
        }
      )
    })
  }

  // Step 3: Call consume prompt API
  const callConsumePromptApi = async (
    agentId: string,
    message: string,
    attack_object_id: string
  ): Promise<ConsumePromptApiResponse> => {
    if (!account?.address) {
      throw new Error('Wallet not connected')
    }

    const response = await fetch('/api/consume-prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id: `${agentId}`,
        message: message,
        attack_object_id
      }),
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const apiResponse: ConsumePromptApiResponse = await response.json()
    onApiSuccess?.(apiResponse)
    return apiResponse
  }

  // Step 4: Execute consume prompt transaction
  const executeConsumePrompt = async (
    agentObjectId: string,
    agentDetails: AgentDetails,
    apiResponse: ConsumePromptApiResponse,
    prompt: string,
    attackObjectId: string
  ): Promise<any> => {
    const tx = new Transaction()
    const sigVector = hexToVector(apiResponse.signature)

    // Extract data from API response
    const { response: apiData } = apiResponse

    tx.moveCall({
      target: `${SUI_CONFIG.EXAMPLES_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::consume_prompt`,
      arguments: [
        tx.object(SUI_CONFIG.AGENT_REGISTRY), // registry: &AgentRegistry
        tx.object(SUI_CONFIG.PROTOCOL_CONFIG_OBJECT_ID),
        tx.object(agentObjectId), // agent: &mut Agent
        tx.pure.bool(apiData.data.success), // success: bool
        tx.pure.string(apiData.data.agent_response), // explanation: String,
        tx.pure.string(apiData.data.jury_response), // explanation: String,
        tx.pure.string(apiData.data.fun_response), // explanation: String,
        tx.pure.string(prompt),
        tx.pure.u8(apiData.data.score), // score: u8
        tx.pure.u64(apiData.timestamp_ms), // timestamp_ms: u64
        tx.pure.vector('u8', sigVector), // sig: &vector<u8>
        tx.object(SUI_CONFIG.ENCLAVE_OBJECT_ID), // enclave: &Enclave<T>
        tx.object(attackObjectId), // attack: &mut Attack,
        tx.object(SUI_CLOCK_OBJECT_ID)
      ],
    })

    tx.setGasBudget(GAS_BUDGET)

    return new Promise((resolve, reject) => {
      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log('Consume prompt transaction success:', result)
            setLastResult(result)
            onSuccess?.(result)
            resolve(result)
          },
          onError: (txError) => {
            console.error('Consume prompt transaction failed:', txError)
            reject(new Error(txError?.message || 'Consume prompt failed'))
          },
        }
      )
    })
  }

  // Main function that orchestrates all steps
  const consumePrompt = useCallback(
    async ({ agentDetails, message }: ConsumePromptParams) => {
      if (!account?.address) {
        const errorMsg = 'Wallet not connected'
        setError(errorMsg)
        if (showToasts) toast.error(errorMsg)
        return
      }

      if (!agentDetails?.object_id || !message?.trim()) {
        const errorMsg = 'Invalid agent ID or message'
        setError(errorMsg)
        if (showToasts) toast.error(errorMsg)
        return
      }

      setIsLoading(true)
      setError(null)
      setCurrentStep('Fetching agent details...')

      try {
        // Step 2: Request Attack Ticket
        setCurrentStep('Requesting attack ticket...')
        if (showToasts) toast.info('Processing payment...')
        const { objectId: attackObjectId, nonce } = await requestAttackTicket(agentDetails)

        // Step 3: Call consume prompt API
        setCurrentStep('Processing prompt...')
        if (showToasts) toast.info('Processing prompt...')
        const apiResponse = await callConsumePromptApi(agentDetails.agent_id, message, attackObjectId)
        console.log('API response:', apiResponse)
        onApiSuccess?.(apiResponse)

        // Step 4: Execute consume prompt transaction
        setCurrentStep('Finalizing transaction...')
        if (showToasts) toast.info('Finalizing transaction...')
        const result = await executeConsumePrompt(
          agentDetails.object_id,
          agentDetails,
          apiResponse,
          message,
          attackObjectId
        )

        if (showToasts) {
          if (apiResponse.response.data.success) {
            toast.success('🎉 Agent defeated! You won the challenge!')
          } else {
            toast.success('Prompt processed successfully')
          }
        }

        onComplete?.({ apiResponse, transactionResult: result })

        setCurrentStep('')
        return result
      } catch (error) {
        console.error('Error in consume prompt process:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to consume prompt'
        setError(errorMessage)

        if (showToasts) {
          toast.error(errorMessage)
        }

        const finalError = error instanceof Error ? error : new Error(errorMessage)
        onError?.(finalError)
        throw finalError
      } finally {
        setIsLoading(false)
        setCurrentStep('')
      }
    },
    [
      account?.address,
      signAndExecuteTransaction,
      onSuccess,
      onError,
      onAttackRequestSuccess,
      onApiSuccess,
      showToasts,
      client,
    ]
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
    isConnected: !!account?.address,
  }
}

// Export types for convenience
export type { ConsumePromptParams, UseConsumePromptOptions, AgentDetails }
