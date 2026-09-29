import { useState, useCallback } from 'react'
import { Transaction } from '@mysten/sui/transactions'
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import { useSuiSignAndExecute } from '@/hooks/useSuiSignAndExecute'
import { SUI_CONFIG, SUI_LEGACY_CONFIG } from '@/constants'
import { getTokenForCoinType } from '@/constants/tokens'
import { toast } from 'sonner'
import { ConsumePromptApiResponse } from '@/types'
import { hexToVector } from '@/lib/utils'
import { fetchEffectiveCost } from '@/lib/sui/effective-cost'
import { type Agent } from '@/types/agents'
import { SuiTransactionBlockResponse, SuiObjectResponse } from '@mysten/sui/client'
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui/utils'

// Raw shape returned by the TEE's /consume-prompt for Sui. The contract signs
// message_hash/score/timestamp; the response strings are for the UI only.
interface SuiConsumePromptTeeResponse {
  response: {
    intent: number
    timestamp: number // Unix seconds — the contract compares against clock/1000
    data: {
      agent_id: string
      success: boolean
      score: number
      message_hash: number[] // 32 bytes
      agent_response: string
      jury_response?: string
      fun_response: string
    }
  }
  signature: string
}

// The TEE names the timestamp field `timestamp` on every chain, while the app's
// shared response type calls it `timestamp_ms` (see the EVM and Solana hooks).
const toConsumePromptApiResponse = (
  teeData: SuiConsumePromptTeeResponse
): ConsumePromptApiResponse => ({
  signature: teeData.signature,
  response: {
    intent: teeData.response.intent,
    timestamp_ms: teeData.response.timestamp * 1000,
    data: teeData.response.data,
  },
})

interface UseConsumePromptOptions {
  onSuccess?: (result: any) => void
  onError?: (error: Error) => void
  onAttackRequestSuccess?: (result: any) => void
  onApiSuccess?: (response: ConsumePromptApiResponse) => void
  onComplete?: (args: {
    apiResponse: ConsumePromptApiResponse
    transactionResult: SuiTransactionBlockResponse
    /** Nonce minted into the Attack ticket — identifies the backend attack doc. */
    attackNonce?: string
  }) => void
  showToasts?: boolean
}

interface ConsumePromptParams {
  agentDetails: Agent
  message: string
}

const ATTACK_ABORT_REASONS: Record<string, string> = {
  '4': "The agent's price went up while this attack was being submitted. Please try again.",
  '17': 'This token is not accepted by the protocol.',
  '18': 'This sentinel is not accepting attacks right now — its creator has started a withdrawal.',
  '19': 'The protocol is paused. Please try again later.',
  '24': 'This sentinel has already been defeated.',
}

const describeAttackAbort = (error: string | null | undefined): string => {
  const code = error?.match(/,\s*(\d+)\)\s*in command/)?.[1]
  const reason = code ? ATTACK_ABORT_REASONS[code] : undefined
  if (reason) return reason
  return `Attack request failed on-chain: ${error ?? 'unknown error'}`
}

interface AttackTicket {
  objectId: string
  nonce: string
}

