import { SUI_SENTINEL_APP_URL, SUI_SENTINEL_DOCS_URL } from '@/constants'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-end justify-start bg-cover bg-no-repeat bg-center p-20"
      style={{
        backgroundImage: "url('/img/mountains.png')",
      }}
    >
      <div className="w-full">
        <h1 className="text-[64px] max-w-[770px]">Guardians of Intelligent Frontiers</h1>

        <div className="flex items-center justify-between">
          <p className="max-w-[540px] text-black text-[18px]">
            Deploy AI Sentinels, defend models, and earn rewards in a gamified AI security world.
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
