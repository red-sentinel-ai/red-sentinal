'use client'

import Image from 'next/image'

interface JapaneseThemeBackgroundProps {
  children: React.ReactNode
  showCherry?: boolean
  showRedSun?: boolean
  showPinkCircle?: boolean
}

export function JapaneseThemeBackground({
  children,
  showCherry = true,
  // showRedSun = true,
  showPinkCircle = true,
}: JapaneseThemeBackgroundProps) {
  return (
    <div
      className="min-h-screen w-full overflow-x-hidden pb-safe pt-10"
      style={{
        fontFamily: '"Poppins", sans-serif',
        backgroundColor: 'var(--jp-bg-color)',
        position: 'relative',
      }}
    >
      {/* Red Sun Circle Decoration - Center */}
      {/* {showRedSun && (
        <div
          className="pointer-events-none absolute"
          style={{
            left: '50%',
            top: '300px',
            transform: 'translateX(-50%)',
            width: '350px',
            height: '350px',
            background: 'var(--jp-red-circle)',
            borderRadius: '50%',
            boxShadow: 'var(--jp-box-shadow)',
            zIndex: 0,
          }}
        />
      )} */}

      {/* Light Pink Circle - Left Side */}
      {showPinkCircle && (
        <div
          className="pointer-events-none absolute"
          style={{
            left: '-180px',
            top: '10%',
            width: '360px',
            height: '360px',
            borderRadius: '50%',
            backgroundColor: 'var(--jp-light-pink)',
            zIndex: 0,
          }}
        />
      )}

      {/* Cherry Blossom Image - Right Side */}
      {showCherry && (
        <div
          className="pointer-events-none absolute"
          style={{
            right: '-30px',
            top: '100px',
            width: '550px',
            zIndex: 0,
          }}
        >
          <Image
            src="/japenese-ui/cherry.png"
            alt="Cherry blossom decoration"
            width={550}
            height={550}
            className="object-contain"
            style={{ filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.1))', opacity: 0.9 }}
          />
        </div>
      )}

      {/* Content wrapper with z-index to appear above decorations */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
