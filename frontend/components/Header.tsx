'use client'

import clsx from 'clsx'
import { useState, useEffect } from 'react'
import Image from 'next/image'

import { MenuItems } from './MenuItems'
import { MenuIcon, X } from 'lucide-react'
import Link from 'next/link'
import { ConnectButton } from './ConnectButton'

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={clsx('fixed left-0 right-0 top-0 w-full z-50 transition-all duration-300', {
        'bg-white/80 backdrop-blur-xl border-b border-gray-200': menuOpen || scrolled,
        'bg-transparent': !scrolled && !menuOpen,
      })}
    >
      <div className="max-w-full mx-auto flex items-center p-3 lg:p-4 justify-between">
        <div className="flex items-center flex-1">
          <Link
            className="block mr-1 xl:mr-4 flex-shrink-0"
            href="https://suisentinel.xyz"
            target="_blank"
          >
            <div className="relative w-8 h-11">
              <Image src="/icons/logo-sm.svg" alt="shield" fill style={{ objectFit: 'contain' }} />
            </div>
          </Link>

          <div className="hidden xl:block w-full">
            <MenuItems menuOpen={menuOpen} />
          </div>
        </div>

        <div className="hidden xl:block ms-4">
          <ConnectButton />
        </div>
        <button
          className="xl:hidden flex-shrink-0 ml-2 p-2"
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
      </div>
      {menuOpen && (
        <div className="xl:hidden px-4 pb-4">
          <div className="py-4 border-t border-gray-200">
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
