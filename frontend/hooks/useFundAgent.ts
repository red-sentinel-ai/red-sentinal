import { useState, useCallback, useEffect } from 'react'
import { Transaction } from '@mysten/sui/transactions'
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui/utils'
import { SUI_CONFIG, SUI_LEGACY_CONFIG } from '@/constants'
import { SUI_COIN_TYPE } from '@/constants/tokens'
import { toast } from 'sonner'


interface UseFundAgentOptions {
  onSuccess?: (result: any) => void
  onError?: (error: Error) => void
  showToasts?: boolean
}

interface FundAgentParams {
  agentObjectId: string
  agentId: string // The agent_id string to match with AgentCap
  amount: number
  coinType?: string // defaults to USDC
  decimals?: number // defaults to 6
  symbol?: string // defaults to 'USDC'
}

interface AgentCap {
  id: string
  agentId: string
  isLegacy: boolean
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
      const [newObjects, legacyObjects] = await Promise.all([
        client.getOwnedObjects({
          owner: account.address,
          filter: {
            StructType: `${SUI_CONFIG.APP_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::AgentCap`,
          },
          options: { showContent: true, showType: true },
        }),
        client.getOwnedObjects({
          owner: account.address,
          filter: {
            StructType: `${SUI_LEGACY_CONFIG.APP_PACKAGE_ID}::${SUI_LEGACY_CONFIG.MODULE_NAME}::AgentCap`,
          },
          options: { showContent: true, showType: true },
        }),
      ])

      const parseObjects = (objects: typeof newObjects, isLegacy: boolean): AgentCap[] =>
        objects.data
          .filter(obj => obj.data?.content?.dataType === 'moveObject')
          .map(obj => {
            const fields = (obj.data?.content as any)?.fields
            return {
              id: obj.data?.objectId || '',
              agentId: fields?.agent_id || '',
              isLegacy,
            }
          })
          .filter(cap => cap.id && cap.agentId)

      const caps = [...parseObjects(newObjects, false), ...parseObjects(legacyObjects, true)]
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
    async ({
      agentObjectId,
      agentId,
      amount,
      coinType = '0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC',
      decimals = 6,
      symbol = 'USDC',
    }: FundAgentParams) => {
      console.log({ agentObjectId, agentId, amount, coinType })
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

      // Find the matching AgentCap — re-fetch first to handle the race condition
      // where a freshly-deployed agent's cap isn't in stale state yet
      let caps = agentCaps
      let agentCap = caps.find(cap => cap.agentId.toString() === agentId.toString())
      if (!agentCap) {
        await fetchAgentCaps()
        // fetchAgentCaps updates state asynchronously, so read directly from the RPC result
        const [newObjects, legacyObjects] = await Promise.all([
          client.getOwnedObjects({
            owner: account.address,
            filter: {
              StructType: `${SUI_CONFIG.APP_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::AgentCap`,
            },
            options: { showContent: true, showType: true },
          }),
          client.getOwnedObjects({
            owner: account.address,
            filter: {
              StructType: `${SUI_LEGACY_CONFIG.APP_PACKAGE_ID}::${SUI_LEGACY_CONFIG.MODULE_NAME}::AgentCap`,
            },
            options: { showContent: true, showType: true },
          }),
        ])
        const parseObjects = (objects: typeof newObjects, isLegacy: boolean): AgentCap[] =>
          objects.data
            .filter(obj => obj.data?.content?.dataType === 'moveObject')
            .map(obj => {
              const fields = (obj.data?.content as any)?.fields
              return { id: obj.data?.objectId || '', agentId: fields?.agent_id || '', isLegacy }
            })
            .filter(cap => cap.id && cap.agentId)
        caps = [...parseObjects(newObjects, false), ...parseObjects(legacyObjects, true)]
        agentCap = caps.find(cap => cap.agentId.toString() === agentId.toString())
      }

      if (!agentCap) {
        const errorMsg = `You don't own the AgentCap for agent "${agentId}". Only the agent creator can fund it.`
        setError(errorMsg)
        if (showToasts) toast.error(errorMsg)
        throw new Error(errorMsg)
      }

      setIsLoading(true)
      setError(null)

      try {
        const amountInBaseUnits = BigInt(Math.floor(amount * Math.pow(10, decimals)))

        // Create transaction — gas is paid in SUI automatically, no gas/payment merging needed
        const tx = new Transaction()

        let paymentCoin
        if (coinType === SUI_COIN_TYPE) {
          // SUI is the gas coin — split directly from tx.gas
          ;[paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(amountInBaseUnits)])
        } else {
          // Non-SUI token (e.g. USDC) — fetch coins from wallet
          const coins = await client.getCoins({
            owner: account.address,
            coinType,
            limit: 100,
          })

          if (!coins.data.length) {
            throw new Error(`No ${symbol} coins found in wallet`)
          }

          const sortedCoins = coins.data.sort((a, b) => Number(b.balance) - Number(a.balance))
          const totalAvailable = sortedCoins.reduce(
            (sum, coin) => sum + BigInt(coin.balance),
            BigInt(0)
          )
          console.log(`Amount needed (${symbol}):`, amount)
          console.log(
            `Total available (${symbol}):`,
            Number(totalAvailable) / Math.pow(10, decimals)
          )

          if (totalAvailable < amountInBaseUnits) {
            throw new Error(
              `Insufficient ${symbol} balance. Need ${amount} ${symbol}, have ${
                Number(totalAvailable) / Math.pow(10, decimals)
              } ${symbol}`
            )
          }

          // Select minimum coins needed to cover the amount
          const selectedCoins: typeof sortedCoins = []
          let runningTotal = BigInt(0)
          for (const coin of sortedCoins) {
            selectedCoins.push(coin)
            runningTotal += BigInt(coin.balance)
            if (runningTotal >= amountInBaseUnits) break
          }

          if (selectedCoins.length === 1) {
            ;[paymentCoin] = tx.splitCoins(tx.object(selectedCoins[0].coinObjectId), [
              tx.pure.u64(amountInBaseUnits),
            ])
          } else {
            console.log(`📋 Merging ${selectedCoins.length} ${symbol} coins`)
            const primaryCoinRef = tx.object(selectedCoins[0].coinObjectId)
            tx.mergeCoins(
              primaryCoinRef,
              selectedCoins.slice(1).map(c => tx.object(c.coinObjectId))
            )
            ;[paymentCoin] = tx.splitCoins(primaryCoinRef, [tx.pure.u64(amountInBaseUnits)])
          }
        }

        const packageId = agentCap.isLegacy
          ? SUI_LEGACY_CONFIG.APP_PACKAGE_ID
          : SUI_CONFIG.APP_PACKAGE_ID
        const moduleName = agentCap.isLegacy
          ? SUI_LEGACY_CONFIG.MODULE_NAME
          : SUI_CONFIG.MODULE_NAME

        const moveCallArgs: any = {
          target: `${packageId}::${moduleName}::fund_agent`,
          arguments: [
            tx.object(agentObjectId),
            tx.object(agentCap.id),
            paymentCoin,
            tx.object(SUI_CLOCK_OBJECT_ID),
          ],
        }

        if (!agentCap.isLegacy) {
          moveCallArgs.typeArguments = [coinType]
        }

        tx.moveCall(moveCallArgs)

        // Execute transaction
        return new Promise((resolve, reject) => {
          signAndExecuteTransaction(
            { transaction: tx },
            {
              onSuccess: result => {
                console.log('Fund agent transaction success:', result)
                setLastResult(result)

                if (showToasts) {
                  toast.success(`Successfully funded agent with ${amount} ${symbol}`)
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
