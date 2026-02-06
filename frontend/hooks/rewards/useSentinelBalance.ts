import { useEffect, useState } from 'react'
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import { SUI_CONFIG } from '@/constants'
import { REWARDS_CONSTANTS } from '@/constants/rewards'

interface SentinelBalanceResult {
  balance: number
  formattedBalance: string
  tier: string
  isLoading: boolean
}

function calculateTier(points: number): string {
  const tiers = Object.values(REWARDS_CONSTANTS.TIERS)
  let currentTier = tiers[0].name.toLowerCase()

  for (const tier of tiers) {
    if (points >= tier.minPoints) {
      currentTier = tier.name.toLowerCase()
    }
  }

  return currentTier
}

export function useSentinelBalance(): SentinelBalanceResult {
  const account = useCurrentAccount()
  const client = useSuiClient()
  const [balance, setBalance] = useState(0)
  const [formattedBalance, setFormattedBalance] = useState('0')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBalance = async () => {
      if (!account?.address) {
        setBalance(0)
        setFormattedBalance('0')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const result = await client.getBalance({
          owner: account.address,
          coinType: SUI_CONFIG.SENTINEL_COIN_TYPE,
        })

        const rawBalance = Math.floor(Number(result.totalBalance))
        const formatted = rawBalance.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })

        setBalance(rawBalance)
        setFormattedBalance(formatted)
      } catch (error) {
        console.error('Failed to fetch SENTINEL balance:', error)
        setBalance(0)
        setFormattedBalance('0')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBalance()
  }, [account?.address, client])

  const tier = calculateTier(balance)

  return { balance, formattedBalance, tier, isLoading }
}
