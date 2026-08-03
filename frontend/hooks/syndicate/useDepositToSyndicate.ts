'use client'

import { useState } from 'react'
import { parseUnits } from 'viem'
import { SYNDICATE_ABI, ERC20_ABI } from '@/lib/evm/abi'
import { toReadableEvmError } from '@/lib/evm/errors'
import { isNativeToken } from '@/lib/evm/native-token'
import { useEvmContractWriter } from '@/hooks/evm/useEvmContractWriter'

export function useDepositToSyndicate() {
  const { writeContractAndWait } = useEvmContractWriter()
  const [isDepositing, setIsDepositing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deposit = async (
    syndicateAddress: `0x${string}`,
    tokenAddress: `0x${string}`,
    amount: string,
    decimals: number
  ) => {
    setIsDepositing(true)
    setError(null)

    try {
      const amountRaw = parseUnits(amount, decimals)
      const isNativeDeposit = isNativeToken(tokenAddress)

      if (!isNativeDeposit) {
        await writeContractAndWait({
          address: tokenAddress,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [syndicateAddress, amountRaw],
        })
      }

      return await writeContractAndWait({
        address: syndicateAddress,
        abi: SYNDICATE_ABI,
        functionName: 'deposit',
        args: [amountRaw],
        value: isNativeDeposit ? amountRaw : undefined,
      })
    } catch (err) {
      const msg = toReadableEvmError(err, 'Deposit failed')
      setError(msg)
      throw new Error(msg)
    } finally {
      setIsDepositing(false)
    }
  }

  return { deposit, isDepositing, error }
}
