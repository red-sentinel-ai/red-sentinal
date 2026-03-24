import Link from 'next/link'
import Image from 'next/image'

import { X_URL } from '@/constants'
import { DEFEND_NAV_ITEMS, ATTACK_NAV_ITEMS } from '@/constants/navigation'

interface MobileNavProps {
  onItemClick?: () => void
}

export const MobileNav = ({ onItemClick }: MobileNavProps) => {
  return (
    <ul className="flex w-full flex-col items-center gap-4 font-medium text-black">
      <li>
        <Link href="/" onClick={onItemClick}>
          Home
        </Link>
      </li>

      {DEFEND_NAV_ITEMS.map(item => (
        <li key={item.href}>
          <Link href={item.href} onClick={onItemClick}>
            {item.title}
          </Link>
        </li>
      ))}

      {ATTACK_NAV_ITEMS.map(item => (
        <li key={item.href}>
          <Link href={item.href} onClick={onItemClick}>
            {item.title}
          </Link>
        </li>
      ))}

      <li>
        <Link href="/leaderboard" onClick={onItemClick}>
          Leaderboard
        </Link>
      </li>

      <li>
        <Link href="/rewards" onClick={onItemClick}>
          Rewards
        </Link>
      </li>

      <li className="mt-2">
        <Link
          href={X_URL}
          target="_blank"
          className="btn btn-outline flex h-[50px] items-center justify-center gap-2 !rounded-[25px] !px-6 text-base font-medium"
        >
          <Image src="/icons/x_black.png" width={20} height={20} alt="x" />
          Support on X
        </Link>
      </li>
    </ul>
  )
}
