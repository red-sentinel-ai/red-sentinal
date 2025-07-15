import type React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={inter.className}>
        <div className="bg-[url('/img/abstract_bg.png')] bg-left bg-no-repeat bg-cover">
          {children}
        </div>
      </body>
    </html>
  )
}
