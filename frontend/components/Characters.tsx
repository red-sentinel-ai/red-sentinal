'use client'

import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas'

export default function Characters() {
  const { RiveComponent } = useRive({
    src: '/animations/characters3.riv',
    // autoplay: true,
    // animations: ['Img 3'],
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
  })

  return (
    <div className="h-body">
      <div className="h-[700px] w-full">
        <RiveComponent />
      </div>
    </div>
  )
}
