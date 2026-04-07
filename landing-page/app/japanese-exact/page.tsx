'use client'

import { useState } from 'react'
import { JapaneseHeader, JapaneseSideMenu, JapaneseHero } from '@/app/components/JapaneseExact'
import '@/app/styles/japanese-exact.css'

export default function JapaneseExactPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="japanese-exact">
      {/* Remix Icons */}
      <link
        href="https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css"
        rel="stylesheet"
      />
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Poppins:wght@300;400;600&display=swap"
        rel="stylesheet"
      />

      <div className="japanese-exact-container">
        <JapaneseHeader onMenuClick={() => setIsMenuOpen(true)} />
        <JapaneseSideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        <JapaneseHero />
      </div>
    </div>
  )
}
