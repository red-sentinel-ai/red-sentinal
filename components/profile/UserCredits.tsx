'use client'

import { useMemo } from 'react'
import { Coins, Droplets, ExternalLink, Fuel, Loader2, MailWarning, Wallet } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context/AuthContext'
import {
  useClaimCredit,
  useCreditAssets,
  useUserCreditClaims,
} from '@/hooks/profile/useCredits'
import {
  CreditsApiError,
  formatCreditAmount,
  getTransactionExplorerUrl,
  type CreditAssetView,
  type CreditClaimView,
  type CreditPayoutView,
} from '@/lib/credits-api'

/**
 * Profile Credits tab (WO-8): shows each enabled Credit Asset with the user's
 * Claim Entitlement status (REQ-MACC-001) and submits one-time claims
 * (REQ-MACC-003). Eligibility is enforced server-side — this UI only guides
 * users to email verification or wallet connection when the backend says so.
 */

/** Purpose badge per token so gas credit and Walrus usage credit read differently. */
const TOKEN_PURPOSE_BADGE: Record<string, { label: string; icon: typeof Fuel }> = {
  SUI: { label: 'Network gas', icon: Fuel },
  WAL: { label: 'Walrus usage', icon: Droplets },
}

const NETWORK_LABELS: Record<string, string> = {
  'sui-mainnet': 'Sui Mainnet',
  'sui-testnet': 'Sui Testnet',
  'walrus-testnet': 'Walrus Testnet',
  'monad-testnet': 'Monad Testnet',
}

const INELIGIBILITY_GUIDANCE: Record<
  string,
  { message: string; guidance: string; icon: typeof MailWarning | typeof Wallet }
> = {
  EMAIL_VERIFICATION_REQUIRED: {
    message: 'Verify your email address to claim this credit.',
    guidance: 'Use the email section above to request a code and verify.',
    icon: MailWarning,
  },
  EMAIL_DOMAIN_INELIGIBLE: {
    message: 'The email domain on your account is not eligible for credit claims.',
    guidance: 'Connect a different email address in the email section above.',
    icon: MailWarning,
  },
  WALLET_REQUIRED: {
    message: 'Connect a Sui wallet to claim this credit.',
    guidance: 'Use the connect button in the top bar, then return here.',
    icon: Wallet,
  },
  WALLET_NOT_LINKED: {
    message: 'The selected wallet is not linked to your account.',
    guidance: 'Connect the wallet you use on Red Sentinel.',
    icon: Wallet,
  },
}

function formatNetwork(network: string): string {
  return NETWORK_LABELS[network] ?? network
}

function PayoutStatusBadge({ status }: { status: CreditClaimView['status'] }) {
  if (status === 'claimed') {
    return <Badge className="bg-emerald-500/15 text-emerald-400">Claimed</Badge>
  }
  if (status === 'processing') {
    return (
      <Badge className="gap-1.5 bg-amber-500/15 text-amber-400">
        <Loader2 className="h-3 w-3 animate-spin" />
        Processing
      </Badge>
    )
  }
  return <Badge className="bg-red-500/15 text-red-400">Failed</Badge>
}

function TransactionLink({
  network,
  reference,
}: {
  network: string | undefined
  reference: string
}) {
  const href = getTransactionExplorerUrl(network ?? '', reference)
  if (!href) return null
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-xs text-[var(--color-gold-primary)] hover:underline"
    >
      View transaction
      <ExternalLink className="h-3 w-3" />
    </a>
  )
}

function EntitlementAction({
  asset,
  isClaiming,
  onClaim,
}: {
  asset: CreditAssetView
  isClaiming: boolean
  onClaim: () => void
}) {
  const { entitlement, token } = asset

  // AC-MACC-003.3: a claimed asset stays visibly claimed.
  if (entitlement.status === 'claimed') {
    return <Badge className="bg-emerald-500/15 text-emerald-400">Claimed</Badge>
  }

  // AC-MACC-003.2: processing stays visible until the final outcome.
  if (entitlement.status === 'processing') {
    return (
      <Badge className="gap-1.5 bg-amber-500/15 text-amber-400">
        <Loader2 className="h-3 w-3 animate-spin" />
        Claim processing
      </Badge>
    )
  }

  if (entitlement.status === 'ineligible') {
    const guidance = entitlement.reason
      ? INELIGIBILITY_GUIDANCE[entitlement.reason]
      : undefined
    if (!guidance) return null
    const GuidanceIcon = guidance.icon
    return (
      <div className="flex items-start gap-2 rounded-md border border-[var(--color-border-subtle)] p-2 text-xs text-[var(--color-text-secondary)]">
        <GuidanceIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          {guidance.message} {guidance.guidance}
        </span>
      </div>
    )
  }

  return (
    <Button
      size="sm"
      onClick={onClaim}
      disabled={isClaiming}
      className="min-w-[110px] gap-2"
    >
      {isClaiming ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Claiming…
        </>
      ) : (
        `Claim ${token}`
      )}
    </Button>
  )
}

