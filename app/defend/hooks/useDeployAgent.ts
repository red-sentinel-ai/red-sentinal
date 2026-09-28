import { useState } from 'react'
import { parseUnits } from 'viem'
import { toast } from 'sonner'
import posthog from 'posthog-js'
import { useActiveChain } from '@/context/ActiveChainContext'
import { useAuth } from '@/context/AuthContext'
import { useSuiClient } from '@mysten/dapp-kit'
import { isEvmChain } from '@/constants/chains'
import { useEvmChain } from '@/hooks/evm/useEvmChain'
import { useCreateAgent } from '@/hooks/agents/useCreateAgent'
import { SPONSORED_GAS_ENABLED, type SupportedToken } from '@/constants'
import { registerAgentUtil, resolveProviderCredentials } from '../utils'
import type { AgenticConfig } from '../agentic-types'
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
  agenticConfig: AgenticConfig | null
}

export function useDeployAgent({
  formData,
  selectedToken,
  selectedSolanaToken,
  selectedEvmToken,
  tokenCount,
  agentImage,
  selectedImage,
  agenticConfig,
}: UseDeployAgentOptions) {
  const { activeChain } = useActiveChain()
  const { intendedChainId, ensureWalletOnActiveChain } = useEvmChain()
  const { user } = useAuth()
  const { mutate: createAgent } = useCreateAgent()

  // All chain-specific deploy hooks must be called unconditionally (hook rules)
  // Sui registration always rides on gas sponsorship when the user is signed
  // in. If the user configures a bounty/fee their wallet can't cover, the
  // deploy falls back to the free sponsored tier (bounty 0, attack fee 0).
  const willSponsorSui = SPONSORED_GAS_ENABLED && !!user?.id
  const suiClient = useSuiClient()
  const suiDeploy = useDeploySuiAgent({
    formData,
    selectedToken,
    sponsored: willSponsorSui,
  })
  const solanaDeploy = useDeploySolanaAgent({ formData, selectedSolanaToken })
  const evmDeploy = useDeployEvmAgent({ formData, selectedEvmToken })

  const [isLoading, setIsLoading] = useState(false)
  const [deployedAgentPath, setDeployedAgentPath] = useState<string | null>(null)
  const [transactionDigest, setTransactionDigest] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const getWalletAddress = (): string | null => {
    if (activeChain === 'solana') return solanaDeploy.walletAddress
    if (isEvmChain(activeChain)) return evmDeploy.walletAddress
    return suiDeploy.walletAddress
  }

  const getActiveTokenDecimals = (): number => {
    if (activeChain === 'solana') return selectedSolanaToken.decimals
    if (isEvmChain(activeChain)) return selectedEvmToken.decimals
    return selectedToken.decimals
  }

  const handleOffChainSuccess = (
    objectId: string,
    digest: string,
    agentName: string,
    agentId: string,
    ownerAddress: string,
    effectiveFeePerMessage: number
  ) => {
    setTransactionDigest(digest)
    setShowSuccessModal(true)

    posthog.capture('sentinel_deployed', {
      chain: activeChain,
      agent_name: agentName,
      agent_id: agentId,
      agent_object_id: objectId,
      owner_address: ownerAddress,
      // Effective fee the TEE signed — 0 on the sponsored free tier, not the
      // raw form value.
      cost_per_message: effectiveFeePerMessage / Math.pow(10, getActiveTokenDecimals()),
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
      if (isEvmChain(activeChain)) await ensureWalletOnActiveChain()

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
      let feePerMessage: number
      let suiFundBountyFromWallet = false
      if (isEvmChain(activeChain)) {
        feePerMessage = Number(parseUnits(formData.feePerMessage, decimals))
      } else if (activeChain === 'sui' && willSponsorSui) {
        // Gas sponsorship is always on for signed-in users. A bounty the
        // wallet can't afford downgrades the deploy to the free sponsored
        // tier (bounty 0, attack fee 0); a fundable bounty (or fee alone,
        // which costs nothing at registration) keeps the user's config.
        const typedFee = parseFloat(formData.feePerMessage || '0') * Math.pow(10, decimals)
        const typedBounty = Math.floor(
          parseFloat(formData.initialBalance || '0') * Math.pow(10, decimals)
        )
        if (typedBounty > 0) {
          const { totalBalance } = await suiClient.getBalance({
            owner: walletAddress,
            coinType: selectedToken.coinType,
          })
          if (BigInt(totalBalance) >= BigInt(typedBounty)) {
            suiFundBountyFromWallet = true
            feePerMessage = typedFee
          } else {
            toast.info(
              'Gas sponsorship is enabled: your wallet cannot fund the bounty, so the agent will be registered with bounty = 0 and attack fee = 0.'
            )
            feePerMessage = 0
          }
        } else {
          feePerMessage = typedFee
        }
      } else {
        feePerMessage = parseFloat(formData.feePerMessage) * Math.pow(10, decimals)
      }
      const isCustom = formData.llmProvider === 'custom'
      const credentials = resolveProviderCredentials(formData)

      const teeResponse = await registerAgentUtil(
        formData.systemPrompt,
        feePerMessage,
        walletAddress,
        formData.llmProvider,
        isCustom ? formData.customModelName : formData.llmModel,
        formData.privatePrompt,
        formData.attackGoal,
        activeChain,
        credentials,
        intendedChainId ?? undefined,
        agenticConfig
      )

      // 3. Execute chain-specific transaction
      let result: { objectId: string; digest: string }

      if (activeChain === 'solana') {
        result = await solanaDeploy.executeTransaction(teeResponse)
      } else if (isEvmChain(activeChain)) {
        result = await evmDeploy.executeTransaction(teeResponse)
      } else {
        result = await suiDeploy.executeTransaction(teeResponse, suiFundBountyFromWallet)
      }

      // 4. Handle off-chain success (Supabase storage)
      const agentId = teeResponse.response?.data?.agent_id
      handleOffChainSuccess(
        result.objectId,
        result.digest,
        formData.agentName,
        agentId,
        walletAddress,
        feePerMessage
      )
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
