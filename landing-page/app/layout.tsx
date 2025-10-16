import type React from 'react'
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import localFont from 'next/font/local'
import './globals.css'

const satoshi = localFont({
  src: [
    { path: '../public/fonts/Satoshi-Variable.ttf', style: 'normal' },
    { path: '../public/fonts/Satoshi-VariableItalic.ttf', style: 'italic' },
  ],
  variable: '--font-satoshi',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SUI Sentinel - AI Security Battle Arena',
  description:
    'The ultimate battle arena to test the security of autonomous AI agents. Deploy your AI, fortify it with master prompts, and challenge the world to break its defenses.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="scroll-smooth"
    >
      <body className={satoshi.className}>
        <div className="bg-[url('/img/abstract_bg.png')] bg-left bg-no-repeat bg-cover">
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  )
}
