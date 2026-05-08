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
      className="relative bg-cover bg-bottom bg-no-repeat pt-8 sm:pt-16"
      style={{ backgroundImage: "url('/img/footer-bg.png')" }}
    >
      <div className="vertical-line left-4"></div>
      <div className="vertical-line right-4"></div>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end pb-[24px] md:justify-center md:pb-0">
        <Image
          src="/gifs/fullCircleRed.gif"
          width={500}
          height={346}
          alt="Decorative blend element"
          className="h-auto w-[100px] max-w-xs sm:w-[160px] md:w-auto md:max-w-lg"
        />
        <Image
          width={310}
          height={29}
          src="/img/shadowEllipse.png"
          alt="shadow ellipse"
          className="h-auto w-[120px] sm:w-[200px] md:w-[310px]"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 pb-4 sm:px-6 md:pb-0 lg:px-8">
        <div className="flex min-h-[360px] flex-col items-center justify-between gap-6 text-center sm:min-h-[440px] sm:gap-12 md:min-h-[398px] md:flex-row md:items-start md:text-left">
          <div className="flex max-w-md flex-grow flex-col md:self-stretch">
            <div className="mb-4 flex items-center justify-center gap-3 md:justify-start">
              <Image
                src="/icons/red-sentinel-logo.svg"
                alt="Red Sentinel Logo"
                style={{ objectFit: 'contain' }}
                height={49}
                width={198}
              />
            </div>
            <p className="py-2 text-sm leading-relaxed text-black sm:py-4 sm:text-base">
              Red Sentinel is a real-stakes AI security arena for the age of agents. Attack live
              Sentinels, learn how AI systems fail, earn rewards for verified exploits, and build
              reputation on-chain.
            </p>

            <div className="my-4 flex flex-row flex-wrap justify-center gap-2 md:hidden">
              {socialLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-black transition-colors hover:bg-black/5"
                  aria-label={link.alt}
                >
                  {link.isImage ? (
                    <Image src={link.icon as string} alt={link.alt} width={20} height={20} />
                  ) : (
                    <link.icon className="size-5 text-black" />
                  )}
                </Link>
              ))}
            </div>

            <div className="mt-auto text-xs text-white sm:text-sm md:text-base">
              <span>Powered by </span>
              <a
                href={NAUTILUS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
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
                className="underline"
              >
                Audited by OtterSec
              </a>
            </div>
            <p className="mb-4 text-xs font-medium text-white sm:text-sm md:text-base">
              <span>© 2025 </span>
              <span>All Rights Reserved @Cyphronix Software</span>
            </p>
          </div>

          <div className="hidden w-full md:block md:w-auto">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {socialLinks.map(link => (
                <div key={link.href} className="flex items-center justify-between gap-6">
                  <Link
                    className="whitespace-nowrap font-medium text-black hover:underline"
                    href={link.href}
                    target="_blank"
                  >
                    {link.name}
                  </Link>
                  <Link
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-[51px] w-[70px] items-center justify-center rounded-[8px] border border-[#ACACAC] transition-colors hover:bg-black/5"
                    aria-label={link.alt}
                  >
                    {link.isImage ? (
                      <Image src={link.icon as string} alt={link.alt} width={20} height={20} />
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
