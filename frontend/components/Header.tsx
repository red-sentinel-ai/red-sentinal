'use client'

import clsx from 'clsx'
import { useState } from 'react'
import Image from 'next/image'

import { MenuItems } from './MenuItems'
import { MenuIcon, X } from 'lucide-react'
import Link from 'next/link'
import { ConnectButton } from './ConnectButton'
import SentinelStatsBar from './statbar/StatBar'
import { APP_NETWORK } from '@/constants'

const HEADER_LOGO =
  APP_NETWORK === 'testnet' ? '/icons/logo_large_testnet.svg' : '/icons/logo_large.svg'
const HEADER_LOGO_SMALL = '/icons/logo-sm.svg'

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed left-0 right-0 top-0 z-50 w-full">
      <SentinelStatsBar />
      <div
        className={clsx(
          'w-full bg-transparent pt-8 transition-all duration-300 md:border-b md:border-gray-200 md:bg-white/80 md:backdrop-blur-xl'
        )}
      >
        <div className="mx-auto flex max-w-full items-center justify-between p-2 lg:px-6">
          <div className="flex flex-1 items-center gap-2 md:gap-8">
            {/* Mobile: Small logo */}
            <Link className="block flex-shrink-0 md:hidden" href="/">
              <div className="relative">
                <Image
                  src={HEADER_LOGO_SMALL}
                  alt="logo"
                  height={36}
                  width={36}
                  quality={100}
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </Link>
            {/* Desktop: Full logo */}
            <Link className="hidden flex-shrink-0 md:block" href="/">
              <div className="relative">
                <Image
                  src={HEADER_LOGO}
                  alt="logo"
                  height={49}
                  width={198}
                  quality={100}
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </Link>

            <div className="hidden w-full xl:block">
              <MenuItems menuOpen={menuOpen} />
            </div>
          </div>

          <div className="ms-4 hidden xl:block">
            <ConnectButton />
          </div>
          <button
            className="ml-2 flex-shrink-0 p-2 xl:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X className="block" /> : <MenuIcon />}
          </button>

          {/* <Link
          className="block ml-3 xl:ml-4 flex-shrink-0"
          href={YOUTUBE_VIDEO_URL}
          target="_blank"
        >
          <YoutubeIcon size={32} />
        </Link>

        <Link
          href={X_URL}
          aria-label="Twitter/X"
          target="_blank"
          className="ms-3"
        >
          <Image
            src="/icons/x.svg"
            width={22}
            height={22}
            alt="x"
          />
        </Link> */}
          <Link href="/profile" className="ms-4 hidden rounded-full bg-white xl:block">
            <Image
              src="/icons/default_profile.png"
              width={32}
              height={32}
              alt="profile"
              className="mix-blend-luminosity"
            />
          </Link>
        </div>
        {menuOpen && (
          <>
            {/* Backdrop overlay */}
            <div
              className="fixed inset-0 top-[96px] z-40 bg-black/20 backdrop-blur-sm md:top-[100px] xl:hidden"
              onClick={() => setMenuOpen(false)}
            />
            {/* Mobile menu */}
            <div className="absolute left-0 right-0 top-full z-50 border-b border-gray-200 bg-white/95 px-4 pb-6 pt-2 shadow-lg backdrop-blur-xl xl:hidden">
              <div className="border-t border-gray-200">
                <MenuItems menuOpen={menuOpen} onItemClick={() => setMenuOpen(false)} />
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
