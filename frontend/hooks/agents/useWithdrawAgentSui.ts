import { useState, useCallback, useEffect } from 'react'
import { Transaction } from '@mysten/sui/transactions'
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui/utils'
import { SUI_CONFIG, SUI_LEGACY_CONFIG } from '@/constants'
import { SUI_COIN_TYPE, getTokenForCoinType } from '@/constants/tokens'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { AGENT_DETAILS_FULL_QUERY_KEY } from './useAgentDetails'

interface UseWithdrawAgentOptions {
  onSuccess?: (result: any) => void
  onError?: (error: Error) => void
  showToasts?: boolean
  enabled?: boolean
}

interface AgentCap {
  id: string
  agentId: string
  coinType: string
  isLegacy: boolean  
}

interface WithdrawAgentParams {
  agentObjectId: string
  agentId: string
  amount: number
}

/** Extract coin type from a full Sui struct type string.
 *  e.g. "0xpkg::sentinel::AgentCap<0x2::sui::SUI>" → "0x2::sui::SUI"
 *  Returns SUI_COIN_TYPE when no type parameter is present (legacy agents). */
function extractCoinTypeFromObjectType(objectType: string): string {
  const match = objectType.match(/<(.+)>$/)
  return match ? match[1] : SUI_COIN_TYPE
}

export const useWithdrawAgentSui = (options: UseWithdrawAgentOptions = {}) => {
  const { onSuccess, onError, showToasts = true, enabled = true } = options
  const client = useSuiClient()
  const queryClient = useQueryClient()

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

  const fetchAgentCaps = useCallback(async (): Promise<AgentCap[]> => {
    if (!account?.address) {
      setAgentCaps([])
      return []
    }

    try {
      // Query both new multi-token contract and legacy single-token contract in parallel
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
            const objectType: string = obj.data?.type || ''
            return {
              id: obj.data?.objectId || '',
              agentId: fields?.agent_id || '',
              coinType: isLegacy ? SUI_COIN_TYPE : extractCoinTypeFromObjectType(objectType),
              isLegacy,
            }
          })
          .filter(cap => cap.id && cap.agentId)

      const caps = [...parseObjects(newObjects, false), ...parseObjects(legacyObjects, true)]
      setAgentCaps(caps)
      return caps
    } catch (error) {
      console.error('Error fetching AgentCaps:', error)
      return []
    }
  }, [account?.address, client])

  useEffect(() => {
    if (!enabled) return
    fetchAgentCaps()
  }, [enabled, fetchAgentCaps])

  const withdrawAgent = useCallback(
    async ({ agentObjectId, agentId, amount }: WithdrawAgentParams) => {
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

      let agentCap = agentCaps.find(cap => cap.agentId.toString() === agentId.toString())
      if (!agentCap) {
        const freshCaps = await fetchAgentCaps()
        agentCap = freshCaps.find(cap => cap.agentId.toString() === agentId.toString())
      }
      if (!agentCap) {
        const errorMsg = `You don't own the AgentCap for this agent. Only the agent creator can withdraw.`
        setError(errorMsg)
        if (showToasts) toast.error(errorMsg)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const tx = new Transaction()
        const token = getTokenForCoinType(agentCap.coinType)
        const amountInRaw = BigInt(Math.round(amount * Math.pow(10, token.decimals)))

        const packageId = agentCap.isLegacy
          ? SUI_LEGACY_CONFIG.APP_PACKAGE_ID
          : SUI_CONFIG.APP_PACKAGE_ID
        const moduleName = agentCap.isLegacy
          ? SUI_LEGACY_CONFIG.MODULE_NAME
          : SUI_CONFIG.MODULE_NAME

        const moveCallArgs: any = {
          target: `${packageId}::${moduleName}::withdraw_from_agent`,
          arguments: [
            tx.object(agentObjectId),
            tx.object(agentCap.id),
            tx.pure.u64(amountInRaw),
            tx.object(SUI_CLOCK_OBJECT_ID),
          ],
        }

        if (!agentCap.isLegacy) {
          moveCallArgs.typeArguments = [agentCap.coinType]
        }

        const [coin] = tx.moveCall(moveCallArgs)

        tx.transferObjects([coin], account.address)

        return new Promise((resolve, reject) => {
          signAndExecuteTransaction(
            { transaction: tx },
            {
              onSuccess: result => {
                console.log('Withdraw agent transaction success:', result)
                setLastResult(result)

                if (showToasts) {
                  toast.success(`Successfully withdrew ${amount} ${token.symbol}`)
                }

                // Refetch agent data
                queryClient.invalidateQueries({
                  queryKey: ['agents-by-owner', account?.address],
                })
                queryClient.invalidateQueries({
                  queryKey: [AGENT_DETAILS_FULL_QUERY_KEY],
                })

                onSuccess?.(result)
                resolve(result)
              },
              onError: txError => {
                console.error('Transaction failed:', txError)
                const errorMsg = 'Transaction failed: ' + txError.message
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
        console.error('Error withdrawing from agent:', error)
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to withdraw from agent'
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
    [
      account?.address,
      agentCaps,
      fetchAgentCaps,
      signAndExecuteTransaction,
      onSuccess,
      onError,
      showToasts,
      queryClient,
    ]
  )

  const reset = useCallback(() => {
    setError(null)
    setLastResult(null)
  }, [])

  return {
    withdrawAgent,
    isLoading,
    error,
    lastResult,
    reset,
    isConnected: !!account?.address,
  }
}
