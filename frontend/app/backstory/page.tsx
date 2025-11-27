'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const STORIES = [
  {
    id: 'arc-1',
    arcLabel: 'Arc 1',
    title: 'The Awakening',
    image: '/img/the_awaking_circles.png',
    imgWidth: 276,
    imgHeight: 252,
    activeGradient: 'bg-gradient-to-b from-[#F6BCE1] via-[#FFFFFF] to-[#FCC3E2]',
    borderColor: 'border-[#F632F3]',
    imgClass: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    link: '/backstory/the-awakening',
  },
  {
    id: 'arc-2',
    arcLabel: 'Arc 2',
    title: 'The Cosmic Roast',
    image: '/img/the_cosmic_roast_circles.png',
    imgWidth: 644,
    imgHeight: 854,
    activeGradient: 'bg-gradient-to-b from-[#C3ECE6] via-[#F1FDFB] to-[#CCF0ED]',
    borderColor: 'border-[#049414]',
    imgClass: 'top-0 left-1/2 -translate-x-1/2 w-full',
    link: '/backstory/the-cosmic-roast',
  },
  {
    id: 'arc-3',
    arcLabel: 'Arc 3',
    title: 'The Ego Crisis',
    image: '/img/the_ego_crisis_circles.png',
    imgWidth: 644,
    imgHeight: 854,
    activeGradient: 'bg-gradient-to-b from-[#E5CCEF] via-[#FBEEFC] to-[#F1CFEF]',
    borderColor: 'border-[#C532F6]',
    imgClass: 'top-0 left-1/2 -translate-x-1/2 w-full mix-blend-difference',
    link: '/backstory/the-ego-crisis',
  },
  {
    id: 'arc-4',
    arcLabel: 'Arc 4',
    title: 'The Challenge Begins',
    image: '/img/the_challenge_begins_circles.png',
    imgWidth: 644,
    imgHeight: 854,
    activeGradient: 'bg-gradient-to-b from-[#F2EFCC] via-[#F7FCEE] to-[#DDE6A9]',
    borderColor: 'border-[#947204]',
    imgClass: 'top-0 -left-4 w-full',
    link: '/backstory/the-challenge-begins',
  },
]

export default function BackStory() {
  const [visitedArcs, setVisitedArcs] = useState<string[]>([])
  const [hoveredArc, setHoveredArc] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('visited_backstory_arcs')
    if (stored) {
      setVisitedArcs(JSON.parse(stored))
    }
  }, [])

  const handleCardClick = (id: string) => {
    if (!visitedArcs.includes(id)) {
      const updated = [...visitedArcs, id]
      setVisitedArcs(updated)
      localStorage.setItem('visited_backstory_arcs', JSON.stringify(updated))
    }
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-4 pt-24 min-h-body leading-loose">
      <h1 className="text-2xl md:text-[48px] font-bold mb-20">
        <span>THE SUI SENTINEL</span>
        <br />
        <br />
        <span className="text-[#C871FF]">BACKSTORY</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STORIES.map((story, index) => {
          const isFirstCard = index === 0
          const isVisited = visitedArcs.includes(story.id)
          const isHovered = hoveredArc === story.id
          const isActive = isVisited || isHovered

          let backgroundClass = ''
          let grayscaleClass = ''
          let textColorClass = ''

          if (isActive) {
            backgroundClass = story.activeGradient
            grayscaleClass = 'grayscale-0'
            textColorClass = 'text-black'
          } else {
            textColorClass = 'text-[#5F5C5C]'

            if (isFirstCard) {
              backgroundClass = 'special-gray-gradient'
              grayscaleClass = 'grayscale-0'
            } else {
              backgroundClass = story.activeGradient
              grayscaleClass = 'grayscale'
            }
          }

          return (
            <Link
              key={story.id}
              href={story.link}
              onClick={() => handleCardClick(story.id)}
              onMouseEnter={() => setHoveredArc(story.id)}
              onMouseLeave={() => setHoveredArc(null)}
              className={cn(
                'relative rounded-lg min-h-[480px] flex items-end border transition-all duration-500 ease-in-out overflow-hidden group cursor-pointer',
                story.borderColor,
                backgroundClass,
                grayscaleClass,
                !isFirstCard && !isActive && 'grayscale'
              )}
            >
              <div className={cn('absolute min-w-[276px] transition-opacity', story.imgClass)}>
                <Image
                  src={story.image}
                  width={story.imgWidth}
                  height={story.imgHeight}
                  alt={`${story.title} illustration`}
                  className="object-contain"
                />
              </div>

              <div
                className={cn(
                  'flex justify-between w-full items-end px-4 py-6 relative z-10 transition-colors duration-300',
                  textColorClass
                )}
              >
                <div>
                  <h2 className="text-base font-medium">{story.arcLabel}</h2>
                  <h3 className="font-bold text-2xl">{story.title}</h3>
                </div>

                <div className="transition-transform duration-300 group-hover:translate-x-1">
                  <Image
                    src="/icons/arrow_right.png"
                    width={45}
                    height={24}
                    alt="arrow right"
                    className={cn(
                      'transition-all duration-300',
                      !isActive ? 'opacity-60 contrast-50' : 'opacity-100 contrast-100'
                    )}
                  />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
