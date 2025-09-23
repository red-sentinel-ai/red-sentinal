import Link from 'next/link'
import clsx from 'clsx'

export const MenuItems = ({ menuOpen }: { menuOpen: boolean }) => {
  return (
    <ul
      className={clsx('flex flex-col xl:flex-row items-start xl:items-center gap-3', {
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
    </ul>
  )
}
