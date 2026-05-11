import { SUI_SENTINEL_APP_URL, SUI_SENTINEL_DOCS_URL } from '@/constants'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center md:items-end md:justify-start p-6 md:p-20 overflow-hidden text-left border-b border-b-black">
      <div className="vertical-line left-4"></div>
      <div className="vertical-line right-4"></div>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
        aria-label="Mountain landscape background video"
      >
        <source src="/videos/coverVideo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="relative z-10 w-full">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] xl:text-[64px] max-w-[320px] sm:max-w-[550px] md:max-w-[700px] lg:max-w-[850px] italic text-white leading-[1.1] mx-auto md:mx-0">
          The Machines Are Already Lying
        </h1>
        <div className="mt-8 flex flex-col md:flex-row items-center md:items-end justify-between gap-10">
          <p className="max-w-[300px] sm:max-w-[450px] md:max-w-[600px] lg:max-w-[750px] text-black text-sm sm:text-base font-medium md:text-lg lg:text-[22px] mb-8 md:mb-32 mx-auto md:mx-0">
            Your money. Your data. Your decisions. All of it, handed to machines that hallucinate,
            manipulate, and self-preserve. The edge belongs to those who know exactly how they
            break. Attack live AI Sentinels. Compete for real bounties. Build verifiable proof
            on-chain.
          </p>
          <div className="flex gap-6 shrink-0 w-auto">
            <Link href={SUI_SENTINEL_APP_URL} target="_blank">
              <button className="px-6 btn font-bold btn-white shadow-v1">Enter the Arena</button>
            </Link>
            <Link href={SUI_SENTINEL_DOCS_URL} target="_blank">
              <button className="px-6 btn font-bold btn-outline-white backdrop-blur-md">
                How It Works
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
