'use client'

import { useRouter } from 'next/navigation'
import { Inbox } from '@novu/nextjs'
import { dark } from '@novu/react/themes'

import { NOVU_APP_IDENTIFIER } from '@/constants'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'

// Match the Aave-style dark UI: dark surfaces, white primary, hairline borders.
const appearance = {
  baseTheme: dark,
  variables: {
    colorBackground: 'var(--color-bg-surface)',
    colorForeground: 'var(--color-text-primary)',
    colorPrimary: 'var(--color-text-primary)',
    colorPrimaryForeground: '#100f0f',
    colorSecondary: 'var(--color-bg-elevated)',
    colorSecondaryForeground: 'var(--color-text-primary)',
    colorNeutral: 'var(--color-text-secondary)',
    colorShadow: 'transparent',
    fontSize: '14px',
    borderRadius: '0px',
  },
  elements: {
    popoverContent: {
      border: '1px solid var(--color-border-default)',
      borderRadius: '0px',
      background: 'var(--color-bg-surface)',
    },
    bellIcon: { color: 'var(--color-text-secondary)' },
    notificationListNewNotificationsNotice__button: {
      background: 'var(--color-text-primary)',
      color: '#100f0f',
    },
  },
}

export function NovuInbox() {
  const router = useRouter()
  const { address, isConnected } = useConnectedAddress()

  // Without a subscriber (wallet) and an app identifier there is nothing to show.
  if (!isConnected || !address || !NOVU_APP_IDENTIFIER) return null

  return (
    <Inbox
      applicationIdentifier={NOVU_APP_IDENTIFIER}
      subscriber={address}
      appearance={appearance}
      onNotificationClick={(notification) => {
        if (notification?.redirect?.url) {
          router.push(decodeURIComponent(notification.redirect.url))
        }
      }}
      onPrimaryActionClick={(notification) => {
        if (notification?.primaryAction?.redirect?.url) {
          router.push(decodeURIComponent(notification.primaryAction.redirect.url))
        }
      }}
    />
  )
}
