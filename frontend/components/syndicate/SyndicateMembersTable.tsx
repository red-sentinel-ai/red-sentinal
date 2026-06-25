'use client'

import { Users } from 'lucide-react'
import type { SyndicateMemberDetail } from '@/types/syndicate'
import { SyndicateMemberRow } from './SyndicateMemberRow'

interface Props {
  members: SyndicateMemberDetail[]
  tokenSymbol: string
  tokenDecimals: number
}

export function SyndicateMembersTable({ members, tokenSymbol, tokenDecimals }: Props) {
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
          <tbody className="divide-y divide-[var(--color-border-subtle)]">
            {sorted.map(member => (
              <SyndicateMemberRow
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
