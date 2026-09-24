'use client'

import { useRouter } from 'next/navigation'
import { Inbox } from '@novu/nextjs'

import { NOVU_APP_IDENTIFIER, NOVU_BACKEND_URL, NOVU_WEBSOCKET_HOSTNAME } from '@/constants'
import { useAuth } from '@/context/AuthContext'

const novuAppearance = {
  variables: {
    colorBackground: 'var(--color-bg-surface)',
    colorForeground: 'var(--color-text-primary)',
    colorPrimary: 'var(--color-text-primary)',
    colorPrimaryForeground: 'var(--color-bg-base)',
    colorSecondary: 'var(--color-bg-elevated)',
    colorSecondaryForeground: 'var(--color-text-primary)',
    colorNeutral: 'var(--color-text-secondary)',
    colorShadow: 'transparent',
    fontSize: '14px',
    borderRadius: '0px',
  },
  elements: {
    popoverContent: {
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '0px',
      background: 'var(--color-bg-surface)',
    },
    notificationListNewNotificationsNotice__button: {
      background: 'var(--color-text-primary)',
      color: 'var(--color-bg-base)',
    },
  },
}

export function NovuInbox() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user?.id || !NOVU_APP_IDENTIFIER) return null

  return (
    <Inbox
      applicationIdentifier={NOVU_APP_IDENTIFIER}
      subscriber={user.id}
      backendUrl={NOVU_BACKEND_URL}
      socketUrl={NOVU_WEBSOCKET_HOSTNAME}
      appearance={novuAppearance}
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
