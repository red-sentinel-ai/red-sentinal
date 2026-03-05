'use client'

import { Users, Megaphone, MessageCircle, UserPlus } from 'lucide-react'
import Image from 'next/image'

export type MissionTab = 'twitter' | 'content' | 'community' | 'referrals'

interface TabItem {
  id: MissionTab
  label: string
  icon: typeof Users
  iconSrc?: string
}

const TABS: TabItem[] = [
  { id: 'twitter', label: 'Twitter/X', icon: Users, iconSrc: '/icons/x_black.png' },
  { id: 'content', label: 'Content Creation', icon: Megaphone },
  { id: 'community', label: 'Community', icon: MessageCircle },
  { id: 'referrals', label: 'Referrals', icon: UserPlus },
]

interface MissionTabNavProps {
  activeTab: MissionTab
  onTabChange: (tab: MissionTab) => void
}

export function MissionTabNav({ activeTab, onTabChange }: MissionTabNavProps) {
  return (
    <div className="mb-8 overflow-x-auto">
      <div className="flex gap-2 border-b border-gray-200">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors sm:px-6 sm:text-base ${
                isActive
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
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
