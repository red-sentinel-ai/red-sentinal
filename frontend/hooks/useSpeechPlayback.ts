'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { SUI_SENTINEL_API_URL } from '@/constants'

export type SpeechPlaybackStatus = 'idle' | 'loading' | 'playing'

// Only one message may speak at a time across the whole page. Each hook
// instance registers its own stopper here when it starts playing, and the
// next message to play stops whatever was already speaking.
let stopActivePlayback: (() => void) | null = null

/** Fetch synthesized audio for `text` and return a playable object URL. */
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

/**
 * Reads a single piece of text aloud on demand. The generated audio is cached
 * for the lifetime of the component, so replaying is instant and free. Starting
 * playback stops any other message that is currently speaking.
 */
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

  // Release the cached audio and the shared stopper when unmounting.
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
