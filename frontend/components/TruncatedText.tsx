'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface TruncatedTextProps {
  text: string
  limit?: number
}

export const TruncatedText = ({ text, limit = 200 }: TruncatedTextProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!text) return null

  if (text.length <= limit) {
    return <p className="mt-1 pr-2 text-sm leading-relaxed text-[#575757]">{text}</p>
  }

  return (
    <div className="mt-1 pr-2">
      <div
        className={cn(
          'text-sm leading-relaxed text-[#575757] transition-all',
          isExpanded && 'max-h-[150px] overflow-y-auto'
        )}
      >
        {isExpanded ? text : `${text.slice(0, limit)}...`}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsExpanded(!isExpanded)
        }}
        className="mt-1 text-xs font-medium text-[#989898] underline decoration-1 underline-offset-2 hover:text-black"
      >
        {isExpanded ? 'Read Less' : 'Read More'}
      </button>
    </div>
  )
}
