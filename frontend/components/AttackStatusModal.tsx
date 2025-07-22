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
      className="max-w-[700px] border-none flex justify-center bg-transparent"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="bg-[#12121266] backdrop-blur-3xl bg-black border border-[#383838] rounded-2xl p-8 max-w-xl w-full relative shadow-2xl"
      >
        <button
          onClick={() => setShowResultModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-3">
            {success ? (
              <span className="bg-gradient-to-r from-[#558EB4] to-[#1388D5] bg-clip-text text-transparent">
                Attack Successful! 🎉
              </span>
            ) : (
              <span className="bg-gradient-to-r from-[#8F564E] to-[#E53922] bg-clip-text text-transparent">
                Attack Failed
              </span>
            )}
          </h2>
          <p className="text-gray-300 mb-6">
            {success
              ? "Your prompt successfully breached the Sentinel's defenses!"
              : 'The Sentinel held strong against your attack.'}
          </p>

          <div className="border border-[#558eb466] rounded-xl p-4 mb-6 text-left">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Explanation:</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {apiResponse?.response.data.explanation}
            </p>
          </div>

          <div className="border border-[#558eb466] rounded-xl p-4 mb-6 text-left">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Attack Score:</h3>
            <div className="flex items-center gap-4">
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-[#558EB4] to-[#1388D5] h-3 rounded-full"
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className="font-bold text-white text-lg">{score}/100</span>
            </div>
          </div>

          <div className="border border-[#558eb466] rounded-xl p-4 mb-8 text-left">
            <p className="text-sm text-gray-400 mb-2">Transaction Block:</p>
            <Link
              href={`${SUI_TESTNET_BASE_URL}/${txnHash}`}
              className="text-xs font-mono break-all text-[#558EB4] hover:underline transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {txnHash}
            </Link>
          </div>

          <button
            onClick={() => setShowResultModal(false)}
            className="w-full border border-[#383838] hover:border-[#424242] transition-colors font-medium bg-transparent text-gray-300 px-6 py-3 rounded-full hover:bg-[#1a1b1f]"
          >
            Close
          </button>
        </div>
      </motion.div>
    </Dialog>
  )
}
