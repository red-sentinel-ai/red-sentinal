'use client'

import Image from 'next/image'
import { Check, ChevronDown, type LucideIcon } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export interface FilterSelectOption {
  value: string
  label: string
  iconSrc?: string
  iconClassName?: string
}

interface FilterSelectProps {
  icon: LucideIcon
  label: string
  options: FilterSelectOption[]
  value: string
  onValueChange: (value: string) => void
  className?: string
}

export const FilterSelect = ({
  icon: Icon,
  label,
  options,
  value,
  onValueChange,
  className,
}: FilterSelectProps) => {
  const selectedOption = options.find(option => option.value === value) ?? options[0]

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        aria-label={label}
        className={cn(
          'font-body flex h-12 items-center gap-2 bg-[var(--color-bg-base)] px-4 text-[10px] font-extrabold uppercase tracking-[0.1em] text-white transition-colors focus:outline-none focus-visible:bg-[var(--color-bg-subtle)] data-[state=open]:bg-[var(--color-bg-subtle)]',
          className
        )}
      >
        <Icon className="size-[18px] shrink-0 text-[var(--color-text-muted)]" />
        {selectedOption?.iconSrc && (
          <Image
            src={selectedOption.iconSrc}
            alt=""
            width={14}
            height={14}
            className={cn('shrink-0 rounded-full', selectedOption.iconClassName)}
          />
        )}
        <span className="flex-1 text-left">{selectedOption?.label}</span>
        <ChevronDown className="size-3.5 shrink-0 text-[var(--color-text-muted)]" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="min-w-[var(--radix-dropdown-menu-trigger-width)]"
      >
        {options.map(option => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => onValueChange(option.value)}
            className="font-body justify-between gap-3 text-[10px] font-extrabold uppercase tracking-[0.1em]"
          >
            <span className="flex items-center gap-2">
              {option.iconSrc && (
                <Image
                  src={option.iconSrc}
                  alt=""
                  width={14}
                  height={14}
                  className={cn('shrink-0 rounded-full', option.iconClassName)}
                />
              )}
              {option.label}
            </span>
            {option.value === value && <Check className="size-3.5 shrink-0" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
