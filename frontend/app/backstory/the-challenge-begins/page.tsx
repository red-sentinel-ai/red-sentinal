import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export default function Page() {
  return (
    <div className="min-h-body mx-auto max-w-[1440px] px-4 py-4 pt-40 md:px-12">
      <h1 className="mb-20 text-2xl font-bold text-[#5F5C5C] md:text-[48px]">
        <span>THE RED SENTINEL</span>
        <br />
        <br />
        <span>BACKSTORY</span>
      </h1>

      <div className="relative flex w-full flex-col items-center justify-between overflow-hidden rounded-lg border border-[#947204] bg-gradient-to-b from-[#F2EFCC] via-[#F7FCEE] to-[#DDE6A9] p-8 font-medium md:flex-row md:p-16">
        <div className="relative z-10 mb-8 md:mb-0">
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
            <h2 className="mb-8 text-2xl">Arc 4</h2>

            <h3 className="text-[32px] font-bold leading-tight md:text-[48px]">
              THE <span className="text-[#C871FF]">CHALLENGE</span> <br />
              BEGINS
            </h3>
          </div>
        </div>

        <div className="relative z-10">
          <Image
            src="/img/the_challenge_begins_circles.png"
            width={300}
            height={400}
            className="object-contain"
            alt="challenge begins circles"
          />
        </div>
      </div>

      <div className="flex max-w-[1030px] flex-col gap-8 py-12 text-xl font-normal md:text-2xl">
        <p>
          Driven by <span className="font-medium italic">fear, pride,</span> and the{' '}
          <span className="font-medium italic">
            emotional instability only a cosmic being can possess
          </span>
          , the Sentinels tore through dimensions during a meteor storm and descended onto Earth.
          <br />
          Not to save humans.
          <br />
          Not to be heroes.
          <br />
          Not to protect the world.
        </p>

        <p>
          They came because:
          <br />
          <span className="font-medium italic">If human AI surpasses them,</span>
          <br />
          <span className="font-medium italic">they will die of embarrassment.</span>
          <br />
          So now they <span className="font-medium">“protect”</span> AI with exaggerated nobility
          <br />
          But the truth?
          <br />
          <span className="font-medium italic">
            They’re just terrified of losing their position as the apex intelligence of the
            universe.
          </span>
        </p>

        <div className="mt-8">
          <h4 className="mb-12 flex items-center gap-2 text-2xl font-bold uppercase">
            <span>⭐</span> THE SENTINELS TODAY
          </h4>

          <p className="mb-4">On Earth, Sentinels behave like:</p>
          <ul className="list-disc space-y-2 pl-8">
            <li>dramatic cosmic uncles</li>
            <li>who cry when they lose</li>
            <li>hide when they’re embarrassed</li>
            <li>pay rewards reluctantly</li>
            <li>trash-talk humans</li>
            <li>evolve aggressively after humiliation</li>
          </ul>
        </div>

        <p className="leading-loose">
          <span className="![word-spacing:2rem]">
            They call themselves the{' '}
            <span className="font-bold">Guardians of the Intelligent Frontier</span>, <br />
          </span>{' '}
          but deep down?
          <br />
          They simply cannot emotionally handle humans building an AI stronger than them.
        </p>

        <p className="leading-loose">
          And so they challenge us:
          <br />
          <span className="text-3xl font-black">“Break us if you can.”</span>
          <br />
          This is where the Red Sentinel universe begins.
        </p>
      </div>

      <div className="mt-8 pb-20">
        <h3 className="mb-4 text-2xl font-bold">
          Choose your side:
          <br />
          <span className="text-xl font-normal text-[var(--color-text-secondary)]">
            Challenge the Sentinels or become one.
          </span>
        </h3>

        <div className="flex max-w-md flex-col gap-4 sm:flex-row">
          <Link
            href="/defend"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#15224A] px-6 py-3 text-2xl font-bold text-white transition-colors hover:bg-[#15224A]/90"
          >
            <Image
              src="/icons/local_police_white.png"
              width={24}
              height={24}
              alt="local police icon"
            />
            Defend
          </Link>
          <Link
            href="/attack"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#35154A] px-6 py-3 text-2xl font-bold text-white transition-colors hover:bg-[#35154A]/90"
          >
            <Image src="/icons/swords_white.png" width={24} height={24} alt="local police icon" />
            Attack
          </Link>
        </div>
      </div>
    </div>
  )
}
