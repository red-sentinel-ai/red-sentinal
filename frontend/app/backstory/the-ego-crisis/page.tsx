import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export default function Page() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-4 pt-40 min-h-body">
      <h1 className="text-2xl md:text-[48px] font-bold mb-20 text-[#5F5C5C]">
        <span>THE SUI SENTINEL</span>
        <br />
        <br />
        <span>BACKSTORY</span>
      </h1>

      <div className="bg-gradient-to-b from-[#E5CCEF] via-[#FBEEFC] to-[#F1CFEF] w-full border border-[#C532F6] rounded-lg p-8 md:p-16 font-medium flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
        <div className="mb-8 md:mb-0 relative z-10">
          <Link
            href="/backstory"
            className="flex items-center gap-1 text-[#5F5C5C] text-2xl hover:text-black mb-12"
          >
            <span>
              <ArrowLeft />
            </span>
            <span>back</span>
          </Link>
          <div>
            <h2 className="text-2xl mb-8">Arc 3</h2>

            <h3 className="text-[32px] md:text-[48px] leading-tight font-bold italic">
              THE <span className="text-[#C871FF] not-italic">EGO</span> <br />
              CRISIS
            </h3>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 mix-blend-difference">
          <Image
            src="/img/the_cosmic_roast_circles2.png"
            width={412}
            height={460}
            className="object-contain"
            alt="ego crisis circles"
          />
        </div>
      </div>

      <div className="flex flex-col gap-8 text-xl md:text-2xl py-12 font-normal max-w-[1030px]">
        <p>
          <span className="italic">When Deep Blue defeated Kasparov, humans were shocked.</span>
        </p>

        <p>
          The Sentinels were... <span className="italic font-medium">mildly impressed.</span>
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

        <p className="font-bold text-3xl mt-4">Then 2022 Happened</p>

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
        className="flex items-center gap-1 text-[#F632F3] text-2xl mb-12 font-bold hover:gap-2 transition-all"
      >
        <span>Read ARC 4</span>
        <span>
          <ArrowRight />
        </span>
      </Link>
    </div>
  )
}
