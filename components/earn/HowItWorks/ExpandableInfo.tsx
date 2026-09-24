'use client'

import { useState } from 'react'
import { ChevronDown, Zap, Clock, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui'
import { DAILY_STREAK_BONUSES } from '@/lib/earn-utils'

const INFO_SECTIONS = [
  {
    id: 'streaks',
    icon: Zap,
    title: 'Daily Spin Streaks',
    description: 'Spinning on consecutive days earns bonus multipliers',
  },
  {
    id: 'lucky-hour',
    icon: Clock,
    title: 'Lucky Hour',
    description: '1–2 random hours per day with +20% bonus on all spins',
  },
  {
    id: 'first-spin',
    icon: Star,
    title: 'First Spin of Day',
    description: 'Guaranteed minimum 300 base instead of 100',
  },
]

export function ExpandableInfo() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id)
  }

  return (
    <div className="mt-10 space-y-3">
      {INFO_SECTIONS.map(section => {
        const Icon = section.icon
        const isExpanded = expandedSection === section.id

        return (
          <Card
            key={section.id}
            className="overflow-hidden rounded-xl border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] transition-all duration-300 hover:border-[var(--color-border-default)]"
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-[var(--color-bg-subtle)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-subtle)]">
                  <Icon className="h-5 w-5 text-[var(--color-text-primary)]" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-[var(--color-text-primary)]">{section.title}</h4>
                  <p className="font-body text-sm text-[var(--color-text-muted)]">{section.description}</p>
                </div>
              </div>
              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="h-5 w-5 text-[var(--color-text-muted)]" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CardContent className="border-t border-[var(--color-border-subtle)] p-4">
                    {section.id === 'streaks' && (
                      <div className="overflow-x-auto">
                        <table className="font-body w-full text-sm">
                          <thead>
                            <tr className="border-b border-[var(--color-border-subtle)]">
                              <th className="pb-2 pr-4 text-left font-medium text-[var(--color-text-secondary)]">
                                Consecutive Days
                              </th>
                              <th className="pb-2 text-left font-medium text-[var(--color-text-secondary)]">Bonus</th>
                            </tr>
                          </thead>
                          <tbody>
                            {DAILY_STREAK_BONUSES.map(({ days, bonus }) => (
                              <tr key={days} className="border-b border-[var(--color-border-subtle)] last:border-0">
                                <td className="py-2 pr-4 text-[var(--color-text-primary)]">Day {days}</td>
                                <td className="py-2 font-semibold text-[var(--color-text-primary)]">+{bonus}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <p className="font-body mt-3 text-xs text-[var(--color-text-muted)]">
                          Note: Streak resets if no spin for 48 hours
                        </p>
                      </div>
                    )}

                    {section.id === 'lucky-hour' && (
                      <div className="font-body space-y-2 text-sm text-[var(--color-text-secondary)]">
                        <p>
                          Lucky Hours are randomly selected each day. During these special hours,
                          all spins receive a <strong className="text-[var(--color-text-primary)]">+20% bonus</strong>.
                        </p>
                        <p>
                          Lucky Hours are announced in our{' '}
                          <a
                            href="https://t.me/suisentinel"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--color-gold-primary)] underline hover:text-[var(--color-gold-light)]"
                          >
                            Telegram
                          </a>
                          .
                        </p>
                      </div>
                    )}

                    {section.id === 'first-spin' && (
                      <div className="font-body text-sm text-[var(--color-text-secondary)]">
                        <p>
                          Your first spin of each day is guaranteed a{' '}
                          <strong className="text-[var(--color-text-primary)]">minimum base of 300 SENTINEL</strong>{' '}
                          instead of the standard 100 minimum. This applies before your booster
                          multiplier, so a 10x Epic booster on your first spin guarantees at least
                          3,000 SENTINEL.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        )
      })}
    </div>
  )
}
