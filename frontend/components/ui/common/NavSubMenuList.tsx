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
                'hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black'
              )}
            >
              <div className="text-sm font-medium leading-none">{item.title}</div>
              <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted-foreground">
                {item.description}
              </p>
            </Link>
          </NavigationMenuLink>
        </li>
      ))}
    </ul>
  )
}
