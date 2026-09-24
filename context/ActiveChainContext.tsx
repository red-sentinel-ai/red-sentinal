'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { SUPPORTED_CHAINS, ACTIVE_CHAIN_STORAGE_KEY, type SupportedChain } from '@/constants/chains'

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

  const setActiveChain = useCallback((chain: SupportedChain) => {
    setActiveChainState(chain)
    localStorage.setItem(ACTIVE_CHAIN_STORAGE_KEY, chain)
  }, [])

  const value = useMemo(
    () => ({ activeChain, setActiveChain, isHydrated }),
    [activeChain, setActiveChain, isHydrated]
  )

  return <ActiveChainContext.Provider value={value}>{children}</ActiveChainContext.Provider>
}

export function useActiveChain() {
  return useContext(ActiveChainContext)
}
