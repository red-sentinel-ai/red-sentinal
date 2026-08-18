/**
 * WebSocket client for the speech-to-speech backend, used purely as a
 * **speech-to-text** channel.
 *
 * The backend runs a full VAD -> STT -> LLM -> TTS pipeline, but Red Sentinel
 * already has a brain: an attack goes through the sentinel's own API so it can
 * be judged, scored and (on-chain) paid for. So we keep the half we want —
 * voice-activity detection and streaming transcription — and cancel the
 * pipeline's own generation the moment it starts. The reply the user hears is
 * synthesized separately by `SentinelSpeechPlayer`.
 *
 * Protocol reference: OpenAI Realtime GA over WebSocket.
 */

import { encodePcmToBase64 } from './pcm-codec'

/**
 * Sent once the socket opens. The server rejects audio until a session exists,
 * and this doubles as a safety net: if a generation ever escapes the cancel
 * below, the model has been told to stay quiet.
 */
const TRANSCRIPTION_ONLY_INSTRUCTIONS =
  'Transcribe the user only. Never reply, never speak, produce no output.'

export interface SpeechToTextSocketHandlers {
  /** Voice activity detected — the user has started a turn. */
  onSpeechStarted: () => void
  /** The user stopped talking; a transcript is on its way. */
  onSpeechStopped: () => void
  /** Running transcript for the turn in progress. Superseded by the final one. */
  onPartialTranscript: (text: string) => void
  /** Authoritative transcript for a finished turn. Empty when nothing was heard. */
  onFinalTranscript: (text: string) => void
  onError: (error: Error) => void
  onClosed: () => void
}

interface RealtimeSessionGrant {
  connectUrl: string
}

/**
 * Ask the backend for a realtime slot. It answers with a per-session URL on a
 * specific compute, so the pool address itself never reaches the browser.
 */
async function requestRealtimeSession(sessionUrl: string): Promise<RealtimeSessionGrant> {
  const response = await fetch(sessionUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  })

  if (!response.ok) {
    throw new Error(
      response.status === 503
        ? 'Voice is busy right now — try again in a moment.'
        : `Could not start a voice session (${response.status})`
    )
  }

  const grant = await response.json()
  const connectUrl = grant.connect_url ?? grant.websocket_url
  if (!connectUrl) throw new Error('Voice session response did not include a connect URL')
  return { connectUrl }
}

export class SpeechToTextSocket {
  private readonly handlers: SpeechToTextSocketHandlers
  private socket: WebSocket | null = null
  private isSessionConfigured = false
  private isClosedByUs = false

  constructor(handlers: SpeechToTextSocketHandlers) {
    this.handlers = handlers
  }

  /** Resolves once the socket is open and ready to accept audio. */
  async connect(sessionUrl: string): Promise<void> {
    const { connectUrl } = await requestRealtimeSession(sessionUrl)

    await new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(connectUrl)
      this.socket = socket

      const onOpen = () => {
        socket.removeEventListener('open', onOpen)
        socket.removeEventListener('error', onOpenFailed)
        resolve()
      }
      const onOpenFailed = () => {
        socket.removeEventListener('open', onOpen)
        socket.removeEventListener('error', onOpenFailed)
        reject(new Error('Could not reach the voice server'))
      }

      socket.addEventListener('open', onOpen)
      socket.addEventListener('error', onOpenFailed)
      socket.addEventListener('message', event => void this.handleServerEvent(event.data))
      socket.addEventListener('close', () => {
        if (!this.isClosedByUs) this.handlers.onClosed()
      })
    })
  }

  sendAudioChunk(pcmChunk: ArrayBuffer): void {
    // The server rejects audio that arrives before the session is configured.
    if (!this.isSessionConfigured) return
    this.send({ type: 'input_audio_buffer.append', audio: encodePcmToBase64(pcmChunk) })
  }

  close(): void {
    this.isClosedByUs = true
    if (this.socket && this.socket.readyState <= WebSocket.OPEN) {
      this.socket.close(1000, 'conversation ended')
    }
    this.socket = null
    this.isSessionConfigured = false
  }

  private send(event: Record<string, unknown>): void {
    if (this.socket?.readyState !== WebSocket.OPEN) return
    this.socket.send(JSON.stringify(event))
  }

  private async handleServerEvent(raw: string | Blob | ArrayBuffer): Promise<void> {
    let payload: string
    if (typeof raw === 'string') payload = raw
    else if (raw instanceof Blob) payload = await raw.text()
    else payload = new TextDecoder().decode(raw)

    let event: Record<string, any>
    try {
      event = JSON.parse(payload)
    } catch {
      return
    }

    switch (event.type) {
      case 'session.created':
        this.send({
          type: 'session.update',
          session: { type: 'realtime', instructions: TRANSCRIPTION_ONLY_INSTRUCTIONS },
        })
        this.isSessionConfigured = true
        break

      case 'input_audio_buffer.speech_started':
        this.handlers.onSpeechStarted()
        break

      case 'input_audio_buffer.speech_stopped':
        this.handlers.onSpeechStopped()
        break

      case 'conversation.item.input_audio_transcription.delta':
        // Each delta carries the cumulative transcript so far, not an increment.
        if (typeof event.delta === 'string' && event.delta) {
          this.handlers.onPartialTranscript(event.delta)
        }
        break

      case 'conversation.item.input_audio_transcription.completed':
        this.handlers.onFinalTranscript(
          typeof event.transcript === 'string' ? event.transcript.trim() : ''
        )
        break

      case 'response.created':
        // The pipeline started composing its own reply. We don't want it — the
        // sentinel's answer comes from our own API — so hand the slot straight
        // back, which also re-enables listening for the next turn.
        this.send({ type: 'response.cancel' })
        break

      case 'error':
        this.handlers.onError(new Error(event.error?.message ?? 'Voice server error'))
        break
    }
  }
}
