import Link from 'next/link'
import Image from 'next/image'
import clsx from 'clsx'
import { BookOpen } from 'lucide-react'

import { Badge } from './ui'
import { SUI_SENTINEL_TELEGRAM_URL, SUI_SENTINEL_DOCS_URL } from '@/constants'

export const MenuItems = ({ menuOpen }: { menuOpen: boolean }) => {
  return (
    <ul
      className={clsx('flex flex-col xl:flex-row items-center gap-6 mr-4', {
        'w-full': menuOpen,
      })}
    >
      <li>
        <Link
          className="block ml-3 xl:ml-4 flex-shrink-0"
          href="/"
        >
          Home
        </Link>
      </li>
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

      <li>
        <Link
          className="flex items-center gap-[6px] ml-1 xl:ml-4 flex-shrink-0 "
          target="_blank"
          href={SUI_SENTINEL_DOCS_URL}
        >
          <BookOpen width={16} />
          <span>Documentation</span>
        </Link>
      </li>

      <li className="xl:ms-auto">
        <Badge
          variant="secondary"
          className="bg-green-500/10 text-green-400 border-green-500/20"
        >
          Testnet
        </Badge>
      </li>

      <li>
        <Link
          href={SUI_SENTINEL_TELEGRAM_URL}
          target="_blank"
          className="flex items-center w-fit gap-3 px-6 py-3 bg-gradient-to-r from-[#0088cc] to-[#0077b5] rounded-full text-white font-medium hover:from-[#0077b5] hover:to-[#006699] transition-all duration-300 shadow-lg hover:shadow-xl transform group"
        >
          <Image
            src="/icons/telegram.png"
            alt="Telegram"
            width={20}
            height={20}
          />
          <span className="text-sm font-semibold">Join Telegram</span>
        </Link>
      </li>
    </ul>
  )
}
