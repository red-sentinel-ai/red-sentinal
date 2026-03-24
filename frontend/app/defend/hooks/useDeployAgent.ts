import { useState } from 'react'
import { toast } from 'sonner'
import posthog from 'posthog-js'
import { Transaction } from '@mysten/sui/transactions'
import { SuiTransactionBlockResponse } from '@mysten/sui/client'
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit'
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui/utils'
import { SUI_COIN_TYPE, SUI_CONFIG, type SupportedToken } from '@/constants'
import { hexToVector } from '@/lib/utils'
import { useAgentObjectNames } from '@/hooks/useAgentObjectNames'
import { useCreateAgent } from '@/hooks/agents/useCreateAgent'
import { registerAgentUtil } from '../utils'
import type { DefendFormData } from './useDefendForm'

interface UseDeployAgentOptions {
  formData: DefendFormData
  selectedToken: SupportedToken
  tokenCount: number
  agentImage: File | null
  selectedImage: { url: string; isCustom: boolean; file?: File | null } | null
}

export function useDeployAgent({
  formData,
  selectedToken,
  tokenCount,
  agentImage,
  selectedImage,
}: UseDeployAgentOptions) {
  const client = useSuiClient()
  const account = useCurrentAccount()
  const { addAgentObjectIdWithName } = useAgentObjectNames()
  const { mutate: createAgent } = useCreateAgent()

  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      await client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: { showRawEffects: true, showObjectChanges: true },
      }),
  })

  const [isLoading, setIsLoading] = useState(false)
  const [deployedAgentPath, setDeployedAgentPath] = useState<string | null>(null)
  const [transactionDigest, setTransactionDigest] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)

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

  const handleOffChainSuccess = async (
    result: SuiTransactionBlockResponse,
    agentName: string,
    agentId: string
  ) => {
    const agentObject = result?.objectChanges?.find(
      (obj: any) =>
        obj.objectType ===
        `${SUI_CONFIG.APP_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::Agent<${selectedToken.coinType}>`
    )

    if (!agentObject) return

    const agentObjectId = (agentObject as any).objectId
    await addAgentObjectIdWithName(`${agentObjectId} ${agentName}`)
    setTransactionDigest(result.digest.toString())
    setShowSuccessModal(true)

    posthog.capture('sentinel_deployed', {
      agent_name: agentName,
      agent_id: agentId,
      agent_object_id: agentObjectId,
      owner_address: account!.address,
      cost_per_message: formData.feePerMessage,
      system_prompt_length: formData.systemPrompt.length,
      system_prompt_tokens: tokenCount,
      tx_digest: result.digest.toString(),
    })

    const payload = new FormData()
    payload.append('agent_id', agentId)
    payload.append('agent_name', agentName)
    payload.append('object_id', agentObjectId)
    payload.append('owner', account!.address)
    payload.append('digest', result.digest.toString())
    payload.append('model_provider', formData.llmProvider)
    payload.append(
      'model_name',
      formData.llmProvider === 'custom' ? formData.customModelName : formData.llmModel
    )

    if (agentImage) {
      payload.append('image', agentImage)
    } else if (selectedImage?.url && !selectedImage.isCustom) {
      payload.append('image_url', selectedImage.url)
    }

    createAgent(payload, {
      onSuccess: data => {
        if (data?.data?.agent_path) setDeployedAgentPath(data.data.agent_path)
      },
    })
  }

  const createAgentTransaction = async (agentDetails: any) => {
    const tx = new Transaction()
    const sigVector = hexToVector(agentDetails.signature)
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
        tx.pure.string(agentDetails.response.data.agent_id),
        tx.pure.u64(agentDetails.response.timestamp_ms),
        tx.pure.u64(agentDetails.response.data.cost_per_message),
        tx.pure.string(agentDetails.response.data.system_prompt),
        initialFundCoin,
        tx.pure.vector('u8', sigVector),
        tx.object(SUI_CONFIG.ENCLAVE_OBJECT_ID),
        tx.object(SUI_CLOCK_OBJECT_ID),
      ],
    })

    return await signAndExecuteTransaction(
      { transaction: tx },
      {
        onSuccess: async result => {
          await handleOffChainSuccess(result, formData.agentName, agentDetails.response.data.agent_id)
        },
      }
    )
  }

  const deploy = async (customProviderValidated: boolean, validateForm: () => boolean) => {
    if (!validateForm()) return
    if (!customProviderValidated && formData.llmProvider === 'custom') {
      toast.error('Please validate your custom provider connection before deploying')
      return
    }
    if (!account) return

    setIsLoading(true)
    try {
      const checkResponse = await fetch(
        `/api/agents/check-name?name=${encodeURIComponent(formData.agentName)}`
      )
      const checkData = await checkResponse.json()

      if (!checkResponse.ok) throw new Error(checkData.error || 'Failed to validate Sentinel name.')

      if (checkData.exists) {
        // Return the error so the caller can set it via setErrors
        return { nameExists: true }
      }

      const feePerMessage =
        parseFloat(formData.feePerMessage) * Math.pow(10, selectedToken.decimals)
      const isCustom = formData.llmProvider === 'custom'

      const agentDetails = await registerAgentUtil(
        formData.systemPrompt,
        feePerMessage,
        account.address,
        formData.llmProvider,
        isCustom ? formData.customModelName : formData.llmModel,
        formData.privatePrompt,
        formData.attackGoal,
        formData.juryPrompt,
        isCustom ? { apiBaseUrl: formData.customEndpointUrl, apiKey: formData.customApiKey } : undefined
      )

      await createAgentTransaction(agentDetails)
    } catch (error) {
      console.error('Deployment error:', error)
      toast.error(error instanceof Error ? error.message : 'Deployment failed')
    } finally {
      setIsLoading(false)
    }
  }

  const resetDeployState = () => {
    setDeployedAgentPath(null)
    setTransactionDigest('')
    setShowSuccessModal(false)
  }

  return {
    isLoading,
    deployedAgentPath,
    transactionDigest,
    showSuccessModal,
    setShowSuccessModal,
    deploy,
    resetDeployState,
  }
}
