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
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    icon: Sparkles,
    title: 'Spin to Multiply',
    description:
      "Use your Spin Pass at the slot machine. Base range is 100-1,000 SENTINEL, multiplied by your pass's booster tier. A 25x Legendary Spin Pass? That's 2,500-25,000 SENTINEL.",
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    icon: Coins,
    title: 'Collect Instantly',
    description:
      'SENTINEL tokens land in your wallet immediately after spinning. Share your spin on Twitter for a bonus +100 SENTINEL.',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
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
            <Card className="h-full rounded-2xl border-gray-200 bg-white transition-all duration-300 hover:border-gray-300 hover:shadow-sm">
              <CardContent className="flex flex-col items-center p-6 text-center md:p-8">
                <div
                  className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${step.iconBg}`}
                >
                  <Icon className={`h-8 w-8 ${step.iconColor}`} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-black">{step.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600 md:text-base">
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
