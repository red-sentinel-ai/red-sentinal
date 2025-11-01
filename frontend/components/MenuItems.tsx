import Link from 'next/link'
import Image from 'next/image'
import clsx from 'clsx'
import { BookOpen } from 'lucide-react'

import { Badge } from './ui'
import { SUI_SENTINEL_TELEGRAM_URL, SUI_SENTINEL_DOCS_URL } from '@/constants'

export const MenuItems = ({ menuOpen }: { menuOpen: boolean }) => {
  return (
    <ul
      className={clsx('flex flex-col xl:flex-row items-center gap-6 text-black font-medium mr-4', {
        'w-full': menuOpen,
      })}
    >
      <li>
        <Link
          className="block"
          href="/"
        >
          Home
        </Link>
      </li>
      <li>
        <Link
          className="block"
          href="/rewards"
        >
          Rewards
        </Link>
      </li>
      <li>
        <Link
          className="block"
          href="/rewards/leaderboard"
        >
          Leaderboard
        </Link>
      </li>
      <li>
        <Link
          className="flex items-center gap-2"
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
          className="bg-green-100 text-green-800 border-green-200"
        >
          Testnet
        </Badge>
      </li>
      <li>
        <Link
          href={SUI_SENTINEL_TELEGRAM_URL}
          target="_blank"
          className="flex items-center w-fit gap-3 px-6 py-2 bg-[#0088cc] rounded-full text-white font-medium hover:bg-[#0077b5] transition-colors"
        >
          <Image
            src="/icons/telegram.png"
            alt="Telegram"
            width={20}
            height={20}
          />
          <span className="text-sm">Join Telegram</span>
        </Link>
      </li>
    </ul>
  )
}
