import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ActionSubmitButton } from './ActionSubmitButton'

interface Props {
  open: boolean
  onClose: () => void
  loading: boolean
  tokenSymbol: string
  unclaimedCreatorFees: string | null
  onSubmit: () => void
}

export function CreatorRewardsModal({
  open,
  onClose,
  loading,
  tokenSymbol,
  unclaimedCreatorFees,
  onSubmit,
}: Props) {
  const nothingToPull = unclaimedCreatorFees != null && parseFloat(unclaimedCreatorFees) === 0

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Claim Creator Rewards</DialogTitle>
          <DialogDescription>
            Attacks pay creator fees that accrue inside the sentinel. This pulls them into the
            syndicate and distributes them across all shareholders, only then do they appear as
            each member&apos;s &quot;pending fees&quot; to claim. Anyone can call this.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          {unclaimedCreatorFees != null && (
            <div className="flex items-center justify-between border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-3 text-xs">
              <span className="text-[var(--color-text-muted)]">Available in sentinel</span>
              <span className="font-medium text-[var(--color-text-primary)]">
                {unclaimedCreatorFees} {tokenSymbol}
              </span>
            </div>
          )}
          <ActionSubmitButton onClick={onSubmit} loading={loading} disabled={nothingToPull}>
            {nothingToPull ? 'Nothing to claim' : 'Claim & Distribute'}
          </ActionSubmitButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}
