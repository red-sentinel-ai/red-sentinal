'use client'

import { useQuery } from '@tanstack/react-query'
import { formatUnits } from 'viem'
import { useAccount } from 'wagmi'
import Link from 'next/link'
import { ExternalLink, Shield, TrendingUp, Wallet, ArrowLeft } from 'lucide-react'
import { SUI_SENTINEL_API_URL } from '@/constants'
import { APP_NETWORK } from '@/constants/shared'
import { BNB_CONFIG } from '@/constants/evm'
import { Skeleton } from '@/components/ui/skeleton'
import { useSyndicateContractInfo, useSyndicateMemberInfo } from '@/hooks/syndicate/useSyndicateInfo'
import { OwnerPanel } from '@/components/syndicate/OwnerPanel'
import { MemberPanel } from '@/components/syndicate/MemberPanel'

interface BackendSyndicate {
  contract_address: string
  owner: string
  name: string
  description: string
  social_link: string | null
  token_address: string
  token_symbol: string
  whitelist_enabled: boolean
  agent_id: string | null
  network: string
  created_at: string
}

interface SyndicatePageClientProps {
  address: `0x${string}`
}

export default function SyndicatePageClient({ address }: SyndicatePageClientProps) {
  const { address: connectedAddress } = useAccount()

  // Off-chain metadata
  const { data: metaData, refetch: refetchMeta } = useQuery<{ syndicate: BackendSyndicate }>({
    queryKey: ['syndicate-meta', address],
    queryFn: async () => {
      const res = await fetch(`${SUI_SENTINEL_API_URL}/syndicates/${address}?network=${APP_NETWORK}`)
      if (!res.ok) throw new Error('Syndicate not found')
      return res.json()
    },
  })

  const meta = metaData?.syndicate

  // On-chain state (refetch key tied to meta so it re-reads after actions)
  const {
    owner,
    agentId,
    whitelistEnabled,
    tokenAddress,
    idlePrincipal,
    totalManagedAssets,
    isLoading: isContractLoading,
  } = useSyndicateContractInfo(address)

  const {
    shares,
    pendingFees,
    isWhitelisted,
    isLoading: isMemberLoading,
  } = useSyndicateMemberInfo(address, connectedAddress)

  const tokenDecimals = meta ? getDecimalsForSymbol(meta.token_symbol) : 18
  const isOwner =
    connectedAddress && owner && connectedAddress.toLowerCase() === owner.toLowerCase()

  const formattedTVL =
    totalManagedAssets !== undefined
      ? parseFloat(formatUnits(totalManagedAssets, tokenDecimals)).toFixed(4)
      : null

  const formattedIdle =
    idlePrincipal !== undefined
      ? parseFloat(formatUnits(idlePrincipal, tokenDecimals)).toFixed(4)
      : null

  const refresh = () => refetchMeta()

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] pb-16 pt-10">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Back nav */}
        <Link
          href="/defend"
          className="mb-6 flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Defend
        </Link>

        {/* Header */}
        <div className="mb-8">
          {!meta ? (
            <Skeleton className="h-8 w-64" />
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                    {meta.name}
                  </h1>
                  {meta.description && (
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      {meta.description}
                    </p>
                  )}
                  {meta.social_link && (
                    <a
                      href={meta.social_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 flex items-center gap-1 text-xs text-[var(--color-gold-primary)] hover:underline"
                    >
                      {meta.social_link} <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {whitelistEnabled !== undefined && (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        whitelistEnabled
                          ? 'bg-yellow-500/10 text-yellow-500'
                          : 'bg-green-500/10 text-green-400'
                      }`}
                    >
                      {whitelistEnabled ? 'Permissioned' : 'Public'}
                    </span>
                  )}
                  {agentId && (
                    <span className="rounded-full bg-[var(--color-gold-primary)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--color-gold-primary)]">
                      Sentinel Active
                    </span>
                  )}
                  <a
                    href={`${BNB_CONFIG.explorerUrl}/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                  >
                    {address.slice(0, 8)}...{address.slice(-6)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Stats row */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Value Locked"
            value={
              isContractLoading ? null : formattedTVL
                ? `${formattedTVL} ${meta?.token_symbol ?? ''}`
                : '—'
            }
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <StatCard
            label="Idle Funds"
            value={
              isContractLoading ? null : formattedIdle
                ? `${formattedIdle} ${meta?.token_symbol ?? ''}`
                : '—'
            }
            icon={<Wallet className="h-4 w-4" />}
          />
          <StatCard
            label="Sentinel"
            value={
              isContractLoading ? null : agentId ? `${agentId.slice(0, 8)}...` : 'Not launched'
            }
            icon={<Shield className="h-4 w-4" />}
          />
        </div>

        {/* Panels */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {isOwner && meta && tokenAddress && (
            <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-5">
              <OwnerPanel
                syndicateAddress={address}
                tokenAddress={tokenAddress}
                tokenSymbol={meta.token_symbol}
                tokenDecimals={tokenDecimals}
                whitelistEnabled={whitelistEnabled ?? false}
                agentId={agentId}
                onRefresh={refresh}
              />
            </div>
          )}

          {connectedAddress && meta && tokenAddress && (
            <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-5">
              <MemberPanel
                syndicateAddress={address}
                tokenAddress={tokenAddress}
                tokenSymbol={meta.token_symbol}
                tokenDecimals={tokenDecimals}
                whitelistEnabled={whitelistEnabled ?? false}
                isWhitelisted={isWhitelisted}
                shares={shares}
                pendingFees={pendingFees}
                idlePrincipal={idlePrincipal}
                isLoadingMember={isMemberLoading}
                hasAgent={!!agentId}
                onRefresh={refresh}
              />
            </div>
          )}

          {!connectedAddress && (
            <div className="col-span-full flex flex-col items-center gap-3 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] py-10">
              <Wallet className="h-10 w-10 text-[var(--color-text-muted)]" />
              <p className="text-sm text-[var(--color-text-secondary)]">
                Connect your BNB wallet to interact with this syndicate
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string | null
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-4">
      <div className="mb-1 flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
        {icon}
        {label}
      </div>
      {value === null ? (
        <Skeleton className="h-5 w-24" />
      ) : (
        <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">{value}</p>
      )}
    </div>
  )
}

function getDecimalsForSymbol(symbol: string): number {
  const map: Record<string, number> = { USDC: 18, USDT: 18, WBNB: 18, BNB: 18 }
  return map[symbol] ?? 18
}