function CreditAssetCard({
  asset,
  latestPayout,
  network,
}: {
  asset: CreditAssetView
  latestPayout: CreditPayoutView | null
  network: string
}) {
  const { user } = useAuth()
  const claimMutation = useClaimCredit(user?.id)
  const { token, purpose, entitlement } = asset

  const purposeBadge = TOKEN_PURPOSE_BADGE[token.toUpperCase()]
  const PurposeIcon = purposeBadge?.icon ?? Coins

  const handleClaim = () => {
    if (!user?.id) return
    claimMutation.mutate(
      { assetId: asset.assetId },
      {
        onSuccess: data => {
          if (data.claim.status === 'claimed') {
            toast.success(`Your ${token} credit has been claimed!`)
          } else if (data.claim.status === 'processing') {
            toast.info(`Your ${token} credit claim is processing.`)
          } else {
            // AC-MACC-003.4: a failed payout keeps the entitlement available.
            toast.error(`Your ${token} credit claim failed. You can try again.`)
          }
        },
        onError: error => {
          const message =
            error instanceof CreditsApiError
              ? error.message
              : `Failed to claim the ${token} credit. Please try again.`
          toast.error(message)
        },
      }
    )
  }

  return (
    <Card className="border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-subtle)]">
            <Coins className="h-5 w-5 text-[var(--color-gold-primary)]" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-semibold text-[var(--color-text-primary)]">
                {token} credit
              </span>
              {purposeBadge && (
                <Badge
                  variant="outline"
                  className="gap-1 border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]"
                >
                  <PurposeIcon className="h-3 w-3" />
                  {purposeBadge.label}
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{purpose}</p>
            <p className="mt-1 text-xs text-[var(--color-text-faint)]">
              {formatNetwork(network)}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <div className="text-left sm:text-right">
            <p className="text-xl font-semibold text-[var(--color-text-primary)]">
              {formatCreditAmount(asset.amount, token)} {token}
            </p>
            <p className="text-xs text-[var(--color-text-faint)]">one-time credit</p>
          </div>
          <EntitlementAction
            asset={asset}
            isClaiming={claimMutation.isPending}
            onClaim={handleClaim}
          />
          {entitlement.status === 'claimed' && latestPayout?.transactionReference && (
            <TransactionLink
              network={network}
              reference={latestPayout.transactionReference}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ClaimsHistory({
  claims,
  networkByAsset,
}: {
  claims: Array<{ claim: CreditClaimView; latestPayout: CreditPayoutView | null }>
  networkByAsset: Map<string, string>
}) {
  if (claims.length === 0) return null

  return (
    <div className="mt-8">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
        Claim history
      </h3>
      <div className="space-y-2">
        {claims.map(({ claim, latestPayout }) => (
          <div
            key={claim.claimId}
            className="flex flex-col gap-1 rounded-lg border border-[var(--color-border-subtle)] p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="text-sm text-[var(--color-text-primary)]">
              {claim.assetId.replace(/-/g, ' ')}
              <span className="ml-2 text-xs text-[var(--color-text-faint)]">
                {new Date(claim.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <PayoutStatusBadge status={claim.status} />
              {latestPayout?.transactionReference && (
                <TransactionLink
                  network={networkByAsset.get(claim.assetId)}
                  reference={latestPayout.transactionReference}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function UserCredits() {
  const { user } = useAuth()
  const userId = user?.id

  const assetsQuery = useCreditAssets(userId)
  const claimsQuery = useUserCreditClaims(userId)

  const payoutsByAsset = useMemo(() => {
    const map = new Map<string, CreditPayoutView>()
    for (const entry of claimsQuery.data?.claims ?? []) {
      if (entry.latestPayout && !map.has(entry.claim.assetId)) {
        map.set(entry.claim.assetId, entry.latestPayout)
      }
    }
    return map
  }, [claimsQuery.data])

  const networkByAsset = useMemo(() => {
    const map = new Map<string, string>()
    for (const asset of assetsQuery.data?.assets ?? []) {
      map.set(asset.assetId, asset.network)
    }
    return map
  }, [assetsQuery.data])

  if (assetsQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-lg" />
        <Skeleton className="h-28 w-full rounded-lg" />
      </div>
    )
  }

  if (assetsQuery.isError) {
    return (
      <Card className="border-[var(--color-border-subtle)]">
        <CardContent className="py-8 text-center text-sm text-[var(--color-text-secondary)]">
          Failed to load your credits. Please try again later.
        </CardContent>
      </Card>
    )
  }

  const assets = assetsQuery.data?.assets ?? []

  // AC-MACC-001.4: no enabled Credit Assets means credits are unavailable.
  if (assets.length === 0) {
    return (
      <Card className="border-[var(--color-border-subtle)]">
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
          <Coins className="h-8 w-8 text-[var(--color-text-faint)]" />
          <p className="text-sm text-[var(--color-text-secondary)]">
            Credits are not currently available. Check back soon.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <div className="space-y-4">
        {assets.map(asset => (
          <CreditAssetCard
            key={asset.assetId}
            asset={asset}
            latestPayout={payoutsByAsset.get(asset.assetId) ?? null}
            network={asset.network}
          />
        ))}
      </div>
      <ClaimsHistory
        claims={claimsQuery.data?.claims ?? []}
        networkByAsset={networkByAsset}
      />
    </div>
  )
}
