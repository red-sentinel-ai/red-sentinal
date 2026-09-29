import { Transaction } from '@mysten/sui/transactions'
import { SuiTransactionBlockResponse } from '@mysten/sui/client'
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui/utils'
import { SUI_CONFIG } from '@/constants'
import { SUI_COIN_TYPE } from '@/constants/tokens'
import { useSuiSignAndExecute } from '@/hooks/useSuiSignAndExecute'
import type { SupportedToken } from '@/constants/shared'
import { hexToVector } from '@/lib/utils'
import type { ChainDeployHook, SuiTeeResponse } from '../types'
import type { DefendFormData } from './useDefendForm'

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

  const { mutate: signAndExecuteTransaction } = useSuiSignAndExecute()

  const buildInitialFundCoin = async (tx: Transaction, amountRaw: bigint) => {
    // SUI registration: split the fund from tx.gas itself — gas and the fund
    // coin share the same coin, exactly like a wallet-built transaction.
    // Building the fund from the user's coin objects instead would consume
    // them as inputs, and the SDK's gas selection filters out coins used as
    // inputs, so a wallet with a single SUI coin would end up with no valid
    // gas coins. Splitting zero is valid for a bounty of 0.
    if (selectedToken.coinType === SUI_COIN_TYPE) {
      const { totalBalance } = await client.getBalance({
        owner: account!.address,
        coinType: SUI_COIN_TYPE,
      })
      if (BigInt(totalBalance) < amountRaw) {
        throw new Error(
          `Insufficient ${selectedToken.symbol} balance. Need ${formData.initialBalance} ${selectedToken.symbol}, have ${Number(totalBalance) / Math.pow(10, selectedToken.decimals)} ${selectedToken.symbol}. Claim a ${selectedToken.symbol} credit from your profile or fund your wallet and try again.`
        )
      }
      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amountRaw)])
      return coin
    }

    // Zero-bounty registration for a non-SUI token: build a zero-balance Coin
    // on-chain (0x2::coin::zero) so the wallet needs no coins of that type.
    if (amountRaw === BigInt(0)) {
      const [coin] = tx.moveCall({
        target: '0x2::coin::zero',
        typeArguments: [selectedToken.coinType],
      })
      return coin
    }

    // Every other case: the fund is split from the user's own coin objects of
    // the selected token.
    const coins = await client.getCoins({
      owner: account!.address,
      coinType: selectedToken.coinType,
      limit: 100,
    })

    const sorted = coins.data.sort((a, b) => Number(b.balance) - Number(a.balance))
    const totalAvailable = sorted.reduce((sum, c) => sum + BigInt(c.balance), BigInt(0))

    if (totalAvailable < amountRaw) {
      throw new Error(
        `Insufficient ${selectedToken.symbol} balance. Need ${formData.initialBalance} ${selectedToken.symbol}, have ${Number(totalAvailable) / Math.pow(10, selectedToken.decimals)} ${selectedToken.symbol}. Claim a ${selectedToken.symbol} credit from your profile or fund your wallet and try again.`
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
      Math.floor(parseFloat(formData.initialBalance || '0') * Math.pow(10, selectedToken.decimals))
    )

    const initialFundCoin = await buildInitialFundCoin(tx, initialAmountRaw)

    tx.moveCall({
      target: `${SUI_CONFIG.APP_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::register_agent`,
      typeArguments: [selectedToken.coinType],
      arguments: [
        tx.object(SUI_CONFIG.AGENT_REGISTRY),
        tx.object(SUI_CONFIG.PROTOCOL_CONFIG_ID),
        tx.pure.string(teeResponse.response.data.agent_id),
        tx.pure.u64(teeResponse.response.timestamp), // seconds
        tx.pure.u64(teeResponse.response.data.cost_per_message),
        tx.pure.vector('u8', teeResponse.response.data.prompt_hash),
        initialFundCoin,
        tx.pure.vector('u8', sigVector),
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
