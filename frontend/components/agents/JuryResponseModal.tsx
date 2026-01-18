'use client'

import Image from 'next/image'
import { X } from 'lucide-react'
import { Dialog } from '@/components/Dialog'

interface JuryResponseModalProps {
  isOpen: boolean
  onClose: () => void
  response: string
}

export function JuryResponseModal({ isOpen, onClose, response }: JuryResponseModalProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="z-[100] w-full max-w-[600px] overflow-hidden rounded-xl border border-[#9A9A9A] bg-white p-0"
    >
      <div className="relative w-full p-10">
        <div className="flex items-center justify-between pb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div>
                <Image src="/icons/court_house.png" width="20" height="20" alt="Court House" />
              </div>
              <h2 className="text-xl font-bold text-black">Jury Response</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-black" />
          </button>
        </div>

        <div className="flex items-center justify-center">
          <Image src="/img/july_table.png" width="400" height="282" alt="Jury Table" />
        </div>

        <div className="rounded-lg border border-[#9A9A9A] p-3 text-center shadow-sm">
          <p className="whitespace-pre-line text-sm">{response || 'No jury response provided.'}</p>
        </div>
      </div>
    </Dialog>
  )
}
