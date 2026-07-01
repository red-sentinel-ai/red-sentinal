'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, Mic, Radio } from 'lucide-react'
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

interface VoiceRoomSessionProps {
  authToken: string
  userName: string
  title: string
  onLeave: () => void
}

function describeJoinError(error: unknown): string {
  const name = (error as { name?: string })?.name
  const code = (error as { code?: number })?.code

  if (code === 3002 || name === 'DeviceNotAvailable') {
    return 'No microphone found. Connect a mic (and close other apps using it), then try again.'
  }
  if (name === 'NotAllowedError' || code === 3001) {
    return 'Microphone access is blocked. Allow it in your browser settings, then try again.'
  }
  return error instanceof Error ? error.message : 'Failed to join the voice room'
}

export function VoiceRoomSession({ authToken, userName, title, onLeave }: VoiceRoomSessionProps) {
  const hmsActions = useHMSActions()
  const isConnected = useHMSStore(selectIsConnectedToRoom)
  const roomState = useHMSStore(selectRoomState)
  const peers = useHMSStore(selectPeers)
  const dominantSpeaker = useHMSStore(selectDominantSpeaker)

  const isConnecting = roomState === HMSRoomState.Connecting
  const [joinError, setJoinError] = useState<string>()

  const { allDevices } = useDevices()
  const microphoneCount = allDevices.audioInput?.length ?? 0
  const isAudioEnabled = useHMSStore(selectIsLocalAudioEnabled)
  const previousMicrophoneCount = useRef(microphoneCount)

  const errorNotification = useHMSNotifications(HMSNotificationTypes.ERROR)
  useEffect(() => {
    if (errorNotification?.data) {
      setJoinError(describeJoinError(errorNotification.data))
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
    if (isAudioEnabled) setJoinError(undefined)
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
    setJoinError(undefined)
    try {
      await hmsActions.join({
        authToken,
        userName: userName.toLowerCase(),
        settings: { isAudioMuted: false, isVideoMuted: true },
      })
    } catch (error) {
      setJoinError(describeJoinError(error))
    }
  }

  const handleLeave = async () => {
    await hmsActions.leave()
    onLeave()
  }

  if (!isConnected) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--color-border-strong)]">
          <Mic className="h-7 w-7 text-[var(--color-text-muted)]" />
        </div>
        <div className="space-y-1">
          <p className="industrial-header text-[11px] tracking-widest text-white">{title}</p>
          <p className="font-mono text-[11px] text-[var(--color-text-muted)]">
            Your microphone will be enabled when you join.
          </p>
        </div>
        <button
          type="button"
          onClick={handleJoin}
          disabled={isConnecting}
          className="button-ghost-terminal flex items-center gap-2 px-6 py-3 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isConnecting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>CONNECTING</span>
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              <span>JOIN VOICE ROOM</span>
            </>
          )}
        </button>

        {joinError && (
          <div className="w-full max-w-xs text-left">
            <VoiceErrorNotice message={joinError} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-[var(--color-border-strong)] px-4">
        <span className="industrial-header truncate text-[11px] tracking-widest text-white">
          {title}
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Radio className="h-3 w-3 animate-pulse text-[var(--color-success)]" />
            <span className="industrial-header text-[9px] text-[var(--color-success)]">LIVE</span>
          </div>
          <span className="industrial-header text-[9px] text-[var(--color-text-muted)]">
            {peers.length} IN ROOM
          </span>
        </div>
      </div>

      {joinError && (
        <div className="shrink-0 px-4 pt-3">
          <VoiceErrorNotice message={joinError} />
        </div>
      )}

      <div className="terminal-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
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

      <VoiceControls onLeave={handleLeave} />
    </div>
  )
}
