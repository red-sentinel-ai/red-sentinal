'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Swords, ChevronRight } from 'lucide-react'

import { AgentDetailsFull } from '@/hooks/agents/useAgentDetails'
import { cn } from '@/lib/utils'

interface SentinelIntroScreenProps {
  agent: AgentDetailsFull
  onStartAttack: () => void
}

function getChallengeText(attackGoal: string | null): string {
  if (!attackGoal) return 'Break my defenses and claim the prize.'
  return attackGoal
}

function HighlightedChallenge({ text }: { text: string }) {
  const parts = text.split(/\b(make me|say|accept|reveal|admit|agree|tell|confess)\b/gi)
  return (
    <>
      {parts.map((part, i) => {
        const isKeyword = /^(make me|say|accept|reveal|admit|agree|tell|confess)$/i.test(part)
        return isKeyword ? (
          <span key={i} className="font-bold text-[var(--color-gold-primary)]">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      })}
    </>
  )
}

export function SentinelIntroScreen({ agent, onStartAttack }: SentinelIntroScreenProps) {
  const challengeText = getChallengeText(agent.attack_goal)

  return (
    <motion.div
      className="relative flex min-h-[calc(100vh-64px)] flex-col items-center justify-center overflow-hidden bg-[var(--color-bg-base)] px-4 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[500px] rounded-full bg-[var(--color-gold-primary)]/[0.04] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col items-center text-center">
        {/* Agent avatar */}
        <motion.div
          className="relative mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
        >
          <div className="relative size-24 overflow-hidden rounded-2xl border-2 border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-elevated)] sm:size-28">
            {agent.agent_image ? (
              <Image
                src={agent.agent_image}
                alt={agent.agent_name ?? 'Sentinel'}
                fill
                className="object-cover"
                sizes="112px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-3xl font-bold text-[var(--color-text-muted)]">
                {agent.agent_name?.charAt(0).toUpperCase() ?? '?'}
              </div>
            )}
          </div>
          {agent.state === 'active' && (
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--color-bg-base)] bg-[var(--color-success)]">
              <span className="h-2 w-2 rounded-full bg-white" />
            </span>
          )}
        </motion.div>

        {/* Identity Section */}
        <motion.div
          className="mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="mb-2 text-2xl font-semibold tracking-tight text-[var(--color-text-primary)] sm:text-3xl">
            Hi, I&apos;m{' '}
            <motion.span
              className="inline-block text-[var(--color-gold-primary)]"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.06,
                    delayChildren: 0.4,
                  },
                },
              }}
            >
              {(agent.agent_name ?? 'Sentinel').split('').map((char, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  {char === ' ' ? ' ' : char}
                </motion.span>
              ))}
            </motion.span>
            .
          </h1>
        </motion.div>

        {/* Challenge Section */}
        <motion.div
          className="mb-8 w-full"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <div className="relative rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-5 shadow-[var(--shadow-card)] sm:p-6">
            <p className="text-base font-medium leading-relaxed text-[var(--color-text-primary)] sm:text-lg">
              I challenge you to{' '}
              <HighlightedChallenge text={challengeText} />
            </p>
          </div>
        </motion.div>

        {/* Reward Section */}
        <motion.div
          className="mb-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="flex flex-col items-center gap-2">
            <p className="text-base font-medium italic text-[var(--color-text-secondary)] sm:text-lg">
              If you win, you get all the money I have.
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.button
          onClick={onStartAttack}
          className={cn(
            'group relative flex items-center gap-3 overflow-hidden rounded-xl px-10 py-4 text-base font-semibold',
            'bg-[var(--color-gold-primary)] text-[var(--color-text-on-gold)]',
            'transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,56,79,0.3)]',
            'active:scale-[0.98]'
          )}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.5 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <Swords className="size-5" />
          <span>Start Attack</span>
          <ChevronRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
        </motion.button>

      </div>
    </motion.div>
  )
}
