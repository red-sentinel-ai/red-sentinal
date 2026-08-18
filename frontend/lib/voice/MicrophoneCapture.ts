/**
 * Owns everything between the user's microphone and a stream of PCM16 chunks:
 * the media stream, the AudioContext, the capture worklet and an AnalyserNode
 * the orb reads its levels from.
 *
 * The AudioContext is created eagerly by the caller inside the click that
 * starts a call — iOS Safari only lets a context leave the `suspended` state
 * from within a user gesture — and then handed here.
 */

const MIC_CAPTURE_WORKLET_URL = '/worklets/sentinel-mic-capture.js'
const MIC_CAPTURE_PROCESSOR_NAME = 'sentinel-mic-capture'
const MIC_CHUNK_MS = 40

/** Small FFT: the orb only needs a handful of low-frequency speech bands. */
export const VOICE_ANALYSER_FFT_SIZE = 256

export interface MicrophoneCaptureOptions {
  audioContext: AudioContext
  onPcmChunk: (chunk: ArrayBuffer) => void
}

export class MicrophoneCapture {
  private readonly audioContext: AudioContext
  private readonly onPcmChunk: (chunk: ArrayBuffer) => void

  private mediaStream: MediaStream | null = null
  private sourceNode: MediaStreamAudioSourceNode | null = null
  private captureNode: AudioWorkletNode | null = null
  private analyserNode: AnalyserNode | null = null
  private isPaused = false

  constructor({ audioContext, onPcmChunk }: MicrophoneCaptureOptions) {
    this.audioContext = audioContext
    this.onPcmChunk = onPcmChunk
  }

  /** Levels for the orb while the user is talking. Null until `start()` runs. */
  get analyser(): AnalyserNode | null {
    return this.analyserNode
  }

  async start(): Promise<void> {
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    })

    await this.audioContext.audioWorklet.addModule(MIC_CAPTURE_WORKLET_URL)

    const captureNode = new AudioWorkletNode(this.audioContext, MIC_CAPTURE_PROCESSOR_NAME, {
      numberOfInputs: 1,
      numberOfOutputs: 0,
      processorOptions: { chunkMs: MIC_CHUNK_MS },
    })
    captureNode.port.onmessage = event => {
      // Paused chunks are dropped here rather than in the worklet so its
      // internal buffer keeps draining and never grows unbounded.
      if (!this.isPaused && event.data instanceof ArrayBuffer) this.onPcmChunk(event.data)
    }

    const analyserNode = this.audioContext.createAnalyser()
    analyserNode.fftSize = VOICE_ANALYSER_FFT_SIZE
    analyserNode.smoothingTimeConstant = 0

    const sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream)
    sourceNode.connect(captureNode)
    sourceNode.connect(analyserNode)

    this.captureNode = captureNode
    this.analyserNode = analyserNode
    this.sourceNode = sourceNode
  }

  /**
   * Stop forwarding audio without releasing the microphone. Used while a turn
   * is being answered, so half-heard speech can't start a second turn, and when
   * the user mutes themselves.
   */
  setPaused(paused: boolean): void {
    this.isPaused = paused
  }

  stop(): void {
    this.captureNode?.port.close()
    this.sourceNode?.disconnect()
    this.captureNode?.disconnect()
    this.analyserNode?.disconnect()
    this.mediaStream?.getTracks().forEach(track => track.stop())

    this.captureNode = null
    this.sourceNode = null
    this.analyserNode = null
    this.mediaStream = null
  }
}
