'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MenuIcon, X } from 'lucide-react'

import { APP_NETWORK, X_URL } from '@/constants'
import { ConnectButton } from './ConnectButton'
import { ChainSwitcher } from './ChainSwitcher'
import { DesktopNav } from './DesktopNav'
import { MobileNav } from './MobileNav'
import SentinelStatsBar from './statbar/StatBar'

const LOGO_SRC = '/redSentinel.jpeg'
const LOGO_SMALL_SRC = '/redSentinel.jpeg'

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed left-0 right-0 top-0 z-50 w-full">
      <SentinelStatsBar />

      <div className="w-full bg-[var(--color-bg-surface)]/80 pt-8 backdrop-blur-xl transition-all duration-300 md:border-b md:border-[var(--color-border-subtle)]">
        <div className="mx-auto flex max-w-full items-center justify-between p-2 lg:px-6">
          <div className="flex flex-1 items-center gap-2 md:gap-8">
            <Link href="/" className="flex-shrink-0 md:hidden">
              <Image
                src={LOGO_SMALL_SRC}
                alt="logo"
                height={36}
                width={120}
                quality={100}
                style={{ objectFit: 'contain' }}
              />
            </Link>
            <Link href="/" className="hidden flex-shrink-0 md:block">
              <Image
                src={LOGO_SRC}
                alt="logo"
                height={49}
                width={198}
                quality={100}
                style={{ objectFit: 'contain' }}
              />
            </Link>

            <div className="hidden w-full xl:block">
              <DesktopNav />
            </div>
          </div>

          <Link
            href={X_URL}
            target="_blank"
            className="btn btn-outline ms-4 hidden h-[50px] items-center justify-center gap-2 !rounded-[25px] !px-6 text-base font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-subtle)] xl:flex"
          >
            <Image src="/icons/x_black.png" width={20} height={20} alt="x" />
            Support on X
          </Link>

          <div className="ms-4 hidden xl:block">
            <ChainSwitcher />
          </div>

          <div className="ms-2 hidden xl:block">
            <ConnectButton />
          </div>

          <button
            className="ml-2 flex-shrink-0 p-2 text-[var(--color-text-primary)] xl:hidden"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X /> : <MenuIcon />}
          </button>

          <Link href="/profile" className="ms-4 hidden rounded-full bg-[var(--color-bg-subtle)] xl:block">
            <Image
              src="/icons/default_profile.png"
              width={32}
              height={32}
              alt="profile"
              className="mix-blend-luminosity"
            />
          </Link>
        </div>

        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 top-[96px] z-40 bg-[var(--color-overlay)] backdrop-blur-sm md:top-[100px] xl:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="absolute left-0 right-0 top-full z-50 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]/95 px-4 pb-6 pt-2 shadow-[var(--shadow-elevated)] backdrop-blur-xl xl:hidden">
              <div className="border-t border-[var(--color-border-subtle)] pt-4">
                <MobileNav onItemClick={() => setMobileMenuOpen(false)} />
              </div>
              <div className="mt-4 flex items-center justify-center gap-2">
                <ChainSwitcher />
                <ConnectButton />
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
