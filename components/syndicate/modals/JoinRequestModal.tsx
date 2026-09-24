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
  syndicateName: string
  message: string
  setMessage: (v: string) => void
  loading: boolean
  onSubmit: () => void
}

export function JoinRequestModal({
  open,
  onClose,
  syndicateName,
  message,
  setMessage,
  loading,
  onSubmit,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request to Join {syndicateName}</DialogTitle>
          <DialogDescription>
            Send a join request to the syndicate owner. Add an optional message to
            introduce yourself.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={4}
            maxLength={280}
            placeholder="Tell the owner why you’d like to join (optional)"
            className="w-full resize-none border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-text-primary)] focus:outline-none"
          />
          <ActionSubmitButton onClick={onSubmit} loading={loading}>
            Send Request
          </ActionSubmitButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}
