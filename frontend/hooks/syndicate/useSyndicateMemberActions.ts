'use client'

import { useState } from 'react'
import { parseUnits } from 'viem'
import { useAccount } from 'wagmi'
import { SYNDICATE_ABI, ERC20_ABI } from '@/lib/evm/abi'
import { toReadableEvmError } from '@/lib/evm/errors'
import { isNativeToken } from '@/lib/evm/native-token'
import { useEvmContractWriter } from '@/hooks/evm/useEvmContractWriter'
import { APP_NETWORK } from '@/constants/shared'
import { SUI_SENTINEL_API_URL } from '@/constants'

export function useSyndicateMemberActions(syndicateAddress: `0x${string}`) {
  const { address: walletAddress } = useAccount()
  const { writeContractAndWait } = useEvmContractWriter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const exec = async (key: string, run: () => Promise<`0x${string}`>) => {
    setLoading(key)
    setError(null)
    try {
      return await run()
    } catch (err) {
      const msg = toReadableEvmError(err, 'Transaction failed')
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(null)
    }
  }

  const deposit = (tokenAddress: `0x${string}`, amount: string, decimals: number) =>
    exec('deposit', async () => {
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

      return writeContractAndWait({
        address: syndicateAddress,
        abi: SYNDICATE_ABI,
        functionName: 'deposit',
        args: [amountRaw],
        value: isNativeDeposit ? amountRaw : undefined,
      })
    })

  const redeem = (shares: bigint) =>
    exec('redeem', () =>
      writeContractAndWait({
        address: syndicateAddress,
        abi: SYNDICATE_ABI,
        functionName: 'redeem',
        args: [shares],
      })
    )

  const claimFeesForSyndicate = () =>
    exec('claimForSyndicate', () =>
      writeContractAndWait({
        address: syndicateAddress,
        abi: SYNDICATE_ABI,
        functionName: 'claimCreatorFeesFromSentinel',
        args: [],
      })
    )

  const claimFeesForSelf = () =>
    exec('claimSelf', () =>
      writeContractAndWait({
        address: syndicateAddress,
        abi: SYNDICATE_ABI,
        functionName: 'claimFees',
        args: [],
      })
    )

  const requestToJoin = async (message: string) => {
    if (!walletAddress) throw new Error('Wallet not connected')
    setLoading('joinRequest')
    setError(null)
    try {
      const res = await fetch(`${SUI_SENTINEL_API_URL}/syndicates/join-request`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syndicate_address: syndicateAddress,
          requester_address: walletAddress,
          message,
          network: APP_NETWORK,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send request')
      }
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(null)
    }
  }

  return {
    deposit,
    redeem,
    claimFeesForSyndicate,
    claimFeesForSelf,
    requestToJoin,
    loading,
    error,
  }
}
