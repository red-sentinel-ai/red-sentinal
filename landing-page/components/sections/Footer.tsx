'use client'

import Link from 'next/link'
import Image from 'next/image'
import { socialLinks } from '@/constants'

export function Footer() {
  return (
    <footer className="relative mt-20 pt-16 bg-cover bg-bottom bg-no-repeat bg-[url('/img/footer-bg-sm.png')] md:bg-[url('/img/footer-bg.png')]">
      <div className="vertical-line left-4 -top-40"></div>
      <div className="vertical-line right-4 -top-40"></div>

      <div className="relative z-10 max-w-[1440px] mx-auto pb-0 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 md:text-left">
          <div className="max-w-md md:self-stretch md:shrink-0 flex flex-col order-1 md:order-1">
            <div className="flex items-center text-sm md:text-base md:justify-start gap-3 mb-4">
              <Image
                src="/icons/logo_large.svg"
                alt="Red Sentinel Logo"
                style={{ objectFit: 'contain' }}
                height={49}
                width={198}
              />
            </div>
            <p className="text-black leading-relaxed">
              Red Sentinel is a Decentralized AI safety platform built on Sui. Stress-test models,
              find vulnerabilities, earn rewards. Every judgment cryptographically verified
              on-chain.
            </p>

          </div>

          <div className="flex w-full max-w-[280px] sm:max-w-xs md:max-w-none md:flex-1 md:min-w-0 mx-auto items-end justify-center gap-2 mt-8 md:mt-auto order-3 md:order-2">
            <div className="shrink min-w-0">
              <Image
                src="/img/robot_defend.png"
                width={260}
                height={346}
                alt="Defender Robot"
                className="h-auto w-[150px] sm:w-[180px] md:w-full md:max-w-[220px] lg:max-w-[260px]"
              />
            </div>
            <div className="flex shrink min-w-0">
              <Image
                src="/img/robot_attack.png"
                width={215}
                height={286}
                alt="Attacker Robot"
                className="mt-auto h-auto w-[100px] sm:w-[130px] md:w-full md:max-w-[180px] lg:max-w-[215px]"
              />
            </div>
          </div>

          <div className="w-full md:w-auto md:shrink-0 order-2 md:order-3 pb-4 overflow-auto">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:hidden">
              {socialLinks.map((link) => (
                <div key={link.href} className="flex items-center justify-between gap-3">
                  <Link
                    className="text-black font-medium whitespace-nowrap hover:underline text-sm"
                    href={link.href}
                    target={link.isOutside ? '_blank' : '_self'}
                  >
                    {link.name}
                  </Link>
                  <Link
                    href={link.href}
                    target={link.isOutside ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    className="w-[45px] h-[36px] sm:w-[50px] sm:h-[40px] border border-[#ACACAC] rounded-xl flex items-center justify-center hover:bg-black/5 transition-colors flex-none"
                    aria-label={link.alt}
                  >
                    {link.isImage ? (
                      <Image src={link.icon as string} alt={link.alt} width={18} height={18} />
                    ) : (
                      <link.icon className="w-5 h-5 text-black" />
                    )}
                  </Link>
                </div>
              ))}
            </div>

            <div className="hidden md:grid grid-cols-2 gap-x-10 gap-y-4">
              {socialLinks.map((link) => (
                <div key={link.href} className="flex items-center justify-between gap-2">
                  <Link
                    className="text-black font-medium whitespace-nowrap hover:underline"
                    href={link.href}
                    target={link.isOutside ? '_blank' : '_self'}
                  >
                    {link.name}
                  </Link>
                  <Link
                    href={link.href}
                    target={link.isOutside ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    className="w-[50px] h-[40px] sm:w-[60px] sm:h-[45px] md:w-[70px] md:h-[51px] border border-[#ACACAC] rounded-xl flex items-center justify-center hover:bg-black/5 transition-colors flex-none"
                    aria-label={link.alt}
                  >
                    {link.isImage ? (
                      <Image src={link.icon as string} alt={link.alt} width={20} height={20} />
                    ) : (
                      <link.icon className="w-5 h-5 text-black" />
                    )}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-black/10 flex flex-col md:flex-row items-center justify-between gap-2 pb-4">
          <p className="hidden md:block text-white font-medium text-sm">
            <span>© 2025 </span>
            <span>All Rights Reserved @Cyphronix Software</span>
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/privacy-policy"
              className="text-black font-medium hover:underline whitespace-nowrap"
            >
              Privacy Policy
            </Link>
            <span className="text-black/30">|</span>
            <Link
              href="/code-of-conduct"
              className="text-black font-medium hover:underline whitespace-nowrap"
            >
              Code of Conduct
            </Link>
          </div>
        </div>

        <p className="md:hidden text-white font-medium text-[10px] w-full text-center pb-2">
          <span>© 2025 </span>
          <span>All Rights Reserved @Cyphronix Software</span>
        </p>
      </div>
    </footer>
  )
}
