'use client'

import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas'

export default function RiveLoader() {
  const { RiveComponent } = useRive({
    src: '/animations/loader.riv',
    autoplay: true,
    animations: ['Timeline 1', 'Timeline 2', 'Timeline 3'],
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
  })

  return (
    <div className="h-body">
      <div className="w-[500px] h-[500px]">
        <RiveComponent />
      </div>
    </div>
  )
}
