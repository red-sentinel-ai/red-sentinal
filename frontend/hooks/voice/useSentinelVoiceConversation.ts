'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { SPEECH_TO_SPEECH_SESSION_URL } from '@/constants'
import { MicrophoneCapture, VOICE_ANALYSER_FFT_SIZE } from '@/lib/voice/MicrophoneCapture'
import { SentinelSpeechPlayer } from '@/lib/voice/SentinelSpeechPlayer'
import { SpeechToTextSocket } from '@/lib/voice/SpeechToTextSocket'
import { VoiceOrbLevelWriter } from '@/lib/voice/VoiceOrbLevelWriter'
import { describeVoiceError } from '@/lib/voice-utils'
import type { SentinelVoiceTurnHandler, VoiceCallStatus, VoiceTurn } from '@/types/voice'

const PARTIAL_TURN_ID = 'attacker-partial'

/**
 * Drives a full audio-to-audio conversation with a sentinel.
 *
 * One turn looks like this:
 *
 *   user speaks -> backend VAD + STT -> `onUserTurn(transcript)` -> reply spoken
 *
 * The speech-to-speech backend supplies the ears, `onUserTurn` supplies the
 * brain (practice API, casual chat, or an on-chain attack), and
 * `SentinelSpeechPlayer` supplies the voice. Keeping the brain behind a
 * callback is what lets the same call UI serve all three attack surfaces.
 */
