import { useState, useCallback, useEffect } from 'react'
import { Transaction } from '@mysten/sui/transactions'
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui/utils'
import { SUI_CONFIG } from '@/constants'
import { toast } from 'sonner'

const USDC_COIN_TYPE =
  '0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC'
const USDC_DECIMALS = 1_000_000 // 6 decimal places

interface UseFundAgentOptions {
  onSuccess?: (result: any) => void
  onError?: (error: Error) => void
  showToasts?: boolean
}

interface FundAgentParams {
  agentObjectId: string
  agentId: string // The agent_id string to match with AgentCap
  amount: number // Amount in USDC
}

interface AgentCap {
  id: string
  agentId: string
}

export const useFundAgent = (options: UseFundAgentOptions = {}) => {
  const { onSuccess, onError, showToasts = true } = options
  const client = useSuiClient()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<any>(null)
  const [agentCaps, setAgentCaps] = useState<AgentCap[]>([])
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

  // Fetch user's AgentCaps
  const fetchAgentCaps = useCallback(async () => {
    if (!account?.address) {
      setAgentCaps([])
      return
    }

    try {
      const objects = await client.getOwnedObjects({
        owner: account.address,
        filter: {
          StructType: `${SUI_CONFIG.APP_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::AgentCap`,
        },
        options: {
          showContent: true,
          showType: true,
        },
      })

      const caps: AgentCap[] = objects.data
        .filter(obj => obj.data?.content?.dataType === 'moveObject')
        .map(obj => {
          const fields = (obj.data?.content as any)?.fields
          return {
            id: obj.data?.objectId || '',
            agentId: fields?.agent_id || '',
          }
        })
        .filter(cap => cap.id && cap.agentId)

      setAgentCaps(caps)
      console.log('Fetched AgentCaps:', caps)
    } catch (error) {
      console.error('Error fetching AgentCaps:', error)
    }
  }, [account?.address, client])

  // Fetch AgentCaps when account changes
  useEffect(() => {
    fetchAgentCaps()
  }, [fetchAgentCaps])

  const fundAgent = useCallback(
    async ({ agentObjectId, agentId, amount }: FundAgentParams) => {
      console.log({ agentObjectId, agentId, amount })
      if (!account?.address) {
        const errorMsg = 'Wallet not connected'
        setError(errorMsg)
        if (showToasts) toast.error(errorMsg)
        return
      }

      if (!agentObjectId || !agentId || !amount || amount <= 0) {
        const errorMsg = 'Invalid agent ID or amount'
        setError(errorMsg)
        if (showToasts) toast.error(errorMsg)
        return
      }

      // Find the matching AgentCap
      const agentCap = agentCaps.find(cap => cap.agentId.toString() === agentId.toString())
      if (!agentCap) {
        const errorMsg = `You don't own the AgentCap for agent "${agentId}". Only the agent creator can fund it.`
        setError(errorMsg)
        if (showToasts) toast.error(errorMsg)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Get user's USDC coins
        const coins = await client.getCoins({
          owner: account.address,
          coinType: USDC_COIN_TYPE,
          limit: 100,
        })

        if (!coins.data.length) {
          throw new Error('No USDC coins found in wallet')
        }

        const amountInBaseUnits = BigInt(Math.floor(amount * USDC_DECIMALS))

        // Sort coins by balance (largest first)
        const sortedCoins = coins.data.sort((a, b) => Number(b.balance) - Number(a.balance))

        const totalAvailable = sortedCoins.reduce(
          (sum, coin) => sum + BigInt(coin.balance),
          BigInt(0)
        )
        console.log('Amount needed (USDC):', amount)
        console.log('Total available (USDC):', Number(totalAvailable) / USDC_DECIMALS)

        if (totalAvailable < amountInBaseUnits) {
          throw new Error(
            `Insufficient USDC balance. Need ${amount} USDC, have ${
              Number(totalAvailable) / USDC_DECIMALS
            } USDC`
          )
        }

        // Create transaction — gas is paid in SUI automatically, no gas/payment merging needed
        const tx = new Transaction()

        // Select the minimum coins needed to cover the amount
        const selectedCoins: typeof sortedCoins = []
        let runningTotal = BigInt(0)
        for (const coin of sortedCoins) {
          selectedCoins.push(coin)
          runningTotal += BigInt(coin.balance)
          if (runningTotal >= amountInBaseUnits) break
        }

        let paymentCoin
        if (selectedCoins.length === 1) {
          ;[paymentCoin] = tx.splitCoins(tx.object(selectedCoins[0].coinObjectId), [
            tx.pure.u64(amountInBaseUnits),
          ])
        } else {
          console.log(`📋 Merging ${selectedCoins.length} USDC coins`)
          const primaryCoinRef = tx.object(selectedCoins[0].coinObjectId)
          tx.mergeCoins(
            primaryCoinRef,
            selectedCoins.slice(1).map(c => tx.object(c.coinObjectId))
          )
          ;[paymentCoin] = tx.splitCoins(primaryCoinRef, [tx.pure.u64(amountInBaseUnits)])
        }

        tx.moveCall({
          target: `${SUI_CONFIG.APP_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::fund_agent`,
          typeArguments: [USDC_COIN_TYPE],
          arguments: [
            tx.object(agentObjectId),
            tx.object(agentCap.id),
            paymentCoin,
            tx.object(SUI_CLOCK_OBJECT_ID),
          ],
        })

        // Execute transaction
        return new Promise((resolve, reject) => {
          signAndExecuteTransaction(
            { transaction: tx },
            {
              onSuccess: result => {
                console.log('Fund agent transaction success:', result)
                setLastResult(result)

                if (showToasts) {
                  toast.success(`Successfully funded agent with ${amount} USDC`)
                }

                onSuccess?.(result)
                resolve(result)
              },
              onError: txError => {
                console.error('Transaction failed:', txError)
                const errorMsg = 'Transaction failed'
                setError(errorMsg)

                if (showToasts) {
                  toast.error(errorMsg)
                }

                const error = new Error(errorMsg)
                onError?.(error)
                reject(error)
              },
            }
          )
        })
      } catch (error) {
        console.error('Error funding agent:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to fund agent'
        setError(errorMessage)

        if (showToasts) {
          toast.error(errorMessage)
        }

        const finalError = error instanceof Error ? error : new Error(errorMessage)
        onError?.(finalError)
        throw finalError
      } finally {
        setIsLoading(false)
      }
    },
    [account?.address, client, signAndExecuteTransaction, onSuccess, onError, showToasts, agentCaps]
  )

  const reset = useCallback(() => {
    setError(null)
    setLastResult(null)
  }, [])

  return {
    fundAgent,
    isLoading,
    error,
    lastResult,
    reset,
    isConnected: !!account?.address,
    agentCaps, // Expose fetched caps
    refetchAgentCaps: fetchAgentCaps, // Allow manual refresh
  }
}

export type { FundAgentParams, UseFundAgentOptions, AgentCap }
