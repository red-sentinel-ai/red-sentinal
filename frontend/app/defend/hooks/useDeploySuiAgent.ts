import { Transaction } from '@mysten/sui/transactions'
import { SuiTransactionBlockResponse } from '@mysten/sui/client'
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit'
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui/utils'
import { SUI_CONFIG } from '@/constants'
import { SUI_COIN_TYPE } from '@/constants/tokens'
import type { SupportedToken } from '@/constants/shared'
import { hexToVector } from '@/lib/utils'
import type { DefendFormData } from './useDefendForm'
import type { ChainDeployHook, SuiTeeResponse } from '../types'

interface UseDeploySuiAgentOptions {
  formData: DefendFormData
  selectedToken: SupportedToken
}

export function useDeploySuiAgent({
  formData,
  selectedToken,
}: UseDeploySuiAgentOptions): ChainDeployHook {
  const client = useSuiClient()
  const account = useCurrentAccount()

  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      await client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: { showRawEffects: true, showObjectChanges: true },
      }),
  })

  const buildInitialFundCoin = async (tx: Transaction, amountRaw: bigint) => {
    if (selectedToken.coinType === SUI_COIN_TYPE) {
      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amountRaw)])
      return coin
    }

    const coins = await client.getCoins({
      owner: account!.address,
      coinType: selectedToken.coinType,
      limit: 100,
    })

    if (!coins.data.length) {
      throw new Error(`No ${selectedToken.symbol} coins found in wallet`)
    }

    const sorted = coins.data.sort((a, b) => Number(b.balance) - Number(a.balance))
    const totalAvailable = sorted.reduce((sum, c) => sum + BigInt(c.balance), BigInt(0))

    if (totalAvailable < amountRaw) {
      throw new Error(
        `Insufficient ${selectedToken.symbol} balance. Need ${formData.initialBalance} ${selectedToken.symbol}, have ${Number(totalAvailable) / Math.pow(10, selectedToken.decimals)} ${selectedToken.symbol}`
      )
    }

    const selected: typeof sorted = []
    let running = BigInt(0)
    for (const coin of sorted) {
      selected.push(coin)
      running += BigInt(coin.balance)
      if (running >= amountRaw) break
    }

    if (selected.length === 1) {
      const [coin] = tx.splitCoins(tx.object(selected[0].coinObjectId), [tx.pure.u64(amountRaw)])
      return coin
    }

    const primary = tx.object(selected[0].coinObjectId)
    tx.mergeCoins(primary, selected.slice(1).map(c => tx.object(c.coinObjectId)))
    const [coin] = tx.splitCoins(primary, [tx.pure.u64(amountRaw)])
    return coin
  }

  const executeTransaction = async (
    teeResponse: SuiTeeResponse
  ): Promise<{ objectId: string; digest: string }> => {
    const tx = new Transaction()
    const sigVector = hexToVector(teeResponse.signature)
    const initialAmountRaw = BigInt(
      Math.floor(parseFloat(formData.initialBalance) * Math.pow(10, selectedToken.decimals))
    )

    const initialFundCoin = await buildInitialFundCoin(tx, initialAmountRaw)

    tx.moveCall({
      target: `${SUI_CONFIG.APP_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::register_agent`,
      typeArguments: [selectedToken.coinType],
      arguments: [
        tx.object(SUI_CONFIG.AGENT_REGISTRY),
        tx.object(SUI_CONFIG.PROTOCOL_CONFIG_ID),
        tx.pure.string(teeResponse.response.data.agent_id),
        tx.pure.u64(teeResponse.response.timestamp_ms),
        tx.pure.u64(teeResponse.response.data.cost_per_message),
        tx.pure.string(teeResponse.response.data.system_prompt),
        initialFundCoin,
        tx.pure.vector('u8', sigVector),
        tx.object(SUI_CONFIG.ENCLAVE_OBJECT_ID),
        tx.object(SUI_CLOCK_OBJECT_ID),
      ],
    })

    return new Promise((resolve, reject) => {
      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result: SuiTransactionBlockResponse) => {
            const agentObject = result?.objectChanges?.find(
              (obj: any) =>
                obj.objectType ===
                `${SUI_CONFIG.APP_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::Agent<${selectedToken.coinType}>`
            )
            const agentObjectId = agentObject ? (agentObject as any).objectId : ''
            resolve({
              objectId: agentObjectId,
              digest: result.digest.toString(),
            })
          },
          onError: (error: Error) => {
            reject(error)
          },
        }
      )
    })
  }

  return {
    walletAddress: account?.address ?? null,
    executeTransaction: executeTransaction as any,
  }
}
