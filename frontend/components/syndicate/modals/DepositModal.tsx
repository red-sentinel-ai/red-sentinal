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
  loading: boolean
  onSubmit: () => void
}

export function DepositModal({
  open,
  onClose,
  inputValue,
  setInputValue,
  tokenSymbol,
  loading,
  onSubmit,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deposit Principal</DialogTitle>
          <DialogDescription>
            Deposit {tokenSymbol} to receive syndicate shares.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <AmountInput
            value={inputValue}
            onChange={setInputValue}
            placeholder={`Amount (${tokenSymbol})`}
          />
          <ActionSubmitButton onClick={onSubmit} loading={loading} disabled={!inputValue}>
            Deposit
          </ActionSubmitButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}
