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
  whitelistInput: string
  setWhitelistInput: (v: string) => void
  loading: boolean
  onSubmit: () => void
}

export function WhitelistModal({
  open,
  onClose,
  whitelistInput,
  setWhitelistInput,
  loading,
  onSubmit,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Whitelist Operators</DialogTitle>
          <DialogDescription>
            Add addresses to the syndicate whitelist (max 10 per transaction).
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <textarea
            value={whitelistInput}
            onChange={e => setWhitelistInput(e.target.value)}
            rows={4}
            placeholder="0x1234...&#10;0x5678..."
            className="w-full resize-none border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-text-primary)] focus:outline-none"
          />
          <ActionSubmitButton
            onClick={onSubmit}
            loading={loading}
            disabled={!whitelistInput.trim()}
          >
            Whitelist Addresses
          </ActionSubmitButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}
