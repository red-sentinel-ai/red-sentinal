export type NavSubItem = {
  title: string
  href: string
}

export const DEFEND_NAV_ITEMS: NavSubItem[] = [
  {
    title: 'Launch New Sentinel',
    href: '/defend',
  },
  {
    title: 'Sentinel Templates',
    href: '/instruction-templates',
  },
]

export const ATTACK_NAV_ITEMS: NavSubItem[] = [
  {
    title: 'Attack Arena',
    href: '/attack',
  },
]
