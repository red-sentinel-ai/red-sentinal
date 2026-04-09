'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, Target } from 'lucide-react'

interface NavItem {
  id: string
  label: string
  icon: typeof Lightbulb
}

const NAV_ITEMS: NavItem[] = [
  { id: 'how-it-works', label: 'How It Works', icon: Lightbulb },
  { id: 'missions', label: 'Missions', icon: Target },
]

export function StickyTabNav() {
  const [activeSection, setActiveSection] = useState('how-it-works')

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.3, rootMargin: '-100px 0px -66% 0px' }
    )

    NAV_ITEMS.forEach(item => {
      const element = document.getElementById(item.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const yOffset = -80 // Account for sticky nav height
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <nav className="sticky top-0 z-40 border-b backdrop-blur-sm" style={{ borderColor: 'var(--jp-dark-pink)', backgroundColor: 'rgba(254, 247, 247, 0.95)' }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-1 overflow-x-auto py-2 sm:gap-2">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const isActive = activeSection === item.id

            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`relative flex items-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:gap-2 sm:px-6 sm:text-base ${
                  isActive ? 'text-[var(--jp-orange-color)]' : 'text-[var(--jp-gray-color)] hover:text-[var(--jp-orange-color)]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.label.split(' ')[0]}</span>

                {isActive && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: 'var(--jp-orange-color)' }}
                    layoutId="activeTab"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
