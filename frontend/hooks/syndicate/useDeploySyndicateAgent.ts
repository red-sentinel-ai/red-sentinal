'use client'

import { useState } from 'react'
import { parseUnits } from 'viem'
import { SYNDICATE_ABI } from '@/lib/evm/abi'
import { toReadableEvmError } from '@/lib/evm/errors'
import { buildEvmSignature, bytesToHex32 } from '@/lib/evm/signature'
import { useEvmChain } from '@/hooks/evm/useEvmChain'
import { useEvmContractWriter } from '@/hooks/evm/useEvmContractWriter'
import { registerAgentUtil, resolveProviderCredentials } from '@/app/defend/utils'
import { useCreateAgent } from '@/hooks/agents/useCreateAgent'
import { APP_NETWORK } from '@/constants/shared'
import { SUI_SENTINEL_API_URL } from '@/constants'
import type { SupportedToken } from '@/constants/shared'
import type { DefendFormData } from '@/app/defend/hooks/useDefendForm'

interface UseSyndicateAgentOptions {
  syndicateAddress: `0x${string}`
  formData: DefendFormData
  selectedToken: SupportedToken
  selectedImage: { url: string; isCustom: boolean; file?: File | null } | null
  agentImage: File | null
}

export function useDeploySyndicateAgent({
  syndicateAddress,
  formData,
  selectedToken,
  selectedImage,
  agentImage,
}: UseSyndicateAgentOptions) {
  const { activeEvmChainKey, intendedChainId, ensureWalletOnActiveChain } = useEvmChain()
  const { writeContractAndWait } = useEvmContractWriter()
  const { mutate: createAgent } = useCreateAgent()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agentId, setAgentId] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  const deploy = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await ensureWalletOnActiveChain()
      if (!activeEvmChainKey) throw new Error('No EVM chain is selected')

      const decimals = selectedToken.decimals
      const feePerMessage = Number(parseUnits(formData.feePerMessage, decimals))
      const initialFundRaw = parseUnits(formData.initialBalance, decimals)
      const isCustom = formData.llmProvider === 'custom'
      const credentials = resolveProviderCredentials(formData)

      // TEE registration - use syndicate address as creator
      const teeResponse = await registerAgentUtil(
        formData.systemPrompt,
        feePerMessage,
        syndicateAddress,
        formData.llmProvider,
        isCustom ? formData.customModelName : formData.llmModel,
        formData.privatePrompt,
        formData.attackGoal,
        formData.juryPrompt,
        activeEvmChainKey,
        credentials,
        intendedChainId ?? undefined
      )

      const { response: teeData, signature: sigHex, recovery_id } = teeResponse
      const { data } = teeData

      const registerTx = await writeContractAndWait({
        address: syndicateAddress,
        abi: SYNDICATE_ABI,
        functionName: 'registerAgent',
        args: [
          data.agent_id,
          BigInt(teeData.timestamp),
          BigInt(data.cost_per_message),
          bytesToHex32(data.prompt_hash),
          initialFundRaw,
          buildEvmSignature(sigHex, recovery_id),
        ],
      })

      setAgentId(data.agent_id)
      setTxHash(registerTx)

      const agentSlug = formData.agentName.toLowerCase().replace(/\s+/g, '_')
      const agentPath = `/attack/${agentSlug}`

      // Update backend syndicate record with agent_id + agent_path
      await fetch(`${SUI_SENTINEL_API_URL}/syndicates/${syndicateAddress}/agent?network=${APP_NETWORK}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: data.agent_id, agent_path: agentPath }),
      })

      // Create agent in Supabase
      const payload = new FormData()
      payload.append('agent_id', data.agent_id)
      payload.append('agent_name', formData.agentName)
      payload.append('object_id', registerTx)
      payload.append('owner', syndicateAddress)
      payload.append('digest', registerTx)
      payload.append('model_provider', formData.llmProvider)
      payload.append('chain', activeEvmChainKey)
      payload.append('model_name', isCustom ? formData.customModelName : formData.llmModel)

      if (agentImage) {
        payload.append('image', agentImage)
      } else if (selectedImage?.url && !selectedImage.isCustom) {
        payload.append('image_url', selectedImage.url)
      }
      createAgent(payload)
      return { agentId: data.agent_id, txHash: registerTx }
    } catch (err) {
      const msg = toReadableEvmError(err, 'Failed to launch sentinel')
      setError(msg)
      throw new Error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return { deploy, isLoading, error, agentId, txHash }
}
