'use client'

import { useCallback } from 'react'
import { usePublicClient, useWriteContract } from 'wagmi'
import { waitForTransactionReceipt } from '@wagmi/core'
import type { Abi } from 'viem'
import { wagmiConfig } from '@/lib/wagmi'
import { getEvmFeeOverrides } from '@/lib/evm/fees'
import { useEVMWallet } from '@/hooks/useEVMWallet'
import { useEvmChain } from '@/hooks/evm/useEvmChain'
import type { EvmConfig } from '@/constants/evm'

export type ContractWriteRequest = {
  address: `0x${string}`
  abi: Abi | readonly unknown[]
  functionName: string
  args?: readonly unknown[]
  value?: bigint
}

export function useEvmContractWriter() {
  const { address: walletAddress } = useEVMWallet()
  const { evmConfig, intendedChainId, ensureWalletOnActiveChain } = useEvmChain()
  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient({ chainId: intendedChainId ?? undefined })

  const writeContract = useCallback(
    async (request: ContractWriteRequest): Promise<`0x${string}`> => {
      if (!walletAddress) throw new Error('EVM wallet not connected')

      const chainId = await ensureWalletOnActiveChain()

      const feeOverrides = await getEvmFeeOverrides(chainId, publicClient)

      return writeContractAsync({
        ...request,
        ...feeOverrides,
        account: walletAddress,
        chainId,
      } as Parameters<typeof writeContractAsync>[0])
    },
    [walletAddress, ensureWalletOnActiveChain, publicClient, writeContractAsync]
  )

  const writeContractAndWait = useCallback(
    async (request: ContractWriteRequest): Promise<`0x${string}`> => {
      const hash = await writeContract(request)
      await waitForTransactionReceipt(wagmiConfig, { hash, chainId: intendedChainId ?? undefined })
      return hash
    },
    [writeContract, intendedChainId]
  )

  const requireEvmConfig = useCallback((): EvmConfig => {
    if (!evmConfig) throw new Error('No EVM chain is selected')
    return evmConfig
  }, [evmConfig])

  return {
    walletAddress,
    evmConfig,
    requireEvmConfig,
    intendedChainId,
    publicClient,
    writeContract,
    writeContractAndWait,
    isWalletConnected: !!walletAddress,
  }
}
