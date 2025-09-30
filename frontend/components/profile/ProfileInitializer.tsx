'use client'

import { useUserProfile } from '@/hooks/profile/useUserProfile'

/**
 * A client component that ensures a user profile is created or fetched
 * as soon as a wallet is connected. It does not render any UI.
 */
export function ProfileInitializer() {
  useUserProfile()

  return null
}
