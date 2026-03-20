import { useState, useCallback } from 'react'
import { Transaction } from '@mysten/sui/transactions'
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import { SUI_COIN_TYPE, SUI_CONFIG, getTokenForCoinType } from '@/constants'
import { toast } from 'sonner'
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
    if (!SUI_CONFIG.PROTOCOL_CONFIG_ID) {
      throw new Error('ProtocolConfig Object ID is not set in constants.')
    }

    const isNewContract = !!agentDetails.coin_type

    // Use backend-computed current price (based on indexed PromptConsumed event count).
    // Falls back to the base cost for legacy agents or if the field is missing.
    const costInBaseUnits = BigInt(
      agentDetails.current_cost_per_message ?? agentDetails.cost_per_message
    )

    const token = getTokenForCoinType(agentDetails.coin_type)
    const tokenDivisor = Math.pow(10, token.decimals)

    const tx = new Transaction()
    let paymentCoin

    if (token.coinType === SUI_COIN_TYPE) {
      // SUI is the gas coin — split directly from tx.gas
      ;[paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(costInBaseUnits)])
    } else {
      // Non-SUI token — fetch from wallet
      const coins = await client.getCoins({
        owner: account.address,
        coinType: token.coinType,
        limit: 100,
      })

      if (!coins.data.length) {
        throw new Error(`No ${token.symbol} coins found in wallet`)
      }

      const sortedCoins = coins.data.sort((a, b) => Number(b.balance) - Number(a.balance))
      const totalAvailable = sortedCoins.reduce(
        (sum, coin) => sum + BigInt(coin.balance),
        BigInt(0)
      )

      if (totalAvailable < costInBaseUnits) {
        throw new Error(
          `Insufficient ${token.symbol} balance. Need ${Number(costInBaseUnits) / tokenDivisor} ${token.symbol}, have ${Number(totalAvailable) / tokenDivisor} ${token.symbol}`
        )
      }

      // Select minimum coins needed, merge if necessary, then split exact amount
      const selectedCoins: typeof sortedCoins = []
      let runningTotal = BigInt(0)
      for (const coin of sortedCoins) {
        selectedCoins.push(coin)
        runningTotal += BigInt(coin.balance)
        if (runningTotal >= costInBaseUnits) break
      }

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
    }

    // Route to the correct package: new agents use APP_PACKAGE_ID, old agents use LEGACY
    const packageId = isNewContract
      ? SUI_CONFIG.APP_PACKAGE_ID
      : (SUI_CONFIG.LEGACY_APP_PACKAGE_ID || SUI_CONFIG.APP_PACKAGE_ID)

    const [attackTicket] = tx.moveCall({
      target: `${packageId}::${SUI_CONFIG.MODULE_NAME}::request_attack`,
      // Old contract had no type parameters; new contract is generic over the coin type
      ...(isNewContract && { typeArguments: [token.coinType] }),
      arguments: [
        tx.object(SUI_CONFIG.AGENT_REGISTRY),
        tx.object(agentDetails.agent_object_id),
        tx.object(SUI_CONFIG.PROTOCOL_CONFIG_ID),
        paymentCoin,
        tx.object('0x8'),
        tx.object(SUI_CLOCK_OBJECT_ID),
      ],
    })
    console.log({attackTicket})

    tx.transferObjects([attackTicket], tx.pure.address(account.address))

    tx.setGasBudget(GAS_BUDGET)

    return new Promise((resolve, reject) => {
      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: async result => {
            onAttackRequestSuccess?.(result)

            // Fast path: objectChanges (works when node has locally executed the tx)
            let attackObjectId: string | null =
              (result.objectChanges?.find(
                (obj: any) => obj.type === 'created' && (obj as any).objectType?.includes('::sentinel::Attack')
              ) as any)?.objectId ?? null

            // Fallback: poll getOwnedObjects — queries current chain state directly.
            // Try both APP and LEGACY package IDs since the type origin may differ across upgrades.
            if (!attackObjectId) {
              const legacyId = SUI_CONFIG.LEGACY_APP_PACKAGE_ID || SUI_CONFIG.APP_PACKAGE_ID
              const structTypes = isNewContract
                ? [
                    `${SUI_CONFIG.APP_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::Attack<${token.coinType}>`,
                    `${legacyId}::${SUI_CONFIG.MODULE_NAME}::Attack<${token.coinType}>`,
                  ]
                : [`${legacyId}::${SUI_CONFIG.MODULE_NAME}::Attack`]

              for (let attempt = 0; attempt < 5 && !attackObjectId; attempt++) {
                await new Promise(resolve => setTimeout(resolve, 1500))
                for (const structType of structTypes) {
                  try {
                    const { data } = await client.getOwnedObjects({
                      owner: account.address,
                      filter: { StructType: structType },
                      options: { showContent: true },
                    })
                    const match = data.find(
                      obj => (obj.data?.content as any)?.fields?.agent_id === agentDetails.agent_id
                    )
                    if (match?.data?.objectId) {
                      attackObjectId = match.data.objectId
                      break
                    }
                  } catch {
                    // ignore, retry next attempt
                  }
                }
              }
            }

            if (!attackObjectId) {
              return reject(new Error('Failed to create Attack ticket object.'))
            }

            let objectResponse: SuiObjectResponse | null = null
            for (let attempt = 0; attempt < 5; attempt++) {
              try {
                objectResponse = await client.getObject({
                  id: attackObjectId!,
                  options: { showContent: true },
                })
                if (objectResponse?.data?.content?.dataType === 'moveObject') break
              } catch {
                // ignore, retry
              }
              await new Promise(resolve => setTimeout(resolve, 1000))
            }

            if (objectResponse?.data?.content?.dataType !== 'moveObject') {
              return reject(new Error('Failed to fetch Attack ticket content.'))
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

    const isNewContract = !!agentDetails.coin_type
    const packageId = isNewContract
      ? SUI_CONFIG.APP_PACKAGE_ID
      : (SUI_CONFIG.LEGACY_APP_PACKAGE_ID || SUI_CONFIG.APP_PACKAGE_ID)

    tx.moveCall({
      target: `${packageId}::${SUI_CONFIG.MODULE_NAME}::consume_prompt`,
      ...(isNewContract && { typeArguments: [getTokenForCoinType(agentDetails.coin_type).coinType] }),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      account?.address,
      signAndExecuteTransaction,
      onSuccess,
      onError,
      onAttackRequestSuccess,
      onApiSuccess,
      onComplete,
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
