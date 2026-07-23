'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { SUI_SENTINEL_API_URL } from '@/constants'

export type SpeechPlaybackStatus = 'idle' | 'loading' | 'playing'

let stopActivePlayback: (() => void) | null = null

async function fetchSpeechAudioUrl(text: string): Promise<string> {
  const response = await fetch(`${SUI_SENTINEL_API_URL}/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  })

  if (!response.ok) {
    throw new Error(`Text-to-speech request failed (${response.status})`)
  }

  return URL.createObjectURL(await response.blob())
}

export function useSpeechPlayback(text: string) {
  const [status, setStatus] = useState<SpeechPlaybackStatus>('idle')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUrlRef = useRef<string | null>(null)

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    if (stopActivePlayback === stop) {
      stopActivePlayback = null
    }
    setStatus('idle')
  }, [])

  const toggle = useCallback(async () => {
    if (status === 'playing') {
      stop()
      return
    }

    stopActivePlayback?.()

    try {
      setStatus('loading')

      if (!audioUrlRef.current) {
        audioUrlRef.current = await fetchSpeechAudioUrl(text)
      }

      const audio = audioRef.current ?? new Audio()
      audioRef.current = audio
      audio.src = audioUrlRef.current
      audio.onended = stop

      stopActivePlayback = stop
      await audio.play()
      setStatus('playing')
    } catch {
      stop()
    }
  }, [status, stop, text])

  useEffect(() => {
    stop()
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current)
      audioUrlRef.current = null
    }
  }, [text, stop])

  useEffect(() => {
    return () => {
      if (stopActivePlayback === stop) {
        stopActivePlayback = null
      }
      audioRef.current?.pause()
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current)
      }
    }
  }, [stop])

  return { status, toggle }
}
