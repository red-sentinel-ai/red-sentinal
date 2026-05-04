import { getExplorerTxUrl } from '@/lib/explorer'
import { truncateAddress } from '@/lib/utils'
import { motion } from 'framer-motion'
import { CheckCircle, X } from 'lucide-react'
import Link from 'next/link'
import { SpinPassPromo } from '@/components/rewards/SpinPassPromo'

interface SuccessModalProps {
  open: boolean
  onClose: () => void
  agentName: string
  transactionDigest: string
  agentPath: string
  chain?: 'sui' | 'solana'
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  open,
  onClose,
  agentName,
  transactionDigest,
  agentPath,
  chain = 'sui',
}) => {
  if (!open) return null

  const txExplorerUrl = getExplorerTxUrl(transactionDigest, chain)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-[600px] rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-4 text-[var(--color-text-primary)] shadow-2xl sm:p-8"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[var(--color-text-faint)] transition-colors hover:text-[var(--color-text-primary)]"
          aria-label="Close modal"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="mx-auto max-w-sm text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-text-primary)]">
              <CheckCircle className="h-6 w-6 text-[var(--color-bg-surface)]" />
            </div>
          </div>

          <h2 className="mb-1 text-2xl font-bold text-[var(--color-text-primary)]">
            <span className="text-[var(--color-text-primary)]">{agentName}</span> is now live
          </h2>
          <p className="mb-6 text-sm text-[var(--color-text-muted)]">Your sentinel is deployed and open for attacks.</p>

          <div className="mb-6 flex items-center justify-between rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] px-4 py-3">
            <span className="text-sm text-[var(--color-text-muted)]">Transaction</span>
            <Link
              href={txExplorerUrl}
              className="font-mono text-sm text-[var(--color-text-primary)] transition-colors hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {truncateAddress(transactionDigest)}
            </Link>
          </div>

          <Link href={`/attack/${agentPath}`} className="block w-full">
            <button className="w-full rounded-xl bg-[var(--color-text-primary)] py-3 font-bold text-[var(--color-bg-surface)] transition-colors hover:bg-[var(--color-text-primary)]/80">
              View Sentinel
            </button>
          </Link>
        </div>

        <div className="mt-2 border-t border-[var(--color-border-subtle)]">
          <SpinPassPromo description="You've received a free spin pass for deploying your Sentinel!" buttonVariant="secondary" />
        </div>
      </motion.div>
    </div>
  )
}
