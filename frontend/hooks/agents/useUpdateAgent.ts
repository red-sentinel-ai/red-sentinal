import { useState, useCallback } from 'react'
import { Transaction } from '@mysten/sui/transactions'
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui/utils'
import { toast } from 'react-toastify'
import { MIST_PER_SUI, SUI_CONFIG } from '@/constants'

export const useUpdateAgent = () => {
  const client = useSuiClient()
  const account = useCurrentAccount()
  const [isLoading, setIsLoading] = useState(false)

  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()

  const getAgentCap = useCallback(
    async (agentId: string) => {
      if (!account?.address) return null

      let cursor = null
      let hasNextPage = true

      while (hasNextPage) {
        const response = await client.getOwnedObjects({
          owner: account.address,
          filter: {
            StructType: `${SUI_CONFIG.APP_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::AgentCap`,
          },
          options: {
            showContent: true,
          },
          cursor,
        })

        if (!response.data) break

        const foundCap = response.data.find(obj => {
          const content = obj.data?.content
          return (
            content?.dataType === 'moveObject' &&
            String((content.fields as any).agent_id) === String(agentId)
          )
        })

        if (foundCap) {
          return foundCap.data?.objectId
        }

        hasNextPage = response.hasNextPage
        cursor = response.nextCursor
      }

      return null
    },
    [account?.address, client]
  )

  const executeUpdate = useCallback(
    async (
      agentId: string,
      buildTransaction: (tx: Transaction, capId: string) => void,
      successMessage: string,
      onSuccess?: () => void
    ) => {
      if (!account?.address) {
        toast.error('Wallet not connected')
        return
      }

      setIsLoading(true)
      try {
        const capId = await getAgentCap(agentId)
        if (!capId) {
          throw new Error('You do not own the Capability for this Agent')
        }

        const tx = new Transaction()
        buildTransaction(tx, capId)

        signAndExecuteTransaction(
          { transaction: tx },
          {
            onSuccess: () => {
              toast.success(successMessage)
              onSuccess?.()
            },
            onError: error => {
              console.error('Update error:', error)
              toast.error(`Failed to update: ${error.message}`)
            },
          }
        )
      } catch (error: any) {
        console.error(error)
        toast.error(error.message)
      } finally {
        setIsLoading(false)
      }
    },
    [account?.address, getAgentCap, signAndExecuteTransaction]
  )

  const updatePrompt = useCallback(
    (agentId: string, agentObjectId: string, newPrompt: string, onSuccess?: () => void) => {
      executeUpdate(
        agentId,
        (tx, capId) => {
          tx.moveCall({
            target: `${SUI_CONFIG.APP_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::update_agent_prompt`,
            arguments: [
              tx.object(agentObjectId),
              tx.object(capId),
              tx.pure.string(newPrompt),
              tx.object(SUI_CLOCK_OBJECT_ID),
            ],
          })
        },
        'Agent prompt updated successfully!',
        onSuccess
      )
    },
    [executeUpdate]
  )

  const updateCost = useCallback(
    (agentId: string, agentObjectId: string, newCostSui: number, onSuccess?: () => void) => {
      const costInMist = BigInt(Math.floor(newCostSui * Number(MIST_PER_SUI)))

      executeUpdate(
        agentId,
        (tx, capId) => {
          tx.moveCall({
            target: `${SUI_CONFIG.APP_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::update_agent_cost`,
            arguments: [
              tx.object(agentObjectId),
              tx.object(capId),
              tx.pure.u64(costInMist),
              tx.object(SUI_CLOCK_OBJECT_ID),
            ],
          })
        },
        'Agent attack fee updated successfully!',
        onSuccess
      )
    },
    [executeUpdate]
  )

  const claimFees = useCallback(
    (agentId: string, agentObjectId: string, onSuccess?: () => void) => {
      executeUpdate(
        agentId,
        (tx, capId) => {
          tx.moveCall({
            target: `${SUI_CONFIG.APP_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::claim_fees`,
            arguments: [tx.object(agentObjectId), tx.object(capId)],
          })
        },
        'Fees claimed successfully!',
        onSuccess
      )
    },
    [executeUpdate]
  )

  return {
    updatePrompt,
    updateCost,
    claimFees,
    isLoading,
  }
}
