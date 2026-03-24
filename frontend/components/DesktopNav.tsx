'use client'

import Link from 'next/link'
import { DEFEND_NAV_ITEMS, ATTACK_NAV_ITEMS } from '@/constants/navigation'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { NavSubMenuList } from '@/components/ui/common/NavSubMenuList'

export function DesktopNav() {
  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-1">
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/" className={navigationMenuTriggerStyle()}>
              Home
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Defend</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavSubMenuList items={DEFEND_NAV_ITEMS} />
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Attack</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavSubMenuList items={ATTACK_NAV_ITEMS} />
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/leaderboard" className={navigationMenuTriggerStyle()}>
              Leaderboard
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/rewards" className={navigationMenuTriggerStyle()}>
              Rewards
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

      </NavigationMenuList>
    </NavigationMenu>
  )
}
