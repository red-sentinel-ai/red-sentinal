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
      hover:
        '[&:hover]:border-[#FF3F26] [&:hover]:shadow-[0_0_30px_rgba(255,63,38,0.3)] hover:after:bg-[#FF3F26]',
      gradient: 'bg-gradient-to-t from-[#FF3F26]/10 via-transparent to-transparent',
      sweep: 'before:via-[#FF3F26]/30',
    },
    defender: {
      hover:
        '[&:hover]:border-[#00A3FF] [&:hover]:shadow-[0_0_30px_rgba(0,163,255,0.3)] hover:after:bg-[#00A3FF]',
      gradient: 'bg-gradient-to-t from-[#00A3FF]/10 via-transparent to-transparent',
      sweep: 'before:via-[#00A3FF]/30',
    },
  }

  const colors = themeColors[theme]

  return (
    <div className="min-h-body flex items-center justify-center relative">
      {/* Background gradient */}
      <div className={`absolute inset-0 ${colors.gradient}`} />

      {/* Content */}
      <div className="text-center max-w-lg mx-auto px-4 relative">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-white">{title}</h1>
        <div className="relative group">
          <ConnectButton />
        </div>
        <p className="text-gray-300 text-lg mt-8">{subtitle}</p>
      </div>
    </div>
  )
}
