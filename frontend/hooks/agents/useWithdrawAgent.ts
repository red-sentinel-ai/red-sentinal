import { useState, useCallback, useEffect } from 'react'
import { Transaction } from '@mysten/sui/transactions'
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import { MIST_PER_SUI, SUI_CONFIG, SUI_CLOCK_OBJECT_ID } from '@/constants'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { AGENT_DETAILS_QUERY_KEY } from './useAgentBySlug'

interface UseWithdrawAgentOptions {
  onSuccess?: (result: any) => void
  onError?: (error: Error) => void
  showToasts?: boolean
}

interface AgentCap {
  id: string
  agentId: string
}

interface WithdrawAgentParams {
  agentObjectId: string
  agentId: string
  amount: number // Amount in SUI
}

export const useWithdrawAgent = (options: UseWithdrawAgentOptions = {}) => {
  const { onSuccess, onError, showToasts = true } = options
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
    } catch (error) {
      console.error('Error fetching AgentCaps:', error)
    }
  }, [account?.address, client])

  useEffect(() => {
    fetchAgentCaps()
  }, [fetchAgentCaps])

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

      const agentCap = agentCaps.find(cap => cap.agentId.toString() === agentId.toString())
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
        const amountInMist = BigInt(Math.floor(amount * MIST_PER_SUI))

        const [coin] = tx.moveCall({
          target: `${SUI_CONFIG.APP_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::withdraw_from_agent`,
          arguments: [
            tx.object(agentObjectId),
            tx.object(agentCap.id),
            tx.pure.u64(amountInMist),
            tx.object(SUI_CLOCK_OBJECT_ID),
          ],
        })

        tx.transferObjects([coin], account.address)

        return new Promise((resolve, reject) => {
          signAndExecuteTransaction(
            { transaction: tx },
            {
              onSuccess: result => {
                console.log('Withdraw agent transaction success:', result)
                setLastResult(result)

                if (showToasts) {
                  toast.success(`Successfully withdrew ${amount} SUI`)
                }

                // Refetch agent data
                queryClient.invalidateQueries({
                  queryKey: ['agents-by-owner', account?.address],
                })
                queryClient.invalidateQueries({
                  queryKey: [AGENT_DETAILS_QUERY_KEY],
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
