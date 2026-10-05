'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  // Gift,
  BookOpen,
  Compass,
  HelpCircle,
  MessageCircleQuestion,
  Terminal,
  Network,
  PlusSquare,
  Swords,
  Trophy,
  User,
  Users,
  Library,
  type LucideIcon,
} from 'lucide-react'
import { InstallButton } from '@/components/pwa/InstallButton'
import { useInstallPrompt } from '@/context/InstallPromptContext'
import { SupportSheet } from '@/components/support/SupportSheet'

import { APP_NETWORK, SUI_SENTINEL_DOCS_URL } from '@/constants'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

const LOGO_SRC =
  APP_NETWORK === 'testnet' ? '/icons/logo_large_testnet.svg' : '/icons/logo_large.svg'

type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  description: string
}

const NAV_ITEMS: NavItem[] = [
  {
    title: 'Home',
    href: '/attack',
    icon: Terminal,
    description: '',
  },
  {
    title: 'Explore',
    href: '/attacks',
    icon: Compass,
    description:
      'Every active sentinel in the arena — filter by network, status, token, and pool size.',
  },
  {
    title: 'Practice (Free)',
    href: '/practice',
    icon: Swords,
    description:
      'Attack practice sentinels with zero fees. Learn the game before you play for real pools.',
  },
  {
    title: 'Leaderboard',
    href: '/leaderboard',
    icon: Trophy,
    description:
      'Top attackers, defenders, and syndicates, ranked by bounties won and fees earned.',
  },
  {
    title: 'Operators',
    href: '/operators',
    icon: Users,
    description:
      'Everyone on Red Sentinel, their attacks, breaks, earnings, and sentinels. Follow the ones worth tracking.',
  },
  {
    title: 'Deploy a Sentinel',
    href: '/defend',
    icon: PlusSquare,
    description:
      'Launch your own agent with a Bounty Pool. Earn 40% of every failed Attack Fee it withstands.',
  },
  {
    title: 'Sentinel Templates',
    href: '/sentinel-templates',
    icon: Library,
    description: 'Pre-built sentinels. Pick one, fund the pool, go live in minutes.',
  },
  {
    title: 'Syndicates',
    href: '/syndicates',
    icon: Network,
    description:
      'Pool funds with other operators to launch bigger sentinels. Split attack-fee earnings by contribution.',
  },

  // { title: 'Rewards', href: '/rewards', icon: Gift, description: "Claim what you've earned." },

  {
    title: 'Profile',
    href: '/profile',
    icon: User,
    description: '',
  },
]

function isItemActive(pathname: string, href: string) {
  // The root route renders the Attack view, so treat "/" as Attack being active.
  if (href === '/attack' && pathname === '/') return true
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppSidebar() {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()
  const { isInstalled } = useInstallPrompt()
  const [isSupportOpen, setIsSupportOpen] = useState(false)

  const renderItem = (item: NavItem) => {
    const Icon = item.icon
    const active = isItemActive(pathname, item.href)
    return (
      <SidebarMenuItem key={item.href}>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuButton
              asChild
              isActive={active}
              tooltip={item.title}
              size="default"
              className="font-body h-11 rounded-none px-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)] transition-colors hover:bg-white/[0.04] hover:text-white data-[active=true]:bg-white/[0.05] data-[active=true]:text-white data-[active=true]:shadow-none [&>svg]:size-5"
            >
              <Link href={item.href} onClick={() => isMobile && setOpenMobile(false)}>
                <Icon />
                <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            align="center"
            sideOffset={8}
            hidden={isMobile || !item.description}
            className="font-body max-w-[240px] px-4 py-3 text-[13px] font-medium leading-relaxed text-[var(--color-text-muted)]"
          >
            {item.description}
          </TooltipContent>
        </Tooltip>
      </SidebarMenuItem>
    )
  }

  return (
    <>
      <Sidebar
        collapsible="offcanvas"
        className="z-50 border-[var(--color-border-default)] bg-[var(--sidebar)]"
      >
        <SidebarHeader className="p-8 pt-[calc(2rem+var(--sat))]">
          <div className="flex min-h-12 items-start">
            <Link href="/" aria-label="Red Sentinel home" className="flex min-w-0 flex-col gap-1">
              <Image
                src={LOGO_SRC}
                alt="Red Sentinel"
                width={268}
                height={42}
                quality={100}
                className={cn('h-8 w-auto object-contain', APP_NETWORK !== 'testnet')}
              />
            </Link>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-4 py-0">
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <SidebarMenu>{NAV_ITEMS.map(renderItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="mt-auto border-t border-[var(--color-border-default)] p-8">
          <div className="space-y-4">
            {!isInstalled && (
              <InstallButton variant="sidebar" onClick={() => isMobile && setOpenMobile(false)} />
            )}
            <Link
              href={SUI_SENTINEL_DOCS_URL}
              target="_blank"
              rel="noreferrer"
              className="font-body flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)] transition-colors hover:text-white"
            >
              <BookOpen className="size-3.5" />
              Docs
            </Link>
            <Link
              href="/faq"
              onClick={() => isMobile && setOpenMobile(false)}
              className="font-body flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)] transition-colors hover:text-white"
            >
              <MessageCircleQuestion className="size-3.5" />
              FAQ
            </Link>
            <button
              type="button"
              onClick={() => {
                setIsSupportOpen(true)
                if (isMobile) setOpenMobile(false)
              }}
              className="font-body flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)] transition-colors hover:text-white"
            >
              <HelpCircle className="size-3.5" />
              Support
            </button>
            {/* <Link
            href="#"
            className="font-body flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--color-text-secondary)] transition-colors hover:text-white"
          >
            <FileText className="size-3.5" />
            Logs
          </Link> */}
          </div>
        </SidebarFooter>
      </Sidebar>
      <SupportSheet open={isSupportOpen} onOpenChange={setIsSupportOpen} />
    </>
  )
}
