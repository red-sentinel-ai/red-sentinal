'use client'

import { useEffect, useState } from 'react'
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'

interface TokenBalanceResult {
  /** Raw balance as returned by the chain (before decimal division) */
  rawBalance: number
  /** Human-readable balance after dividing by 10^decimals */
  balance: number
  formattedBalance: string
  isLoading: boolean
}

export function useTokenBalance(coinType: string, decimals: number = 9): TokenBalanceResult {
  const account = useCurrentAccount()
  const client = useSuiClient()
  const [rawBalance, setRawBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBalance = async () => {
      if (!account?.address) {
        setRawBalance(0)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const result = await client.getBalance({
          owner: account.address,
          coinType,
        })
        setRawBalance(Number(result.totalBalance))
      } catch (error) {
        console.error(`Failed to fetch balance for ${coinType}:`, error)
        setRawBalance(0)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBalance()
  }, [account?.address, client, coinType])

  const divisor = decimals > 0 ? Math.pow(10, decimals) : 1
  const balance = rawBalance / divisor
  const formattedBalance = balance.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals > 0 ? 4 : 0,
  })

  return { rawBalance, balance, formattedBalance, isLoading }
}