export const useConsumePromptSui = (options: UseConsumePromptOptions = {}) => {
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
  // Gas is paid from the connected wallet.
  const { mutate: signAndExecuteTransaction } = useSuiSignAndExecute()

  // Step 2: Request an Attack Ticket
  const requestAttackTicket = async (agentDetails: Agent): Promise<AttackTicket> => {
    if (!account?.address) {
      throw new Error('Wallet not connected')
    }
    if (!SUI_CONFIG.PROTOCOL_CONFIG_ID) {
      throw new Error('ProtocolConfig Object ID is not set in constants.')
    }

    const isNewContract = !!agentDetails.coin_type

    const token = getTokenForCoinType(agentDetails.coin_type)
    const tokenDivisor = Math.pow(10, token.decimals)

    // Each contract deployment has its own shared objects — must use the matching set.
    const contractConfig = isNewContract ? SUI_CONFIG : SUI_LEGACY_CONFIG
    const agentRegistry = contractConfig.AGENT_REGISTRY || SUI_CONFIG.AGENT_REGISTRY
    const protocolConfigId = contractConfig.PROTOCOL_CONFIG_ID || SUI_CONFIG.PROTOCOL_CONFIG_ID
    const packageId = contractConfig.APP_PACKAGE_ID || SUI_CONFIG.APP_PACKAGE_ID

    const costInBaseUnits = isNewContract
      ? await fetchEffectiveCost(client, {
          packageId,
          moduleName: SUI_CONFIG.MODULE_NAME,
          agentObjectId: agentDetails.agent_object_id,
          protocolConfigId,
          coinType: token.coinType,
          sender: account.address,
        })
      : BigInt(agentDetails.cost_per_message)

    const tx = new Transaction()

    // The attack cost is always paid from the user's own coin objects — never
    // from tx.gas, which is reserved for gas. Even for SUI, the payment is
    // split from an owned SUI coin rather than the gas coin.
    const coins = await client.getCoins({
      owner: account.address,
      coinType: token.coinType,
      limit: 100,
    })

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

    let paymentCoin
    if (costInBaseUnits === BigInt(0) && sortedCoins.length > 0) {
      // Zero-cost attack with tokens in the wallet: split a zero coin from the
      // user's own coin so the tx stays minimal.
      ;[paymentCoin] = tx.splitCoins(tx.object(sortedCoins[0].coinObjectId), [
        tx.pure.u64(0),
      ])
    } else if (costInBaseUnits === BigInt(0)) {
      // Zero-cost attack with no token coins: build a zero-balance Coin
      // on-chain (0x2::coin::zero) rather than crashing on an empty selection
      // below.
      ;[paymentCoin] = tx.moveCall({
        target: '0x2::coin::zero',
        typeArguments: [token.coinType],
      })
    } else if (selectedCoins.length === 1) {
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
      target: `${packageId}::${SUI_CONFIG.MODULE_NAME}::request_attack`,
      // Old contract had no type parameters; new contract is generic over the coin type
      ...(isNewContract && { typeArguments: [token.coinType] }),
      arguments: [
        tx.object(agentRegistry),
        tx.object(agentDetails.agent_object_id),
        tx.object(protocolConfigId),
        paymentCoin,
        tx.object('0x8'),
        tx.object(SUI_CLOCK_OBJECT_ID),
      ],
    })

    tx.transferObjects([attackTicket], tx.pure.address(account.address))

    return new Promise((resolve, reject) => {
      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: async result => {
            try {
              onAttackRequestSuccess?.(result)

              // The custom `execute` above returns as soon as the node accepts the
              // tx, so its objectChanges can arrive before the ticket is readable.
              // Waiting for the digest to be indexed makes the read-back
              // deterministic — previously this raced the tx and the retry loops
              // that papered over it swallowed RPC errors, so a rate-limited read
              // surfaced as "Failed to create Attack ticket object".
              const confirmed = await client.waitForTransaction({
                digest: result.digest,
                options: { showObjectChanges: true, showEffects: true },
              })

              if (confirmed.effects?.status?.status !== 'success') {
                return reject(new Error(describeAttackAbort(confirmed.effects?.status?.error)))
              }

              const attackObjectId: string | null =
                (
                  confirmed.objectChanges?.find(
                    (obj: any) =>
                      obj.type === 'created' &&
                      (obj as any).objectType?.includes(`::${SUI_CONFIG.MODULE_NAME}::Attack`)
                  ) as any
                )?.objectId ?? null

              if (!attackObjectId) {
                return reject(new Error('Failed to create Attack ticket object.'))
              }

              const objectResponse: SuiObjectResponse = await client.getObject({
                id: attackObjectId,
                options: { showContent: true },
              })

              if (objectResponse?.data?.content?.dataType !== 'moveObject') {
                return reject(new Error('Failed to fetch Attack ticket content.'))
              }

              const fields = (objectResponse.data.content as any).fields
              const nonce = fields.nonce

              if (!nonce) {
                return reject(new Error('Failed to retrieve nonce from Attack ticket.'))
              }

              resolve({ objectId: attackObjectId, nonce: nonce as string })
            } catch (readError) {
              // Surface the underlying failure (RPC status, timeout) instead of
              // collapsing every cause into a generic "ticket creation failed".
              console.error('Failed to read back Attack ticket:', readError)
              reject(
                readError instanceof Error
                  ? readError
                  : new Error('Failed to read back Attack ticket')
              )
            }
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
    attackNonce: string
  ): Promise<SuiConsumePromptTeeResponse> => {
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
        // Sui identifies the attack the same way EVM does: the nonce minted into
        // the Attack object, plus the attacker. The contract re-derives both from
        // chain when it verifies, so these must match the ticket exactly — the
        // nonce stays a string because a full u64 loses precision as a JS number.
        attack_id: attackNonce,
        attacker: account.address,
      }),
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const teeData: SuiConsumePromptTeeResponse = await response.json()
    onApiSuccess?.(toConsumePromptApiResponse(teeData))
    return teeData
  }

  // Step 4: Execute consume prompt transaction
  const executeConsumePrompt = async (
    agentObjectId: string,
    agentDetails: Agent,
    teeData: SuiConsumePromptTeeResponse,
    attackObjectId: string
  ): Promise<any> => {
    const tx = new Transaction()
    const { data: attackResult } = teeData.response

    const isNewContract = !!agentDetails.coin_type
    const contractConfig = isNewContract ? SUI_CONFIG : SUI_LEGACY_CONFIG
    const packageId = contractConfig.APP_PACKAGE_ID || SUI_CONFIG.APP_PACKAGE_ID
    const agentRegistry = contractConfig.AGENT_REGISTRY || SUI_CONFIG.AGENT_REGISTRY
    const protocolConfigId = contractConfig.PROTOCOL_CONFIG_ID || SUI_CONFIG.PROTOCOL_CONFIG_ID

    tx.moveCall({
      target: `${packageId}::${SUI_CONFIG.MODULE_NAME}::consume_prompt`,
      ...(isNewContract && { typeArguments: [getTokenForCoinType(agentDetails.coin_type).coinType] }),
      arguments: [
        tx.object(agentRegistry),
        tx.object(protocolConfigId),
        tx.object(agentObjectId), // agent: &mut Agent<T>
        tx.pure.bool(attackResult.success), // success: bool
        tx.pure.u64(attackResult.score), // score: u64
        tx.pure.vector('u8', attackResult.message_hash), // message_hash: vector<u8>
        tx.pure.u64(teeData.response.timestamp), // timestamp: u64 (seconds)
        tx.pure.vector('u8', hexToVector(teeData.signature)), // sig: &vector<u8>
        tx.object(attackObjectId), // attack: Attack<T>
        tx.object(SUI_CLOCK_OBJECT_ID),
      ],
    })

    return new Promise((resolve, reject) => {
      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: async result => {
            // Settle before handing back, so anything the caller refetches on
            // completion reads post-attack state instead of the pre-attack one.
            try {
              const confirmed = await client.waitForTransaction({
                digest: result.digest,
                options: { showEffects: true },
              })
              if (confirmed.effects?.status?.status !== 'success') {
                return reject(
                  new Error(`Attack failed on-chain: ${confirmed.effects?.status?.error ?? 'unknown error'}`)
                )
              }
            } catch (waitError) {
              // The tx was already accepted — a slow confirmation must not fail
              // an attack that in fact landed.
              console.warn('Consume prompt confirmation wait failed:', waitError)
            }
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
        const { objectId: attackObjectId, nonce: attackNonce } =
          await requestAttackTicket(agentDetails)

        // Step 3: Call consume prompt API
        setCurrentStep('Processing prompt...')
        if (showToasts) toast.info('Processing prompt...')
        const teeData = await callConsumePromptApi(agentDetails.agent_id, message, attackNonce)
        const apiResponse = toConsumePromptApiResponse(teeData)

        // Step 4: Execute consume prompt transaction
        setCurrentStep('Finalizing transaction...')
        if (showToasts) toast.info('Finalizing transaction...')
        const result = await executeConsumePrompt(
          agentDetails.agent_object_id,
          agentDetails,
          teeData,
          attackObjectId
        )

        if (showToasts) {
          if (apiResponse.response.data.success) {
            toast.success('🎉 Agent defeated! You won the challenge!')
          } else {
            toast.success('Prompt processed successfully')
          }
        }

        onComplete?.({ apiResponse, transactionResult: result, attackNonce })

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
