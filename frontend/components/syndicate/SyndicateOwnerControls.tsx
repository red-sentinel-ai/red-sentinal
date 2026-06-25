import { ArrowRight, ArrowLeft, Users, Eye, Terminal } from 'lucide-react'
import { SyndicateControlItem } from './SyndicateControlItem'
import type { SyndicateModalId } from '@/types/Syndicate'

interface Props {
  agentId: string | undefined
  whitelistEnabled: boolean | undefined
  isLocked: boolean | undefined
  isOwner: boolean
  isMember: boolean
  openModal: (id: SyndicateModalId) => void
}

export function SyndicateOwnerControls({
  agentId,
  whitelistEnabled,
  isLocked,
  isOwner,
  isMember,
  openModal,
}: Props) {
  const chatHint = isMember ? ' Message them in the syndicate chat room to ask.' : ''
  const ownerOnlyTooltip = (action: string) =>
    isOwner ? undefined : `Only the syndicate owner can ${action}.${chatHint}`

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Terminal className="h-5 w-5 text-[var(--color-text-primary)]" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)]">
          Syndicate Owner Controls
        </h3>
        <span className="bg-[var(--color-text-muted)]/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
          Restricted
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <SyndicateControlItem
          title="Add Funds to Sentinel"
          subtitle="Syndicate Idle -> Sentinel Active"
          icon={<ArrowRight className="h-5 w-5" />}
          onClick={() => openModal('fundSentinel')}
          disabled={!agentId || !isOwner}
          tooltip={ownerOnlyTooltip('add funds to the sentinel bounty pool')}
        />
        <SyndicateControlItem
          title="Withdraw Funds from Sentinel"
          subtitle={isLocked ? 'Locked · 14-day window after funding' : 'Move liquidity to Idle Funds'}
          icon={<ArrowLeft className="h-5 w-5" />}
          onClick={() => openModal('withdrawSentinel')}
          disabled={!agentId || !isOwner}
          tooltip={ownerOnlyTooltip('withdraw funds from the sentinel back to the syndicate')}
        />
        <SyndicateControlItem
          title="Whitelist Operators"
          subtitle="Manage member permissions"
          icon={<Users className="h-5 w-5" />}
          onClick={() => openModal('whitelist')}
          disabled={!isOwner}
          tooltip={ownerOnlyTooltip('manage the operator whitelist')}
        />
        <SyndicateControlItem
          title="Change Syndicate Visibility"
          subtitle={`Current: ${whitelistEnabled ? 'PERMISSIONED' : 'PUBLIC'}`}
          icon={<Eye className="h-5 w-5" />}
          onClick={() => openModal('visibility')}
          disabled={!isOwner}
          tooltip={ownerOnlyTooltip("change the syndicate's visibility")}
        />
      </div>
    </div>
  )
}
