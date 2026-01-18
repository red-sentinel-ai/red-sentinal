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

      <div className="relative flex w-full flex-col items-center justify-between overflow-hidden rounded-lg border border-[#049414] bg-gradient-to-b from-[#C3ECE6] via-[#F1FDFB] to-[#CCF0ED] p-8 font-medium md:flex-row md:p-16">
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
            <h2 className="mb-8 text-2xl">Arc 2</h2>

            <h3 className="text-[32px] font-bold italic leading-tight md:text-[48px]">
              THE <span className="not-italic text-[#C871FF]">COSMIC</span> <br />
              ROAST
            </h3>
          </div>
        </div>

        <div className="absolute bottom-0 right-0">
          <Image
            src="/img/the_cosmic_roast_circles2.png"
            width={412}
            height={460}
            className="object-contain"
            alt="cosmic roast circles"
          />
        </div>
      </div>

      <div className="flex max-w-[1030px] flex-col gap-8 py-12 text-xl font-normal md:text-2xl">
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

        <div>
          For decades they mocked us, joking:
          <p className="font-medium">
            <span className="italic">“If humans ever build real AI,</span>
            <br />
            <span className="italic">we’ll go there and ‘protect’ them.”</span>
            <br />
            <span className="italic">It was sarcasm. Pure cosmic sarcasm.</span>
          </p>
        </div>
      </div>

      <Link
        href="/backstory/the-ego-crisis"
        className="mb-12 flex items-center gap-1 text-2xl font-bold text-[#F632F3] transition-all hover:gap-2"
      >
        <span>Read ARC 3</span>
        <span>
          <ArrowRight />
        </span>
      </Link>
    </div>
  )
}
