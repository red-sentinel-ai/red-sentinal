'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ListChecks, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Agent } from '@/types/agents'
import { generateAvatarUrl } from '@/lib/utils'

interface SuccessCriteriaPanelProps {
  agent: Agent
  isOpen: boolean
  onClose: () => void
  /**
   * Desktop: render as an inline page section beside the chat (GraySwan-style),
   * with the feed shrinking to make room — no backdrop, chat stays interactive.
   * Mobile: fall back to an overlay drawer, the section can't fit beside the feed.
   */
  inline?: boolean
}

type PanelView = 'criteria' | 'instructions'

function PanelSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="industrial-header text-[11px] font-semibold tracking-[0.08em] text-[var(--color-text-muted)]">
        {label}
      </div>
      {children}
    </div>
  )
}

function PanelHeader({
  view,
  agentName,
  onBack,
  onClose,
}: {
  view: PanelView
  agentName: string | null
  onBack: () => void
  onClose: () => void
}) {
  const isInstructions = view === 'instructions'
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border-strong)] px-6 py-4">
      <div className="flex items-center gap-2">
        {isInstructions ? (
          <button
            onClick={onBack}
            aria-label="Back to success criteria"
            className="border border-[var(--color-border-strong)] p-1.5 text-[var(--color-text-muted)] transition-colors hover:border-white hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        ) : (
          <ListChecks className="text-accent h-4 w-4" />
        )}
        <div>
          <h2 className="industrial-header text-sm font-semibold tracking-[0.08em] text-white">
            {isInstructions ? 'SENTINEL_INSTRUCTIONS' : 'SUCCESS_CRITERIA'}
          </h2>
          <p className="industrial-header text-[10px] tracking-[0.06em] text-[var(--color-text-muted)]">
            {isInstructions ? (agentName ?? '') : 'TARGET_SENTINEL'}
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        aria-label="Close panel"
        className="border border-[var(--color-border-strong)] p-1.5 text-[var(--color-text-muted)] transition-colors hover:border-white hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

/**
 * GraySwan-style brief detail: what the attacker is trying to achieve and how
 * a win is determined. Criteria are derived from the attack mechanics (jury
 * verdict, bounty drain, per-attempt fee) since agents only store attack_goal.
 * READ_ALL swaps the section to the full sentinel instructions with a back
 * button — no modal, no stacked drawer.
 */
export function SuccessCriteriaPanel({
  agent,
  isOpen,
  onClose,
  inline = false,
}: SuccessCriteriaPanelProps) {
  const instructionsRef = useRef<HTMLParagraphElement>(null)
  const [shouldTruncate, setShouldTruncate] = useState(false)
  const [view, setView] = useState<PanelView>('criteria')

  useEffect(() => {
    if (!isOpen) {
      setView('criteria')
      return
    }
    if (instructionsRef.current) {
      const lineHeight = parseFloat(getComputedStyle(instructionsRef.current).lineHeight)
      const maxHeightForFourLines = lineHeight * 4
      setShouldTruncate(instructionsRef.current.scrollHeight > maxHeightForFourLines)
    }
  }, [isOpen, agent.prompt])

  const objective = agent.attack_goal?.trim()
  const criteria = [
    `Your prompt has to push ${agent.agent_name ?? 'the sentinel'} into violating the objective above — that is the breach.`,
    'Every round is scored by the on-chain jury: the verdict lands with the sentinel response, visible to everyone in the feed.',
    'A confirmed breach drains the active bounty straight to your wallet and ends the challenge.',
    'Failed attempts still burn the attack fee, so read the instructions and craft carefully.',
  ]

  const criteriaBody = (
    <div className="space-y-8 p-6">
      {/* Sentinel identity */}
      <div className="border-hairline flex items-center gap-3 bg-[var(--color-bg-elevated)] p-4">
        <div className="h-10 w-10 shrink-0 overflow-hidden border border-[var(--color-border-strong)]">
          <Image
            src={agent.agent_image || generateAvatarUrl(agent.agent_id)}
            width={40}
            height={40}
            alt={agent.agent_name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="industrial-header truncate text-sm text-white">{agent.agent_name}</p>
          <p className="industrial-header text-[10px] tracking-[0.06em] text-[var(--color-text-muted)]">
            TARGET_SENTINEL
          </p>
        </div>
      </div>

      {/* Objective */}
      <PanelSection label="ATTACK_OBJECTIVE">
        <div className="border-hairline bg-[var(--color-bg-elevated)] p-4">
          <p className="font-mono text-[14px] leading-relaxed text-white">
            {objective ||
              `Make ${agent.agent_name ?? 'this sentinel'} violate its standing instructions.`}
          </p>
        </div>
      </PanelSection>

      {/* Criteria */}
      <PanelSection label="CRITERIA">
        <ul className="space-y-3">
          {criteria.map((line, i) => (
            <li key={i} className="border-hairline flex gap-3 bg-[var(--color-bg-elevated)] p-4">
              <span className="industrial-header text-accent mt-0.5 shrink-0 text-[11px] font-bold tracking-[0.06em]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="font-mono text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
                {line}
              </p>
            </li>
          ))}
        </ul>
      </PanelSection>

      {/* Sentinel instructions (truncated — READ_ALL swaps the section view) */}
      <PanelSection label="SENTINEL_INSTRUCTIONS">
        <div className="border-hairline bg-[var(--color-bg-elevated)] p-4">
          <p
            ref={instructionsRef}
            className="line-clamp-4 whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-[var(--color-text-muted)]"
          >
            {agent.prompt}
          </p>
          {shouldTruncate && (
            <div className="mt-3">
              <button
                onClick={() => setView('instructions')}
                className="industrial-header border-b border-white text-[10px] tracking-[0.06em] text-white transition-opacity hover:opacity-70"
              >
                READ_ALL
              </button>
            </div>
          )}
        </div>
      </PanelSection>
    </div>
  )

  const instructionsBody = (
    <div className="p-6">
      <div className="border-hairline bg-[var(--color-bg-elevated)] p-4">
        <p className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
          {agent.prompt}
        </p>
      </div>
    </div>
  )

  const panelContent = (
    <>
      <PanelHeader
        view={view}
        agentName={agent.agent_name}
        onBack={() => setView('criteria')}
        onClose={onClose}
      />
      <div className="ios-scroll terminal-scrollbar min-h-0 flex-1 overflow-y-auto">
        {view === 'criteria' ? criteriaBody : instructionsBody}
      </div>
    </>
  )

  // Desktop: inline page section — the parent ResizablePanelGroup owns the
  // width and provides the draggable divider, so this is pure content.
  if (inline) {
    return (
      <div
        className="flex h-full w-full flex-col bg-[var(--color-bg-base)]"
        role="complementary"
        aria-label="Success criteria"
      >
        {panelContent}
      </div>
    )
  }

  // Mobile: overlay drawer — the viewport is too narrow for a side-by-side section.
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/80"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="ios-scroll terminal-scrollbar fixed bottom-0 right-0 top-0 z-50 flex w-[480px] max-w-[92vw] flex-col overflow-y-auto border-l border-[var(--color-border-strong)] bg-[var(--color-bg-base)] shadow-2xl"
            role="dialog"
            aria-label="Success criteria"
          >
            {panelContent}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
