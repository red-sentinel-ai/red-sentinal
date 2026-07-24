'use client'

import { useCallback, useSyncExternalStore } from 'react'
import {
  getSpeechPlaybackStatus,
  playSpeech,
  stopSpeechPlayback,
  subscribeToSpeechPlayback
} from '@/lib/speech-playback'

export type { SpeechPlaybackStatus } from '@/lib/speech-playback'

export function useSpeechPlayback(text: string) {
  const status = useSyncExternalStore(
    subscribeToSpeechPlayback,
    () => getSpeechPlaybackStatus(text),
    () => 'idle' as const
  )

  const toggle = useCallback(() => {
    if (getSpeechPlaybackStatus(text) === 'idle') {
      playSpeech(text)
    } else {
      stopSpeechPlayback()
    }
  }, [text])

  return { status, toggle }
}
