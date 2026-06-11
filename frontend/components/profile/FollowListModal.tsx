'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FollowListPanel } from './FollowListPanel'

type FollowTab = 'followers' | 'following'

interface FollowListModalProps {
  /** Target user id (uuid) or username. */
  identifier: string
  open: boolean
  onClose: () => void
  initialTab?: FollowTab
}

/**
 * Tabbed Followers / Following list shown over a profile. The panels mount only
 * when the dialog is open, so no follow data is fetched until the user opens it.
 */
export function FollowListModal({
  identifier,
  open,
  onClose,
  initialTab = 'followers',
}: FollowListModalProps) {
  const [tab, setTab] = useState<FollowTab>(initialTab)

  // Sync the active tab with whichever count the user clicked to open the modal.
  useEffect(() => {
    if (open) setTab(initialTab)
  }, [open, initialTab])

  return (
    <Dialog open={open} onOpenChange={value => !value && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold uppercase tracking-[2px]">
            Connections
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={value => setTab(value as FollowTab)} className="mt-2">
          <TabsList className="flex w-full gap-4 border-b border-[var(--color-border-subtle)] p-0">
            <TabsTrigger value="followers" className="flex-1">
              Followers
            </TabsTrigger>
            <TabsTrigger value="following" className="flex-1">
              Following
            </TabsTrigger>
          </TabsList>

          <TabsContent value="followers">
            <FollowListPanel identifier={identifier} direction="followers" onNavigate={onClose} />
          </TabsContent>
          <TabsContent value="following">
            <FollowListPanel identifier={identifier} direction="following" onNavigate={onClose} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
