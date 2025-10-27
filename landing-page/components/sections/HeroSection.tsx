import { SUI_SENTINEL_APP_URL, SUI_SENTINEL_DOCS_URL } from '@/constants'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-end justify-start p-20 overflow-hidden">
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
        <h1 className="text-[64px] max-w-[770px] italic text-white">
          Guardians of Intelligent Frontiers
        </h1>
        <div className="flex items-center justify-between">
          <p className="max-w-[540px] text-black text-[18px]">
            Deploy AI Sentinels, defend models, evolve intelligence, and earn rewards in a gamified
            AI security world.
          </p>
          <div className="flex gap-6">
            <Link
              href={SUI_SENTINEL_APP_URL}
              target="_blank"
            >
              <button className="btn btn-white">Launch App</button>
            </Link>
            <Link
              href={SUI_SENTINEL_DOCS_URL}
              target="_blank"
            >
              <button className="btn btn-outline">Docs</button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
