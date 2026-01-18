'use client'

import clsx from 'clsx'
import { useState } from 'react'
import Image from 'next/image'

import { MenuItems } from './MenuItems'
import { MenuIcon, X } from 'lucide-react'
import Link from 'next/link'
import { ConnectButton } from './ConnectButton'

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header
      className={clsx(
        'fixed left-0 right-0 top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-xl transition-all duration-300'
      )}
    >
      <div className="flex h-11 items-center justify-center bg-gradient-to-r from-black/15 to-[rgba(102,102,102,0.2)] p-2 text-center text-xs text-black md:text-base">
        <h3 className="text-shadow-[0_4px_4px_rgba(0,0,0,0.25)] font-medium">
          Sui Sentinel is live on Testnet. Mainnet launches after smart-contract audits.
        </h3>
      </div>
      <div className="mx-auto flex max-w-full items-center justify-between p-3 py-4 lg:px-8">
        <div className="flex flex-1 items-end gap-2 md:gap-8">
          <Link className="block flex-shrink-0" href="https://suisentinel.xyz" target="_blank">
            <div className="relative">
              <Image
                src="/icons/logo_large_testnet.svg"
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
        <Link href="/profile" className="ms-4 rounded-full bg-white">
          <Image
            src="/icons/default_profile.png"
            width={48}
            height={48}
            alt="profile"
            className="mix-blend-luminosity"
          />
        </Link>
      </div>
      {menuOpen && (
        <div className="px-4 pb-4 xl:hidden">
          <div className="border-t border-gray-200 py-4">
            <MenuItems menuOpen={menuOpen} onItemClick={() => setMenuOpen(false)} />
          </div>
          <div className="mt-4 flex justify-center">
            <ConnectButton />
          </div>
        </div>
      )}
    </header>
  )
}
