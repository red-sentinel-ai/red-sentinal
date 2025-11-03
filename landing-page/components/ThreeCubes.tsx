'use client'

import dynamic from 'next/dynamic'

const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] lg:h-[700px] flex items-center justify-center">
      Loading 3D model...
    </div>
  ),
})

export function ThreeCubes() {
  return (
    <div className="w-full h-full lg:aspect-auto aspect-square">
      <Spline scene="https://prod.spline.design/DCh49JA7nfSYvaQn/scene.splinecode" />
    </div>
  )
}
