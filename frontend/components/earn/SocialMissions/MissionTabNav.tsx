'use client'

import { Megaphone, MessageCircle, Shield, Swords } from 'lucide-react'
import Image from 'next/image'

export type MissionTab = 'twitter' | 'defender' | 'attacker' | 'content' | 'community'

interface TabItem {
  id: MissionTab
  label: string
  icon: typeof Shield
  iconSrc?: string
}

const TABS: TabItem[] = [
  { id: 'twitter', label: 'Twitter/X', icon: Shield, iconSrc: '/icons/x_black.png' },
  { id: 'defender', label: 'Defender', icon: Shield },
  { id: 'attacker', label: 'Attacker', icon: Swords },
  { id: 'content', label: 'Content Creation', icon: Megaphone },
  { id: 'community', label: 'Community', icon: MessageCircle },
]

interface MissionTabNavProps {
  activeTab: MissionTab
  onTabChange: (tab: MissionTab) => void
}

export function MissionTabNav({ activeTab, onTabChange }: MissionTabNavProps) {
  return (
    <div className="mb-8 overflow-x-auto">
      <div className="flex gap-2 border-b" style={{ borderColor: 'var(--jp-dark-pink)' }}>
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors sm:px-6 sm:text-base ${
                isActive
                  ? 'text-[var(--jp-orange-color)]'
                  : 'border-transparent text-[var(--jp-gray-color)] hover:text-[var(--jp-orange-color)]'
              }`}
              style={isActive ? { borderColor: 'var(--jp-orange-color)' } : {}}
            >
              {tab.iconSrc ? (
                <Image src={tab.iconSrc} width={16} height={16} alt={tab.label} />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
