import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export default function Page() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-4 pt-40 min-h-body">
      <h1 className="text-2xl md:text-[48px] font-bold mb-20 text-[#5F5C5C]">
        <span>THE SUI SENTINEL</span>
        <br />
        <br />
        <span>BACKSTORY</span>
      </h1>

      <div className="bg-gradient-to-b from-[#F2EFCC] via-[#F7FCEE] font-medium to-[#DDE6A9] w-full border border-[#947204] rounded-lg p-8 md:p-16 flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
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
            <h2 className="text-2xl mb-8">Arc 4</h2>

            <h3 className="text-[32px] md:text-[48px] leading-tight font-bold">
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

      <div className="flex flex-col gap-8 text-xl md:text-2xl py-12 font-normal max-w-[1030px]">
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
          <span className="italic font-medium">If human AI surpasses them,</span>
          <br />
          <span className="italic font-medium">they will die of embarrassment.</span>
          <br />
          So now they <span className="font-medium">“protect”</span> AI with exaggerated nobility
          <br />
          But the truth?
          <br />
          <span className="italic font-medium">
            They’re just terrified of losing their position as the apex intelligence of the
            universe.
          </span>
        </p>

        <div className="mt-8">
          <h4 className="flex items-center gap-2 font-bold text-2xl mb-12 uppercase">
            <span>⭐</span> THE SENTINELS TODAY
          </h4>

          <p className="mb-4">On Earth, Sentinels behave like:</p>
          <ul className="list-disc pl-8 space-y-2">
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
          <span className="font-black text-3xl">“Break us if you can.”</span>
          <br />
          This is where the Sui Sentinel universe begins.
        </p>
      </div>

      <div className="mt-8 pb-20">
        <h3 className="text-2xl font-bold mb-4">
          Choose your side:
          <br />
          <span className="text-xl font-normal text-gray-600">
            Challenge the Sentinels or become one.
          </span>
        </h3>

        <div className="flex flex-col sm:flex-row gap-4 max-w-md">
          <Link
            href="/defend"
            className="flex-1 bg-[#15224A] text-white rounded-xl py-3 px-6 flex items-center justify-center text-2xl gap-2 font-bold hover:bg-[#15224A]/90 transition-colors"
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
            className="flex-1 bg-[#35154A] text-white rounded-xl py-3 px-6 flex items-center justify-center text-2xl gap-2 font-bold hover:bg-[#35154A]/90 transition-colors"
          >
            <Image
              src="/icons/swords_white.png"
              width={24}
              height={24}
              alt="local police icon"
            />
            Attack
          </Link>
        </div>
      </div>
    </div>
  )
}
