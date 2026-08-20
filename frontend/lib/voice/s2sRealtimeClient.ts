/**
 * Browser client for the speech-to-speech realtime WebSocket endpoint.
 *
 * This is a direct-connection, load-balancer-free port of the reference
 * implementation in /home/satyam/hf-realtime-voice/ws/s2s-ws-client.js.
 * The deploy pins a single S2S server via NEXT_PUBLIC_SPEECH_TO_SPEECH_URL,
 * so queueing, session proxies, and metering are intentionally removed.
 *
 * Protocol: OpenAI Realtime GA over WebSocket.
 *   - Client sends `session.update` with instructions + voice.
 *   - Mic audio is streamed as PCM16 16 kHz mono base64 (`input_audio_buffer.append`).
 *   - Server replies with `response.output_audio.delta` + transcript deltas.
 */

import {
  base64FromArrayBuffer,
  base64ToBytes,
  extractResponseTranscript,
  trimTrailingSlash,
} from './codec'

export type S2sStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'user-speaking'
  | 'processing'
  | 'ai-speaking'
  | 'closed'
  | 'error'

export interface S2sTranscript {
  role: 'user' | 'assistant'
  text: string
  partial: boolean
  itemId?: string
  responseId?: string
}

export interface S2sToolCall {
  name: string
  arguments: string
  callId: string
  responseId: string
}

export interface S2sResponseFinished {
  responseId: string
  status: string
  audible: boolean
  transcript: string
}

export interface S2sClientOptions {
  /** Full WebSocket URL of the S2S realtime endpoint, e.g. wss://host/v1/realtime. */
  directUrl: string
  /** Voice name (backend-specific). */
  voice: string
  /** System instructions (may include the ss-route: marker line). */
  instructions: string
  /** Optional hidden user prompt that asks the model to greet once on connect. */
  startupGreeting?: string
  /** Optional pre-acquired mic stream. */
  micStream?: MediaStream
  /** Lazy mic acquisition if no stream is provided. */
  acquireMic?: () => Promise<MediaStream>
  /** Optional pre-created AudioContext. */
  audioContext?: AudioContext
  /** Optional output device id. */
  audioOutputId?: string
  /** Close the session after this many ms of user silence while listening. */
  inactivityTimeoutMs?: number
}

interface InternalEventMap {
  status: CustomEvent<{ status: S2sStatus }>
  transcript: CustomEvent<S2sTranscript>
  error: CustomEvent<{ error: Error }>
  'server-error': CustomEvent<{ error: Error }>
  'user-turn-started': CustomEvent<{ itemId: string }>
  'user-turn-stopped': CustomEvent<{ itemId: string }>
  'response-finished': CustomEvent<S2sResponseFinished>
  toolcall: CustomEvent<S2sToolCall>
}

const OUTPUT_SAMPLE_RATE = 16000
const MIC_CHUNK_MS = 40
const RESPONSE_CREATE_ID_METADATA_KEY = 's2s_demo_create_id'

export class S2sRealtimeClient extends EventTarget {
  private options: S2sClientOptions
  private ws: WebSocket | null = null
  private ctx: AudioContext | null = null
  private micSrc: MediaStreamAudioSourceNode | null = null
  private captureNode: AudioWorkletNode | null = null
  private playbackNode: AudioWorkletNode | null = null
  private micAnalyser: AnalyserNode | null = null
  private outAnalyser: AnalyserNode | null = null
  private status: S2sStatus = 'idle'
  private aiSpeaking = false
  private muted = false
  private sessionConfigured = false
  private startupGreetingSent = false
  private lastUserSpeech = 0
  private inactivityTimer: ReturnType<typeof setInterval> | null = null

  private activeResponseId = ''
  private pendingCreateId = ''
  private pendingCreateSawResponse = false
  private waitingForResponseAfterCollision = false
  private nextCreateSequence = 0
  private createQueue: { image?: string }[] = []

