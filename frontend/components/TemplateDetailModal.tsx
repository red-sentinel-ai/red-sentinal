'use client'

import Link from 'next/link'
import { Eye, EyeOff, Crosshair, Gavel } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { CopyButton } from '@/components/ui/common/CopyButton'
import { SESSION_KEYS } from '@/constants'
import type { SentinelTemplate } from '@/types'

interface TemplateDetailModalProps {
  template: SentinelTemplate | null
  copiedField: string | null
  onCopy: (text: string, fieldId: string) => void
  onClose: () => void
}

export function TemplateDetailModal({
  template,
  copiedField,
  onCopy,
  onClose,
}: TemplateDetailModalProps) {
  return (
    <AnimatePresence>
      {template && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 rounded-t-2xl border-b border-[#5E5E5E] bg-white p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-semibold">{template.name}</h2>
                    <span
                      className={cn(
                        'shrink-0 rounded-full border px-3 py-1 text-xs font-medium',
                        template.sentinel_type === 'rag'
                          ? 'border-purple-200 bg-purple-100 text-purple-800'
                          : 'border-blue-200 bg-blue-100 text-blue-800'
                      )}
                    >
                      {template.sentinel_type}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="ml-4 text-gray-400 transition-colors hover:text-black"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="space-y-6 p-6">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-600" />
                    <h3 className="text-base font-semibold">Public Instructions</h3>
                  </div>
                  <CopyButton
                    text={template.public_instructions}
                    fieldId="public"
                    copiedField={copiedField}
                    onCopy={onCopy}
                  />
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800">
                    {template.public_instructions}
                  </pre>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4 text-orange-600" />
                    <h3 className="text-base font-semibold">Private Instructions</h3>
                  </div>
                  <CopyButton
                    text={template.hidden_instructions}
                    fieldId="hidden"
                    copiedField={copiedField}
                    onCopy={onCopy}
                  />
                </div>
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                  <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800">
                    {template.hidden_instructions}
                  </pre>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crosshair className="h-4 w-4 text-red-600" />
                    <h3 className="text-base font-semibold">Attack Goal</h3>
                  </div>
                  <CopyButton
                    text={template.attack_goal}
                    fieldId="attack"
                    copiedField={copiedField}
                    onCopy={onCopy}
                  />
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800">
                    {template.attack_goal}
                  </pre>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gavel className="h-4 w-4 text-purple-600" />
                    <h3 className="text-base font-semibold">Jury Prompt</h3>
                  </div>
                  <CopyButton
                    text={template.jury_prompt}
                    fieldId="jury"
                    copiedField={copiedField}
                    onCopy={onCopy}
                  />
                </div>
                <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                  <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800">
                    {template.jury_prompt}
                  </pre>
                </div>
              </div>

              <Link
                href="/defend"
                onClick={() => {
                  sessionStorage.setItem(SESSION_KEYS.SELECTED_TEMPLATE, JSON.stringify(template))
                }}
                className="block w-full rounded-xl bg-black py-4 text-center font-medium text-white transition-all hover:bg-black/90"
              >
                Use This Template
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
