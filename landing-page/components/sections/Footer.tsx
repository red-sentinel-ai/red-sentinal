'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Github, BookOpen } from 'lucide-react'
import {
  SUI_SENTINEL_X_URL,
  SUI_SENTINEL_GITHUB_URL,
  SUI_SENTINEL_TELEGRAM_URL,
  SUI_SENTINEL_DOCS_URL,
} from '@/constants'

const socialLinks = [
  { href: SUI_SENTINEL_X_URL, icon: '/icons/x_black.png', isImage: true, alt: 'X (Twitter)' },
  { href: SUI_SENTINEL_GITHUB_URL, icon: Github, isImage: false, alt: 'GitHub' },
  {
    href: SUI_SENTINEL_TELEGRAM_URL,
    icon: '/icons/telegram_black.png',
    isImage: true,
    alt: 'Telegram',
  },
  { href: SUI_SENTINEL_DOCS_URL, icon: BookOpen, isImage: false, alt: 'Documentation' },
]

export function Footer() {
  return (
    <footer
      className="relative pt-16 bg-cover bg-bottom bg-no-repeat"
      style={{ backgroundImage: "url('/img/footer-bg.png')" }}
    >
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12  min-h-[505px]">
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/icons/logo_large.png"
                alt="shield"
                style={{ objectFit: 'contain' }}
                height={49}
                width={198}
              />
            </div>
            <p className="text-black leading-relaxed">
              Sui Sentinel is a decentralized network that audits, red-teams, and evolves AI models
              through real-world challenges ensuring they grow stronger with every test.
            </p>
          </div>

          <div className="mt-auto flex justify-between w-full">
            <div>
              <Image
                src="/img/robot_defend.png"
                width={260}
                height={346}
                alt="robo"
              />
            </div>

            <div className="flex">
              <Image
                src="/img/robot_attack.png"
                width={215}
                height={286}
                alt="robo"
                className="mt-auto"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <span className="text-black font-medium whitespace-nowrap">connect with us</span>
            <div className="flex flex-col gap-2">
              {socialLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-16 h-10 border-2 border-black rounded-lg flex items-center justify-center hover:bg-black/5 transition-colors"
                  aria-label={link.alt}
                >
                  {link.isImage ? (
                    <Image
                      src={link.icon as string}
                      alt={link.alt}
                      width={20}
                      height={20}
                    />
                  ) : (
                    <link.icon className="size-5 text-black" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
