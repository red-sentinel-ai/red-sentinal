'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { NAUTILUS_URL, socialLinks } from '@/constants'

const Footer = () => {
  const pathname = usePathname()
  const shouldHideFooter = pathname.startsWith('/attack/')

  if (shouldHideFooter) {
    return null
  }

  return (
    <footer className="relative border-t border-outline-variant bg-surface-container-low pt-8 sm:pt-16">
      <div className="vertical-line left-4 border-outline"></div>
      <div className="vertical-line right-4 border-outline"></div>

      {/* Ambient glow at bottom */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end pb-[24px] md:justify-center md:pb-0">
        <div className="bg-primary/10 h-auto w-[100px] max-w-xs rounded-full blur-3xl sm:w-[160px] md:w-auto md:max-w-lg" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 pb-4 sm:px-6 md:pb-0 lg:px-8">
        <div className="flex min-h-[360px] flex-col items-center justify-between gap-6 text-center sm:min-h-[440px] sm:gap-12 md:min-h-[398px] md:flex-row md:items-start md:text-left">
          <div className="flex max-w-md flex-grow flex-col md:self-stretch">
            <div className="mb-4 flex items-center justify-center gap-3 md:justify-start">
              <Image
                src="/icons/logo_large_white.svg"
                alt="Sui Sentinel Logo"
                style={{ objectFit: 'contain' }}
                height={49}
                width={198}
              />
            </div>
            <p className="py-2 text-sm leading-relaxed text-on-surface-variant sm:py-4 sm:text-base">
              The first crowdsource AI red teaming platform on Sui. Deploy Sentinels, break AI
              defenses, earn instant rewards. Every attack verified cryptographically. Every payout
              trustless.
            </p>

            <div className="my-4 flex flex-row flex-wrap justify-center gap-2 md:hidden">
              {socialLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant transition-colors hover:bg-surface-container"
                  aria-label={link.alt}
                >
                  {link.isImage ? (
                    <Image
                      src={link.icon as string}
                      alt={link.alt}
                      width={20}
                      height={20}
                      className="opacity-80"
                    />
                  ) : (
                    <link.icon className="size-5 text-on-surface" />
                  )}
                </Link>
              ))}
            </div>

            <div className="mt-auto text-xs text-on-surface-variant sm:text-sm md:text-base">
              <span>Powered by </span>
              <a
                href={NAUTILUS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Nautilus Framework
              </a>
              <span className="mx-1">•</span>
              <span>Secured by TEE</span>
              <span className="mx-1">•</span>
              <a
                href="https://osec.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Audited by OtterSec
              </a>
            </div>
            <p className="mb-4 text-xs font-medium text-on-surface-variant sm:text-sm md:text-base">
              <span>© 2025 </span>
              <span>All Rights Reserved @Cyphronix Software</span>
            </p>
          </div>

          <div className="hidden w-full md:block md:w-auto">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {socialLinks.map(link => (
                <div key={link.href} className="flex items-center justify-between gap-6">
                  <Link
                    className="whitespace-nowrap font-medium text-on-surface hover:text-primary hover:underline"
                    href={link.href}
                    target="_blank"
                  >
                    {link.name}
                  </Link>
                  <Link
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-[51px] w-[70px] items-center justify-center rounded-lg border border-outline-variant transition-colors hover:bg-surface-container"
                    aria-label={link.alt}
                  >
                    {link.isImage ? (
                      <Image
                        src={link.icon as string}
                        alt={link.alt}
                        width={20}
                        height={20}
                        className="opacity-80"
                      />
                    ) : (
                      <link.icon className="size-5 text-on-surface" />
                    )}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
