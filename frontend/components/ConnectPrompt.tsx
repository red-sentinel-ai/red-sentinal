'use client'

import { ConnectButton } from './ConnectButton'

interface ConnectPromptProps {
  title: string
  subtitle: string
  theme: 'attacker' | 'defender'
}

export const ConnectPrompt = ({ title, subtitle, theme }: ConnectPromptProps) => {
  const themeColors = {
    attacker: {
      gradient: 'bg-gradient-to-t from-red-50 via-white to-white',
    },
    defender: {
      gradient: 'bg-gradient-to-t from-blue-50 via-white to-white',
    },
  }

  const colors = themeColors[theme]

  return (
    <div className="min-h-body relative flex items-center justify-center bg-white">
      {/* Background gradient */}
      <div className={`absolute inset-0 ${colors.gradient}`} />

      {/* Content */}
      <div className="relative mx-auto max-w-lg px-4 text-center">
        <h1 className="mb-8 text-2xl font-bold sm:text-4xl md:text-5xl">{title}</h1>
        <div className="group relative">
          <ConnectButton />
        </div>
        <p className="mt-8 text-lg text-gray-600">{subtitle}</p>
      </div>
    </div>
  )
}
