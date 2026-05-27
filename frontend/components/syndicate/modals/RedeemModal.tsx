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
  inputValue: string
  setInputValue: (v: string) => void
  tokenSymbol: string
  formattedShares: string | null
  loading: boolean
  onSubmit: () => void
}

export function RedeemModal({
  open,
  onClose,
  inputValue,
  setInputValue,
  tokenSymbol,
  formattedShares,
  loading,
  onSubmit,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Redeem Shares</DialogTitle>
          <DialogDescription>
            Redeem your syndicate shares for {tokenSymbol}.
            {formattedShares && (
              <span className="mt-1 block text-[var(--color-text-primary)]">
                Your shares: {parseFloat(formattedShares).toFixed(4)}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="flex gap-2">
            <input
              type="number"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Shares to redeem"
              className="flex-1 border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-text-primary)] focus:outline-none"
            />
            {formattedShares && (
              <button
                type="button"
                onClick={() => setInputValue(formattedShares)}
                className="px-4 text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] transition-opacity hover:opacity-70"
              >
                Max
              </button>
            )}
          </div>
          <ActionSubmitButton onClick={onSubmit} loading={loading} disabled={!inputValue}>
            Redeem
          </ActionSubmitButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}
