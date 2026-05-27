'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  label: string
  sublabel: string
}

const STEPS: Step[] = [
  { label: 'Create Syndicate', sublabel: 'Name & settings' },
  { label: 'Fund Syndicate', sublabel: 'Initial contribution' },
  { label: 'Launch Sentinel', sublabel: 'Deploy your AI' },
]

interface SyndicateStepperProps {
  currentStep: number
}

export function SyndicateStepper({ currentStep }: SyndicateStepperProps) {
  return (
    <div className="flex items-center justify-between">
      {STEPS.map((step, index) => {
        const stepNum = index + 1
        const isDone = currentStep > stepNum
        const isActive = currentStep === stepNum

        return (
          <div key={stepNum} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all',
                  isDone &&
                    'border-[var(--color-gold-primary)] bg-[var(--color-gold-primary)] text-[var(--color-text-on-gold)]',
                  isActive &&
                    'border-[var(--color-gold-primary)] bg-transparent text-[var(--color-gold-primary)]',
                  !isDone &&
                    !isActive &&
                    'border-[var(--color-border-default)] bg-transparent text-[var(--color-text-muted)]'
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : stepNum}
              </div>
              <div className="text-center">
                <p
                  className={cn(
                    'text-xs font-medium',
                    isActive
                      ? 'text-[var(--color-text-primary)]'
                      : 'text-[var(--color-text-muted)]'
                  )}
                >
                  {step.label}
                </p>
                <p className="text-[10px] text-[var(--color-text-faint)]">{step.sublabel}</p>
              </div>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  'mb-6 h-px flex-1 transition-all',
                  currentStep > stepNum
                    ? 'bg-[var(--color-gold-primary)]'
                    : 'bg-[var(--color-border-default)]'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
