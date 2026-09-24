'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type TopbarSlotContextType = {
  content: ReactNode
  setContent: (content: ReactNode) => void
}

const TopbarSlotContext = createContext<TopbarSlotContextType | null>(null)

export function TopbarSlotProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ReactNode>(null)

  const value = useMemo(() => ({ content, setContent }), [content])

  return <TopbarSlotContext.Provider value={value}>{children}</TopbarSlotContext.Provider>
}

export function useTopbarSlot() {
  const context = useContext(TopbarSlotContext)
  if (!context) {
    throw new Error('useTopbarSlot must be used within a TopbarSlotProvider')
  }
  return context
}

/**
 * Renders `content` into the app topbar for as long as the calling component is
 * mounted. Pass `null` to render nothing.
 */
export function useRenderInTopbar(content: ReactNode) {
  const { setContent } = useTopbarSlot()

  const clear = useCallback(() => setContent(null), [setContent])

  useEffect(() => {
    setContent(content)
    return clear
  }, [content, setContent, clear])
}
