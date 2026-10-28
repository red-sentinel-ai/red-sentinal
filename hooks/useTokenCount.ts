import { useState, useEffect, useCallback } from 'react'
import type { TiktokenModel } from 'js-tiktoken'
import { Tiktoken } from 'js-tiktoken/lite'
import { useDebouncedCallback } from 'use-debounce'

// Every caller of this hook uses the default 'gpt-4' model, so only the
// cl100k_base rank table is needed. The full `js-tiktoken` entry ships every
// rank table (~4MB) into the client bundle, so the table is code-split behind
// this dynamic import and the encoder is cached module-wide — built at most
// once per page session, no matter how many components count tokens.
let encoderPromise: Promise<Tiktoken> | null = null

function getEncoder(): Promise<Tiktoken> {
  encoderPromise ??= import('js-tiktoken/ranks/cl100k_base').then(
    ({ default: cl100kBase }) => new Tiktoken(cl100kBase)
  )
  return encoderPromise
}

export const useTokenCount = (model: TiktokenModel = 'gpt-4') => {
  const [tokenCount, setTokenCount] = useState<number>(0)
  const [isDebouncing, setIsDebouncing] = useState(false)
  const [encoder, setEncoder] = useState<Tiktoken | null>(null)
  const [lastText, setLastText] = useState('')

  useEffect(() => {
    if (model !== 'gpt-4') {
      // cl100k_base is the only loaded table; other models would need their
      // own rank import — warn rather than count with the wrong vocabulary.
      console.warn(`useTokenCount: no rank table loaded for ${model}, counting with cl100k_base`)
    }
    let cancelled = false
    getEncoder().then(enc => {
      if (!cancelled) setEncoder(enc)
    })
    return () => {
      cancelled = true
    }
  }, [model])

  const debouncedCount = useDebouncedCallback((text: string) => {
    setIsDebouncing(false)

    if (!text) {
      setTokenCount(0)
      return
    }

    if (!encoder) {
      // Rank table still loading — rough estimate, refined on the next keystroke.
      setTokenCount(Math.ceil(text.length / 4))
      return
    }

    try {
      const tokens = encoder.encode(text)
      setTokenCount(tokens.length)
    } catch (error) {
      console.warn('Error counting tokens:', error)
      setTokenCount(0)
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
