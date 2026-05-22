'use client'

import { useState } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import { waitForTransactionReceipt } from '@wagmi/core'
import { parseUnits } from 'viem'
import { wagmiConfig } from '@/lib/wagmi'
import { SYNDICATE_ABI, ERC20_ABI } from '@/lib/evm/abi'

export function useDepositToSyndicate() {
  const { address: walletAddress, chain } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const [isDepositing, setIsDepositing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deposit = async (
    syndicateAddress: `0x${string}`,
    tokenAddress: `0x${string}`,
    amount: string,
    decimals: number
  ) => {
    if (!walletAddress) throw new Error('EVM wallet not connected')

    setIsDepositing(true)
    setError(null)

    try {
      const amountRaw = parseUnits(amount, decimals)
      const txArgs = { account: walletAddress, chain: chain ?? null }

      const approveTx = await writeContractAsync({
        ...txArgs,
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [syndicateAddress, amountRaw],
      })
      await waitForTransactionReceipt(wagmiConfig, { hash: approveTx })

      const depositTx = await writeContractAsync({
        ...txArgs,
        address: syndicateAddress,
        abi: SYNDICATE_ABI,
        functionName: 'deposit',
        args: [amountRaw],
      })
      await waitForTransactionReceipt(wagmiConfig, { hash: depositTx })

      return depositTx
    } catch (err: any) {
      const msg = err?.shortMessage ?? err?.message ?? 'Deposit failed'
      setError(msg)
      throw new Error(msg)
    } finally {
      setIsDepositing(false)
    }
  }

  return { deposit, isDepositing, error }
}
