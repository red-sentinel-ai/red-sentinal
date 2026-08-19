'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MicOff } from 'lucide-react'
import { selectIsPeerAudioEnabled, useHMSStore, type HMSPeer } from '@100mslive/react-sdk'
import { cn, truncateAddress, generateAvatarUrl } from '@/lib/utils'

interface VoiceParticipantTileProps {
  peer: HMSPeer
  username?: string
  avatarUrl?: string | null
  isSpeaking: boolean
}

export function VoiceParticipantTile({
  peer,
  username,
  avatarUrl,
  isSpeaking,
}: VoiceParticipantTileProps) {
  const isMicOn = useHMSStore(selectIsPeerAudioEnabled(peer.id))
  const displayName = username || truncateAddress(peer.name || '')
  const avatar = avatarUrl || generateAvatarUrl(peer.name || displayName)

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={cn(
          'relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 transition-colors',
          isSpeaking
            ? 'border-[var(--color-success)] shadow-[0_0_0_3px_var(--color-success-muted)]'
            : 'border-[var(--color-border-strong)]'
        )}
      >
        <Image src={avatar} alt={displayName} fill sizes="56px" className="object-cover" />
        {!isMicOn && (
          <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border border-[var(--color-bg-elevated)] bg-[var(--color-danger)]">
            <MicOff className="h-2.5 w-2.5 text-white" />
          </span>
        )}
      </div>
      <Link
        href={`/u/${username}`}
        target="_blank"
        rel="noopener noreferrer"
        className="max-w-[64px] truncate font-mono text-[10px] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-accent)] hover:underline"
      >
        {peer.isLocal ? 'You' : displayName}
      </Link>
    </div>
  )
}
