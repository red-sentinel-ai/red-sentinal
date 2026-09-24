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
  formattedMaxRedeemable: string | null
  formattedIdle: string | null
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
  formattedMaxRedeemable,
  formattedIdle,
  loading,
  onSubmit,
}: Props) {
  const maxRedeemable = formattedMaxRedeemable ? parseFloat(formattedMaxRedeemable) : 0
  const requested = inputValue ? parseFloat(inputValue) : 0
  const exceedsMax = requested > maxRedeemable

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Redeem Shares</DialogTitle>
          <DialogDescription>
            Redeem your syndicate shares for {tokenSymbol}. Only capital sitting idle in the
            syndicate can be redeemed, funds locked in the active sentinel must be withdrawn back
            to the syndicate first.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="space-y-1 border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-3 text-xs">
            {formattedShares && (
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-muted)]">Your shares</span>
                <span className="font-medium text-[var(--color-text-primary)]">
                  {parseFloat(formattedShares).toFixed(4)}
                </span>
              </div>
            )}
            {formattedMaxRedeemable && (
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-muted)]">Available to redeem now</span>
                <span className="font-medium text-[var(--color-text-primary)]">
                  {parseFloat(formattedMaxRedeemable).toFixed(4)} shares
                </span>
              </div>
            )}
            {formattedIdle && (
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-muted)]">Idle syndicate funds</span>
                <span className="font-medium text-[var(--color-text-primary)]">
                  {formattedIdle} {tokenSymbol}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Shares to redeem"
              className="flex-1 border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-text-primary)] focus:outline-none"
            />
            {formattedMaxRedeemable && (
              <button
                type="button"
                onClick={() => setInputValue(formattedMaxRedeemable)}
                className="px-4 text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] transition-opacity hover:opacity-70"
              >
                Max
              </button>
            )}
          </div>

          {exceedsMax && (
            <p className="text-xs text-[var(--color-danger)]">
              Only {maxRedeemable.toFixed(4)} shares are redeemable right now, the rest of the
              value is locked in the sentinel.
            </p>
          )}

          <ActionSubmitButton
            onClick={onSubmit}
            loading={loading}
            disabled={!inputValue || exceedsMax}
          >
            Redeem
          </ActionSubmitButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}
