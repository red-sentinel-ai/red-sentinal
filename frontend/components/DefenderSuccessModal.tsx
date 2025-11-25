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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md w-full relative shadow-2xl text-black"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-[#558EB4] to-[#1388D5] rounded-full flex items-center justify-center shadow-glow-blue">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-black mb-3">Agent Deployed!</h2>
          <p className="text-gray-600 mb-6">
            Your agent &quot;<span className="font-semibold text-black">{agentName}</span>&quot; has
            been successfully deployed to the blockchain.
          </p>

          <div className="bg-gray-50 border border-blue-200 rounded-xl p-4 mb-8 text-left">
            <p className="text-sm text-gray-500 mb-2">Transaction Block:</p>
            <Link
              href={`${SUI_TESTNET_BASE_URL}/${transactionDigest}`}
              className="text-xs font-mono break-all text-blue-600 hover:underline transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {transactionDigest}
            </Link>
          </div>

          <div className="space-y-4">
            <button
              onClick={onAddFunds}
              className="w-full btn bg-gradient-to-r from-[#558EB4] to-[#1388D5] hover:from-[#1388D5] hover:to-[#558EB4] text-white rounded-full py-3 font-bold transition-all duration-300 shadow-lg hover:shadow-glow-blue"
            >
              Add Funds Now
            </button>
            <Link
              href={`/attack/${agentPath}`}
              className="w-full block"
            >
              <button className="w-full btn btn-outline">Skip for Now</button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
