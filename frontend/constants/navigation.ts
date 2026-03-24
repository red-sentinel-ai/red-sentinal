export type NavSubItem = {
  title: string
  href: string
  description: string
}

export const DEFEND_NAV_ITEMS: NavSubItem[] = [
  {
    title: 'Defender Templates',
    href: '/instruction-templates',
    description: 'Browse pre-built sentinel instructions to deploy faster.',
  },
]

export const ATTACK_NAV_ITEMS: NavSubItem[] = [
  {
    title: 'Attack Arena',
    href: '/attack',
    description: 'Browse deployed sentinels and launch your attacks.',
  },
]
