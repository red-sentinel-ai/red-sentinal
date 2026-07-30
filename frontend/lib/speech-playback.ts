import { SUI_SENTINEL_API_URL } from '@/constants'

export type SpeechPlaybackStatus = 'idle' | 'loading' | 'playing'

const MAX_CACHED_CLIPS = 20

let activeText: string | null = null
let activeStatus: SpeechPlaybackStatus = 'idle'
let audioElement: HTMLAudioElement | null = null

const listeners = new Set<() => void>()
const audioUrlCache = new Map<string, string>()

function setActivePlayback(text: string | null, status: SpeechPlaybackStatus) {
  activeText = text
  activeStatus = status
  listeners.forEach(listener => listener())
}

export function subscribeToSpeechPlayback(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getSpeechPlaybackStatus(text: string): SpeechPlaybackStatus {
  return activeText === text ? activeStatus : 'idle'
}

export function stopSpeechPlayback() {
  if (audioElement) {
    audioElement.pause()
    audioElement.currentTime = 0
  }
  if (typeof window !== 'undefined') {
    window.speechSynthesis?.cancel()
  }
  setActivePlayback(null, 'idle')
}

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

function cacheAudioUrl(text: string, audioUrl: string) {
  audioUrlCache.set(text, audioUrl)

  if (audioUrlCache.size > MAX_CACHED_CLIPS) {
    const oldestText = audioUrlCache.keys().next().value
    const oldestUrl = oldestText ? audioUrlCache.get(oldestText) : undefined
    if (oldestText && oldestUrl) {
      URL.revokeObjectURL(oldestUrl)
      audioUrlCache.delete(oldestText)
    }
  }
}

function speakWithBrowserVoice(text: string): boolean {
  const synthesis = typeof window === 'undefined' ? null : window.speechSynthesis
  if (!synthesis) return false

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.onend = stopSpeechPlayback
  utterance.onerror = stopSpeechPlayback

  synthesis.cancel()
  synthesis.speak(utterance)
  return true
}

export async function playSpeech(text: string): Promise<void> {
  if (!text?.trim()) return

  stopSpeechPlayback()
  setActivePlayback(text, 'loading')

  try {
    let audioUrl = audioUrlCache.get(text)
    if (!audioUrl) {
      audioUrl = await fetchSpeechAudioUrl(text)
      cacheAudioUrl(text, audioUrl)
    }

    // A newer request took over while we were fetching.
    if (activeText !== text) return

    const audio = audioElement ?? new Audio()
    audioElement = audio
    audio.src = audioUrl
    audio.onended = stopSpeechPlayback

    await audio.play()

    if (activeText === text) {
      setActivePlayback(text, 'playing')
    }
  } catch {
    if (activeText !== text) return

    if (speakWithBrowserVoice(text)) {
      setActivePlayback(text, 'playing')
    } else {
      stopSpeechPlayback()
    }
  }
}
