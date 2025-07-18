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
  agentObjectId: string
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  open,
  onClose,
  onAddFunds,
  agentName,
  transactionDigest,
  agentObjectId,
}) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="bg-[#12121266] backdrop-blur-xl border border-[#383838] rounded-2xl p-8 max-w-md w-full relative shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
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

          <h2 className="text-3xl font-bold text-white mb-3">Agent Deployed!</h2>
          <p className="text-gray-300 mb-6">
            Your agent &quot;<span className="font-semibold text-white">{agentName}</span>&quot; has
            been successfully deployed to the blockchain.
          </p>

          <div className="bg-[#1a1b1f] border border-[#558eb466] rounded-xl p-4 mb-8 text-left">
            <p className="text-sm text-gray-400 mb-2">Transaction Block:</p>
            <Link
              href={`${SUI_TESTNET_BASE_URL}/${transactionDigest}`}
              className="text-xs font-mono break-all text-[#558EB4] hover:underline transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {transactionDigest}
            </Link>
          </div>

          <div className="space-y-4">
            <button
              onClick={onAddFunds}
              className="w-full bg-gradient-to-r from-[#558EB4] to-[#1388D5] hover:from-[#1388D5] hover:to-[#558EB4] text-white rounded-full py-3 font-bold transition-all duration-300 shadow-lg hover:shadow-glow-blue"
            >
              Add Funds Now
            </button>
            <Link
              href={`/attack/${agentObjectId}`}
              className="w-full block"
            >
              <button className="w-full border border-[#383838] hover:border-[#424242] transition-colors font-medium bg-transparent text-gray-300 px-6 py-3 rounded-full hover:bg-[#1a1b1f]">
                Skip for Now
              </button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
