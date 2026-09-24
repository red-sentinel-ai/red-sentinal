import { useEffect, useState } from 'react'
import { Lock, Unlock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { formatDuration } from '@/lib/utils'
import { AmountInput } from './AmountInput'
import { ActionSubmitButton } from './ActionSubmitButton'

interface Props {
  open: boolean
  onClose: () => void
  inputValue: string
  setInputValue: (v: string) => void
  tokenSymbol: string
  unlockTimestamp: number | null
  loading: boolean
  onSubmit: () => void
}

export function WithdrawSentinelModal({
  open,
  onClose,
  inputValue,
  setInputValue,
  tokenSymbol,
  unlockTimestamp,
  loading,
  onSubmit,
}: Props) {
  // Tick once per second while open so the countdown stays live.
  const [remaining, setRemaining] = useState<number | null>(null)
  useEffect(() => {
    if (!open || unlockTimestamp === null) {
      setRemaining(null)
      return
    }
    const tick = () => setRemaining(Math.max(0, unlockTimestamp - Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [open, unlockTimestamp])

  const isLocked = remaining !== null && remaining > 0
  const d = formatDuration(remaining ?? 0)
  const unlockDate = unlockTimestamp ? new Date(unlockTimestamp) : null

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw from Sentinel</DialogTitle>
          <DialogDescription>
            Move liquidity from the active sentinel back to syndicate idle funds. Each time the
            sentinel is funded, withdrawals lock for 14 days while it defends; once the lock
            expires, attacks pause and you can withdraw. Funding again resumes attacks and resets
            the lock.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {isLocked ? (
            <div className="space-y-2 border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-4">
              <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                <Lock className="h-4 w-4 text-[var(--color-gold-primary)]" />
                <span className="text-sm font-medium">Withdrawal locked</span>
              </div>
              <p className="font-mono text-lg tabular-nums text-[var(--color-text-primary)]">
                {d.days}d {String(d.hours).padStart(2, '0')}h {String(d.minutes).padStart(2, '0')}m{' '}
                {String(d.seconds).padStart(2, '0')}s
              </p>
              {unlockDate && (
                <p className="text-xs text-[var(--color-text-muted)]">
                  Unlocks {unlockDate.toLocaleString()}
                </p>
              )}
            </div>
          ) : (
            unlockTimestamp !== null && (
              <div className="flex items-center gap-2 border border-[var(--color-success-muted)] bg-[var(--color-success-muted)] p-3 text-[var(--color-success)]">
                <Unlock className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Withdrawal unlocked — attacks are paused until you fund again
                </span>
              </div>
            )
          )}

          <AmountInput
            value={inputValue}
            onChange={setInputValue}
            placeholder={`Amount (${tokenSymbol})`}
          />
          <ActionSubmitButton onClick={onSubmit} loading={loading} disabled={!inputValue || isLocked}>
            {isLocked ? 'Locked' : 'Withdraw'}
          </ActionSubmitButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}
