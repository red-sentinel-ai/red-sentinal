/**
 * Drives the orb's animation from live audio.
 *
 * Every animation frame it reads the two AnalyserNodes of a call — the
 * microphone and the sentinel's synthesized speech — and writes the result to
 * CSS custom properties on the orb element. Keeping this out of React state is
 * deliberate: it updates at display rate, and re-rendering 60 times a second to
 * move a few pixels would be wasteful.
 *
 * Properties written (all in the 0..1 range, all consumed by `.voice-orb` in
 * `globals.css`):
 *   --voice-bar-0 … --voice-bar-4   five speech-band levels for the bar meter
 *   --voice-mic-level               overall level of the user's voice
 *   --voice-speech-level            overall level of the sentinel's voice
 */

/** Speech energy lives at the bottom of the FFT, so the band edges stay low. */
const BAND_EDGES = [2, 5, 9, 16, 28, 52]
const BAND_COUNT = BAND_EDGES.length - 1
/** Rise quickly so word onsets register; fall slowly so the orb doesn't flicker. */
const RISE_SMOOTHING = 0.6
const FALL_SMOOTHING = 0.18

export class VoiceOrbLevelWriter {
  private readonly element: HTMLElement
  private readonly frequencies: Uint8Array

  private microphoneAnalyser: AnalyserNode | null = null
  private speechAnalyser: AnalyserNode | null = null
  private readonly bandLevels = new Float32Array(BAND_COUNT)
  private microphoneLevel = 0
  private speechLevel = 0
  private animationFrame: number | null = null

  constructor(element: HTMLElement, frequencyBinCount: number) {
    this.element = element
    this.frequencies = new Uint8Array(frequencyBinCount)
  }

  /** Analysers appear as the call connects, so they are attached after construction. */
  setAnalysers(analysers: { microphone?: AnalyserNode | null; speech?: AnalyserNode | null }): void {
    if ('microphone' in analysers) this.microphoneAnalyser = analysers.microphone ?? null
    if ('speech' in analysers) this.speechAnalyser = analysers.speech ?? null
  }

  start(): void {
    if (this.animationFrame !== null) return
    const tick = () => {
      this.animationFrame = requestAnimationFrame(tick)
      this.writeLevels()
    }
    this.animationFrame = requestAnimationFrame(tick)
  }

  stop(): void {
    if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame)
    this.animationFrame = null

    for (let band = 0; band < BAND_COUNT; band++) {
      this.element.style.removeProperty(`--voice-bar-${band}`)
    }
    this.element.style.removeProperty('--voice-mic-level')
    this.element.style.removeProperty('--voice-speech-level')
  }

  private writeLevels(): void {
    this.speechLevel = this.readPeak(this.speechAnalyser, this.speechLevel)
    this.microphoneLevel = this.readPeak(this.microphoneAnalyser, this.microphoneLevel)
    this.element.style.setProperty('--voice-speech-level', this.speechLevel.toFixed(3))
    this.element.style.setProperty('--voice-mic-level', this.microphoneLevel.toFixed(3))

    // The bars belong to whoever is making noise: the sentinel while it talks,
    // the microphone the rest of the time.
    const barSource = this.speechLevel > 0.02 ? this.speechAnalyser : this.microphoneAnalyser
    if (!barSource) return
    barSource.getByteFrequencyData(this.frequencies)

    for (let band = 0; band < BAND_COUNT; band++) {
      const lowBin = BAND_EDGES[band]
      const highBin = Math.min(BAND_EDGES[band + 1], this.frequencies.length)
      let total = 0
      for (let bin = lowBin; bin < highBin; bin++) total += this.frequencies[bin]

      const target = highBin > lowBin ? total / ((highBin - lowBin) * 255) : 0
      this.bandLevels[band] = smoothTowards(this.bandLevels[band], target)
      this.element.style.setProperty(`--voice-bar-${band}`, this.bandLevels[band].toFixed(3))
    }
  }

  private readPeak(analyser: AnalyserNode | null, previousLevel: number): number {
    if (!analyser) return smoothTowards(previousLevel, 0)
    analyser.getByteFrequencyData(this.frequencies)

    let peak = 0
    const limit = Math.min(this.frequencies.length, BAND_EDGES[BAND_COUNT])
    for (let bin = 0; bin < limit; bin++) {
      if (this.frequencies[bin] > peak) peak = this.frequencies[bin]
    }
    return smoothTowards(previousLevel, peak / 255)
  }
}

function smoothTowards(current: number, target: number): number {
  const smoothing = target > current ? RISE_SMOOTHING : FALL_SMOOTHING
  return current + (target - current) * smoothing
}
