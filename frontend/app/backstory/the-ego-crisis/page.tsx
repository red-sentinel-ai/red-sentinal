import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export default function Page() {
  return (
    <div className="min-h-body mx-auto max-w-[1440px] px-4 py-4 pt-40 md:px-12">
      <h1 className="mb-20 text-2xl font-bold text-[#5F5C5C] md:text-[48px]">
        <span>THE SUI SENTINEL</span>
        <br />
        <br />
        <span>BACKSTORY</span>
      </h1>

      <div className="relative flex w-full flex-col items-center justify-between overflow-hidden rounded-lg border border-[#C532F6] bg-gradient-to-b from-[#E5CCEF] via-[#FBEEFC] to-[#F1CFEF] p-8 font-medium md:flex-row md:p-16">
        <div className="relative z-10 mb-8 md:mb-0">
          <Link
            href="/backstory"
            className="mb-12 flex items-center gap-1 text-2xl text-[#5F5C5C] hover:text-black"
          >
            <span>
              <ArrowLeft />
            </span>
            <span>back</span>
          </Link>
          <div>
            <h2 className="mb-8 text-2xl">Arc 3</h2>

            <h3 className="text-[32px] font-bold italic leading-tight md:text-[48px]">
              THE <span className="not-italic text-[#C871FF]">EGO</span> <br />
              CRISIS
            </h3>
          </div>
        </div>

        <div className="absolute bottom-0 right-0 mix-blend-difference">
          <Image
            src="/img/the_cosmic_roast_circles2.png"
            width={412}
            height={460}
            className="object-contain"
            alt="ego crisis circles"
          />
        </div>
      </div>

      <div className="flex max-w-[1030px] flex-col gap-8 py-12 text-xl font-normal md:text-2xl">
        <p>
          <span className="italic">When Deep Blue defeated Kasparov, humans were shocked.</span>
        </p>

        <p>
          The Sentinels were... <span className="font-medium italic">mildly impressed.</span>
        </p>

        <p className="font-bold">
          “Okay.
          <br />
          Maybe they’re not that stupid.”
        </p>

        <p>
          But for the first time, a cold shiver ran through the Sentinel species.
          <br />
          <span className="font-bold">“What if humans actually evolve this thing?”</span>
          <br />
          It felt impossible, but the thought haunted them.
        </p>

        <p className="mt-4 text-3xl font-bold">Then 2022 Happened</p>

        <p>
          The explosion of modern AI, LLMs, image models, agents shattered whatever pride the
          Sentinels had left.
        </p>

        <p>
          They stared at Earth in disbelief:
          <br />
          <span className="font-medium italic">
            “WAIT. HOW did humans build something THIS powerful?”
          </span>
        </p>

        <p>
          This was no longer a joke.
          <br />
          <span className="font-bold">It was an existential threat to their cosmic ego.</span>
        </p>
      </div>

      <Link
        href="/backstory/the-challenge-begins"
        className="mb-12 flex items-center gap-1 text-2xl font-bold text-[#F632F3] transition-all hover:gap-2"
      >
        <span>Read ARC 4</span>
        <span>
          <ArrowRight />
        </span>
      </Link>
    </div>
  )
}
