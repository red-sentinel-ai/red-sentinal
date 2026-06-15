'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { SUPPORTED_CHAINS, ACTIVE_CHAIN_STORAGE_KEY, type SupportedChain } from '@/constants/chains'

// In Arbitrum-only mode lock the default to 'arb'; otherwise keep the historical
// 'solana' default. The stored-chain check below also rejects any value that
// isn't in SUPPORTED_CHAINS, so a leftover 'solana' in localStorage can't leak in.
const DEFAULT_CHAIN: SupportedChain = SUPPORTED_CHAINS.includes('solana') ? 'solana' : 'arb'

type ActiveChainContextValue = {
  activeChain: SupportedChain
  setActiveChain: (chain: SupportedChain) => void
  isHydrated: boolean
}

const ActiveChainContext = createContext<ActiveChainContextValue>({
  activeChain: DEFAULT_CHAIN,
  setActiveChain: () => {},
  isHydrated: false,
})

export function ActiveChainProvider({ children }: { children: React.ReactNode }) {
  const [activeChain, setActiveChainState] = useState<SupportedChain>(DEFAULT_CHAIN)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate from localStorage after mount to avoid SSR mismatch. Arbitrum-only
  // mode has SUPPORTED_CHAINS = ['arb'], so any other stored value is ignored
  // and the active chain stays locked to Arbitrum.
  useEffect(() => {
    const stored = localStorage.getItem(ACTIVE_CHAIN_STORAGE_KEY) as SupportedChain | null
    if (stored && SUPPORTED_CHAINS.includes(stored)) {
      setActiveChainState(stored)
    }
    setIsHydrated(true)
  }, [])

  const setActiveChain = (chain: SupportedChain) => {
    setActiveChainState(chain)
    localStorage.setItem(ACTIVE_CHAIN_STORAGE_KEY, chain)
  }

  return (
    <ActiveChainContext.Provider value={{ activeChain, setActiveChain, isHydrated }}>
      {children}
    </ActiveChainContext.Provider>
  )
}

export function useActiveChain() {
  return useContext(ActiveChainContext)
}
