import Image from 'next/image'
import Link from 'next/link'
import { User, Wallet } from 'lucide-react'
import { type Tables } from '@/lib/database.types'
import { truncateAddress, generateAvatarUrl } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

type UserProfile = Pick<Tables<{ schema: 'sentinel' }, 'ss_users'>, 'username' | 'avatar_url'> | null | undefined

interface DefenderProfileProps {
  ownerAddress: string
  profile: UserProfile
  isLoading: boolean
}

export const DefenderProfile = ({ ownerAddress, profile, isLoading }: DefenderProfileProps) => {
  if (isLoading) {
    return (
      <div className="my-2 flex flex-col gap-1.5 md:my-3 md:gap-2 lg:my-4">
        <h3 className="text-xs font-semibold uppercase text-[var(--color-text-primary)]/60 md:text-sm">Defender</h3>
        <div className="flex items-center gap-2 md:gap-3">
          <Skeleton className="h-8 w-8 rounded-full bg-[var(--color-border-subtle)] md:h-10 md:w-10" />
          <div className="space-y-1.5 md:space-y-2">
            <Skeleton className="h-3.5 w-20 bg-[var(--color-border-subtle)] md:h-4 md:w-24" />
            <Skeleton className="h-2.5 w-28 bg-[var(--color-border-subtle)] md:h-3 md:w-32" />
          </div>
        </div>
      </div>
    )
  }

  const avatar = profile?.avatar_url || generateAvatarUrl(ownerAddress)
  const username = profile?.username
  const profileLink = username ? `/u/${username}` : `/u/${ownerAddress}`

  return (
    <div className="my-2 flex flex-col gap-1.5 md:my-3 md:gap-2 lg:my-4">
      <h3 className="text-xs font-semibold uppercase text-[var(--color-text-primary)]/60 md:text-sm">Defender</h3>
      <Link href={profileLink} className="group flex items-center gap-2 md:gap-3">
        <div className="relative h-8 w-8 flex-shrink-0 rounded-full border border-[var(--color-border-subtle)] md:h-10 md:w-10">
          {avatar ? (
            <Image
              src={avatar}
              alt={username || 'Defender Avatar'}
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[var(--color-bg-subtle)]">
              <User className="h-4 w-4 text-[var(--color-text-faint)] md:h-5 md:w-5" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          {username && (
            <p className="truncate text-sm font-semibold text-[var(--color-text-primary)] group-hover:underline md:text-base">
              {username}
            </p>
          )}
          <div
            className="flex items-center gap-1 font-mono text-xs text-[var(--color-text-muted)] md:gap-1.5 md:text-sm"
            onClick={e => e.preventDefault()}
          >
            <Wallet className="h-2.5 w-2.5 flex-shrink-0 md:h-3 md:w-3" />
            {truncateAddress(ownerAddress)}
          </div>
        </div>
      </Link>
    </div>
  )
}
