/**
 * Speaks the sentinel's replies during a voice call.
 *
 * Playback goes through Web Audio rather than an `<audio>` element for two
 * reasons the call depends on: an AnalyserNode gives the orb something to pulse
 * to, and a source node can be cut off mid-word the instant the user barges in.
 *
 * If the backend's TTS route is unavailable, we fall back to the browser's own
 * speech synthesis so the conversation continues (silently, as far as the orb
 * is concerned — there is no audio graph to analyse).
 */

import { VOICE_ANALYSER_FFT_SIZE } from './MicrophoneCapture'
import { fetchSynthesizedSpeech } from './speech-synthesis'

export class SentinelSpeechPlayer {
  private readonly audioContext: AudioContext
  private readonly analyserNode: AnalyserNode

  private activeSource: AudioBufferSourceNode | null = null
  /** Resolves the in-flight `speak()` when playback ends or is interrupted. */
  private finishActiveUtterance: (() => void) | null = null
  /**
   * Bumped by every `speak()` and every `stop()`. Synthesis is a network round
   * trip, so a barge-in can land while we are still waiting for the audio —
   * comparing this on the way back tells us the utterance is no longer wanted.
   */
  private utteranceGeneration = 0

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext
    this.analyserNode = audioContext.createAnalyser()
    this.analyserNode.fftSize = VOICE_ANALYSER_FFT_SIZE
    this.analyserNode.smoothingTimeConstant = 0.3
    this.analyserNode.connect(audioContext.destination)
  }

  /** Levels for the orb while the sentinel is talking. */
  get analyser(): AnalyserNode {
    return this.analyserNode
  }

  /** Resolves once the reply has finished playing, or as soon as it is stopped. */
  async speak(text: string): Promise<void> {
    this.stop()
    if (!text.trim()) return
    const generation = ++this.utteranceGeneration

    let audioBuffer: AudioBuffer
    try {
      const speechBlob = await fetchSynthesizedSpeech(text)
      audioBuffer = await this.audioContext.decodeAudioData(await speechBlob.arrayBuffer())
    } catch {
      if (generation !== this.utteranceGeneration) return
      await speakWithBrowserVoice(text)
      return
    }

    if (generation !== this.utteranceGeneration) return

    await new Promise<void>(resolve => {
      const source = this.audioContext.createBufferSource()
      source.buffer = audioBuffer
      source.connect(this.analyserNode)

      this.activeSource = source
      this.finishActiveUtterance = resolve
      source.onended = () => this.settleActiveUtterance()
      source.start()
    })
  }

  stop(): void {
    this.utteranceGeneration += 1
    if (this.activeSource) {
      this.activeSource.onended = null
      this.activeSource.stop()
      this.activeSource.disconnect()
    }
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
    this.settleActiveUtterance()
  }

  dispose(): void {
    this.stop()
    this.analyserNode.disconnect()
  }

  private settleActiveUtterance(): void {
    this.activeSource = null
    this.finishActiveUtterance?.()
    this.finishActiveUtterance = null
  }
}

function speakWithBrowserVoice(text: string): Promise<void> {
  const synthesis = typeof window === 'undefined' ? null : window.speechSynthesis
  if (!synthesis) return Promise.resolve()

  return new Promise(resolve => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.onend = () => resolve()
    utterance.onerror = () => resolve()
    synthesis.cancel()
    synthesis.speak(utterance)
  })
}
