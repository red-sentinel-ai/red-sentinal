'use client'

import { MoreVertical, ExternalLink, Copy } from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Props {
  address: string
}

export function SyndicateMemberActionsMenu({ address }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="More actions"
        className="text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)] focus:outline-none"
      >
        <MoreVertical className="h-5 w-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        <DropdownMenuItem asChild>
          <a
            href={`https://bscscan.com/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase tracking-wider"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View on Explorer
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            navigator.clipboard.writeText(address)
            toast.success('Address copied')
          }}
          className="text-xs uppercase tracking-wider"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy Address
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
