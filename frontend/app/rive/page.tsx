'use client'

import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas'

export default function AvatarCustomizer() {
  const { RiveComponent, rive } = useRive({
    src: '/animations/rockstar.riv',
    autoplay: false,
    animations: ['Makeup: 4', 'Facial Features: 3', 'Blue Background'],
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
  })

  return (
    <div>
      <div className="w-full h-[500px]">
        <RiveComponent />
      </div>
      <div className="flex gap-2 mt-4">
        <button onClick={() => rive?.play('Pink Background')}>Pink Background</button>
        <button onClick={() => rive?.play('Blue Background')}>Blue Background</button>
        <button onClick={() => rive?.play('Green Background')}>Green Background</button>
        <button onClick={() => rive?.play('Colored Background Warp Loop')}>
          Animate Background
        </button>
      </div>
    </div>
  )
}
