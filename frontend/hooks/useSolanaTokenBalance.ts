'use client'

import { useEffect, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { useSolanaWallet, useSolanaConnection } from '@/hooks/useSolanaWallet'
import { NATIVE_SOL_MINT } from '@/constants/solana'

interface SolanaTokenBalanceResult {
  /** Raw balance in lamports / base units (before decimal division) */
  rawBalance: number
  /** Human-readable balance after dividing by 10^decimals */
  balance: number
  formattedBalance: string
  isLoading: boolean
}

/**
 * Fetches the balance of a Solana token for the connected wallet.
 * Accepts `coinType` (which on Solana is the SPL mint address) and decimals,
 * matching the same signature pattern as useTokenBalance for Sui.
 */
export function useSolanaTokenBalance(
  coinType: string,
  decimals: number = 9
): SolanaTokenBalanceResult {
  const { publicKey } = useSolanaWallet()
  const { connection } = useSolanaConnection()
  const [rawBalance, setRawBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const fetchBalance = async () => {
      if (!publicKey) {
        setRawBalance(0)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        if (coinType === NATIVE_SOL_MINT) {
          const lamports = await connection.getBalance(publicKey)
          if (!cancelled) setRawBalance(lamports)
        } else {
          const mintPubkey = new PublicKey(coinType)
          const ata = await getAssociatedTokenAddress(mintPubkey, publicKey)
          const tokenBalance = await connection.getTokenAccountBalance(ata)
          if (!cancelled) setRawBalance(Number(tokenBalance.value.amount))
        }
      } catch {
        if (!cancelled) setRawBalance(0)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchBalance()

    return () => {
      cancelled = true
    }
  }, [publicKey, connection, coinType])

  const divisor = decimals > 0 ? Math.pow(10, decimals) : 1
  const balance = rawBalance / divisor
  const formattedBalance = balance.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals > 0 ? 4 : 0,
  })

  return { rawBalance, balance, formattedBalance, isLoading }
}
