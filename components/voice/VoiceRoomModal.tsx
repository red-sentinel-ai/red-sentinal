'use client'

import { Loader2, Mic, Wallet } from 'lucide-react'
import { HMSRoomProvider } from '@100mslive/react-sdk'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { VoiceRoomSession } from './VoiceRoomSession'
import { VoiceStatusMessage } from './VoiceStatusMessage'

interface VoiceRoomModalProps {
  open: boolean
  onClose: () => void
  title: string
  authToken?: string
  isTokenLoading: boolean
  isTokenError: boolean
  canJoin: boolean
  permissionHint: string
  connectedAddress?: string
  onRequestConnect?: () => void
}

export function VoiceRoomModal({
  open,
  onClose,
  title,
  authToken,
  isTokenLoading,
  isTokenError,
  canJoin,
  permissionHint,
  connectedAddress,
  onRequestConnect,
}: VoiceRoomModalProps) {
  const renderBody = () => {
    if (!connectedAddress) {
      return (
        <VoiceStatusMessage icon={<Wallet className="h-6 w-6 text-[var(--color-text-muted)]" />}>
          <p className="font-mono text-[11px] text-[var(--color-text-muted)]">
            Connect your wallet to join the voice room.
          </p>
          {onRequestConnect && (
            <button
              type="button"
              onClick={onRequestConnect}
              className="button-ghost-terminal mt-4 px-6 py-3"
            >
              CONNECT WALLET
            </button>
          )}
        </VoiceStatusMessage>
      )
    }

    if (!canJoin) {
      return (
        <VoiceStatusMessage icon={<Mic className="h-6 w-6 text-[var(--color-text-muted)]" />}>
          <p className="font-mono text-[11px] text-[var(--color-text-muted)]">{permissionHint}</p>
        </VoiceStatusMessage>
      )
    }

    if (isTokenLoading) {
      return (
        <VoiceStatusMessage icon={<Loader2 className="h-6 w-6 animate-spin text-[var(--color-text-muted)]" />}>
          <p className="font-mono text-[11px] text-[var(--color-text-muted)]">
            Preparing voice room…
          </p>
        </VoiceStatusMessage>
      )
    }

    if (isTokenError || !authToken) {
      return (
        <VoiceStatusMessage icon={<Mic className="h-6 w-6 text-[var(--color-danger)]" />}>
          <p className="font-mono text-[11px] text-[var(--color-text-muted)]">
            Voice chat is unavailable right now. Please try again later.
          </p>
        </VoiceStatusMessage>
      )
    }

    return (
      <HMSRoomProvider>
        <VoiceRoomSession
          authToken={authToken}
          userName={connectedAddress}
          title={title}
          onLeave={onClose}
        />
      </HMSRoomProvider>
    )
  }

  return (
    <Sheet
      open={open}
      onOpenChange={isOpen => {
        if (!isOpen) onClose()
      }}
    >
      <SheetContent
        side="bottom"
        className="mx-auto flex h-[80dvh] w-full max-w-md flex-col gap-0 overflow-hidden rounded-t-2xl border-t border-[var(--color-border-strong)] p-0 pb-safe"
      >
        {/* Drag handle — native bottom-sheet affordance */}
        <div className="flex shrink-0 justify-center pt-2.5">
          <div className="h-1 w-10 rounded-full bg-[var(--color-border-strong)]" />
        </div>
        <SheetTitle className="sr-only">{title} voice room</SheetTitle>
        {renderBody()}
      </SheetContent>
    </Sheet>
  )
}
