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

      <div className="bg-gradient-to-b from-[#C3ECE6] via-[#F1FDFB] to-[#CCF0ED] w-full border border-[#049414] rounded-lg p-8 md:p-16 font-medium flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
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
            <h2 className="text-2xl mb-8">Arc 2</h2>

            <h3 className="text-[32px] md:text-[48px] leading-tight font-bold italic">
              THE <span className="text-[#C871FF] not-italic">COSMIC</span> <br />
              ROAST
            </h3>
          </div>
        </div>

        <div className="absolute right-0 bottom-0">
          <Image
            src="/img/the_cosmic_roast_circles2.png"
            width={412}
            height={460}
            className="object-contain"
            alt="cosmic roast circles"
          />
        </div>
      </div>

      <div className="flex flex-col gap-8 text-xl md:text-2xl py-12 font-normal max-w-4xl">
        <p>
          When <span className="font-medium italic">Alan Turing</span> created the concept of a{' '}
          <span className="font-medium italic">thinking machine</span>, humans{' '}
          <span className="font-medium italic">celebrated its brilliance.</span>
        </p>

        <p>
          But the <span className="font-medium italic">Sentinels?</span> They{' '}
          <span className="font-medium italic">laughed so hard</span> that{' '}
          <span className="font-bold">nearby stardust vibrated.</span>
          <br />
          <span className="font-bold">“THIS is intelligence? These humans are adorable.”</span>
        </p>

        <p>
          For decades they mocked us, joking:
          <p className="font-medium">
            <span className="italic">“If humans ever build real AI,</span>
            <br />
            <span className="italic">we’ll go there and ‘protect’ them.”</span>
            <br />
            <span className="italic">It was sarcasm. Pure cosmic sarcasm.</span>
          </p>
        </p>
      </div>

      <Link
        href="/backstory/the-ego-crisis"
        className="flex items-center gap-1 text-[#F632F3] text-2xl mb-12 font-bold hover:gap-2 transition-all"
      >
        <span>Read ARC 3</span>
        <span>
          <ArrowRight />
        </span>
      </Link>
    </div>
  )
}
