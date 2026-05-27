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
  tokenSymbol: string
  formattedPendingFees: string | null
  loading: boolean
  onSubmit: () => void
}

export function ClaimPersonalFeesModal({
  open,
  onClose,
  tokenSymbol,
  formattedPendingFees,
  loading,
  onSubmit,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Claim Personal Fees</DialogTitle>
          <DialogDescription>
            You have{' '}
            <span className="font-semibold text-[var(--color-text-primary)]">
              {formattedPendingFees ?? '0.00'} {tokenSymbol}
            </span>{' '}
            in pending fees to claim.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <ActionSubmitButton onClick={onSubmit} loading={loading}>
            Claim Fees
          </ActionSubmitButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}
