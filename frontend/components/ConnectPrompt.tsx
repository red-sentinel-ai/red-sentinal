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
    <div className="min-h-body flex items-center justify-center relative bg-white">
      {/* Background gradient */}
      <div className={`absolute inset-0 ${colors.gradient}`} />

      {/* Content */}
      <div className="text-center max-w-lg mx-auto px-4 relative">
        <h1 className="text-4xl md:text-5xl font-bold mb-8">{title}</h1>
        <div className="relative group">
          <ConnectButton />
        </div>
        <p className="text-lg mt-8 text-gray-600">{subtitle}</p>
      </div>
    </div>
  )
}
