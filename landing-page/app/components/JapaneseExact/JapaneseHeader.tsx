'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface JapaneseHeaderProps {
  onMenuClick: () => void
}

export function JapaneseHeader({ onMenuClick }: JapaneseHeaderProps) {
  return (
    <motion.header
      className="japanese-exact-header"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="logo">
        
      </div>

      <nav className="japanese-exact-nav">
        <a href="#">Home</a>
        <a href="#">About</a>
        <a href="#">Blog</a>
        <a href="#">News</a>
        <button
          className="japanese-exact-menu-icon"
          onClick={onMenuClick}
          aria-label="Menu"
        >
          <i className="ri-menu-3-line"></i>
        </button>
      </nav>
    </motion.header>
  )
}
