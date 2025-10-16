'use client'

import { useEffect, useState } from 'react'

export function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-end justify-start bg-cover bg-no-repeat bg-center p-20"
      style={{
        backgroundImage: "url('/img/mountains.png')",
      }}
    >
      <div>
        <h1 className="text-[64px] max-w-[770px]">Guardians of Intelligent Frontiers</h1>

        <p className="max-w-[540px] text-black">
          Deploy AI Sentinels, defend models, and earn rewards in a gamified AI security world.
        </p>
      </div>
    </section>
  )
}
