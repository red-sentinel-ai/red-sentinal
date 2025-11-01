import { SUI_SENTINEL_APP_URL, SUI_SENTINEL_DOCS_URL } from '@/constants'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center md:items-end md:justify-start p-6 md:p-20 overflow-hidden text-center md:text-left">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
        aria-label="Mountain landscape background video"
      >
        <source
          src="/videos/coverVideo.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>

      <div className="relative z-10 w-full">
        <h1 className="text-4xl md:text-[64px] max-w-[770px] italic text-white leading-tight mx-auto md:mx-0">
          Guardians of Intelligent Frontiers
        </h1>
        <div className="mt-8 flex flex-col md:flex-row items-center md:items-end justify-between gap-10">
          <p className="max-w-[690px] text-black text-xl md:text-[24px] md:mb-32">
            Deploy AI Sentinels, defend models, evolve intelligence, and earn rewards in a gamified
            AI security world.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 shrink-0">
            <Link
              href={SUI_SENTINEL_APP_URL}
              target="_blank"
            >
              <button className="btn btn-white shadow-v1">Launch App</button>
            </Link>
            <Link
              href={SUI_SENTINEL_DOCS_URL}
              target="_blank"
            >
              <button className="btn btn-outline-white backdrop-blur-md">Docs</button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
