'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FileText, MenuIcon, X } from 'lucide-react'

import { APP_NETWORK, X_URL } from '@/constants'
import { CHAINS, SUPPORTED_CHAINS } from '@/constants/chains'
import { useActiveChain } from '@/context/ActiveChainContext'
import { cn } from '@/lib/utils'
import { ConnectButton } from './ConnectButton'
import { ChainSwitcher } from './ChainSwitcher'
import { DesktopNav } from './DesktopNav'
import { MobileNav } from './MobileNav'
import SentinelStatsBar from './statbar/StatBar'

const LOGO_SRC =
  APP_NETWORK === 'testnet' ? '/icons/logo_large_testnet.svg' : '/icons/logo_large.svg'
const LOGO_SMALL_SRC = '/icons/logo-sm.svg'

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { activeChain, setActiveChain } = useActiveChain()

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
            href="/pdfs/redsentinel_whitepaper.pdf"
            target="_blank"
            className="btn btn-outline ms-4 hidden h-[50px] items-center justify-center gap-2 !rounded-[25px] !px-6 text-base font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-subtle)] xl:flex"
          >
            <FileText size={20} />
            Whitepaper
          </Link>

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
            <div className="absolute left-0 right-0 top-full z-50 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-4 pb-6 pt-2 shadow-[var(--shadow-elevated)] xl:hidden">
              <div className="border-t border-[var(--color-border-subtle)] pt-4">
                <MobileNav onItemClick={() => setMobileMenuOpen(false)} />
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-1 rounded-full border border-[var(--color-border-subtle)] p-1">
                  {SUPPORTED_CHAINS.map(chainId => (
                    <button
                      key={chainId}
                      onClick={() => setActiveChain(chainId)}
                      className={cn(
                        'flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors',
                        activeChain === chainId
                          ? 'bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)]'
                          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                      )}
                    >
                      <Image
                        src={CHAINS[chainId].icon}
                        alt={CHAINS[chainId].name}
                        width={16}
                        height={16}
                        className="rounded-full"
                      />
                      {CHAINS[chainId].name}
                    </button>
                  ))}
                </div>
                <div className="flex justify-center">
                  <ConnectButton />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
