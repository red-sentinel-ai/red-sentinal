import Image from 'next/image'
import Link from 'next/link'
import { User, Wallet } from 'lucide-react'
import { formatAddress } from '@mysten/sui/utils'
import { type Tables } from '@/lib/database.types'
import { DEFAULT_PROFILE_URL } from '@/constants'
import { Skeleton } from '@/components/ui/skeleton'

type UserProfile = Pick<Tables<'ss_users'>, 'username' | 'avatar_url'> | null | undefined

interface DefenderProfileProps {
  ownerAddress: string
  profile: UserProfile
  isLoading: boolean
}

export const DefenderProfile = ({ ownerAddress, profile, isLoading }: DefenderProfileProps) => {
  if (isLoading) {
    return (
      <div className="my-4 flex flex-col gap-2">
        <h3 className="text-sm font-semibold uppercase text-black/60">Defender</h3>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full bg-gray-200" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 bg-gray-200" />
            <Skeleton className="h-3 w-32 bg-gray-200" />
          </div>
        </div>
      </div>
    )
  }

  const avatar = profile?.avatar_url || DEFAULT_PROFILE_URL
  const username = profile?.username
  const profileLink = username ? `/u/${username}` : `/u/${ownerAddress}`

  return (
    <div className="my-4 flex flex-col gap-2">
      <h3 className="text-sm font-semibold uppercase text-black/60">Defender</h3>
      <Link href={profileLink} className="group flex items-center gap-3">
        <div className="relative h-10 w-10 flex-shrink-0 rounded-full border border-gray-200">
          {avatar ? (
            <Image
              src={avatar}
              alt={username || 'Defender Avatar'}
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100">
              <User className="h-5 w-5 text-gray-400" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          {username && (
            <p className="truncate font-semibold text-black group-hover:underline">{username}</p>
          )}
          <div
            className="flex items-center gap-1.5 font-mono text-sm text-gray-500"
            onClick={e => e.preventDefault()}
          >
            <Wallet className="h-3 w-3 flex-shrink-0" />
            {formatAddress(ownerAddress)}
          </div>
        </div>
      </Link>
    </div>
  )
}
