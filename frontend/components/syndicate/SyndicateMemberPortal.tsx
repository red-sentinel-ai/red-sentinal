import { Wallet, LogOut, Coins, Award, User } from 'lucide-react'
import { SyndicateMemberActionCard } from './SyndicateMemberActionCard'
import type { SyndicateModalId } from '@/types/syndicate'

interface Props {
  shares: bigint | undefined
  pendingFees: bigint | undefined
  canDeposit: boolean
  agentId: string | undefined
  tokenSymbol: string
  unclaimedCreatorFees: string | null
  hasUnclaimedCreatorFees: boolean
  openModal: (id: SyndicateModalId) => void
}

export function SyndicateMemberPortal({
  shares,
  pendingFees,
  canDeposit,
  agentId,
  tokenSymbol,
  unclaimedCreatorFees,
  hasUnclaimedCreatorFees,
  openModal,
}: Props) {
  const isActive = shares !== undefined && shares > 0n
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <User className="h-5 w-5 text-[var(--color-text-primary)]" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)]">
          Member Portal
        </h3>
        {isActive ? (
          <span className="bg-[var(--color-text-primary)]/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-primary)]">
            Member Active
          </span>
        ) : (
          <span className="bg-[var(--color-text-muted)]/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
            Not a Member
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SyndicateMemberActionCard
          title="Deposit Principal"
          icon={<Wallet className="h-6 w-6" />}
          description="Add funds to the pool and mint shares."
          onClick={() => openModal('deposit')}
          disabled={!canDeposit}
        />
        <SyndicateMemberActionCard
          title="Redeem Shares"
          icon={<LogOut className="h-6 w-6" />}
          description="Burn shares for idle syndicate funds."
          onClick={() => openModal('redeem')}
          disabled={!shares || shares === 0n}
        />
        <SyndicateMemberActionCard
          title="Creator Rewards"
          icon={<Award className="h-6 w-6" />}
          description="Pull the sentinel's earned fees into the pool, then they show up as your pending fees."
          badge={
            hasUnclaimedCreatorFees && unclaimedCreatorFees
              ? `${unclaimedCreatorFees} ${tokenSymbol}`
              : undefined
          }
          onClick={() => openModal('creatorRewards')}
          disabled={!agentId || !hasUnclaimedCreatorFees}
        />
        <SyndicateMemberActionCard
          title="Claim Personal Fees"
          icon={<Coins className="h-6 w-6" />}
          description="Withdraw your distributed share of pulled fees."
          onClick={() => openModal('claimFees')}
          disabled={!pendingFees || pendingFees === 0n}
        />
      </div>
    </div>
  )
}
