'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, Mic, Wifi } from 'lucide-react'
import {
  HMSNotificationTypes,
  HMSRoomState,
  selectDominantSpeaker,
  selectIsConnectedToRoom,
  selectIsLocalAudioEnabled,
  selectPeers,
  selectRoomState,
  useDevices,
  useHMSActions,
  useHMSNotifications,
  useHMSStore,
} from '@100mslive/react-sdk'
import { useUserProfiles } from '@/hooks/profile/useUserProfiles'
import { VoiceParticipantTile } from './VoiceParticipantTile'
import { VoiceControls } from './VoiceControls'
import { VoiceErrorNotice } from './VoiceErrorNotice'
import { describeVoiceError, isMicrophoneError } from '@/lib/voice-utils'

interface VoiceRoomSessionProps {
  authToken: string
  userName: string
  title: string
  onLeave: () => void
}

export function VoiceRoomSession({ authToken, userName, title, onLeave }: VoiceRoomSessionProps) {
  const hmsActions = useHMSActions()
  const isConnected = useHMSStore(selectIsConnectedToRoom)
  const roomState = useHMSStore(selectRoomState)
  const peers = useHMSStore(selectPeers)
  const dominantSpeaker = useHMSStore(selectDominantSpeaker)

  const isConnecting = roomState === HMSRoomState.Connecting
  const isReconnecting = roomState === HMSRoomState.Reconnecting
  const [voiceError, setVoiceError] = useState<string>()

  const { allDevices } = useDevices()
  const microphoneCount = allDevices.audioInput?.length ?? 0
  const isAudioEnabled = useHMSStore(selectIsLocalAudioEnabled)
  const previousMicrophoneCount = useRef(microphoneCount)

  const errorNotification = useHMSNotifications(HMSNotificationTypes.ERROR)
  useEffect(() => {
    const error = errorNotification?.data
    if (!error) return
    if (isMicrophoneError(error) || error.isTerminal) {
      setVoiceError(describeVoiceError(error))
    }
  }, [errorNotification])

  useEffect(() => {
    const hadNoMicrophone = previousMicrophoneCount.current === 0
    previousMicrophoneCount.current = microphoneCount
    if (hadNoMicrophone && microphoneCount > 0) {
      hmsActions.setLocalAudioEnabled(true).catch(() => {})
    }
  }, [microphoneCount, hmsActions])

  useEffect(() => {
    if (isAudioEnabled) setVoiceError(undefined)
  }, [isAudioEnabled])

  useEffect(() => {
    return () => {
      hmsActions.leave()
    }
  }, [hmsActions])

  const peerAddresses = useMemo(
    () => peers.map(peer => peer.name?.toLowerCase()).filter(Boolean),
    [peers]
  )

  const { data: profilesMap } = useUserProfiles(peerAddresses)

  const handleJoin = async () => {
    setVoiceError(undefined)
    try {
      await hmsActions.join({
        authToken,
        userName: userName.toLowerCase(),
        settings: { isAudioMuted: false, isVideoMuted: true },
      })
    } catch (error) {
      setVoiceError(describeVoiceError(error))
    }
  }

  const handleLeave = async () => {
    await hmsActions.leave()
    onLeave()
  }

  if (!isConnected) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-border-strong)]">
          <Mic className="h-6 w-6 text-[var(--color-text-muted)]" />
        </div>
        <div className="space-y-1">
          <p className="industrial-header text-[11px] font-semibold tracking-[0.06em] text-white">
            {title}
          </p>
          <p className="font-mono text-[11px] text-[var(--color-text-muted)]">
            Mic enables on join.
          </p>
        </div>
        <button
          type="button"
          onClick={handleJoin}
          disabled={isConnecting}
          className="flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--color-accent-fg)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isConnecting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>CONNECTING</span>
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              <span>JOIN</span>
            </>
          )}
        </button>

        {voiceError && (
          <div className="w-full max-w-xs text-left">
            <VoiceErrorNotice message={voiceError} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex h-10 shrink-0 items-center justify-between gap-3 border-b border-[var(--color-border-strong)] px-4">
        <span className="industrial-header truncate text-[11px] font-semibold tracking-[0.06em] text-white">
          {title}
        </span>
        <div className="flex shrink-0 items-center gap-2.5">
          {isReconnecting ? (
            <div className="flex items-center gap-1.5">
              <Wifi className="h-3 w-3 animate-pulse text-[var(--color-warning)]" />
              <span className="industrial-header text-[10px] font-semibold tracking-[0.06em] text-[var(--color-warning)]">
                RECONNECTING
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-success)]" />
              <span className="industrial-header text-[10px] font-semibold tracking-[0.06em] text-[var(--color-success)]">
                LIVE
              </span>
            </div>
          )}
          <span className="industrial-header text-[10px] font-semibold tracking-[0.06em] text-[var(--color-text-muted)]">
            {peers.length}
          </span>
        </div>
      </div>

      {voiceError && (
        <div className="shrink-0 px-4 pt-2.5">
          <VoiceErrorNotice message={voiceError} />
        </div>
      )}

      <div className="terminal-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
        <div className="flex flex-wrap items-start justify-center gap-4">
          {peers.map(peer => {
            const profile = profilesMap?.[peer.name?.toLowerCase()]
            return (
              <VoiceParticipantTile
                key={peer.id}
                peer={peer}
                username={profile?.username}
                avatarUrl={profile?.avatar_url}
                isSpeaking={dominantSpeaker?.id === peer.id}
              />
            )
          })}
        </div>
      </div>

      <VoiceControls onLeave={handleLeave} />
    </div>
  )
}
