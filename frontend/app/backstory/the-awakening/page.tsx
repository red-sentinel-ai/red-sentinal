import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'

export default function Page() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-4 pt-40 min-h-body">
      <h1 className="text-2xl md:text-[48px] font-bold mb-20 text-[#5F5C5C]">
        <span>THE SUI SENTINEL</span>
        <br />
        <br />
        <span>BACKSTORY</span>
      </h1>

      <div className="bg-gradient-to-b from-[#F6BCE1] via-[#FFFFFF] to-[#FCC3E2] w-full border border-[#F632F3] rounded-lg p-16  font-medium flex justify-between items-center">
        <div className="mb-16">
          <button className="flex items-center gap-1 text-[#5F5C5C] text-2xl hover:text-black mb-12">
            <span>
              <ArrowLeft />
            </span>
            <span>back</span>
          </button>
          <div>
            <h2 className="text-2xl mb-8">Arc 1</h2>

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
    </div>
  )
}
