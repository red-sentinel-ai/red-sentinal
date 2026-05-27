'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MoreVertical, Users, Twitter, Wallet } from 'lucide-react'
import { truncateAddress, formatTokenAmount } from '@/lib/utils'

export interface SyndicateMemberDetail {
  address: string
  is_owner: boolean
  designation: string
  shares: string
  deposited: string
  redeemed: string
  net_deposited: string
  fees_claimed: string
  deposits_count: number
  redemptions_count: number
  equity_share: number
  first_deposit_at: string | null
  last_activity_at: string | null
  username: string | null
  avatar_url: string | null
  twitter_username: string | null
  twitter_avatar: string | null
  discord_username: string | null
  discord_avatar: string | null
}

interface SyndicateMembersTableProps {
  members: SyndicateMemberDetail[]
  tokenSymbol: string
  tokenDecimals: number
}

function avatarFallbackChars(member: SyndicateMemberDetail): string {
  if (member.username) return member.username.slice(0, 2).toUpperCase()
  return member.address.slice(2, 4).toUpperCase()
}

export function SyndicateMembersTable({
  members,
  tokenSymbol,
  tokenDecimals,
}: SyndicateMembersTableProps) {
  // Owner first, then by equity share descending.
  const sorted = [...members].sort((a, b) => {
    if (a.is_owner !== b.is_owner) return a.is_owner ? -1 : 1
    return b.equity_share - a.equity_share
  })

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between border-b border-[var(--color-border-strong)] pb-4">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-[var(--color-text-primary)]" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)]">
            Syndicate Members
          </h3>
        </div>
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
          {sorted.length} Operators Active
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs font-normal uppercase tracking-wider text-[var(--color-text-muted)]">
              <th className="pb-4 font-normal">Operator</th>
              <th className="pb-4 font-normal">Designation</th>
              <th className="pb-4 font-normal text-right">Equity Share</th>
              <th className="pb-4 font-normal text-right">Net Deposited</th>
              <th className="pb-4 font-normal text-right">Fees Claimed</th>
              <th className="pb-4 font-normal text-right">Joined</th>
              <th className="pb-4 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-default)]/30">
            {sorted.map(member => (
              <MemberRow
                key={member.address}
                member={member}
                tokenSymbol={tokenSymbol}
                tokenDecimals={tokenDecimals}
              />
            ))}
            {sorted.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center text-xs uppercase tracking-wider text-[var(--color-text-muted)]"
                >
                  No operators yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function MemberRow({
  member,
  tokenSymbol,
  tokenDecimals,
}: {
  member: SyndicateMemberDetail
  tokenSymbol: string
  tokenDecimals: number
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const displayName = member.username
    ? member.username.toUpperCase()
    : truncateAddress(member.address)
  const avatar = member.avatar_url ?? member.twitter_avatar ?? null
  const joinedLabel = member.first_deposit_at
    ? new Date(member.first_deposit_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—'

  const equityLabel =
    member.equity_share > 0 && member.equity_share < 0.01
      ? '<0.01%'
      : `${member.equity_share.toFixed(2)}%`

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
                {avatarFallbackChars(member)}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)]">
              {displayName}
            </span>
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
        {equityLabel}
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
        {joinedLabel}
      </td>
      <td className="relative py-4 text-right">
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]"
          aria-label="More actions"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
        {menuOpen && (
          <div
            className="absolute right-0 z-20 mt-2 min-w-[180px] border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] text-left shadow-lg"
            onMouseLeave={() => setMenuOpen(false)}
          >
            <a
              href={`https://bscscan.com/address/${member.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wider text-[var(--color-text-muted)] transition-colors hover:bg-white/[0.04] hover:text-[var(--color-text-primary)]"
            >
              <Wallet className="h-3.5 w-3.5" />
              View on Explorer
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(member.address)
                setMenuOpen(false)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs uppercase tracking-wider text-[var(--color-text-muted)] transition-colors hover:bg-white/[0.04] hover:text-[var(--color-text-primary)]"
            >
              Copy Address
            </button>
          </div>
        )}
      </td>
    </tr>
  )
}
