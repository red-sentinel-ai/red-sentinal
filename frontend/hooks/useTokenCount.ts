import { useState, useEffect, useCallback } from 'react'
import { encodingForModel, TiktokenModel } from 'js-tiktoken'
import { useDebouncedCallback } from 'use-debounce'

export const useTokenCount = (model: TiktokenModel = 'gpt-4') => {
  const [tokenCount, setTokenCount] = useState<number>(0)
  const [isDebouncing, setIsDebouncing] = useState(false)
  const [encoder, setEncoder] = useState<ReturnType<typeof encodingForModel> | null>(null)
  const [lastText, setLastText] = useState('')

  useEffect(() => {
    const enc = encodingForModel(model)
    setEncoder(enc)
  }, [model])

  const debouncedCount = useDebouncedCallback((text: string) => {
    if (!encoder || !text) {
      setTokenCount(0)
      setIsDebouncing(false)
      return
    }

    try {
      const tokens = encoder.encode(text)
      setTokenCount(tokens.length)
    } catch (error) {
      console.warn('Error counting tokens:', error)
      setTokenCount(0)
    } finally {
      setIsDebouncing(false)
    }
  }, 500)

  const countTokens = useCallback(
    (text: string) => {
      setLastText(text)
      setIsDebouncing(text !== lastText)
      debouncedCount(text)
    },
    [debouncedCount, lastText]
  )

  return {
    tokenCount,
    countTokens,
    isDebouncing,
  }
}
