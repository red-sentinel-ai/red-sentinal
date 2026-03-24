import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type NavSubItem } from '@/constants/navigation'
import { NavigationMenuLink } from '@/components/ui/navigation-menu'

export function NavSubMenuList({ items }: { items: NavSubItem[] }) {
  return (
    <ul className="w-[260px] p-2">
      {items.map(item => (
        <li key={item.href}>
          <NavigationMenuLink asChild>
            <Link
              href={item.href}
              className={cn(
                'group/item flex select-none items-center justify-between rounded-lg px-4 py-3.5 no-underline outline-none transition-colors',
                'hover:bg-gray-100 focus:bg-gray-100'
              )}
            >
              <span className="text-[15px] font-semibold text-gray-800 group-hover/item:text-black">
                {item.title}
              </span>
              <ChevronRight className="h-4 w-4 translate-x-0 text-gray-400 transition-transform duration-150 group-hover/item:translate-x-1 group-hover/item:text-gray-600" />
            </Link>
          </NavigationMenuLink>
        </li>
      ))}
    </ul>
  )
}
