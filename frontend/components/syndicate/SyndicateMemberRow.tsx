'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Twitter } from 'lucide-react'
import { truncateAddress, formatTokenAmount } from '@/lib/utils'
import type { SyndicateMemberDetail } from '@/types/Syndicate'
import { SyndicateMemberActionsMenu } from './SyndicateMemberActionsMenu'

interface Props {
  member: SyndicateMemberDetail
  tokenSymbol: string
  tokenDecimals: number
}

function avatarFallback(member: SyndicateMemberDetail): string {
  if (member.username) return member.username.slice(0, 2).toUpperCase()
  return member.address.slice(2, 4).toUpperCase()
}

function formatJoinedDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatEquity(share: number): string {
  if (share > 0 && share < 0.01) return '<0.01%'
  return `${share.toFixed(2)}%`
}

export function SyndicateMemberRow({ member, tokenSymbol, tokenDecimals }: Props) {
  const displayName = member.username
    ? member.username.toUpperCase()
    : truncateAddress(member.address)
  const avatar = member.avatar_url ?? member.twitter_avatar ?? null
  // /u/[identifier] resolves usernames; EVM addresses (40-char) don't resolve
  // there, so we only link rows that actually have a username.
  const profileHref = member.username ? `/u/${member.username}` : null

  return (
    <tr className="group transition-colors hover:bg-white/[0.02]">
      <td className="py-4">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden bg-[var(--color-bg-elevated)]">
            {avatar ? (
              <Image
                src={avatar}
                alt={displayName}
                fill
                sizes="40px"
                className="object-cover grayscale brightness-90"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-bold text-[var(--color-text-muted)]">
                {avatarFallback(member)}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            {profileHref ? (
              <Link
                href={profileHref}
                className="font-mono text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-text-muted)] hover:underline"
              >
                {displayName}
              </Link>
            ) : (
              <span className="font-mono text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)]">
                {displayName}
              </span>
            )}
            {member.username && (
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                {truncateAddress(member.address)}
              </span>
            )}
            {member.twitter_username && (
              <a
                href={`https://x.com/${member.twitter_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 inline-flex w-fit items-center gap-1 text-[10px] text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]"
              >
                <Twitter className="h-3 w-3" />@{member.twitter_username}
              </a>
            )}
          </div>
        </div>
      </td>
      <td className="py-4 text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
        {member.designation}
      </td>
      <td className="py-4 text-right font-mono text-sm text-[var(--color-text-primary)]">
        {formatEquity(member.equity_share)}
      </td>
      <td className="py-4 text-right font-mono text-sm text-[var(--color-text-primary)]">
        {formatTokenAmount(member.net_deposited, tokenDecimals)}{' '}
        <span className="text-xs text-[var(--color-text-muted)]">{tokenSymbol}</span>
      </td>
      <td className="py-4 text-right font-mono text-sm text-[var(--color-text-primary)]">
        {formatTokenAmount(member.fees_claimed, tokenDecimals)}{' '}
        <span className="text-xs text-[var(--color-text-muted)]">{tokenSymbol}</span>
      </td>
      <td className="py-4 text-right text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
        {formatJoinedDate(member.first_deposit_at)}
      </td>
      <td className="py-4 text-right">
        <SyndicateMemberActionsMenu address={member.address} />
      </td>
    </tr>
  )
}
