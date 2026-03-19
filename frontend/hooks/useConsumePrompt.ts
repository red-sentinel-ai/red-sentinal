/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react'
import { Transaction } from '@mysten/sui/transactions'
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import { SUI_CONFIG } from '@/constants'
import { toast } from 'sonner'
import { ConsumePromptApiResponse } from '@/types'
import { hexToVector } from '@/lib/utils'
import { type AgentDetails } from './agents/useAllAgents'
import { SuiTransactionBlockResponse, SuiObjectResponse } from '@mysten/sui/client'
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui/utils'

const GAS_BUDGET = 50_000_000

const USDC_COIN_TYPE =
  '0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC'
const USDC_DECIMALS = 1_000_000 // 6 decimal places

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
    if (!SUI_CONFIG.PROTOCOL_CONFIG_ID) {
      throw new Error('ProtocolConfig Object ID is not set in constants.')
    }

    // Fetch live attack_count from chain to compute dynamic effective cost.
    // The contract charges base_cost * (10000 + attack_count * 100) / 10000.
    const BASIS_POINTS = BigInt(10000)
    const FEE_INCREASE_BPS = BigInt(100) // 1% per attack
    const MAX_FEE_MULTIPLIER_BPS = BigInt(30000) // 3x cap

    let attackCount = BigInt(0)
    try {
      const agentObj = await client.getObject({
        id: agentDetails.agent_object_id,
        options: { showContent: true },
      })
      const agentFields = (agentObj.data?.content as any)?.fields
      attackCount = BigInt(agentFields?.attack_count || 0)
      console.log('Current attack_count:', attackCount.toString())
    } catch (err) {
      console.error('Failed to fetch agent attack_count, using 0:', err)
    }

    const rawMultiplier = BASIS_POINTS + attackCount * FEE_INCREASE_BPS
    const multiplier =
      rawMultiplier > MAX_FEE_MULTIPLIER_BPS ? MAX_FEE_MULTIPLIER_BPS : rawMultiplier
    const costInBaseUnits =
      (BigInt(agentDetails.cost_per_message) * multiplier) / BASIS_POINTS

    console.log(
      `Effective cost: ${Number(costInBaseUnits) / USDC_DECIMALS} USDC (attack #${attackCount + BigInt(1)})`
    )

    // Fetch USDC coins and check balance
    const usdcCoins = await client.getCoins({
      owner: account.address,
      coinType: USDC_COIN_TYPE,
      limit: 100,
    })

    if (!usdcCoins.data.length) {
      throw new Error('No USDC coins found in wallet')
    }

    const sortedCoins = usdcCoins.data.sort((a, b) => Number(b.balance) - Number(a.balance))
    const totalAvailable = sortedCoins.reduce((sum, coin) => sum + BigInt(coin.balance), BigInt(0))

    if (totalAvailable < costInBaseUnits) {
      throw new Error(
        `Insufficient USDC balance. Need ${Number(costInBaseUnits) / USDC_DECIMALS} USDC, have ${Number(totalAvailable) / USDC_DECIMALS} USDC`
      )
    }

    const tx = new Transaction()

    // Select minimum coins needed, merge if necessary, then split exact amount
    const selectedCoins: typeof sortedCoins = []
    let runningTotal = BigInt(0)
    for (const coin of sortedCoins) {
      selectedCoins.push(coin)
      runningTotal += BigInt(coin.balance)
      if (runningTotal >= costInBaseUnits) break
    }

    let paymentCoin
    if (selectedCoins.length === 1) {
      ;[paymentCoin] = tx.splitCoins(tx.object(selectedCoins[0].coinObjectId), [
        tx.pure.u64(costInBaseUnits),
      ])
    } else {
      const primaryCoinRef = tx.object(selectedCoins[0].coinObjectId)
      tx.mergeCoins(
        primaryCoinRef,
        selectedCoins.slice(1).map(c => tx.object(c.coinObjectId))
      )
      ;[paymentCoin] = tx.splitCoins(primaryCoinRef, [tx.pure.u64(costInBaseUnits)])
    }

    const [attackTicket] = tx.moveCall({
      target: `${SUI_CONFIG.APP_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::request_attack`,
      typeArguments: [USDC_COIN_TYPE],
      arguments: [
        tx.object(SUI_CONFIG.AGENT_REGISTRY),
        tx.object(agentDetails.agent_object_id),
        tx.object(SUI_CONFIG.PROTOCOL_CONFIG_ID),
        paymentCoin,
        tx.object('0x8'),
        tx.object(SUI_CLOCK_OBJECT_ID),
      ],
    })

    tx.transferObjects([attackTicket], tx.pure.address(account.address))

    tx.setGasBudget(GAS_BUDGET)

    return new Promise((resolve, reject) => {
      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: async result => {
            onAttackRequestSuccess?.(result)
            console.log({ result })

            // Some nodes return incomplete objectChanges (confirmedLocalExecution: false).
            // Use a fallback chain to find the Attack object ID.
            let attackObjectId: string | null = null

            // 1. Try objectChanges from the executeTransactionBlock response
            const attackFromChanges = result.objectChanges?.find(
              (obj: any) => obj.type === 'created' && obj.objectType.includes('::sentinel::Attack')
            )
            if (attackFromChanges) {
              attackObjectId = (attackFromChanges as any).objectId
            }

            // Wait for the RPC node to index the transaction
            await new Promise(resolve => setTimeout(resolve, 1000))

            // 2. If not found, fetch the full tx block by digest (more complete response)
            if (!attackObjectId) {
              try {
                const txBlock = await client.getTransactionBlock({
                  digest: result.digest,
                  options: { showObjectChanges: true },
                })
                const attackFromTx = txBlock.objectChanges?.find(
                  (obj: any) =>
                    obj.type === 'created' && obj.objectType.includes('::sentinel::Attack')
                )
                if (attackFromTx) {
                  attackObjectId = (attackFromTx as any).objectId
                }
              } catch (err) {
                console.error('Error fetching tx block by digest:', err)
              }
            }

            // 3. Last resort: query owned Attack objects filtered by agent_id
            if (!attackObjectId) {
              try {
                const ownedAttacks = await client.getOwnedObjects({
                  owner: account.address,
                  filter: {
                    StructType: `${SUI_CONFIG.APP_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::Attack<${USDC_COIN_TYPE}>`,
                  },
                  options: { showContent: true },
                })
                const match = ownedAttacks.data.find(obj => {
                  const fields = (obj.data?.content as any)?.fields
                  return fields?.agent_id === agentDetails.agent_id
                })
                if (match?.data?.objectId) {
                  attackObjectId = match.data.objectId
                }
              } catch (err) {
                console.error('Error querying owned Attack objects:', err)
              }
            }

            if (!attackObjectId) {
              return reject(new Error('Failed to create Attack ticket object.'))
            }

            let objectResponse: SuiObjectResponse | null = null
            try {
              objectResponse = await client.getObject({
                id: attackObjectId!,
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

            resolve({ objectId: attackObjectId!, nonce: nonce as string })
          },
          onError: txError => {
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
        attack_object_id,
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
      target: `${SUI_CONFIG.APP_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::consume_prompt`,
      typeArguments: [USDC_COIN_TYPE],
      arguments: [
        tx.object(SUI_CONFIG.AGENT_REGISTRY), // registry: &AgentRegistry
        tx.object(SUI_CONFIG.PROTOCOL_CONFIG_ID),
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
        tx.object(SUI_CLOCK_OBJECT_ID),
      ],
    })

    tx.setGasBudget(GAS_BUDGET)

    return new Promise((resolve, reject) => {
      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: result => {
            console.log('Consume prompt transaction success:', result)
            setLastResult(result)
            onSuccess?.(result)
            resolve(result)
          },
          onError: txError => {
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

      if (!agentDetails?.agent_object_id || !message?.trim()) {
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
        const { objectId: attackObjectId } = await requestAttackTicket(agentDetails)

        // Step 3: Call consume prompt API
        setCurrentStep('Processing prompt...')
        if (showToasts) toast.info('Processing prompt...')
        const apiResponse = await callConsumePromptApi(
          agentDetails.agent_id,
          message,
          attackObjectId
        )
        console.log('API response:', apiResponse)
        onApiSuccess?.(apiResponse)

        // Step 4: Execute consume prompt transaction
        setCurrentStep('Finalizing transaction...')
        if (showToasts) toast.info('Finalizing transaction...')
        const result = await executeConsumePrompt(
          agentDetails.agent_object_id,
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
