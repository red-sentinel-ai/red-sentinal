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
    <footer
      className="relative pt-16 bg-cover bg-bottom bg-no-repeat"
      style={{ backgroundImage: "url('/img/footer-bg.png')" }}
    >
      <div className="vertical-line left-4"></div>
      <div className="vertical-line right-4"></div>
      <div className="absolute inset-0 flex items-center pointer-events-none justify-end md:justify-center pb-[24px] md:pb-0 flex-col">
        <Image
          src="/gifs/fullCircleRed.gif"
          width={500}
          height={346}
          alt="Decorative blend element"
          className="w-[160px] md:w-auto h-auto max-w-xs md:max-w-lg"
        />
        <Image
          width={310}
          height={29}
          src="/img/shadowEllipse.png"
          alt="shadow ellipse"
          className="w-[200px] md:w-[310px] h-auto"
        />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto pb-4 md:pb-0 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-12 text-center md:text-left min-h-[440px] md:min-h-[398px]">
          <div className="max-w-md md:self-stretch flex flex-col flex-grow">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <Image
                src="/icons/logo_large_testnet.svg"
                alt="Sui Sentinel Logo"
                style={{ objectFit: 'contain' }}
                height={49}
                width={198}
              />
            </div>
            <p className="text-black leading-relaxed py-4 ">
              Sui Sentinel is a gamified AI red-teaming and auditing platform built on Sui. Test,
              defend, and harden AI models through real-world adversarial challenges. Every attack
              and defense is verified on-chain, every action has real stakes
            </p>

            <div className="flex flex-row justify-center gap-4 md:hidden my-4">
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

            <div className="md:text-base mt-auto">
              <span>Powered by </span>
              <a
                href={NAUTILUS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Nautilus Framework
              </a>
              <span> • Secured by TEE</span>
            </div>
            <p className="text-white font-medium mb-4">
              <span>© 2025 </span>
              <span>All Rights Reserved @Cyphronix Software</span>
            </p>
          </div>

          <div className="w-full md:w-auto hidden md:block">
            <div className="flex flex-col gap-4">
              {socialLinks.map((link) => (
                <div
                  key={link.href}
                  className="flex items-center justify-between gap-6"
                >
                  <Link
                    className="text-black font-medium whitespace-nowrap hover:underline"
                    href={link.href}
                    target="_blank"
                  >
                    {link.name}
                  </Link>
                  <Link
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-[70px] h-[51px] border border-[#ACACAC] rounded-[8px] flex items-center justify-center hover:bg-black/5 transition-colors"
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
      </div>
    </footer>
  )
}

export default Footer
