import Image from 'next/image'

export default function BackStory() {
  return (
    <div className="container mx-auto px-4 py-4 pt-24 min-h-body leading-loose">
      <h1 className="text-2xl md:text-[48px] font-bold mb-20">
        <span>THE SUI SENTINEL</span>
        <br />
        <br />
        <span className="text-[#C871FF]">BACKSTORY</span>
      </h1>

      <div className="grid grid-cols-4">
        <div className="bg-gradient-to-b from-[#F6BCE1] via-[#FFFFFF] to-[#FCC3E2] border border-[#F632F3] rounded-lg min-h-[484px] flex items-end relative px-4 py-6">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-[276px]">
            <Image
              src="/img/the_awaking_circles.png"
              width={276}
              height={252}
              alt="the awaking circles "
            />
          </div>

          <div className="flex justify-between w-full items-end">
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
      </div>
    </div>
  )
}
