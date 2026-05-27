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
  onSubmit: () => void
}

export function CreatorRewardsModal({ open, onClose, loading, onSubmit }: Props) {
  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Claim Creator Rewards</DialogTitle>
          <DialogDescription>
            Pull creator fees from the sentinel and distribute them to all shareholders. Anyone
            can call this function.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <ActionSubmitButton onClick={onSubmit} loading={loading}>
            Claim & Distribute
          </ActionSubmitButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}
