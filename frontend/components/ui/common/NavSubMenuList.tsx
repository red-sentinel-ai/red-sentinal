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
                'block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors',
                'hover:bg-surface-container-high hover:text-on-surface focus:bg-surface-container-high focus:text-on-surface'
              )}
            >
              <div className="font-display text-sm font-medium leading-none text-on-surface">{item.title}</div>
              <p className="mt-1 line-clamp-2 text-xs leading-snug text-on-surface-variant">
                {item.description}
              </p>
            </Link>
          </NavigationMenuLink>
        </li>
      ))}
    </ul>
  )
}