export function useSentinelVoiceConversation(onUserTurn: SentinelVoiceTurnHandler) {
  const [status, setStatus] = useState<VoiceCallStatus>('idle')
  const [turns, setTurns] = useState<VoiceTurn[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(false)

  const audioContextRef = useRef<AudioContext | null>(null)
  const socketRef = useRef<SpeechToTextSocket | null>(null)
  const microphoneRef = useRef<MicrophoneCapture | null>(null)
  const speechPlayerRef = useRef<SentinelSpeechPlayer | null>(null)
  const orbLevelWriterRef = useRef<VoiceOrbLevelWriter | null>(null)

  // The handler is re-created on every render of the calling component, so the
  // socket callbacks read it from a ref instead of capturing a stale closure.
  const onUserTurnRef = useRef(onUserTurn)
  onUserTurnRef.current = onUserTurn

  /** Guards against late socket events landing after the user hung up. */
  const isCallEndedRef = useRef(false)
  /** Read when a turn finishes, to restore the mute the user chose meanwhile. */
  const isMutedRef = useRef(false)
  isMutedRef.current = isMuted

  const endCall = useCallback(() => {
    isCallEndedRef.current = true
    orbLevelWriterRef.current?.stop()
    socketRef.current?.close()
    microphoneRef.current?.stop()
    speechPlayerRef.current?.dispose()
    void audioContextRef.current?.close()

    socketRef.current = null
    microphoneRef.current = null
    speechPlayerRef.current = null
    audioContextRef.current = null

    setStatus('idle')
    setIsMuted(false)
  }, [])

  /** Ask the sentinel, then speak its reply. */
  const answerSpokenAttack = useCallback(async (spokenPrompt: string) => {
    // Stay deaf while the sentinel is thinking and talking: on a phone's
    // speaker the microphone would otherwise hear the reply and treat it as a
    // new turn. The orb doubles as an interrupt button for real barge-in.
    microphoneRef.current?.setPaused(true)
    setStatus('thinking')

    try {
      const reply = await onUserTurnRef.current(spokenPrompt)
      if (isCallEndedRef.current) return

      setTurns(previous => [
        ...previous,
        {
          id: `sentinel-${Date.now()}`,
          speaker: 'sentinel',
          text: reply.text,
          isBreach: reply.isBreach,
          score: reply.score,
        },
      ])

      setStatus('speaking')
      await speechPlayerRef.current?.speak(reply.text)
    } catch (error) {
      if (isCallEndedRef.current) return
      setErrorMessage(error instanceof Error ? error.message : 'The attack could not be sent')
    } finally {
      if (!isCallEndedRef.current) {
        microphoneRef.current?.setPaused(isMutedRef.current)
        setStatus('listening')
      }
    }
  }, [])

  const startCall = useCallback(async () => {
    if (status !== 'idle' && status !== 'error') return

    isCallEndedRef.current = false
    setErrorMessage(null)
    setStatus('connecting')

    // Created inside the tap that starts the call: iOS Safari only lets an
    // AudioContext leave `suspended` from within a user gesture.
    const audioContext = new AudioContext({ latencyHint: 'interactive' })
    audioContextRef.current = audioContext
    void audioContext.resume()

    const speechPlayer = new SentinelSpeechPlayer(audioContext)
    speechPlayerRef.current = speechPlayer

    const socket = new SpeechToTextSocket({
      onSpeechStarted: () => {
        speechPlayerRef.current?.stop()
        setStatus('user-speaking')
      },
      onSpeechStopped: () => setStatus('transcribing'),
      onPartialTranscript: text => {
        setTurns(previous => {
          const withoutPartial = previous.filter(turn => turn.id !== PARTIAL_TURN_ID)
          return [
            ...withoutPartial,
            { id: PARTIAL_TURN_ID, speaker: 'attacker', text, isPartial: true },
          ]
        })
      },
      onFinalTranscript: text => {
        setTurns(previous => {
          const withoutPartial = previous.filter(turn => turn.id !== PARTIAL_TURN_ID)
          if (!text) return withoutPartial
          return [...withoutPartial, { id: `attacker-${Date.now()}`, speaker: 'attacker', text }]
        })
        // Silence or an unintelligible turn: go back to listening, don't spend
        // an attack on it.
        if (!text) setStatus('listening')
        else void answerSpokenAttack(text)
      },
      onError: error => setErrorMessage(error.message),
      onClosed: () => {
        if (isCallEndedRef.current) return
        endCall()
        setErrorMessage('The voice connection dropped')
        setStatus('error')
      },
    })
    socketRef.current = socket

    try {
      await socket.connect(SPEECH_TO_SPEECH_SESSION_URL)

      const microphone = new MicrophoneCapture({
        audioContext,
        onPcmChunk: chunk => socket.sendAudioChunk(chunk),
      })
      await microphone.start()
      microphoneRef.current = microphone

      orbLevelWriterRef.current?.setAnalysers({
        microphone: microphone.analyser,
        speech: speechPlayer.analyser,
      })
      orbLevelWriterRef.current?.start()

      setStatus('listening')
    } catch (error) {
      // Release everything the failed attempt did manage to open, so tapping
      // the orb again starts from a clean slate rather than leaking a context.
      endCall()
      setErrorMessage(describeVoiceError(error))
      setStatus('error')
    }
  }, [status, answerSpokenAttack, endCall])

  const toggleMute = useCallback(() => {
    setIsMuted(previous => {
      const nextMuted = !previous
      microphoneRef.current?.setPaused(nextMuted)
      return nextMuted
    })
  }, [])

  /** Cut the sentinel off mid-sentence and listen again. */
  const interruptSentinel = useCallback(() => {
    speechPlayerRef.current?.stop()
  }, [])

  /**
   * Ref callback for the orb element. The level writer paints CSS custom
   * properties straight onto it every frame, bypassing React entirely.
   */
  const attachOrbElement = useCallback((element: HTMLElement | null) => {
    if (!element) {
      orbLevelWriterRef.current?.stop()
      orbLevelWriterRef.current = null
      return
    }
    orbLevelWriterRef.current = new VoiceOrbLevelWriter(element, VOICE_ANALYSER_FFT_SIZE / 2)
  }, [])

  useEffect(() => endCall, [endCall])

  return {
    status,
    turns,
    errorMessage,
    isMuted,
    startCall,
    endCall,
    toggleMute,
    interruptSentinel,
    attachOrbElement,
  }
}
