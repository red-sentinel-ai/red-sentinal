'use client'

import { useWriteContract, useAccount, useChainId } from 'wagmi'
import { waitForTransactionReceipt } from '@wagmi/core'
import { parseUnits } from 'viem'
import { wagmiConfig } from '@/lib/wagmi'
import { getEvmConfig } from '@/constants/evm'
import { SENTINEL_ABI, ERC20_ABI } from '@/lib/evm/abi'
import { buildEvmSignature, bytesToHex32 } from '@/lib/evm/signature'
import type { SupportedToken } from '@/constants'
import type { ChainDeployHook, EvmTeeResponse, DeployTransactionResult } from '../types'

interface UseDeployEvmAgentOptions {
  formData: { initialBalance: string }
  selectedEvmToken: SupportedToken
}

export function useDeployEvmAgent({
  formData,
  selectedEvmToken,
}: UseDeployEvmAgentOptions): ChainDeployHook {
  const { address: walletAddress, chain: currentChain } = useAccount()
  const chainId = useChainId()
  const evmCfg = getEvmConfig(chainId)
  const { writeContractAsync } = useWriteContract()

  const executeTransaction = async (
    teeResponse: EvmTeeResponse
  ): Promise<DeployTransactionResult> => {
    if (!walletAddress) throw new Error('EVM wallet not connected')

    const { response: teeData, signature: sigHex, recovery_id } = teeResponse
    const { data } = teeData

    const tokenAddress = selectedEvmToken.coinType as `0x${string}`
    const initialFundRaw = parseUnits(formData.initialBalance, selectedEvmToken.decimals)
    const promptHash = bytesToHex32(data.prompt_hash)
    const fullSignature = buildEvmSignature(sigHex, recovery_id)
    const timestampMs = BigInt(teeData.timestamp)
    const costPerMessage = BigInt(data.cost_per_message)

    const txArgs = { account: walletAddress, chain: currentChain ?? null }

    const approveTxHash = await writeContractAsync({
      ...txArgs,
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [evmCfg.contractAddress, initialFundRaw],
    })

    await waitForTransactionReceipt(wagmiConfig, { hash: approveTxHash })

    const registerTxHash = await writeContractAsync({
      ...txArgs,
      address: evmCfg.contractAddress,
      abi: SENTINEL_ABI,
      functionName: 'registerAgent',
      args: [
        data.agent_id,
        timestampMs,
        costPerMessage,
        promptHash,
        tokenAddress,
        initialFundRaw,
        fullSignature,
      ],
    })

    return {
      objectId: registerTxHash, // use tx hash as object ID for EVM agents
      digest: registerTxHash,
    }
  }

  return {
    walletAddress: walletAddress ?? null,
    executeTransaction,
  }
}
