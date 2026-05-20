import Link from 'next/link'
import { cn } from '@/lib/utils'
import { type NavSubItem } from '@/constants/navigation'
import { NavigationMenuLink } from '@/components/ui/navigation-menu'

export function NavSubMenuList({ items }: { items: NavSubItem[] }) {
  return (
    <ul className="w-[220px] p-2">
      {items.map(item => (
        <li key={item.href}>
          <NavigationMenuLink asChild>
            <Link
              href={item.href}
              className={cn(
                'block select-none rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] no-underline outline-none transition-colors',
                'hover:bg-black/5 hover:text-[var(--color-text-primary)] focus:bg-black/5'
              )}
            >
              {item.title}
            </Link>
          </NavigationMenuLink>
        </li>
      ))}
    </ul>
  )
}
