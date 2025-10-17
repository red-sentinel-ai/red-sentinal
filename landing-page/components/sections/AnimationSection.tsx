import Image from 'next/image'

export const AnimationSection = () => {
  return (
    <div className="relative">
      <div className="relative z-10">
        <h2 className="text-[48px] py-24">
          Enterprise-Grade AI Audits. Stress-test your AI models with real-world attacks and
          actionable insights.
        </h2>
        <div className="flex gap-6">
          <button className="btn btn-black">Explore</button>
          <button className="btn btn-outline">Join Telegram</button>
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Image
          src="/gifs/circle1.gif"
          width={400}
          height={400}
          alt="circle 1 animation"
          unoptimized
        />
      </div>
    </div>
  )
}
