'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

type FocusModeContextType = {
  isFocusMode: boolean
  toggleFocusMode: () => void
  enableFocusMode: () => void
  disableFocusMode: () => void
}

const FocusModeContext = createContext<FocusModeContextType | null>(null)

export function FocusModeProvider({ children }: { children: ReactNode }) {
  const [isFocusMode, setIsFocusMode] = useState(false)

  const toggleFocusMode = useCallback(() => {
    setIsFocusMode(prev => !prev)
  }, [])

  const enableFocusMode = useCallback(() => {
    setIsFocusMode(true)
  }, [])

  const disableFocusMode = useCallback(() => {
    setIsFocusMode(false)
  }, [])

  return (
    <FocusModeContext.Provider
      value={{
        isFocusMode,
        toggleFocusMode,
        enableFocusMode,
        disableFocusMode,
      }}
    >
      {children}
    </FocusModeContext.Provider>
  )
}

export function useFocusMode() {
  const context = useContext(FocusModeContext)
  if (!context) {
    throw new Error('useFocusMode must be used within a FocusModeProvider')
  }
  return context
}
