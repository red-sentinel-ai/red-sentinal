'use client'

import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas'

export default function RiveCard() {
  const { RiveComponent } = useRive({
    src: '/animations/card.riv',
    autoplay: true,
    animations: ['Loop'],
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
