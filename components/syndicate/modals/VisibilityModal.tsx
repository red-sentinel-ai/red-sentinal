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
  whitelistEnabled: boolean | undefined
  loading: boolean
  onSubmit: () => void
}

export function VisibilityModal({
  open,
  onClose,
  whitelistEnabled,
  loading,
  onSubmit,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Syndicate Visibility</DialogTitle>
          <DialogDescription>
            {whitelistEnabled
              ? 'The syndicate is currently permissioned. Only whitelisted addresses can deposit.'
              : 'The syndicate is currently public. Anyone can deposit.'}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <ActionSubmitButton onClick={onSubmit} loading={loading}>
            {whitelistEnabled ? 'Make Public' : 'Make Permissioned'}
          </ActionSubmitButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}
