'use client'

import { Loader2, Mic, Wallet } from 'lucide-react'
import { HMSRoomProvider } from '@100mslive/react-sdk'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
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
        <VoiceStatusMessage icon={<Wallet className="h-7 w-7 text-[var(--color-text-muted)]" />}>
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
        <VoiceStatusMessage icon={<Mic className="h-7 w-7 text-[var(--color-text-muted)]" />}>
          <p className="font-mono text-[11px] text-[var(--color-text-muted)]">{permissionHint}</p>
        </VoiceStatusMessage>
      )
    }

    if (isTokenLoading) {
      return (
        <VoiceStatusMessage icon={<Loader2 className="h-7 w-7 animate-spin text-[var(--color-text-muted)]" />}>
          <p className="font-mono text-[11px] text-[var(--color-text-muted)]">
            Preparing voice room…
          </p>
        </VoiceStatusMessage>
      )
    }

    if (isTokenError || !authToken) {
      return (
        <VoiceStatusMessage icon={<Mic className="h-7 w-7 text-[var(--color-danger)]" />}>
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
    <Dialog
      open={open}
      onOpenChange={isOpen => {
        if (!isOpen) onClose()
      }}
    >
      <DialogContent className="flex h-[520px] max-w-md flex-col overflow-hidden p-0">
        <DialogTitle className="sr-only">{title} voice room</DialogTitle>
        {renderBody()}
      </DialogContent>
    </Dialog>
  )
}

