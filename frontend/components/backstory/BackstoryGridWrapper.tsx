'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '../../lib/utils'

type StoryItem = {
  id: string
  arcLabel: string
  title: string
  image: string
  imgWidth: number
  imgHeight: number
  activeGradient: string
  borderColor: string
  imgClass: string
  link: string
}

export function BackstoryGridWrapper({ stories }: { stories: StoryItem[] }) {
  const [visitedArcs, setVisitedArcs] = useState<string[]>([])
  const [hoveredArc, setHoveredArc] = useState<string | null>(null)

  // Use state to track hydration to prevent hydration mismatch with sessionStorage
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
    // Using sessionStorage as requested
    const stored = sessionStorage.getItem('visited_backstory_arcs')
    if (stored) {
      setVisitedArcs(JSON.parse(stored))
    }
  }, [])

  const handleCardClick = (id: string) => {
    if (!visitedArcs.includes(id)) {
      const updated = [...visitedArcs, id]
      setVisitedArcs(updated)
      sessionStorage.setItem('visited_backstory_arcs', JSON.stringify(updated))
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stories.map((story, index) => {
        const isFirstCard = index === 0

        const isVisited = hasMounted ? visitedArcs.includes(story.id) : false
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
                priority={index < 2}
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
  )
}
