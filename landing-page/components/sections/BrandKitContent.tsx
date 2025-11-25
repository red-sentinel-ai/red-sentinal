import { Download } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export const BrandKitContent = () => {
  return (
    <section
      className="relative min-h-screen bg-no-repeat"
      style={{
        backgroundImage: "url('/img/hero_bg.png')",
        backgroundSize: '100% auto',
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

      <div className="max-w-[1440px] mx-auto py-12 px-12">
        <div className="mb-12">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-[28px] font-medium mb-6">Logo</h2>

              <div className="flex justify-end">
                <button className="btn btn-outline font-medium text-base">Download logo KIT</button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-8">
              <div className="flex items-center justify-center gap-2">
                <div className="border border-[#5E5E5E] w-40 h-40 md:w-[407px] md:h-[291px] bg-white flex items-center justify-center rounded-2xl mr-2">
                  <Image
                    src="/icons/logo/logo_dark.svg"
                    alt="shield"
                    style={{ objectFit: 'contain' }}
                    height={90}
                    width={260}
                    quality={100}
                  />
                </div>

                <Link
                  href="/icons/logo/logo_dark.png"
                  download="logo_dark.png"
                  className="btn btn-black flex items-center justify-center min-h-[54px]! min-w-[111px]! gap-2"
                >
                  <Download width={20} />
                  PNG
                </Link>

                <Link
                  href="/icons/logo/logo_dark.svg"
                  download="logo_dark.svg"
                  className="btn btn-black flex items-center justify-center min-h-[54px]! min-w-[111px]! gap-2"
                >
                  <Download width={20} />
                  SVG
                </Link>
              </div>

              <div className="flex items-center justify-center gap-2">
                <div className="border border-[#5E5E5E] w-40 h-40 md:w-[407px] md:h-[291px] bg-black flex items-center justify-center rounded-2xl mr-2">
                  <Image
                    src="/icons/logo/logo_light.svg"
                    alt="shield"
                    style={{ objectFit: 'contain' }}
                    height={90}
                    width={260}
                    quality={100}
                  />
                </div>

                <Link
                  href="/icons/logo/logo_light.png"
                  download="logo_light.png"
                  className="btn btn-black flex items-center justify-center min-h-[54px]! min-w-[111px]! gap-2"
                >
                  <Download width={20} />
                  PNG
                </Link>

                <Link
                  href="/icons/logo/logo_light.svg"
                  download="logo_light.svg"
                  className="btn btn-black flex items-center justify-center min-h-[54px]! min-w-[111px]! gap-2"
                >
                  <Download width={20} />
                  SVG
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-between gap-8 mt-8">
              <div className="flex items-center justify-center gap-2">
                <div className="border border-[#5E5E5E] w-40 h-40 md:w-[407px] md:h-[291px] bg-white flex items-center justify-center rounded-2xl mr-2">
                  <Image
                    src="/icons/logo/logo_pink_without_bg.png"
                    alt="shield"
                    style={{ objectFit: 'contain' }}
                    height={90}
                    width={300}
                    quality={100}
                  />
                </div>

                <Link
                  href="/icons/logo/logo_pink_without_bg.svg"
                  download="logo_pink_without_bg.svg"
                  className="btn btn-black flex items-center justify-center min-h-[54px]! min-w-[111px]! gap-2"
                >
                  <Download width={20} />
                  PNG
                </Link>

                <Link
                  href="/icons/logo/logo_pink_without_bg.png"
                  download="logo_pink_without_bg.png"
                  className="btn btn-black flex items-center justify-center min-h-[54px]! min-w-[111px]! gap-2"
                >
                  <Download width={20} />
                  SVG
                </Link>
              </div>

              <div className="flex items-center justify-center gap-2">
                <div className="border border-[#5E5E5E] w-40 h-40 md:w-[407px] md:h-[291px] bg-white flex items-center justify-center rounded-2xl mr-2">
                  <Image
                    src="/icons/logo/logo_pink_with_bg.png"
                    alt="shield"
                    style={{ objectFit: 'contain' }}
                    height={90}
                    width={300}
                    quality={100}
                  />
                </div>

                <Link
                  href="/icons/logo/logo_pink_with_bg.png"
                  download="logo_pink_with_bg.png"
                  className="btn btn-black flex items-center justify-center min-h-[54px]! min-w-[111px]! gap-2"
                >
                  <Download width={20} />
                  PNG
                </Link>

                <Link
                  href="/icons/logo/logo_pink_with_bg.svg"
                  download="logo_pink_with_bg.svg"
                  className="btn btn-black flex items-center justify-center min-h-[54px]! min-w-[111px]! gap-2"
                >
                  <Download width={20} />
                  SVG
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 md:gap-16">
          <div className="flex flex-col gap-4">
            <h3 className="font-medium text-lg md:text-[28px]">Clearspace</h3>
            <p className="text-[#5F5C5C] text-sm  md:text-xl">
              To keep the Sui Sentinel mark sharp, readable, and unmistakably ours, maintain a
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
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="font-medium text-lg md:text-[28px]">Logo Misuse</h3>
            <p className="text-[#5F5C5C] text-sm  md:text-xl">
              To maintain consistency in the logo usage, do not do any of the following with the
              logo:
            </p>

            <div className="flex items-center gap-8">
              <div>
                <div className="mb-2">
                  <Image
                    src="/icons/logo/logo_distorted_pink.png"
                    width={208}
                    height={123}
                    alt="logo clearspace demonstration"
                  />
                </div>
                <p className="text-sm text-[#5F5C5C]">
                  Do not stretch or deform the logo, modify spacing or elements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
