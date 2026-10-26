import { useEffect, useState } from 'react'
import { useStellarWallet } from '@/hooks/useStellarWallet'
import { fetchXlmBalance } from '@/lib/stellar/client'

const STROOPS_PER_XLM = 1e7

export function useStellarBalance() {
  const { address } = useStellarWallet()
  const [balance, setBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!address) {
      setBalance(null)
      return
    }
    let cancelled = false
    setIsLoading(true)
    fetchXlmBalance(address)
      .then(stroops => {
        if (!cancelled) {
          setBalance(Number(stroops) / STROOPS_PER_XLM)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [address])

  return { balance, isLoading }
}
