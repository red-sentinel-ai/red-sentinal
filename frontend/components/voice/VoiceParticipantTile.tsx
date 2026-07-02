'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Mic, MicOff } from 'lucide-react'
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
    <div className="flex items-center gap-3 border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-3 py-2.5">
      <div
        className={cn(
          'relative h-9 w-9 shrink-0 overflow-hidden rounded-full border',
          isSpeaking ? 'border-[var(--color-success)]' : 'border-[var(--color-border-strong)]'
        )}
      >
        <Image src={avatar} alt={displayName} fill sizes="36px" className="object-cover" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            href={`/u/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate font-mono text-xs text-white transition-colors hover:text-[var(--color-gold-primary)] hover:underline"
          >
            {displayName}
          </Link>
          {peer.isLocal && (
            <span className="industrial-header text-[8px] tracking-widest text-[var(--color-text-muted)]">
              YOU
            </span>
          )}
        </div>
      </div>

      {isMicOn ? (
        <Mic
          className={cn(
            'h-4 w-4 shrink-0',
            isSpeaking ? 'text-[var(--color-success)]' : 'text-[var(--color-text-muted)]'
          )}
        />
      ) : (
        <MicOff className="h-4 w-4 shrink-0 text-[var(--color-danger)]" />
      )}
    </div>
  )
}
