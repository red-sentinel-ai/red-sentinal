'use client'

import { useConnectedAddress } from '@/hooks/useConnectedAddress'
import { TelegramSubscriptionsSection } from './TelegramSubscriptionsSection'

type Props = {
  profileWalletAddresses: string[]
}

/**
 * Shows the Telegram subscriptions section only when the visitor's connected
 * wallet matches one of the wallets listed on the profile being viewed.
 *
 * Profile pages are public — the subscriptions list is private to the owner,
 * so we gate it client-side on wallet match.
 */
export function TelegramSubscriptionsSectionWrapper({ profileWalletAddresses }: Props) {
  const { address } = useConnectedAddress()
  if (!address) return null

  const lowerAddr = address.toLowerCase()
  const ownsProfile = profileWalletAddresses.some(
    w => w?.toLowerCase() === lowerAddr
  )
  if (!ownsProfile) return null

  return <TelegramSubscriptionsSection walletAddress={address} />
}