  private audibleResponses = new Set<string>()
  private asstTranscriptByResp = new Map<string, string>()
  private asstFullByResp = new Map<string, string>()

  private debug = false

  constructor(options: S2sClientOptions) {
    super()
    this.options = options
    try {
      this.debug = typeof window !== 'undefined' && localStorage.getItem('s2s.debug') === '1'
    } catch {
      this.debug = false
    }
  }

  get currentStatus(): S2sStatus {
    return this.status
  }

  private setStatus(status: S2sStatus) {
    if (this.status === status) return
    this.status = status
    this.dispatchTypedEvent('status', { status })
  }

  private dispatchTypedEvent<K extends keyof InternalEventMap>(
    type: K,
    detail: InternalEventMap[K]['detail']
  ) {
    this.dispatchEvent(new CustomEvent(type, { detail }) as InternalEventMap[K])
  }

  private startInactivityTimer() {
    const timeout = this.options.inactivityTimeoutMs ?? 30000
    if (timeout <= 0) return
    this.lastUserSpeech = Date.now()
    this.inactivityTimer = setInterval(() => {
      if (this.status === 'user-speaking') {
        this.lastUserSpeech = Date.now()
        return
      }
      if (this.status !== 'connected') return
      if (Date.now() - this.lastUserSpeech > timeout) {
        console.log('[s2s] closing due to user inactivity')
        this.ws?.close(4001, 'user inactivity timeout')
      }
    }, 1000)
  }

  private stopInactivityTimer() {
    if (this.inactivityTimer) {
      clearInterval(this.inactivityTimer)
      this.inactivityTimer = null
    }
  }

  private resetInactivityTimer() {
    this.lastUserSpeech = Date.now()
  }

  private asstDisplay(rid: string): string {
    const full = this.asstFullByResp.get(rid) || ''
    const seg = this.asstTranscriptByResp.get(rid) || ''
    if (!seg) return full
    return full ? `${full} ${seg}` : seg
  }

  private markAudible() {
    if (this.status === 'ai-speaking') return
    if (this.status === 'closed' || this.status === 'error') return
    this.setStatus('ai-speaking')
  }

  async connect(): Promise<void> {
    if (this.ws) throw new Error('Already connected')

    const directUrl = this.options.directUrl
    if (!directUrl) throw new Error('No direct S2S URL configured')

    this.setStatus('connecting')

    if (!this.options.micStream && this.options.acquireMic) {
      this.options.micStream = await this.options.acquireMic()
    }

    const audioReady = this.setupAudio()
    const wsReady = this.openWebSocket(directUrl)
    await Promise.all([audioReady, wsReady])
  }

  private async setupAudio(): Promise<void> {
    const ctx = this.options.audioContext ?? new AudioContext({ latencyHint: 'interactive' })
    this.ctx = ctx

    if (ctx.state === 'suspended') {
      try {
        await ctx.resume()
      } catch (err) {
        console.warn('[s2s] AudioContext resume failed:', err)
      }
    }

    const base = `${typeof window !== 'undefined' ? window.location.origin : ''}/worklets/`
    await ctx.audioWorklet.addModule(new URL('mic-capture.js', base).href)
    await ctx.audioWorklet.addModule(new URL('audio-playback.js', base).href)

    const captureNode = new AudioWorkletNode(ctx, 'mic-capture', {
      numberOfInputs: 1,
      numberOfOutputs: 0,
      processorOptions: { chunkMs: MIC_CHUNK_MS },
    })
    captureNode.port.onmessage = (e) => {
      const data = e.data
      if (data instanceof ArrayBuffer) {
        this.onMicChunk(data)
      } else if (data?.kind === 'level') {
        // Available for future mic-level UI.
      }
    }
    this.captureNode = captureNode

    const micStream = this.options.micStream
    if (!micStream) throw new Error('No mic stream available')
    const micSrc = ctx.createMediaStreamSource(micStream)
    micSrc.connect(captureNode)
    this.micSrc = micSrc

    const micAnalyser = ctx.createAnalyser()
    micAnalyser.fftSize = 256
    micAnalyser.smoothingTimeConstant = 0
    micSrc.connect(micAnalyser)
    this.micAnalyser = micAnalyser

    const playbackNode = new AudioWorkletNode(ctx, 'audio-playback', {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [1],
    })
    playbackNode.port.postMessage({ kind: 'config', inputRate: OUTPUT_SAMPLE_RATE })
    playbackNode.port.onmessage = (e) => this.onPlaybackMessage(e.data)

    const outAnalyser = ctx.createAnalyser()
    outAnalyser.fftSize = 256
    outAnalyser.smoothingTimeConstant = 0.3
    playbackNode.connect(outAnalyser)
    outAnalyser.connect(ctx.destination)
    this.outAnalyser = outAnalyser
    this.playbackNode = playbackNode

    await this.setAudioOutputDevice(this.options.audioOutputId || '')
  }

