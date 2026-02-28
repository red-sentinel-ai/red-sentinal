import Link from 'next/link'
import Image from 'next/image'
import clsx from 'clsx'

import { SUI_SENTINEL_TELEGRAM_URL, X_URL } from '@/constants'

export const MenuItems = ({
  menuOpen,
  onItemClick,
}: {
  menuOpen: boolean
  onItemClick?: () => void
}) => {
  return (
    <ul
      className={clsx(
        'mr-4 flex flex-col items-center gap-4 font-medium text-black md:items-end md:gap-8 xl:flex-row',
        {
          'w-full': menuOpen,
        }
      )}
    >
      <li>
        <Link className="block" href="/" onClick={onItemClick}>
          Home
        </Link>
      </li>

      <li>
        <Link className="block" href="/rewards/leaderboard" onClick={onItemClick}>
          Leaderboard
        </Link>
      </li>

      <li>
        <Link className="block" href="/rewards" onClick={onItemClick}>
          Rewards
        </Link>
      </li>
      {/* <li>
        <Link
          className="flex items-center gap-2"
          target="_blank"
          href={X_URL}
          onClick={onItemClick}
        >
          <BookOpen width={16} />
          <span>Documentation</span>
        </Link>
      </li> */}
      {/* <li className="xl:ms-auto my-auto">
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-800 border-green-200"
          onClick={onItemClick}
        >
          Testnet
        </Badge>
      </li> */}

      <li className="xl:ms-auto">
        <Link
          href={X_URL}
          target="_blank"
          className="btn btn-outline min-h-[50px]! flex h-[50px] items-center justify-center !rounded-[25px] !px-6 text-base font-medium"
        >
          <Image src="/icons/x_black.png" width={20} height={20} alt="x" />
          Support on X
        </Link>
      </li>
      <li>
        <Link
          href={SUI_SENTINEL_TELEGRAM_URL}
          target="_blank"
          className="min-h-[50px]! flex h-[50px] w-fit items-center gap-3 rounded-full bg-[#0088cc] px-6 py-2 font-medium text-white transition-colors hover:bg-[#0077b5]"
          onClick={onItemClick}
        >
          <Image src="/icons/telegram.png" alt="Telegram" width={20} height={20} />
        </Link>
      </li>
    </ul>
  )
}
