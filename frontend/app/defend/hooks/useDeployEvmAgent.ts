'use client'

import { parseUnits } from 'viem'
import { SENTINEL_ABI, ERC20_ABI } from '@/lib/evm/abi'
import { isNativeToken } from '@/lib/evm/native-token'
import { buildEvmSignature, bytesToHex32 } from '@/lib/evm/signature'
import { useEvmContractWriter } from '@/hooks/evm/useEvmContractWriter'
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
  const { walletAddress, requireEvmConfig, writeContract, writeContractAndWait } =
    useEvmContractWriter()

  const executeTransaction = async (
    teeResponse: EvmTeeResponse
  ): Promise<DeployTransactionResult> => {
    const { response: teeData, signature: sigHex, recovery_id } = teeResponse
    const { data } = teeData

    const { contractAddress } = requireEvmConfig()
    const tokenAddress = selectedEvmToken.coinType as `0x${string}`
    const initialFundRaw = parseUnits(formData.initialBalance, selectedEvmToken.decimals)
    const isNativeFunding = isNativeToken(tokenAddress)

    if (!isNativeFunding) {
      await writeContractAndWait({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [contractAddress, initialFundRaw],
      })
    }

    const registerTxHash = await writeContract({
      address: contractAddress,
      abi: SENTINEL_ABI,
      functionName: 'registerAgent',
      args: [
        data.agent_id,
        BigInt(teeData.timestamp),
        BigInt(data.cost_per_message),
        bytesToHex32(data.prompt_hash),
        tokenAddress,
        initialFundRaw,
        buildEvmSignature(sigHex, recovery_id),
      ],
      value: isNativeFunding ? initialFundRaw : undefined,
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
