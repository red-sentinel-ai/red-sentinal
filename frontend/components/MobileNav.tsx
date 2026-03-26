import Link from 'next/link'

import { X_URL } from '@/constants'
import { DEFEND_NAV_ITEMS, ATTACK_NAV_ITEMS } from '@/constants/navigation'

interface MobileNavProps {
  onItemClick?: () => void
}

export const MobileNav = ({ onItemClick }: MobileNavProps) => {
  return (
    <ul className="flex w-full flex-col items-center gap-4 font-display font-medium text-on-surface">
      <li>
        <Link href="/" onClick={onItemClick} className="hover:text-primary transition-colors">
          Home
        </Link>
      </li>

      {DEFEND_NAV_ITEMS.map(item => (
        <li key={item.href}>
          <Link href={item.href} onClick={onItemClick} className="hover:text-primary transition-colors">
            {item.title}
          </Link>
        </li>
      ))}

      {ATTACK_NAV_ITEMS.map(item => (
        <li key={item.href}>
          <Link href={item.href} onClick={onItemClick} className="hover:text-primary transition-colors">
            {item.title}
          </Link>
        </li>
      ))}

      <li>
        <Link href="/leaderboard" onClick={onItemClick} className="hover:text-primary transition-colors">
          Leaderboard
        </Link>
      </li>

      <li>
        <Link href="/rewards" onClick={onItemClick} className="hover:text-primary transition-colors">
          Rewards
        </Link>
      </li>

      <li className="mt-2">
        <Link
          href={X_URL}
          target="_blank"
          className="btn-secondary flex h-[50px] items-center justify-center gap-2 !rounded-[25px] !px-6 text-base font-medium"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-on-surface"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Support on X
        </Link>
      </li>
    </ul>
  )
}
