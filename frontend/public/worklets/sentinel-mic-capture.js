/**
 * AudioWorklet that turns the browser's microphone stream into the PCM format
 * the speech-to-speech backend expects: 16 kHz, mono, little-endian Int16.
 *
 * Browsers hand us Float32 samples at the AudioContext rate (48 kHz on most
 * desktops, 44.1 kHz on some Windows machines, 24/16 kHz on some phones), so we
 * resample before packing. Output is posted to the main thread as an
 * ArrayBuffer every `chunkMs` milliseconds; the main thread base64-encodes it
 * and appends it to the realtime socket's input audio buffer.
 *
 * Loaded from `/worklets/sentinel-mic-capture.js` — it must stay same-origin,
 * which is why it lives in `public/` rather than being bundled.
 */

const TARGET_SAMPLE_RATE = 16000
const DEFAULT_CHUNK_MS = 40

class SentinelMicCaptureProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super()
    const chunkMs = options?.processorOptions?.chunkMs ?? DEFAULT_CHUNK_MS
    this.resampleRatio = sampleRate / TARGET_SAMPLE_RATE
    this.samplesPerChunk = Math.round((TARGET_SAMPLE_RATE * chunkMs) / 1000)
    this.pendingInput = new Float32Array(0)
    this.resampledChunk = new Float32Array(this.samplesPerChunk)
  }

  /** Buffer incoming samples, then drain as many full chunks as they cover. */
  appendInput(samples) {
    if (samples.length === 0) return
    const combined = new Float32Array(this.pendingInput.length + samples.length)
    combined.set(this.pendingInput, 0)
    combined.set(samples, this.pendingInput.length)
    this.pendingInput = combined
    this.emitReadyChunks()
  }

  emitReadyChunks() {
    const ratio = this.resampleRatio
    const chunkLength = this.samplesPerChunk
    const inputSamplesNeeded = Math.ceil(chunkLength * ratio)

    while (this.pendingInput.length >= inputSamplesNeeded) {
      if (Math.abs(ratio - 3) < 1e-6) {
        // 48 kHz -> 16 kHz is an exact 3:1 decimation. Averaging each group of
        // three samples acts as a cheap low-pass so we don't alias.
        for (let i = 0; i < chunkLength; i++) {
          const start = i * 3
          this.resampledChunk[i] =
            (this.pendingInput[start] +
              this.pendingInput[start + 1] +
              this.pendingInput[start + 2]) /
            3
        }
      } else {
        // Any other rate: linear interpolation between neighbouring samples.
        for (let i = 0; i < chunkLength; i++) {
          const sourcePosition = i * ratio
          const index = Math.floor(sourcePosition)
          const fraction = sourcePosition - index
          const current = this.pendingInput[index]
          const next = this.pendingInput[index + 1] ?? current
          this.resampledChunk[i] = current + (next - current) * fraction
        }
      }

      const pcm16 = new Int16Array(chunkLength)
      for (let i = 0; i < chunkLength; i++) {
        const sample = Math.max(-1, Math.min(1, this.resampledChunk[i]))
        pcm16[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff
      }

      this.pendingInput = this.pendingInput.slice(Math.floor(chunkLength * ratio))
      this.port.postMessage(pcm16.buffer, [pcm16.buffer])
    }
  }

  process(inputs) {
    const monoChannel = inputs[0]?.[0]
    if (monoChannel && monoChannel.length > 0) this.appendInput(monoChannel)
    return true
  }
}

registerProcessor('sentinel-mic-capture', SentinelMicCaptureProcessor)
