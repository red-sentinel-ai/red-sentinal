import { useEffect, useState } from 'react'
import { useSolanaWallet, useSolanaConnection } from '@/hooks/useSolanaWallet'

const LAMPORTS_PER_SOL = 1_000_000_000

export function useSolanaBalance() {
  const { publicKey } = useSolanaWallet()
  const { connection } = useSolanaConnection()
  const [balance, setBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!publicKey) {
      setBalance(null)
      return
    }
    let cancelled = false
    setIsLoading(true)
    connection
      .getBalance(publicKey)
      .then(lamports => {
        if (!cancelled) {
          setBalance(lamports / LAMPORTS_PER_SOL)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [publicKey, connection])

  return { balance, isLoading }
}
