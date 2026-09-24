import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { AmountInput } from './AmountInput'
import { ActionSubmitButton } from './ActionSubmitButton'

interface Props {
  open: boolean
  onClose: () => void
  inputValue: string
  setInputValue: (v: string) => void
  tokenSymbol: string
  formattedIdle: string | null
  loading: boolean
  onSubmit: () => void
}

export function FundSentinelModal({
  open,
  onClose,
  inputValue,
  setInputValue,
  tokenSymbol,
  formattedIdle,
  loading,
  onSubmit,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Funds to Sentinel</DialogTitle>
          <DialogDescription>
            Deploys idle syndicate capital into the active sentinel. Does not pull from your
            wallet, only funds already deposited into the syndicate are available.
            <span className="mt-1 block text-[var(--color-text-primary)]">
              Idle available: {formattedIdle ?? '0.00'} {tokenSymbol}
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <AmountInput
            value={inputValue}
            onChange={setInputValue}
            placeholder={`Amount (${tokenSymbol})`}
          />
          <ActionSubmitButton onClick={onSubmit} loading={loading} disabled={!inputValue}>
            Fund Sentinel
          </ActionSubmitButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}
