import { ArrowRight, ArrowLeft, Users, Eye, Terminal } from 'lucide-react'
import { SyndicateControlItem } from './SyndicateControlItem'
import type { SyndicateModalId } from '@/types/Syndicate'

interface Props {
  agentId: string | undefined
  whitelistEnabled: boolean | undefined
  isLocked: boolean | undefined
  openModal: (id: SyndicateModalId) => void
}

export function SyndicateOwnerControls({
  agentId,
  whitelistEnabled,
  isLocked,
  openModal,
}: Props) {
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
          disabled={!agentId}
        />
        <SyndicateControlItem
          title="Withdraw Funds from Sentinel"
          subtitle={isLocked ? 'Locked · 14-day window after funding' : 'Move liquidity to Idle Funds'}
          icon={<ArrowLeft className="h-5 w-5" />}
          onClick={() => openModal('withdrawSentinel')}
          disabled={!agentId}
        />
        <SyndicateControlItem
          title="Whitelist Operators"
          subtitle="Manage member permissions"
          icon={<Users className="h-5 w-5" />}
          onClick={() => openModal('whitelist')}
        />
        <SyndicateControlItem
          title="Change Syndicate Visibility"
          subtitle={`Current: ${whitelistEnabled ? 'PERMISSIONED' : 'PUBLIC'}`}
          icon={<Eye className="h-5 w-5" />}
          onClick={() => openModal('visibility')}
        />
      </div>
    </div>
  )
}
