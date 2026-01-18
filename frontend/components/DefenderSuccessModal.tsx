import { SUI_TESTNET_BASE_URL } from '@/constants'
import { motion } from 'framer-motion'
import { CheckCircle, X } from 'lucide-react'
import Link from 'next/link'

interface SuccessModalProps {
  open: boolean
  onClose: () => void
  onAddFunds: () => void
  agentName: string
  transactionDigest: string
  agentPath: string
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  open,
  onClose,
  onAddFunds,
  agentName,
  transactionDigest,
  agentPath,
}) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-black shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-black"
          aria-label="Close modal"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="shadow-glow-blue flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-[#558EB4] to-[#1388D5]">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
          </div>

          <h2 className="mb-3 text-3xl font-bold text-black">Agent Deployed!</h2>
          <p className="mb-6 text-gray-600">
            Your agent &quot;<span className="font-semibold text-black">{agentName}</span>&quot; has
            been successfully deployed to the blockchain.
          </p>

          <div className="mb-8 rounded-xl border border-blue-200 bg-gray-50 p-4 text-left">
            <p className="mb-2 text-sm text-gray-500">Transaction Block:</p>
            <Link
              href={`${SUI_TESTNET_BASE_URL}/${transactionDigest}`}
              className="break-all font-mono text-xs text-blue-600 transition-colors hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {transactionDigest}
            </Link>
          </div>

          <div className="space-y-4">
            <button
              onClick={onAddFunds}
              className="btn hover:shadow-glow-blue w-full rounded-full bg-gradient-to-r from-[#558EB4] to-[#1388D5] py-3 font-bold text-white shadow-lg transition-all duration-300 hover:from-[#1388D5] hover:to-[#558EB4]"
            >
              Add Funds Now
            </button>
            <Link href={`/attack/${agentPath}`} className="block w-full">
              <button className="btn btn-outline w-full">Skip for Now</button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
