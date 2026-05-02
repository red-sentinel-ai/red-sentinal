'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { SUPPORTED_CHAINS, ACTIVE_CHAIN_STORAGE_KEY, type SupportedChain } from '@/constants/chains'

type ActiveChainContextValue = {
  activeChain: SupportedChain
  setActiveChain: (chain: SupportedChain) => void
}

const ActiveChainContext = createContext<ActiveChainContextValue>({
  activeChain: 'sui',
  setActiveChain: () => {},
})

export function ActiveChainProvider({ children }: { children: React.ReactNode }) {
  const [activeChain, setActiveChainState] = useState<SupportedChain>('solana')

  // Hydrate from localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    const stored = localStorage.getItem(ACTIVE_CHAIN_STORAGE_KEY) as SupportedChain | null
    if (stored && SUPPORTED_CHAINS.includes(stored)) {
      setActiveChainState(stored)
    }
  }, [])

  const setActiveChain = (chain: SupportedChain) => {
    setActiveChainState(chain)
    localStorage.setItem(ACTIVE_CHAIN_STORAGE_KEY, chain)
  }

  return (
    <ActiveChainContext.Provider value={{ activeChain, setActiveChain }}>
      {children}
    </ActiveChainContext.Provider>
  )
}

export function useActiveChain() {
  return useContext(ActiveChainContext)
}
