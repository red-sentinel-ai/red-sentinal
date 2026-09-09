'use client'

import { Gift, Sparkles, Coins } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui'

const STEPS = [
  {
    icon: Gift,
    title: 'Earn Spin Passes',
    description:
      'Complete social missions, defend or attack Sentinels, create content, or refer friends to earn Spin Passes. Each pass has a booster tier ranging from 1x to 1000x.',
    iconBg: 'bg-[var(--color-bg-subtle)]',
    iconColor: 'text-[var(--color-gold-primary)]',
  },
  {
    icon: Sparkles,
    title: 'Spin to Multiply',
    description:
      "Use your Spin Pass at the slot machine. Base range is 100-1,000 SENTINEL, multiplied by your pass's booster tier. A 25x Legendary Spin Pass? That's 2,500-25,000 SENTINEL.",
    iconBg: 'bg-[var(--color-bg-subtle)]',
    iconColor: 'text-[var(--color-gold-primary)]',
  },
  {
    icon: Coins,
    title: 'Collect Instantly',
    description:
      'SENTINEL tokens land in your wallet immediately after spinning. Share your spin on X for a bonus +100 SENTINEL.',
    iconBg: 'bg-[var(--color-bg-subtle)]',
    iconColor: 'text-[var(--color-gold-primary)]',
  },
]

export function ThreeStepFlow() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {STEPS.map((step, index) => {
        const Icon = step.icon

        return (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="h-full rounded-xl border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] transition-all duration-300 hover:border-[var(--color-border-default)]">
              <CardContent className="flex flex-col items-center p-4 text-center md:p-5">
                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${step.iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${step.iconColor}`} />
                </div>
                <h3 className="mb-1.5 text-sm font-medium text-[var(--color-text-primary)]">{step.title}</h3>
                <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
