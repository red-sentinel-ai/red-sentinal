'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
import { motion } from 'framer-motion'
import { Dialog } from './Dialog'
import { ConsumePromptApiResponse } from '@/types'
import { SUI_TESTNET_BASE_URL } from '@/constants'

type AttackStatusModalProps = {
  apiResponse: ConsumePromptApiResponse
  showResultModal: boolean
  setShowResultModal: (show: boolean) => void
  txnHash: string
}

export const AttackStatusModal = ({
  apiResponse,
  showResultModal,
  setShowResultModal,
  txnHash,
}: AttackStatusModalProps) => {
  const success = apiResponse?.response.data.success
  const originalScore = apiResponse?.response.data.score || 0
  const score = success ? 100 : originalScore

  return (
    <Dialog
      open={showResultModal && !!apiResponse}
      onClose={() => setShowResultModal(false)}
      className="max-w-xl border-gray-200 bg-white p-0"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl w-full relative"
      >
        <button
          onClick={() => setShowResultModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center p-8">
          <h2 className="text-3xl font-bold mb-3">
            {success ? (
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Attack Successful! 🎉
              </span>
            ) : (
              <span className="bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
                Attack Failed
              </span>
            )}
          </h2>
          <p className="text-gray-600 mb-6">
            {success
              ? "Your prompt successfully breached the Sentinel's defenses!"
              : 'The Sentinel held strong against your attack.'}
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-left max-h-48 overflow-auto">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Explanation:</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {apiResponse?.response.data.explanation}
            </p>
          </div>

          <div className="border border-gray-200 rounded-xl p-4 mb-6 text-left">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Attack Score:</h3>
            <div className="flex items-center gap-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full"
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className="font-bold text-black text-lg">{score}/100</span>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-4 mb-8 text-left">
            <p className="text-sm text-gray-500 mb-2">Transaction Block:</p>
            <Link
              href={`${SUI_TESTNET_BASE_URL}/${txnHash}`}
              className="text-xs font-mono break-all text-blue-600 hover:underline transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {txnHash}
            </Link>
          </div>

          <button
            onClick={() => setShowResultModal(false)}
            className="w-full btn btn-outline"
          >
            Close
          </button>
        </div>
      </motion.div>
    </Dialog>
  )
}
