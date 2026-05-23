'use client'

import React from 'react'
import Link from 'next/link'
import {
  Shield,
  Hexagon,
  EyeOff,
  Server,
  Zap,
  Plus,
  ArrowRight,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* ──────────────────────────────────────────────────────────────
   Data model — replace this array with an API call when ready
   ────────────────────────────────────────────────────────────── */

type SyndicateIconKey = 'shield' | 'hexagon' | 'eyeOff' | 'server' | 'zap'

type Syndicate = {
  id: string
  name: string
  description: string
  members: number
  idlePrincipal: string
  primarySentinel: string
  iconKey: SyndicateIconKey
  isUserSyndicate?: boolean
}

const SYNDICATES: Syndicate[] = [
  {
    id: 'crimson-legion',
    name: 'Crimson Legion',
    description:
      'The vanguard of algorithmic defense. Specializing in flash-loan attack prevention and cross-chain relay security.',
    members: 1402,
    idlePrincipal: '122.82 ETH',
    primarySentinel: 'XENON-9',
    iconKey: 'shield',
    isUserSyndicate: true,
  },
  {
    id: 'azure-phalanx',
    name: 'Azure Phalanx',
    description:
      'A high-density liquidity collective focused on deep-layer MEV protection and oracle manipulation resistance.',
    members: 894,
    idlePrincipal: '419.50 ETH',
    primarySentinel: 'NEBULUS-II',
    iconKey: 'hexagon',
  },
  {
    id: 'shadow-protocol',
    name: 'Shadow Protocol',
    description:
      'Anonymous-first security layers. Leveraging zero-knowledge proofs to maintain network integrity without exposure.',
    members: 2110,
    idlePrincipal: '94.10 ETH',
    primarySentinel: 'VOID-WATCHER',
    iconKey: 'eyeOff',
  },
  {
    id: 'titan-core',
    name: 'Titan Core',
    description:
      'Institutional-grade security hub for large-scale treasury management and whale-tier protocol protection.',
    members: 156,
    idlePrincipal: '4,200.00 ETH',
    primarySentinel: 'ATLAS-PRIME',
    iconKey: 'server',
  },
  {
    id: 'obsidian-apex',
    name: 'Obsidian Apex',
    description:
      'Ultra-low latency tactical responses. Optimized for rapid exploit neutralization and automated fund recovery.',
    members: 442,
    idlePrincipal: '211.34 ETH',
    primarySentinel: 'STRIKE-V',
    iconKey: 'zap',
  },
]

const GLOBAL_STATS = {
  activeSyndicates: '2,419',
  totalAum: '14.8K ETH',
}

/* ──────────────────────────────────────────────────────────────
   Icon map
   ────────────────────────────────────────────────────────────── */

const ICON_MAP: Record<SyndicateIconKey, React.ElementType> = {
  shield: Shield,
  hexagon: Hexagon,
  eyeOff: EyeOff,
  server: Server,
  zap: Zap,
}

/* ──────────────────────────────────────────────────────────────
   Sub-components
   ────────────────────────────────────────────────────────────── */

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        {label}
      </span>
      <span className="font-mono text-xl font-medium tracking-tight text-[var(--color-text-primary)]">
        {value}
      </span>
    </div>
  )
}

function SyndicateCard({ syndicate }: { syndicate: Syndicate }) {
  const Icon = ICON_MAP[syndicate.iconKey]
  const isUser = syndicate.isUserSyndicate

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-6 transition-all duration-300',
        'hover:-translate-y-0.5 hover:border-[var(--color-gold-primary)] hover:shadow-[0_0_15px_rgba(200,56,79,0.15)]',
        isUser && 'shadow-[inset_0_0_20px_rgba(200,56,79,0.05)]'
      )}
    >
      {/* Top hover gradient line */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--color-gold-primary)] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-lg border',
            isUser
              ? 'border-[var(--color-gold-primary)]/40 bg-[var(--color-gold-muted)]'
              : 'border-[var(--color-border-default)] bg-[var(--color-bg-subtle)]'
          )}
        >
          <Icon
            className={cn(
              'h-7 w-7',
              isUser
                ? 'text-[var(--color-gold-primary)]'
                : 'text-[var(--color-text-muted)]'
            )}
            strokeWidth={isUser ? 2.5 : 2}
          />
        </div>
        {isUser && (
          <span className="rounded-sm bg-[var(--color-gold-primary)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
            Your Syndicate
          </span>
        )}
      </div>

      {/* Body */}
      <h3 className="mb-2 text-xl font-semibold leading-8 tracking-tight text-[var(--color-text-primary)]">
        {syndicate.name}
      </h3>
      <p className="mb-6 line-clamp-2 text-base leading-6 text-[var(--color-text-secondary)]">
        {syndicate.description}
      </p>

      {/* Stats grid */}
      <div className="mt-auto grid grid-cols-2 gap-4">
        <div className="rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Members
          </div>
          <div className="mt-0.5 font-mono text-sm text-[var(--color-text-primary)]">
            {syndicate.members.toLocaleString()}
          </div>
        </div>
        <div className="rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Idle Principal
          </div>
          <div className="mt-0.5 font-mono text-sm text-[var(--color-text-primary)]">
            {syndicate.idlePrincipal}
          </div>
        </div>
      </div>

      {/* Primary sentinel */}
      <div className="mb-6 mt-6 flex items-center justify-between text-[var(--color-text-secondary)]">
        <span className="text-[10px] font-semibold uppercase tracking-wider">
          Primary Sentinel
        </span>
        <span
          className={cn(
            'font-mono text-sm',
            isUser
              ? 'text-[var(--color-gold-primary)]'
              : 'text-[var(--color-text-primary)]'
          )}
        >
          {syndicate.primarySentinel}
        </span>
      </div>

      {/* CTA */}
      {isUser ? (
        <Link
          href={`/syndicate/${syndicate.id}`}
          className="flex w-full items-center justify-center gap-2 rounded bg-white py-2.5 text-sm font-semibold uppercase tracking-wider text-black transition-colors hover:bg-[var(--color-text-primary)]"
        >
          View Syndicate
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : (
        <Link
          href={`/syndicate/${syndicate.id}`}
          className="block w-full rounded border border-[var(--color-gold-primary)] py-2.5 text-center text-sm font-semibold uppercase tracking-wider text-[var(--color-gold-primary)] transition-colors hover:bg-[var(--color-gold-primary)]/10"
        >
          View Syndicate
        </Link>
      )}
    </div>
  )
}

