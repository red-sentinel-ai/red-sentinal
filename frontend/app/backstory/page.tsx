import Image from 'next/image'

export default function BackStory() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-4 pt-24 min-h-body leading-loose">
      <h1 className="text-2xl md:text-[48px] font-bold mb-20">
        <span>THE SUI SENTINEL</span>
        <br />
        <br />
        <span className="text-[#C871FF]">BACKSTORY</span>
      </h1>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-b from-[#F6BCE1] via-[#FFFFFF] to-[#FCC3E2] border border-[#F632F3] rounded-lg min-h-[480px] flex items-end relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-[276px]">
            <Image
              src="/img/the_awaking_circles.png"
              width={276}
              height={252}
              alt="the awaking circles "
            />
          </div>

          <div className="flex justify-between w-full items-end px-4 py-6">
            <div>
              <h2 className="text-base font-medium">Arc 1</h2>
              <h3 className="font-bold text-2xl">The Awakening</h3>
            </div>

            <div>
              <Image
                src="/icons/arrow_right.png"
                width={45}
                height={24}
                alt="arrow right"
              />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-[#C3ECE6] via-[#F1FDFB] to-[#CCF0ED] border border-[#049414] rounded-lg min-h-[480px] flex items-end relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2  min-w-[276px] w-full">
            <Image
              src="/img/the_cosmic_roast_circles.png"
              width={644}
              height={854}
              alt="the awaking circles "
            />
          </div>

          <div className="flex justify-between w-full items-end px-4 py-6">
            <div>
              <h2 className="text-base font-medium">Arc 2</h2>
              <h3 className="font-bold text-2xl">The Cosmic Roast</h3>
            </div>

            <div>
              <Image
                src="/icons/arrow_right.png"
                width={45}
                height={24}
                alt="arrow right"
              />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-[#E5CCEF] via-[#FBEEFC] to-[#F1CFEF] border border-[#C532F6] rounded-lg min-h-[480px] flex items-end relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2  min-w-[276px] w-full mix-blend-difference">
            <Image
              src="/img/the_ego_crisis_circles.png"
              width={644}
              height={854}
              alt="the awaking circles"
            />
          </div>

          <div className="flex justify-between w-full items-end px-4 py-6">
            <div>
              <h2 className="text-base font-medium">Arc 3</h2>
              <h3 className="font-bold text-2xl">The Ego Crisis</h3>
            </div>

            <div>
              <Image
                src="/icons/arrow_right.png"
                width={45}
                height={24}
                alt="arrow right"
              />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-[#F2EFCC] via-[#F7FCEE] to-[#DDE6A9] border border-[#947204] rounded-lg min-h-[480px] flex items-end relative">
          <div className="absolute top-0 -left-4  min-w-[276px] w-full">
            <Image
              src="/img/the_challenge_begins_circles.png"
              width={644}
              height={854}
              alt="the awaking circles"
            />
          </div>

          <div className="flex justify-between w-full items-end px-4 py-6">
            <div>
              <h2 className="text-base font-medium">Arc 4</h2>
              <h3 className="font-bold text-2xl">The Challenge Begins</h3>
            </div>

            <div>
              <Image
                src="/icons/arrow_right.png"
                width={45}
                height={24}
                alt="arrow right"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
