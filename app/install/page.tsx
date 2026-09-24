'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Share,
  PlusSquare,
  CheckSquare2,
  MoreVertical,
  Monitor,
  Copy,
  Check,
  Sparkles,
  Zap,
  WifiOff,
  Bell,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InstallButton } from '@/components/pwa/InstallButton'
import { cn } from '@/lib/utils'

export default function InstallPage() {
  const [copied, setCopied] = useState(false)
  const shareUrl =
    typeof window !== 'undefined' ? window.location.origin : 'https://app.redsentinel.xyz'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12 md:px-8">
      {/* Hero */}
      <section className="mb-10 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center bg-[var(--color-bg-surface)]">
          <Image
            src="/icons/pwa-192x192.png"
            alt="Red Sentinel"
            width={80}
            height={80}
            className="h-16 w-16"
          />
        </div>
        <h1 className="page-heading mb-3">Red Sentinel in your pocket</h1>
        <p className="page-subheading mx-auto">
          Install Red Sentinel as an app for the fastest, most native mobile experience. No app
          store required.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <InstallButton />
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 border border-[var(--color-border-strong)] px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-text-primary)] hover:text-[var(--color-text-primary)]"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy Share Link'}
          </button>
        </div>
      </section>

      {/* Why Install */}
      <section className="mb-10 border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-5 sm:p-8">
        <h2 className="font-body mb-5 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--color-text-primary)]">
          Why Install?
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Benefit
            icon={Zap}
            title="Instant Access"
            description="Launch from your home screen — no browser tabs to hunt through."
          />
          <Benefit
            icon={Sparkles}
            title="Native Feel"
            description="Full-screen experience with no browser chrome."
          />
          <Benefit
            icon={WifiOff}
            title="Works Offline"
            description="Static pages load from cache even when your connection drops."
          />
          <Benefit
            icon={Bell}
            title="Push Notifications"
            description="Ready for future mission alerts and bounty updates."
          />
        </div>
      </section>

      {/* Platform Guide */}
      <section className="border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-5 sm:p-8">
        <h2 className="font-body mb-5 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--color-text-primary)]">
          How to Install
        </h2>
        <Tabs defaultValue="ios">
          <TabsList className="mb-4 w-full justify-start border-b border-[var(--color-border-default)]">
            <TabsTrigger value="ios" className="flex-1 sm:flex-none">
              iOS
            </TabsTrigger>
            <TabsTrigger value="android" className="flex-1 sm:flex-none">
              Android
            </TabsTrigger>
            <TabsTrigger value="desktop" className="flex-1 sm:flex-none">
              Desktop
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ios" className="space-y-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              Use Safari on iPhone or iPad. Chrome and Firefox on iOS cannot install PWAs.
            </p>
            <GuideStep
              icon={Share}
              title="1. Tap Share"
              description="Tap the Share button in Safari's toolbar."
            />
            <GuideStep
              icon={PlusSquare}
              title="2. Add to Home Screen"
              description='Scroll down and tap "Add to Home Screen".'
            />
            <GuideStep
              icon={CheckSquare2}
              title="3. Tap Add"
              description='Tap "Add" in the top-right corner.'
            />
          </TabsContent>

          <TabsContent value="android" className="space-y-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              Use Chrome, Samsung Internet, or Edge on Android.
            </p>
            <GuideStep
              icon={MoreVertical}
              title="1. Open the menu"
              description="Tap the three-dot menu in the top-right corner."
            />
            <GuideStep
              icon={PlusSquare}
              title="2. Add to Home Screen"
              description='Tap "Add to Home screen" or "Install app".'
            />
            <GuideStep
              icon={CheckSquare2}
              title="3. Confirm"
              description='Tap "Add" or "Install" when prompted.'
            />
          </TabsContent>

          <TabsContent value="desktop" className="space-y-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              Use Chrome, Edge, or Brave on Windows, macOS, or Linux.
            </p>
            <GuideStep
              icon={Monitor}
              title="1. Look for the install icon"
              description="A small install icon appears in the address bar to the right of the URL."
            />
            <GuideStep
              icon={PlusSquare}
              title="2. Click Install"
              description='Click "Install Red Sentinel" in the prompt.'
            />
            <GuideStep
              icon={CheckSquare2}
              title="3. Launch from apps"
              description="Find Red Sentinel in your apps menu or taskbar."
            />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}

function Benefit({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--color-border-strong)] bg-[var(--color-bg-base)]">
        <Icon className="h-4 w-4 text-[var(--color-text-primary)]" />
      </div>
      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-text-primary)]">
          {title}
        </p>
        <p className="text-sm text-[var(--color-text-muted)]">{description}</p>
      </div>
    </div>
  )
}

function GuideStep({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-4 rounded-none border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-4'
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)]">
        <Icon className="h-4 w-4 text-[var(--color-text-primary)]" />
      </div>
      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-text-primary)]">
          {title}
        </p>
        <p className="text-sm text-[var(--color-text-muted)]">{description}</p>
      </div>
    </div>
  )
}
