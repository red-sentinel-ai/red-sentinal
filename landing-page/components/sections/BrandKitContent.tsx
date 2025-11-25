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

      <div className="grid grid-cols-2 py-12 px-12">
        <div>
          <h2 className="text-lg md:text-[28px] font-medium mb-6">Logo</h2>

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
        </div>
        <div>
          <div className="flex justify-end">
            <button className="btn btn-outline font-medium text-base">Download logo KIT</button>
          </div>
        </div>
      </div>
    </section>
  )
}
