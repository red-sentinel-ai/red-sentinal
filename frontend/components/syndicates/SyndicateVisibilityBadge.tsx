'use client'

import { Globe, Lock } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface SyndicateVisibilityBadgeProps {
  whitelistEnabled: boolean
}

export function SyndicateVisibilityBadge({ whitelistEnabled }: SyndicateVisibilityBadgeProps) {
  const Icon = whitelistEnabled ? Lock : Globe
  const label = whitelistEnabled ? 'Permissioned' : 'Public'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          aria-label={label}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]"
        >
          <Icon className="h-4 w-4" />
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
