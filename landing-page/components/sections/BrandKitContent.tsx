import { SUI_SENTINEL_BRAND_KIT_URL } from '@/constants'
import { Download } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export const BrandKitContent = () => {
  return (
    <section
      className="relative min-h-screen bg-no-repeat"
      style={{
        backgroundImage: `
      url('/img/hero_bg.png'),
      linear-gradient(
        to right,
        rgba(233,239,255,0.55),
        rgba(245,245,245,0.55),
        rgba(255,235,253,0.55)
      )
    `,
        backgroundSize: '100% auto, 100% auto',
        backgroundRepeat: 'no-repeat, no-repeat',
        backgroundPosition: 'center top, center top',
      }}
    >
      <div className="vertical-line left-4 -top-40"></div>
      <div className="vertical-line right-4 -top-40"></div>

      <div
        style={{
          backgroundImage: "url('/img/bannerImage.png')",
          backgroundSize: '100% auto',
        }}
        className="min-h-[563px] flex items-end justify-center py-12"
      >
        <h1 className="text-white text-xl md:text-5xl font-bold">Brand Kit</h1>
      </div>

      <div className="max-w-[1440px] mx-auto py-8 px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="mb-12">
          <div>
            <div className="flex justify-end">
              <Link
                className="btn btn-outline font-medium text-base flex items-center justify-center"
                href={SUI_SENTINEL_BRAND_KIT_URL}
                target="_blank"
              >
                Download logo KIT
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-[28px] font-medium mb-6">Logo</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <div className="border border-[#5E5E5E] w-full sm:w-48 md:w-64 lg:w-[320px] xl:w-[407px] h-40 sm:h-48 md:h-56 lg:h-[250px] xl:h-[291px] bg-white flex items-center justify-center rounded-2xl sm:mr-2">
                  <Image
                    src="/icons/logo/logo_dark.svg"
                    alt="shield"
                    style={{ objectFit: 'contain' }}
                    height={90}
                    width={260}
                    quality={100}
                    className="w-[150px] sm:w-[180px] md:w-[220px] lg:w-[260px]"
                  />
                </div>

                <div className="flex flex-row sm:flex-col gap-2 mt-2 sm:mt-0">
                  <Link
                    href="/icons/logo/logo_dark.png"
                    download="logo_dark.png"
                    className="btn btn-black flex items-center justify-center min-h-[45px]! sm:min-h-[54px]! min-w-[90px]! sm:min-w-[111px]! gap-2 text-sm sm:text-base"
                  >
                    <Download width={18} />
                    PNG
                  </Link>

                  <Link
                    href="/icons/logo/logo_dark.svg"
                    download="logo_dark.svg"
                    className="btn btn-black flex items-center justify-center min-h-[45px]! sm:min-h-[54px]! min-w-[90px]! sm:min-w-[111px]! gap-2 text-sm sm:text-base"
                  >
                    <Download width={18} />
                    SVG
                  </Link>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <div className="border border-[#5E5E5E] w-full sm:w-48 md:w-64 lg:w-[320px] xl:w-[407px] h-40 sm:h-48 md:h-56 lg:h-[250px] xl:h-[291px] bg-black flex items-center justify-center rounded-2xl sm:mr-2">
                  <Image
                    src="/icons/logo/logo_light.svg"
                    alt="shield"
                    style={{ objectFit: 'contain' }}
                    height={90}
                    width={260}
                    quality={100}
                    className="w-[150px] sm:w-[180px] md:w-[220px] lg:w-[260px]"
                  />
                </div>

                <div className="flex flex-row sm:flex-col gap-2 mt-2 sm:mt-0">
                  <Link
                    href="/icons/logo/logo_light.png"
                    download="logo_light.png"
                    className="btn btn-black flex items-center justify-center min-h-[45px]! sm:min-h-[54px]! min-w-[90px]! sm:min-w-[111px]! gap-2 text-sm sm:text-base"
                  >
                    <Download width={18} />
                    PNG
                  </Link>

                  <Link
                    href="/icons/logo/logo_light.svg"
                    download="logo_light.svg"
                    className="btn btn-black flex items-center justify-center min-h-[45px]! sm:min-h-[54px]! min-w-[90px]! sm:min-w-[111px]! gap-2 text-sm sm:text-base"
                  >
                    <Download width={18} />
                    SVG
                  </Link>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <div className="border border-[#5E5E5E] w-full sm:w-48 md:w-64 lg:w-[320px] xl:w-[407px] h-40 sm:h-48 md:h-56 lg:h-[250px] xl:h-[291px] bg-white flex items-center justify-center rounded-2xl sm:mr-2">
                  <Image
                    src="/icons/logo/logo_pink_without_bg.png"
                    alt="shield"
                    style={{ objectFit: 'contain' }}
                    height={90}
                    width={300}
                    quality={100}
                    className="w-[150px] sm:w-[200px] md:w-[250px] lg:w-[300px]"
                  />
                </div>

                <div className="flex flex-row sm:flex-col gap-2 mt-2 sm:mt-0">
                  <Link
                    href="/icons/logo/logo_pink_without_bg.svg"
                    download="logo_pink_without_bg.svg"
                    className="btn btn-black flex items-center justify-center min-h-[45px]! sm:min-h-[54px]! min-w-[90px]! sm:min-w-[111px]! gap-2 text-sm sm:text-base"
                  >
                    <Download width={18} />
                    PNG
                  </Link>

                  <Link
                    href="/icons/logo/logo_pink_without_bg.png"
                    download="logo_pink_without_bg.png"
                    className="btn btn-black flex items-center justify-center min-h-[45px]! sm:min-h-[54px]! min-w-[90px]! sm:min-w-[111px]! gap-2 text-sm sm:text-base"
                  >
                    <Download width={18} />
                    SVG
                  </Link>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <div className="border border-[#5E5E5E] w-full sm:w-48 md:w-64 lg:w-[320px] xl:w-[407px] h-40 sm:h-48 md:h-56 lg:h-[250px] xl:h-[291px] bg-white flex items-center justify-center rounded-2xl sm:mr-2">
                  <Image
                    src="/icons/logo/logo_pink_with_bg.png"
                    alt="shield"
                    style={{ objectFit: 'contain' }}
                    height={90}
                    width={300}
                    quality={100}
                    className="w-[150px] sm:w-[200px] md:w-[250px] lg:w-[300px]"
                  />
                </div>

                <div className="flex flex-row sm:flex-col gap-2 mt-2 sm:mt-0">
                  <Link
                    href="/icons/logo/logo_pink_with_bg.png"
                    download="logo_pink_with_bg.png"
                    className="btn btn-black flex items-center justify-center min-h-[45px]! sm:min-h-[54px]! min-w-[90px]! sm:min-w-[111px]! gap-2 text-sm sm:text-base"
                  >
                    <Download width={18} />
                    PNG
                  </Link>

                  <Link
                    href="/icons/logo/logo_pink_with_bg.svg"
                    download="logo_pink_with_bg.svg"
                    className="btn btn-black flex items-center justify-center min-h-[45px]! sm:min-h-[54px]! min-w-[90px]! sm:min-w-[111px]! gap-2 text-sm sm:text-base"
                  >
                    <Download width={18} />
                    SVG
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          <div className="flex flex-col gap-4">
            <h3 className="font-medium text-lg md:text-[28px]">Clearspace</h3>
            <p className="text-[#5F5C5C] text-sm md:text-xl">
              To keep the Red Sentinel mark sharp, readable, and unmistakably ours, maintain a
              protective zone around the logo.This space must remain free of text, images, or any
              competing visual elements ensuring the emblem stands strong, focused, and unobstructed
              in every environment.
            </p>

            <div>
              <Image
                src="/icons/logo/logo_clearspace.png"
                width={499}
                height={147}
                alt="logo clearspace demonstration"
                className="w-full max-w-[499px]"
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="font-medium text-lg md:text-[28px]">Logo Misuse</h3>
            <p className="text-[#5F5C5C] text-sm md:text-xl">
              To maintain consistency in the logo usage, do not do any of the following with the
              logo:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
              <div className="h-full flex flex-col">
                <div className="mb-2 bg-white rounded-xl border border-[#5E5E5E] overflow-hidden">
                  <Image
                    src="/icons/logo/logo_distorted_pink.png"
                    width={200}
                    height={109}
                    alt="logo clearspace demonstration"
                    className="w-full"
                  />
                </div>
                <p className="text-sm text-[#5F5C5C]">
                  Do not stretch or deform the logo, modify spacing or elements.
                </p>
              </div>

              <div className="h-full flex flex-col">
                <div className="mb-2 bg-white rounded-xl border border-[#5E5E5E] overflow-hidden">
                  <Image
                    src="/icons/logo/logo_distorted_black.png"
                    width={200}
                    height={109}
                    alt="logo clearspace demonstration"
                    className="w-full"
                  />
                </div>
                <p className="text-sm text-[#5F5C5C]">
                  Do not rotate or change the logo orientation.
                </p>
              </div>

              <div className="h-full flex flex-col">
                <div className="mb-2 bg-white rounded-xl border border-[#5E5E5E] overflow-hidden">
                  <Image
                    src="/icons/logo/logo_distorted_blue.png"
                    width={200}
                    height={109}
                    alt="logo clearspace demonstration"
                    className="w-full"
                  />
                </div>
                <p className="text-sm text-[#5F5C5C]">
                  Do not use unapproved colors or add drop shadows.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 md:mt-32">
          <h3 className="font-medium text-lg md:text-[28px] mb-4">Base Colors</h3>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            <div>
              <div className="rounded-xl h-full overflow-hidden shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
                <div className="bg-black min-h-40"></div>
                <div className="px-4 py-2">
                  <h4 className="text-md md:text-xl">Black</h4>
                  <p className="text-sm md:text-base text-[#5F5C5C]">#000000</p>
                </div>
              </div>
            </div>

            <div>
              <div className="rounded-xl h-full overflow-hidden shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
                <div className="bg-white min-h-40"></div>
                <div className="px-4 py-2">
                  <h4 className="text-md md:text-xl">White</h4>
                  <p className="text-sm md:text-base text-[#5F5C5C]">#FFFFFF</p>
                </div>
              </div>
            </div>

            <div>
              <div className="rounded-xl h-full overflow-hidden shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
                <div className="bg-[#EAEAEA] min-h-40"></div>
                <div className="px-4 py-2">
                  <h4 className="text-md md:text-xl">Grey</h4>
                  <p className="text-sm md:text-base text-[#5F5C5C]">#EAEAEA</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 md:mt-12">
          <h3 className="font-medium text-lg md:text-[28px] mb-4">Primary Brand Colors</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="rounded-xl h-full overflow-hidden shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
                <div className="bg-[#F445AB] min-h-40"></div>
                <div className="px-4 py-2">
                  <h4 className="text-md md:text-xl">Sentinel Pink</h4>
                  <p className="text-sm md:text-base text-[#5F5C5C]">#F445AB</p>
                </div>
              </div>
            </div>

            <div>
              <div className="rounded-xl h-full overflow-hidden shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
                <div className="bg-[#A06BFF] min-h-40"></div>
                <div className="px-4 py-2">
                  <h4 className="text-md md:text-xl">Sentinel Pulse</h4>
                  <p className="text-sm md:text-base text-[#5F5C5C]">#A06BFF</p>
                </div>
              </div>
            </div>

            <div>
              <div className="rounded-xl h-full overflow-hidden shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
                <div className="bg-[#A5DBFD] min-h-40"></div>
                <div className="px-4 py-2">
                  <h4 className="text-md md:text-xl">Sentinel Blue</h4>
                  <p className="text-sm md:text-base text-[#5F5C5C]">#A5DBFD</p>
                </div>
              </div>
            </div>

            <div>
              <div className="rounded-xl h-full overflow-hidden shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
                <div className="bg-[#9AFFC0] min-h-40"></div>
                <div className="px-4 py-2">
                  <h4 className="text-md md:text-xl">Sentinel Mint</h4>
                  <p className="text-sm md:text-base text-[#5F5C5C]">#9AFFC0</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 md:gap-12 items-start">
          <div>
            <h3 className="text-[#5F5C5C] text-lg md:text-xl mb-2">Font family</h3>
            <p className="text-2xl md:text-[36px] font-medium">Satoshi</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:gap-12 pl-0 md:pl-8 lg:pl-16 py-2">
            <div className="grid grid-cols-3 gap-4 md:gap-8">
              <div>
                <p className="text-xl md:text-2xl lg:text-[36px] mb-2">Aa</p>
                <p className="text-sm md:text-base lg:text-xl">Medium</p>
              </div>
              <div>
                <p className="text-xl md:text-2xl lg:text-[36px] mb-2 italic font-medium">Aa</p>
                <p className="text-sm md:text-base lg:text-xl">Medium Italic</p>
              </div>
              <div>
                <p className="text-xl md:text-2xl lg:text-[36px] mb-2 font-normal">Aa</p>
                <p className="text-sm md:text-base lg:text-xl">Regular</p>
              </div>
            </div>

            <div className="flex justify-start md:justify-end">
              <div className="text-xs sm:text-sm md:text-base lg:text-xl space-y-1 font-medium break-all">
                <p>ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
                <p>abcdefghijklmnopqrstuvwxyz</p>
                <p>0123456789 !@#$%^&*()</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