  private async setAudioOutputDevice(deviceId = ''): Promise<boolean> {
    const ctx = this.ctx
    if (!ctx || typeof (ctx as unknown as { setSinkId?: (id: string) => Promise<void> }).setSinkId !== 'function') {
      return false
    }
    try {
      await (ctx as unknown as { setSinkId: (id: string) => Promise<void> }).setSinkId(deviceId || '')
      return true
    } catch (err) {
      console.warn('[s2s] setSinkId failed:', err)
      return false
    }
  }

  private openWebSocket(connectUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(connectUrl)
      ws.binaryType = 'arraybuffer'
      this.ws = ws

      const onceOpen = () => {
        ws.removeEventListener('open', onceOpen)
        ws.removeEventListener('error', onceErr)
        this.startInactivityTimer()
        resolve()
      }
      const onceErr = (e: Event) => {
        ws.removeEventListener('open', onceOpen)
        ws.removeEventListener('error', onceErr)
        reject(new Error(`WebSocket failed to open: ${(e as ErrorEvent)?.message ?? 'error'}`))
      }
      ws.addEventListener('open', onceOpen)
      ws.addEventListener('error', onceErr)

      ws.addEventListener('message', (e) => this.onWsMessage(e.data))
      ws.addEventListener('close', (e) => this.onWsClose(e))
      ws.addEventListener('error', (e) => {
        console.error('[s2s] socket error', e)
      })
    })
  }

  private onPlaybackMessage(data: { kind?: string; queuedMs?: number; played?: number }) {
    if (data?.kind === 'underrun') {
      // End-of-turn or cancellation; response.done will drive state.
    }
  }

  private onMicChunk(pcm16Buffer: ArrayBuffer) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
    if (!this.sessionConfigured) return
    if (this.muted) return
    const b64 = base64FromArrayBuffer(pcm16Buffer)
    this.send({ type: 'input_audio_buffer.append', audio: b64 })
  }

  private async onWsMessage(raw: string | ArrayBuffer | Blob) {
    let text: string
    if (typeof raw === 'string') {
      text = raw
    } else if (raw instanceof ArrayBuffer) {
      text = new TextDecoder('utf-8').decode(raw)
    } else if (raw instanceof Blob) {
      text = await raw.text()
    } else {
      return
    }

    let event: { type?: string } & Record<string, unknown>
    try {
      event = JSON.parse(text) as typeof event
    } catch {
      return
    }

    const type = event?.type
    if (typeof type !== 'string') return
    if (this.debug) {
      console.debug('[s2s]', type, event)
    }

    switch (type) {
      case 'session.created':
        this.sendSessionUpdate()
        this.sessionConfigured = true
        this.sendStartupGreeting()
        if (this.status === 'connecting') this.setStatus('connected')
        break

      case 'session.updated':
        break

      case 'input_audio_buffer.speech_started':
        this.playbackNode?.port.postMessage({ kind: 'clear' })
        this.aiSpeaking = false
        this.resetInactivityTimer()
        this.dispatchTypedEvent('user-turn-started', {
          itemId: typeof event.item_id === 'string' ? event.item_id : '',
        })
        this.setStatus('user-speaking')
        break

      case 'input_audio_buffer.speech_stopped': {
        const itemId = typeof event.item_id === 'string' ? event.item_id : ''
        this.dispatchTypedEvent('user-turn-stopped', { itemId })
        if (this.status === 'user-speaking') this.setStatus('processing')
        break
      }

      case 'response.created':
        this.waitingForResponseAfterCollision = false
        this.activeResponseId = (event.response as { id?: string } | undefined)?.id ?? ''
        if (
          (event.response as { metadata?: Record<string, string> } | undefined)?.metadata?.[
            RESPONSE_CREATE_ID_METADATA_KEY
          ] === this.pendingCreateId
        ) {
          this.pendingCreateId = ''
          this.pendingCreateSawResponse = false
        } else if (this.pendingCreateId) {
          this.pendingCreateSawResponse = true
        }
        if (this.status === 'connected' || this.status === 'user-speaking') {
          this.setStatus('processing')
        }
        break

      case 'response.output_item.added':
        if (this.status === 'connected' || this.status === 'user-speaking') {
          this.setStatus('processing')
        }
        break

      case 'response.audio.delta':
      case 'response.output_audio.delta': {
        this.pushAudioDelta(event.delta as string)
        const rid =
          (event.response_id as string) ??
          ((event.response as { id?: string } | undefined)?.id as string)
        if (rid) this.audibleResponses.add(rid)
        if (!this.aiSpeaking) {
          this.aiSpeaking = true
          this.markAudible()
        }
        break
      }

      case 'response.content_part.added': {
        const part = event.part as { type?: string } | undefined
        if (part?.type === 'audio' || part?.type === 'output_audio') {
          this.markAudible()
        }
        break
      }

      case 'response.done': {
        this.aiSpeaking = false
        const responseId = (event.response as { id?: string } | undefined)?.id ?? ''
        if (this.activeResponseId === responseId) this.activeResponseId = ''
        this.waitingForResponseAfterCollision = false
        if (this.status === 'ai-speaking' || this.status === 'processing') {
          this.setStatus('connected')
        }
        const status = (event.response as { status?: string } | undefined)?.status ?? 'completed'
        const audible = responseId ? this.audibleResponses.has(responseId) : false
        this.audibleResponses.delete(responseId)
        const transcript =
          extractResponseTranscript(event.response) || this.asstDisplay(responseId) || ''
        this.asstTranscriptByResp.delete(responseId)
        this.asstFullByResp.delete(responseId)
        this.dispatchTypedEvent('response-finished', {
          responseId,
          status,
          audible,
          transcript,
        })
        this.flushQueuedCreate()
        break
      }

      case 'response.function_call_arguments.done': {
        const name = typeof event.name === 'string' ? event.name : ''
        const args = typeof event.arguments === 'string' ? event.arguments : '{}'
        const callId = typeof event.call_id === 'string' ? event.call_id : ''
        const responseId = typeof event.response_id === 'string' ? event.response_id : ''
        if (name) {
          this.dispatchTypedEvent('toolcall', { name, arguments: args, callId, responseId })
        }
        break
      }

      case 'conversation.item.input_audio_transcription.delta': {
        const delta = typeof event.delta === 'string' ? event.delta : ''
        if (delta) {
          this.dispatchTypedEvent('transcript', {
            role: 'user',
            text: delta,
            partial: true,
            itemId: typeof event.item_id === 'string' ? event.item_id : '',
          })
        }
        break
      }

      case 'conversation.item.input_audio_transcription.completed': {
        const transcript = typeof event.transcript === 'string' ? event.transcript : ''
        if (this.waitingForResponseAfterCollision) {
          this.waitingForResponseAfterCollision = false
          this.flushQueuedCreate()
        }
        if (transcript) {
          this.dispatchTypedEvent('transcript', {
            role: 'user',
            text: transcript,
            partial: false,
            itemId: typeof event.item_id === 'string' ? event.item_id : '',
          })
        } else if (this.status === 'processing' && !this.responsePending()) {
          this.setStatus('connected')
        }
        break
      }

      case 'response.audio_transcript.delta':
      case 'response.output_audio_transcript.delta': {
        this.markAudible()
        const rid = typeof event.response_id === 'string' ? event.response_id : ''
        const delta = typeof event.delta === 'string' ? event.delta : ''
        if (delta) {
          this.asstTranscriptByResp.set(
            rid,
            (this.asstTranscriptByResp.get(rid) || '') + delta
          )
          this.dispatchTypedEvent('transcript', {
            role: 'assistant',
            text: this.asstDisplay(rid),
            partial: true,
            responseId: rid,
          })
        }
        break
      }

      case 'response.audio_transcript.done':
      case 'response.output_audio_transcript.done': {
        const rid = typeof event.response_id === 'string' ? event.response_id : ''
        const segment =
          (typeof event.transcript === 'string' && event.transcript) ||
          this.asstTranscriptByResp.get(rid) ||
          ''
        this.asstTranscriptByResp.delete(rid)
        if (segment) {
          const prev = this.asstFullByResp.get(rid) || ''
          this.asstFullByResp.set(rid, prev ? `${prev} ${segment}` : segment)
        }
        const full = this.asstFullByResp.get(rid) || ''
        if (full) {
          this.dispatchTypedEvent('transcript', {
            role: 'assistant',
            text: full,
            partial: false,
            responseId: rid,
          })
        }
        break
      }

      case 'error': {
        const err = event.error as { type?: string; code?: string; message?: string } | undefined
        console.error('[s2s] server error:', err)
        if (
          err?.type === 'conversation_already_has_active_response' ||
          err?.code === 'conversation_already_has_active_response'
        ) {
          if (this.pendingCreateId) {
            const responseAlreadyFinished =
              this.pendingCreateSawResponse && !this.activeResponseId
            this.waitingForResponseAfterCollision = !this.pendingCreateSawResponse
            this.pendingCreateId = ''
            this.pendingCreateSawResponse = false
            this.createQueue.unshift({})
            if (responseAlreadyFinished) this.flushQueuedCreate()
          }
          break
        }
        this.dispatchTypedEvent('server-error', {
          error: new Error(err?.message ?? 'Server error'),
        })
        break
      }
    }
  }

  private pushAudioDelta(b64: string) {
    if (!this.playbackNode || !b64) return
    const bytes = base64ToBytes(b64)
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
    const samples = new Float32Array(bytes.byteLength / 2)
    for (let i = 0; i < samples.length; i++) {
      const s = view.getInt16(i * 2, true)
      samples[i] = s < 0 ? s / 0x8000 : s / 0x7fff
    }
    this.playbackNode.port.postMessage({ kind: 'audio', samples }, [samples.buffer])
  }

  private onWsClose(ev: CloseEvent) {
    this.stopInactivityTimer()
    console.log('[s2s] socket closed:', ev.code, ev.reason)
    if (this.status === 'closed' || this.status === 'error') return
    if (ev.code === 1000) {
      this.setStatus('closed')
    } else {
      this.dispatchTypedEvent('error', {
        error: new Error(`WebSocket closed (${ev.code}) ${ev.reason || ''}`.trim()),
      })
      this.setStatus('error')
    }
  }

  private sendSessionUpdate() {
    const session: Record<string, unknown> = {
      type: 'realtime',
      instructions: this.options.instructions,
      audio: {
        output: { voice: this.options.voice },
      },
    }
    this.send({ type: 'session.update', session })
  }

  updateSession(patch: { voice?: string; instructions?: string }) {
    const session: Record<string, unknown> = { type: 'realtime' }
    if (patch.instructions) session.instructions = patch.instructions
    if (patch.voice) session.audio = { output: { voice: patch.voice } }
    if (Object.keys(session).length > 1) {
      this.send({ type: 'session.update', session })
    }
  }

  private sendStartupGreeting() {
    const greeting = this.options.startupGreeting?.trim()
    if (!greeting || this.startupGreetingSent) return
    this.startupGreetingSent = true
    this.send({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text: greeting }],
      },
    })
    this.requestResponse()
  }

  requestResponse(opts: { image?: string } = {}) {
    if (this.responsePending()) {
      this.createQueue.push(opts)
      return
    }
    this.createResponseNow(opts)
  }

  private responseActive(): boolean {
    return (
      Boolean(this.activeResponseId) ||
      Boolean(this.pendingCreateId) ||
      this.waitingForResponseAfterCollision
    )
  }

  private responsePending(): boolean {
    return this.responseActive() || this.createQueue.length > 0
  }

  private createResponseNow(opts: { image?: string } = {}) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
    if (opts.image) this.sendUserImage(opts.image)
    const createId = `demo_create_${++this.nextCreateSequence}`
    this.pendingCreateId = createId
    this.pendingCreateSawResponse = false
    this.send({
      type: 'response.create',
      response: { metadata: { [RESPONSE_CREATE_ID_METADATA_KEY]: createId } },
    })
  }

  private flushQueuedCreate() {
    if (this.createQueue.length > 0 && !this.responseActive()) {
      const opts = this.createQueue.shift()
      this.createResponseNow(opts)
    }
  }

  private sendUserImage(dataUrl: string) {
    this.send({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_image', image_url: dataUrl }],
      },
    })
  }

  setMuted(muted: boolean) {
    this.muted = muted
  }

  private send(event: Record<string, unknown>) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
    this.ws.send(JSON.stringify(event))
  }

  async close(): Promise<void> {
    this.stopInactivityTimer()
    this.playbackNode?.port.postMessage({ kind: 'clear' })
    this.aiSpeaking = false
    try {
      if (this.ws && this.ws.readyState <= WebSocket.OPEN) {
        this.ws.close(1000, 'client closed')
      }
    } catch {
      // ignored
    }
    this.ws = null

    try {
      this.captureNode?.port.close?.()
    } catch {
      // ignored
    }
    try {
      this.micSrc?.disconnect()
    } catch {
      // ignored
    }
    try {
      this.captureNode?.disconnect()
    } catch {
      // ignored
    }
    try {
      this.micAnalyser?.disconnect()
    } catch {
      // ignored
    }
    try {
      this.outAnalyser?.disconnect()
    } catch {
      // ignored
    }
    try {
      this.playbackNode?.disconnect()
    } catch {
      // ignored
    }
    try {
      await this.ctx?.close()
    } catch {
      // ignored
    }
    this.ctx = null
    this.captureNode = null
    this.playbackNode = null
    this.micSrc = null
    this.micAnalyser = null
    this.outAnalyser = null
    this.setStatus('closed')
  }
}

export function normalizeS2sUrl(url: string): string {
  const trimmed = trimTrailingSlash(url.trim())
  if (!trimmed) return ''
  if (trimmed.startsWith('ws://') || trimmed.startsWith('wss://')) return trimmed

  // Convert http(s) prefixes to ws(s) so env vars can use either scheme.
  // Also tolerates common typos like `http//host` (missing colon).
  const httpMatch = trimmed.match(/^https?:?\/?\/?(.+)$/)
  if (httpMatch) {
    const isSecure = trimmed.startsWith('https')
    return `${isSecure ? 'wss' : 'ws'}://${httpMatch[1]}/v1/realtime`
  }

  // Bare host:port -> assume secure if page is https, else ws.
  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss://' : 'ws://'
  return `${protocol}${trimmed}/v1/realtime`
}
