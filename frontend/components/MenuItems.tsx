import Link from 'next/link'
import Image from 'next/image'
import clsx from 'clsx'

import { Button } from './ui'
import { SUI_SENTINEL_DISCORD_URL } from '@/constants'

export const MenuItems = ({ menuOpen }: { menuOpen: boolean }) => {
  return (
    <ul
      className={clsx('flex flex-col xl:flex-row items-center gap-3 mr-4', {
        'w-full': menuOpen,
      })}
    >
      <li>
        <Link
          className="block ml-3 xl:ml-4 flex-shrink-0"
          href="/rewards"
        >
          Rewards
        </Link>
      </li>

      <li>
        <Link
          className="block ml-3 xl:ml-4 flex-shrink-0"
          href="/rewards/leaderboard"
        >
          Leaderboard
        </Link>
      </li>

      <li className="xl:ms-auto">
        <Link
          href={SUI_SENTINEL_DISCORD_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="bg-[#5865F2] hover:bg-[#5865F2]/90 text-white font-semibold animate-pulse-glow">
            <Image
              src="/icons/discord.svg"
              width={20}
              height={20}
              alt="discord"
              className="mr-2"
            />
            Join Discord
          </Button>
        </Link>
      </li>
    </ul>
  )
}
