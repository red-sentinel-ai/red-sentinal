import { useState } from 'react'
import { parseUnits } from 'viem'
import { toast } from 'sonner'
import posthog from 'posthog-js'
import { useChainId } from 'wagmi'
import { useActiveChain } from '@/context/ActiveChainContext'
import { useAgentObjectNames } from '@/hooks/useAgentObjectNames'
import { useCreateAgent } from '@/hooks/agents/useCreateAgent'
import { type SupportedToken } from '@/constants'
import { registerAgentUtil } from '../utils'
import { useDeploySuiAgent } from './useDeploySuiAgent'
import { useDeploySolanaAgent } from './useDeploySolanaAgent'
import { useDeployEvmAgent } from './useDeployEvmAgent'
import type { DefendFormData } from './useDefendForm'

interface UseDeployAgentOptions {
  formData: DefendFormData
  selectedToken: SupportedToken // Sui token
  selectedSolanaToken: SupportedToken // Solana token (coinType = mint address)
  selectedEvmToken: SupportedToken // EVM token (ERC-20 address)
  tokenCount: number
  agentImage: File | null
  selectedImage: { url: string; isCustom: boolean; file?: File | null } | null
}

export function useDeployAgent({
  formData,
  selectedToken,
  selectedSolanaToken,
  selectedEvmToken,
  tokenCount,
  agentImage,
  selectedImage,
}: UseDeployAgentOptions) {
  const { activeChain } = useActiveChain()
  const evmChainId = useChainId()
  const { addAgentObjectIdWithName } = useAgentObjectNames()
  const { mutate: createAgent } = useCreateAgent()

  // All chain-specific deploy hooks must be called unconditionally (hook rules)
  const suiDeploy = useDeploySuiAgent({ formData, selectedToken })
  const solanaDeploy = useDeploySolanaAgent({ formData, selectedSolanaToken })
  const evmDeploy = useDeployEvmAgent({ formData, selectedEvmToken })

  const [isLoading, setIsLoading] = useState(false)
  const [deployedAgentPath, setDeployedAgentPath] = useState<string | null>(null)
  const [transactionDigest, setTransactionDigest] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const getWalletAddress = (): string | null => {
    if (activeChain === 'solana') return solanaDeploy.walletAddress
    if (activeChain === 'bnb' || activeChain === 'bot') return evmDeploy.walletAddress
    return suiDeploy.walletAddress
  }

  const getActiveTokenDecimals = (): number => {
    if (activeChain === 'solana') return selectedSolanaToken.decimals
    if (activeChain === 'bnb' || activeChain === 'bot') return selectedEvmToken.decimals
    return selectedToken.decimals
  }

  const handleOffChainSuccess = (
    objectId: string,
    digest: string,
    agentName: string,
    agentId: string,
    ownerAddress: string
  ) => {
    addAgentObjectIdWithName(`${objectId} ${agentName}`)
    setTransactionDigest(digest)
    setShowSuccessModal(true)

    posthog.capture('sentinel_deployed', {
      chain: activeChain,
      agent_name: agentName,
      agent_id: agentId,
      agent_object_id: objectId,
      owner_address: ownerAddress,
      cost_per_message: formData.feePerMessage,
      system_prompt_length: formData.systemPrompt.length,
      system_prompt_tokens: tokenCount,
      tx_digest: digest,
    })

    const payload = new FormData()
    payload.append('agent_id', agentId)
    payload.append('agent_name', agentName)
    payload.append('object_id', objectId)
    payload.append('owner', ownerAddress)
    payload.append('digest', digest)
    payload.append('model_provider', formData.llmProvider)
    payload.append('chain', activeChain)
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

  const deploy = async (customProviderValidated: boolean, validateForm: () => boolean) => {
    if (!validateForm()) return
    if (!customProviderValidated && formData.llmProvider === 'custom') {
      toast.error('Please validate your custom provider connection before deploying')
      return
    }

    const walletAddress = getWalletAddress()
    if (!walletAddress) return

    setIsLoading(true)
    try {
      // 1. Check agent name uniqueness
      const checkResponse = await fetch(
        `/api/agents/check-name?name=${encodeURIComponent(formData.agentName)}`
      )
      const checkData = await checkResponse.json()

      if (!checkResponse.ok) throw new Error(checkData.error || 'Failed to validate Sentinel name.')

      if (checkData.exists) {
        return { nameExists: true }
      }

      // 2. Register with TEE (chain-aware)
      const decimals = getActiveTokenDecimals()
      const feePerMessage = activeChain === 'bnb' || activeChain === 'bot'
        ? Number(parseUnits(formData.feePerMessage, decimals))
        : parseFloat(formData.feePerMessage) * Math.pow(10, decimals)
      const isCustom = formData.llmProvider === 'custom'

      const teeResponse = await registerAgentUtil(
        formData.systemPrompt,
        feePerMessage,
        walletAddress,
        formData.llmProvider,
        isCustom ? formData.customModelName : formData.llmModel,
        formData.privatePrompt,
        formData.attackGoal,
        formData.juryPrompt,
        activeChain,
        isCustom ? { apiBaseUrl: formData.customEndpointUrl, apiKey: formData.customApiKey } : undefined,
        activeChain === 'bnb' || activeChain === 'bot' ? evmChainId : undefined
      )

      // 3. Execute chain-specific transaction
      let result: { objectId: string; digest: string }

      if (activeChain === 'solana') {
        result = await solanaDeploy.executeTransaction(teeResponse)
      } else if (activeChain === 'bnb' || activeChain === 'bot') {
        result = await evmDeploy.executeTransaction(teeResponse)
      } else {
        result = await suiDeploy.executeTransaction(teeResponse)
      }

      // 4. Handle off-chain success (Supabase storage)
      const agentId = teeResponse.response?.data?.agent_id
      handleOffChainSuccess(result.objectId, result.digest, formData.agentName, agentId, walletAddress)
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
