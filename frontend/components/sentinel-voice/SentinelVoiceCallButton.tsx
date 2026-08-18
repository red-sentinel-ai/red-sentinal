'use client'

import { AudioLines } from 'lucide-react'

import { cn } from '@/lib/utils'

interface SentinelVoiceCallButtonProps {
  onClick: () => void
  disabled?: boolean
  className?: string
}

/** Opens the voice call. Lives next to the send button in every attack composer. */
export function SentinelVoiceCallButton({
  onClick,
  disabled,
  className,
}: SentinelVoiceCallButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title="Talk to this sentinel"
      aria-label="Talk to this sentinel"
      className={cn('chat-submit-button button-ghost-terminal', className)}
    >
      <span>TALK</span>
      <AudioLines className="h-3.5 w-3.5" />
    </button>
  )
}
