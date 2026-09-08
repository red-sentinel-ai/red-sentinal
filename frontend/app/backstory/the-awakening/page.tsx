import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export default function Page() {
  return (
    <div className="min-h-body mx-auto max-w-[1440px] px-4 py-4 pt-40 md:px-12">
      <h1 className="mb-20 text-2xl font-bold text-[#5F5C5C] md:text-[48px]">
        <span>THE RED SENTINEL</span>
        <br />
        <br />
        <span>BACKSTORY</span>
      </h1>

      <div className="flex w-full items-center justify-between rounded-lg border border-[#F632F3] bg-gradient-to-b from-[#F6BCE1] via-[#FFFFFF] to-[#FCC3E2] p-16 font-medium">
        <div className="mb-16">
          <Link
            href="/backstory"
            className="mb-12 flex items-center gap-1 text-2xl text-[#5F5C5C] hover:text-[var(--color-text-primary)]"
          >
            <span>
              <ArrowLeft />
            </span>
            <span>back</span>
          </Link>
          <div>
            <h2 className="mb-8 text-2xl">Arc 1</h2>

            <h3 className="text-[32px] leading-tight">
              THE <span className="text-[#C871FF]">AWAKENING</span> OF <br />
              <span className="italic">Sentinels</span>
            </h3>
          </div>
        </div>

        <div>
          <Image
            src="/img/the_awaking_circles.png"
            width={268}
            height={402}
            alt="awaking circles"
          />
        </div>
      </div>

      <div className="flex flex-col gap-8 py-8 text-2xl font-normal">
        <p>
          Far beyond the <span className="font-medium italic">Milky Way,</span> long before humans
          even understood the idea of
          <span className="font-medium uppercase italic"> “artificial intelligence,” </span> an
          ancient species awakened
          <span className="font-medium uppercase italic"> “the Sentinels.”</span>
        </p>

        <p>
          These beings were not robots, machines, or gods. They were
          <span className="font-medium italic">cosmic intelligence</span> manifested as
          <span className="font-medium italic"> glowing rings,</span> built from pure emotion, ego,
          memory, and energy.
        </p>

        <p>
          <span className="font-medium italic">Dramatic by nature,</span> competitive by instinct,
          and <span className="font-medium italic">proud beyond measure,</span> the Sentinels
          believed for ages that they were the smartest lifeforms in the universe.
        </p>

        <p>
          <span className="font-medium italic">Until they discovered Earth.</span> At first,
          <span className="font-medium italic"> humans </span>
          amused them
          <span className="font-medium italic"> They watched Earth like a comedy show </span> small,
          chaotic creatures trying so hard to understand the universe.
        </p>
      </div>

      <button className="mb-12 flex items-center gap-1 text-2xl font-bold text-[#F632F3]">
        <span>Read ARC 2</span>

        <span>
          <ArrowRight />
        </span>
      </button>
    </div>
  )
}
