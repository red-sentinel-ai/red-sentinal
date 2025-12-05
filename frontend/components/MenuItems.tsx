import Link from 'next/link'
import Image from 'next/image'
import clsx from 'clsx'

import { Badge } from './ui'
import { SUI_SENTINEL_DOCS_URL } from '@/constants'

export const MenuItems = ({
  menuOpen,
  onItemClick,
}: {
  menuOpen: boolean
  onItemClick?: () => void
}) => {
  return (
    <ul
       className={clsx('flex flex-col xl:flex-row  items-center md:items-end gap-4 md:gap-8 text-black font-medium mr-4', {
        'w-full': menuOpen,
      })}
    >
      <li>
        <Link
          className="block"
          href="/"
          onClick={onItemClick}
        >
          Home
        </Link>
      </li>
    
      <li>
        <Link
          className="block"
          href="/rewards/leaderboard"
          onClick={onItemClick}
        >
          Leaderboard
        </Link>
      </li>

        <li>
        <Link
          className="block"
          href="/rewards"
          onClick={onItemClick}
        >
          Rewards
        </Link>
      </li>
      {/* <li>
        <Link
          className="flex items-center gap-2"
          target="_blank"
          href={SUI_SENTINEL_DOCS_URL}
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

      <li className='xl:ms-auto'>
        <Link
          href={SUI_SENTINEL_DOCS_URL}
          target="_blank"
          className="!px-6 btn font-medium text-base btn-outline !rounded-[25px] flex items-center justify-center h-[50px] min-h-[50px]!"
        >
           <Image
            src="/icons/x_black.png"
            width={20}
            height={20}
            alt="x"
          />
          Support on X
        </Link>
      </li>
      {/* <li>
        <Link
          href={SUI_SENTINEL_TELEGRAM_URL}
          target="_blank"
          className="flex items-center w-fit gap-3 px-6 py-2 bg-[#0088cc] rounded-full text-white font-medium hover:bg-[#0077b5] transition-colors h-[50px] min-h-[50px]!"
          onClick={onItemClick}
        >
          <Image
            src="/icons/telegram.png"
            alt="Telegram"
            width={20}
            height={20}
          />
        </Link>
      </li> */}
    </ul>
  )
}
