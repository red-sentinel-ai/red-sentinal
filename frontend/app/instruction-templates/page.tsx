'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Copy, Check, Eye, EyeOff, Crosshair, Gavel } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { SENTINEL_TEMPLATES, SentinelTemplate } from '@/constants/sentinel-templates'

export default function InstructionTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<SentinelTemplate | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = async (text: string, fieldId: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(fieldId)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const CopyButton = ({ text, fieldId }: { text: string; fieldId: string }) => (
    <button
      onClick={e => {
        e.stopPropagation()
        copyToClipboard(text, fieldId)
      }}
      className={cn(
        'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-all',
        copiedField === fieldId ? 'bg-green-100 text-green-800' : 'bg-gray-100 hover:bg-gray-200'
      )}
    >
      {copiedField === fieldId ? (
        <>
          <Check className="h-3 w-3" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          Copy
        </>
      )}
    </button>
  )

  return (
    <div className="min-h-body relative">
      <div className="vertical-line left-4"></div>
      <div className="vertical-line right-4"></div>

      <div className="container mx-auto max-w-[1400px] px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/defend"
            className="mb-4 inline-flex items-center gap-2 text-gray-500 transition-colors hover:text-black"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Back to Deploy</span>
          </Link>

          <h1 className="mb-3 text-2xl font-medium sm:text-4xl md:text-5xl">
            Sentinel Templates
          </h1>
          <p className="max-w-3xl text-base text-[#5E5E5E] sm:text-xl">
            Fun, pre-configured sentinel characters ready to deploy. Pick a template, customize it if
            you want, and deploy your defender with all fields auto-filled.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SENTINEL_TEMPLATES.map((template, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="cursor-pointer rounded-xl border border-[#5E5E5E] bg-white p-6 transition-all hover:border-black hover:shadow-md"
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="mb-3 flex items-start justify-between">
                <h3 className="text-lg font-semibold leading-tight">{template.name}</h3>
                <span
                  className={cn(
                    'ml-2 shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                    template.sentinel_type === 'rag'
                      ? 'border-purple-200 bg-purple-100 text-purple-800'
                      : 'border-blue-200 bg-blue-100 text-blue-800'
                  )}
                >
                  {template.sentinel_type}
                </span>
              </div>

              <p className="mb-4 line-clamp-3 text-sm text-[#5E5E5E]">
                {template.public_instructions}
              </p>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Crosshair className="h-3.5 w-3.5" />
                <span className="line-clamp-1">{template.attack_goal}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Template Detail Modal */}
        <AnimatePresence>
          {selectedTemplate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
              onClick={() => setSelectedTemplate(null)}
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
                        <h2 className="text-2xl font-semibold">{selectedTemplate.name}</h2>
                        <span
                          className={cn(
                            'shrink-0 rounded-full border px-3 py-1 text-xs font-medium',
                            selectedTemplate.sentinel_type === 'rag'
                              ? 'border-purple-200 bg-purple-100 text-purple-800'
                              : 'border-blue-200 bg-blue-100 text-blue-800'
                          )}
                        >
                          {selectedTemplate.sentinel_type}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedTemplate(null)}
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
                        text={selectedTemplate.public_instructions}
                        fieldId="public"
                      />
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800">
                        {selectedTemplate.public_instructions}
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
                        text={selectedTemplate.hidden_instructions}
                        fieldId="hidden"
                      />
                    </div>
                    <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                      <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800">
                        {selectedTemplate.hidden_instructions}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Crosshair className="h-4 w-4 text-red-600" />
                        <h3 className="text-base font-semibold">Attack Goal</h3>
                      </div>
                      <CopyButton text={selectedTemplate.attack_goal} fieldId="attack" />
                    </div>
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                      <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800">
                        {selectedTemplate.attack_goal}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gavel className="h-4 w-4 text-purple-600" />
                        <h3 className="text-base font-semibold">Jury Prompt</h3>
                      </div>
                      <CopyButton text={selectedTemplate.judge_prompt} fieldId="judge" />
                    </div>
                    <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                      <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800">
                        {selectedTemplate.judge_prompt}
                      </pre>
                    </div>
                  </div>

                  <Link
                    href="/defend"
                    onClick={() => {
                      sessionStorage.setItem(
                        'selectedTemplate',
                        JSON.stringify(selectedTemplate)
                      )
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
      </div>
    </div>
  )
}
