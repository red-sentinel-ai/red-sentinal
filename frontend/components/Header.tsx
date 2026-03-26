'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MenuIcon, X } from 'lucide-react'

import { APP_NETWORK, X_URL } from '@/constants'
import { ConnectButton } from './ConnectButton'
import { DesktopNav } from './DesktopNav'
import { MobileNav } from './MobileNav'
import SentinelStatsBar from './statbar/StatBar'

const LOGO_SRC =
  APP_NETWORK === 'testnet' ? '/icons/logo_large_testnet.svg' : '/icons/logo_large.svg'
const LOGO_SMALL_SRC = '/icons/logo-sm.svg'

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed left-0 right-0 top-0 z-50 w-full">
      <SentinelStatsBar />

      <div className="w-full bg-transparent pt-8 transition-all duration-300 md:border-b md:border-outline-variant md:bg-surface/80 md:backdrop-blur-xl">
        <div className="mx-auto flex max-w-full items-center justify-between p-2 lg:px-6">
          <div className="flex flex-1 items-center gap-2 md:gap-8">
            <Link href="/" className="flex-shrink-0 md:hidden">
              <Image
                src={LOGO_SMALL_SRC}
                alt="logo"
                height={36}
                width={36}
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
            className="btn-secondary ms-4 hidden h-[50px] items-center justify-center gap-2 !rounded-[25px] !px-6 text-base xl:flex"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-on-surface"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Support on X
          </Link>

          <div className="ms-4 hidden xl:block">
            <ConnectButton />
          </div>

          <button
            className="ml-2 flex-shrink-0 p-2 text-on-surface xl:hidden"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X /> : <MenuIcon />}
          </button>

          <Link href="/profile" className="ms-4 hidden rounded-full xl:block">
            <Image
              src="/icons/default_profile.png"
              width={32}
              height={32}
              alt="profile"
              className="rounded-full border border-outline-variant mix-blend-luminosity"
            />
          </Link>
        </div>

        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 top-[96px] z-40 bg-surface/80 backdrop-blur-sm md:top-[100px] xl:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="absolute left-0 right-0 top-full z-50 border-b border-outline-variant bg-surface/95 px-4 pb-6 pt-2 shadow-ambient backdrop-blur-xl xl:hidden">
              <div className="border-t border-outline-variant pt-4">
                <MobileNav onItemClick={() => setMobileMenuOpen(false)} />
              </div>
              <div className="mt-4 flex justify-center">
                <ConnectButton />
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
