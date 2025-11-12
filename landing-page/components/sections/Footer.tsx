'use client'

import Link from 'next/link'
import Image from 'next/image'
import { socialLinks } from '@/constants'

export function Footer() {
  return (
    <footer
      className="relative pt-16 bg-cover bg-bottom bg-no-repeat"
      style={{ backgroundImage: "url('/img/footer-bg.png')" }}
    >
      <div className="relative z-10 max-w-[1440px] mx-auto pb-4 md:pb-0 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-12 text-center md:text-left">
          <div className="max-w-md md:self-stretch flex flex-col">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <Image
                src="/icons/logo_large.png"
                alt="Sui Sentinel Logo"
                style={{ objectFit: 'contain' }}
                height={49}
                width={198}
              />
            </div>
            <p className="text-black leading-relaxed">
              Sui Sentinel is a decentralized network that audits, red-teams, and evolves AI models
              through real-world challenges ensuring they grow stronger with every test.
            </p>

            <p className="hidden md:block mt-auto py-4 text-white font-medium">
              <span>© 2025 </span>
              <span>All Rights Reserved @Cyphronix Software</span>
            </p>
          </div>

          <div className="flex w-full max-w-xs md:max-w-lg mx-auto items-end justify-between mt-8 md:mt-auto">
            <div>
              <Image
                src="/img/robot_defend.png"
                width={260}
                height={346}
                alt="Defender Robot"
                className="h-auto w-[130px] md:w-[260px]"
              />
            </div>
            <div className="flex">
              <Image
                src="/img/robot_attack.png"
                width={215}
                height={286}
                alt="Attacker Robot"
                className="mt-auto h-auto w-[108px] md:w-[215px]"
              />
            </div>
          </div>

          <div className="w-full md:w-auto">
            <div className="flex flex-row justify-center gap-4 md:hidden">
              {socialLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[70px] h-[51px] border border-black rounded-[8px] flex items-center justify-center hover:bg-black/5 transition-colors"
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

            <div className="hidden md:flex flex-col gap-4">
              {socialLinks.map((link) => (
                <div
                  key={link.href}
                  className="flex items-center justify-between gap-6"
                >
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
                    className="w-[70px] h-[51px] border border-[#ACACAC] rounded-xl flex items-center justify-center hover:bg-black/5 transition-colors"
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
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="md:hidden text-center mt-8 pt-4 text-white font-medium">
          <span>© 2025 </span>
          <span>All Rights Reserved @Cyphronix Software</span>
        </p>
      </div>
    </footer>
  )
}
