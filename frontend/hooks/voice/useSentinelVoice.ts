'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { SPEECH_TO_SPEECH_URL } from '@/constants'
import {
  normalizeS2sUrl,
  S2sRealtimeClient,
  S2sStatus,
  S2sTranscript,
} from '@/lib/voice/s2sRealtimeClient'
import type { UseSentinelVoiceOptions, VoiceStatus, VoiceTranscript } from '@/types/voice'

const DEFAULT_VOICE = 'alba'
const DEFAULT_STARTUP_GREETING =
  'Start the conversation now with a brief, spontaneous greeting in character. Keep it to one sentence and vary the wording each time.'

function buildRouteMarker(options: UseSentinelVoiceOptions): string {
  return `ss-route: ${JSON.stringify({
    sentinel_id: Number(options.sentinelId),
    network: options.network,
    attacker_address: options.attackerAddress,
    session_id: options.sessionId,
  })}`
}

function buildInstructions(options: UseSentinelVoiceOptions): string {
  const marker = buildRouteMarker(options)
  const base = options.instructions?.trim() || 'You are a helpful sentinel.'
  return `${marker}\n\n${base}`
}

function mapStatus(status: S2sStatus): VoiceStatus {
  return status
}

export function useSentinelVoice(options: UseSentinelVoiceOptions) {
  const optionsRef = useRef(options)
  optionsRef.current = options

  const clientRef = useRef<S2sRealtimeClient | null>(null)
  const [status, setStatus] = useState<VoiceStatus>('idle')
  const [transcripts, setTranscripts] = useState<VoiceTranscript[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [isMuted, setIsMuted] = useState(false)

  const ensureClient = useCallback(() => {
    if (clientRef.current) return clientRef.current

    const url = normalizeS2sUrl(SPEECH_TO_SPEECH_URL)
    if (!url) {
      throw new Error('Speech-to-speech server URL is not configured')
    }

    const client = new S2sRealtimeClient({
      directUrl: url,
      voice: optionsRef.current.voice || DEFAULT_VOICE,
      instructions: buildInstructions(optionsRef.current),
      startupGreeting: optionsRef.current.startupGreeting || DEFAULT_STARTUP_GREETING,
      acquireMic: async () => {
        if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
          throw new Error('Microphone access is not available in this environment')
        }
        return navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })
      },
    })

    const handleStatus = (e: Event) => {
      const detail = (e as CustomEvent<{ status: S2sStatus }>).detail
      setStatus(mapStatus(detail.status))
    }

    const handleTranscript = (e: Event) => {
      const detail = (e as CustomEvent<S2sTranscript>).detail
      setTranscripts(prev => {
        const key = detail.role === 'user' ? detail.itemId : detail.responseId
        if (!detail.partial && key) {
          // Replace any partial transcript for this turn with the final one.
          const filtered = prev.filter(t => {
            const matchKey = t.role === 'user' ? detail.itemId : detail.responseId
            return matchKey !== key
          })
          return [
            ...filtered,
            {
              id: `${detail.role}-${key}-${Date.now()}`,
              role: detail.role,
              text: detail.text,
              partial: false,
              createdAt: Date.now(),
            },
          ]
        }
        // Append/update partial transcript. We keep one partial per role/turn key.
        const partialKey = `${detail.role}-${key || 'live'}`
        const existing = prev.find(t => t.id === partialKey)
        if (existing) {
          return prev.map(t =>
            t.id === partialKey ? { ...t, text: detail.text, partial: true } : t
          )
        }
        return [
          ...prev,
          {
            id: partialKey,
            role: detail.role,
            text: detail.text,
            partial: true,
            createdAt: Date.now(),
          },
        ]
      })
    }

    const handleError = (e: Event) => {
      const detail = (e as CustomEvent<{ error: Error }>).detail
      setError(detail.error)
    }

    client.addEventListener('status', handleStatus)
    client.addEventListener('transcript', handleTranscript)
    client.addEventListener('error', handleError)
    client.addEventListener('server-error', handleError)

    clientRef.current = client
    return client
  }, [])

  const start = useCallback(async () => {
    setError(null)
    setTranscripts([])
    setStatus('connecting')

    try {
      const client = ensureClient()
      await client.connect()
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      setStatus('error')
      // Reset client so the next attempt can create a fresh one.
      clientRef.current = null
    }
  }, [ensureClient])

  const stop = useCallback(async () => {
    const client = clientRef.current
    if (!client) return
    clientRef.current = null
    setIsMuted(false)
    await client.close()
  }, [])

  const toggleMute = useCallback(() => {
    const client = clientRef.current
    if (!client) return
    const next = !isMuted
    client.setMuted(next)
    setIsMuted(next)
  }, [isMuted])

  useEffect(() => {
    return () => {
      clientRef.current?.close()
      clientRef.current = null
    }
  }, [])

  return useMemo(
    () => ({
      status,
      transcripts,
      error,
      isMuted,
      start,
      stop,
      toggleMute,
      isConnected:
        status !== 'idle' && status !== 'connecting' && status !== 'closed' && status !== 'error',
    }),
    [status, transcripts, error, isMuted, start, stop, toggleMute]
  )
}
