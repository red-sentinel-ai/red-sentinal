import Image from 'next/image'
import Link from 'next/link'
import { Clock, Shield, Zap } from 'lucide-react'
import { SUI_SENTINEL_DEFENDER_REWARDS_DOCS_URL } from '@/constants'

export const RewardsConditions = () => {
  return (
    <div className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-4 py-3.5 shadow-[var(--shadow-card)]">
      <h3 className="mb-3 text-sm font-medium text-[var(--color-text-primary)]">
        Reward Conditions
      </h3>

      <div className="flex flex-wrap items-center gap-4 sm:gap-8">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-[var(--color-gold-primary)]" />
          <span className="font-body text-sm text-[var(--color-text-secondary)]">Sentinel uptime</span>
        </div>

        <div className="flex items-center gap-2">
          <Shield size={18} className="text-[var(--color-success)]" />
          <span className="font-body text-sm text-[var(--color-text-secondary)]">Successful Defenses</span>
        </div>

        <div className="flex items-center gap-2">
          <Image
            src="/icons/three_circles.png"
            width={18}
            height={18}
            alt="three circles icon"
            className="brightness-0 invert opacity-60"
          />
          <span className="font-body text-sm text-[var(--color-text-secondary)]">No Defeats</span>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 border-t border-[var(--color-border-subtle)] pt-4">
        <Zap size={18} className="text-[var(--color-warning)]" />

        <p className="font-body text-sm text-[var(--color-text-secondary)]">
          Defeat pauses rewards.{` `}
          <Link
            href={SUI_SENTINEL_DEFENDER_REWARDS_DOCS_URL}
            className="text-[var(--color-gold-primary)] underline hover:text-[var(--color-gold-light)]"
            target="_blank"
          >
            Learn More
          </Link>
        </p>
      </div>
    </div>
  )
}
