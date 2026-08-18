import { SUI_SENTINEL_API_URL } from '@/constants'

/**
 * The single place that knows about the backend's `POST /tts` route. Both the
 * per-message replay button (`lib/speech-playback.ts`) and the live voice call
 * (`lib/voice/SentinelSpeechPlayer.ts`) synthesize through here.
 */
export async function fetchSynthesizedSpeech(text: string): Promise<Blob> {
  const response = await fetch(`${SUI_SENTINEL_API_URL}/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    throw new Error(`Text-to-speech request failed (${response.status})`)
  }

  return response.blob()
}