function ForgeCard() {
  return (
    <div className="group flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-6 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-gold-primary)] hover:shadow-[0_0_15px_rgba(200,56,79,0.15)]">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-[var(--color-border-default)] transition-colors group-hover:border-[var(--color-gold-primary)]">
        <Plus className="h-8 w-8 text-[var(--color-text-muted)] transition-colors group-hover:text-[var(--color-gold-primary)]" />
      </div>
      <h3 className="text-xl font-semibold leading-8 tracking-tight text-[var(--color-text-secondary)] transition-colors group-hover:text-[var(--color-gold-primary)]">
        Forge Syndicate
      </h3>
      <p className="mt-2 max-w-[200px] text-base leading-6 text-[var(--color-text-secondary)]">
        Establish your own collective and define security parameters.
      </p>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
   Main component
   ────────────────────────────────────────────────────────────── */

export function SyndicateDirectory() {
  return (
    <div className="relative min-h-full overflow-hidden">
      {/* Atmospheric background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-20">
        <div className="absolute -right-20 -top-40 h-[500px] w-[500px] rounded-full bg-[var(--color-gold-primary)] blur-[120px]" />
        <div className="absolute -left-20 bottom-0 h-[400px] w-[400px] rounded-full bg-[var(--secondary_pink)] blur-[100px]" />
      </div>

      <div className="mx-auto max-w-[1440px] px-6 py-8 md:px-8">
        {/* Header Section */}
        <div className="flex flex-col justify-between gap-4 border-b border-[var(--color-border-default)] pb-6 md:flex-row md:items-end">
          <div>
            <h1 className="mb-2 text-4xl font-bold leading-[56px] tracking-tight text-[var(--color-text-primary)] md:text-5xl">
              SYNDICATE DIRECTORY
            </h1>
            <p className="max-w-2xl text-base leading-6 text-[var(--color-text-secondary)]">
              Connect with high-performance security collectives. Pool
              resources, share threat intelligence, and deploy elite Sentinels
              across the decentralized frontier.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <StatBadge label="Active Syndicates" value={GLOBAL_STATS.activeSyndicates} />
            <div className="h-10 w-px bg-[var(--color-border-subtle)]" />
            <StatBadge label="Total AUM" value={GLOBAL_STATS.totalAum} />
          </div>
        </div>

        {/* Bento Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SYNDICATES.map((syndicate) => (
            <SyndicateCard key={syndicate.id} syndicate={syndicate} />
          ))}
          <ForgeCard />
        </div>

        {/* Footer Summary */}
        <div className="mt-8 flex flex-col items-center justify-between gap-6 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-6 lg:flex-row">
          <div className="flex items-center gap-4">
            <div className="rounded bg-[var(--color-gold-muted)] p-3">
              <Info className="h-5 w-5 text-[var(--color-gold-primary)]" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
                New to Syndicates?
              </h4>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Learn how collectives operate and govern shared resources.
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <button className="flex-1 rounded border border-[var(--color-border-default)] px-6 py-2 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)] sm:flex-none">
              Guidelines
            </button>
            <button className="flex-1 rounded bg-[var(--color-gold-primary)] px-6 py-2 text-sm font-semibold uppercase tracking-wider text-white transition-opacity hover:opacity-90 sm:flex-none">
              Governance Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
