'use client'

import { Mic, MicOff, PhoneOff, Loader2, AlertCircle, Radio } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from '@/lib/utils'
import type { VoiceStatus, VoiceTranscript } from '@/types/voice'

interface VoiceChatSurfaceProps {
  agentName: string
  status: VoiceStatus
  transcripts: VoiceTranscript[]
  error: Error | null
  isMuted: boolean
  isConnected: boolean
  /** Parent-controlled active state so hang-up feels instant. */
  isActive: boolean
  onStart: () => void
  onToggleMute: () => void
  onHangUp: () => void
}

const STATUS_LABELS: Record<VoiceStatus, string> = {
  idle: 'Ready',
  connecting: 'Connecting…',
  connected: 'Listening…',
  'user-speaking': 'You are speaking…',
  processing: 'Sentinel is thinking…',
  'ai-speaking': 'Sentinel is speaking…',
  closed: 'Disconnected',
  error: 'Connection error',
}

function VoiceOrb({ status }: { status: VoiceStatus }) {
  const isActive = status === 'ai-speaking' || status === 'user-speaking'
  const isAi = status === 'ai-speaking'

  return (
    <div className="relative flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
      {isActive && (
        <>
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-[var(--color-accent)]/30"
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.span
            className="absolute inset-[-10px] rounded-full border border-[var(--color-accent)]/20"
            animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.1, 0.4] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
          />
        </>
      )}
      <div
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-full border-2 transition-colors duration-300 sm:h-[72px] sm:w-[72px]',
          isAi
            ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
            : 'border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)]'
        )}
      >
        {isAi ? (
          <motion.div
            className="h-6 w-6 rounded-full bg-[var(--color-accent)] sm:h-7 sm:w-7"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          />
        ) : (
          <Mic className="h-5 w-5 text-[var(--color-text-muted)] sm:h-6 sm:w-6" />
        )}
      </div>
    </div>
  )
}

export function VoiceChatSurface({
  agentName,
  status,
  transcripts,
  error,
  isMuted,
  isActive,
  onStart,
  onToggleMute,
  onHangUp,
}: VoiceChatSurfaceProps) {
  const isConnecting = status === 'connecting'
  const isError = status === 'error' || !!error
  const showStart = !isActive

  return (
    <div className="flex h-full flex-col bg-[var(--color-bg-base)]">
      {/* Header / orb */}
      <div className="flex shrink-0 flex-col items-center gap-1.5 border-b border-[var(--color-border-strong)] px-4 py-2 sm:py-3">
        <VoiceOrb status={status} />
        <div className="text-center">
          <p className="industrial-header text-[10px] tracking-widest text-white sm:text-xs">
            {agentName.toUpperCase().replace(/\s+/g, '_')}
          </p>
          <p className="flex min-h-[1.1rem] items-center justify-center gap-1.5 font-mono text-[9px] text-[var(--color-text-muted)] sm:text-[10px]">
            {isConnecting && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
            {isError && <AlertCircle className="h-2.5 w-2.5 text-[var(--color-danger)]" />}
            {error?.message || STATUS_LABELS[status]}
          </p>
        </div>
      </div>

      {/* Transcripts */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2 terminal-scrollbar sm:px-4 sm:py-3">
        {showStart && transcripts.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <Radio className="h-5 w-5 text-[var(--color-text-muted)]/40" />
            <p className="font-mono text-[10px] text-[var(--color-text-muted)]/60">
              Tap start to begin a voice conversation.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {transcripts.map(t => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'max-w-[90%] border px-2.5 py-1.5 text-[11px] sm:max-w-[85%] sm:px-3 sm:py-2 sm:text-xs',
                  t.role === 'user'
                    ? 'ml-auto border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]'
                    : 'border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 text-[var(--color-text-primary)]'
                )}
              >
                <span className="mb-0.5 block text-[9px] uppercase tracking-wider text-[var(--color-text-muted)]">
                  {t.role === 'user' ? 'You' : agentName}
                  {t.partial && ' …'}
                </span>
                {t.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="flex shrink-0 items-center justify-center gap-3 border-t border-[var(--color-border-strong)] px-4 py-2 sm:py-3">
        {showStart ? (
          <button
            type="button"
            onClick={onStart}
            className="flex h-11 items-center gap-1.5 border border-[var(--color-accent)] bg-[var(--color-accent)]/10 px-4 text-[11px] text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)]/20 sm:px-5 sm:text-sm"
          >
            <Mic className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="industrial-header tracking-widest">START VOICE</span>
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onToggleMute}
              className={cn(
                'flex h-11 w-11 items-center justify-center border transition-colors sm:h-12 sm:w-12',
                isMuted
                  ? 'border-[var(--color-danger)] text-[var(--color-danger)]'
                  : 'border-[var(--color-border-strong)] text-[var(--color-text-muted)] hover:border-white hover:text-white'
              )}
              aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? <MicOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Mic className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>

            <button
              type="button"
              onClick={onHangUp}
              className="flex h-11 w-11 items-center justify-center border border-[var(--color-danger)] text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger)]/10 sm:h-12 sm:w-12"
              aria-label="End voice chat"
            >
              <PhoneOff className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
