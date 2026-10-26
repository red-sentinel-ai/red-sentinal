import { useState, useEffect, useCallback } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { toast } from '@/lib/toast'
import { SentinelTemplate, TemplateOrigin } from '@/types'

export type TemplateSort = 'newest' | 'popular'

export function useInstructionTemplates() {
  const account = useCurrentAccount()
  const [selectedOrigin, setSelectedOrigin] = useState<TemplateOrigin>('team')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<TemplateSort>('newest')
  const [selectedTemplate, setSelectedTemplate] = useState<SentinelTemplate | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [allTemplates, setAllTemplates] = useState<SentinelTemplate[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const wallet = account?.address?.toLowerCase()

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/templates${wallet ? `?wallet=${wallet}` : ''}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        const mapped = data.map((t: any) => ({
          id: t.id,
          name: t.name,
          sentinel_type: (t.tags?.includes('rag') ? 'rag' : 'basic') as 'basic' | 'rag',
          public_instructions: t.public_instructions,
          hidden_instructions: t.private_instructions,
          attack_goal: t.attack_goal,
          avatar_url: t.avatar_url,
          origin: (t.origin === 'team' ? 'team' : 'community') as TemplateOrigin,
          creator_address: t.creator_address,
          like_count: t.like_count ?? 0,
          comment_count: t.comment_count ?? 0,
          liked_by_me: Boolean(t.liked_by_me),
        }))
        setAllTemplates(mapped)
      }
    } catch (err) {
      console.error('Error fetching templates:', err)
    } finally {
      setIsLoading(false)
    }
  }, [wallet])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const toggleLike = useCallback(
    async (template: SentinelTemplate) => {
      if (!template.id) return
      if (!wallet) {
        setIsWalletModalOpen(true)
        return
      }

      const willLike = !template.liked_by_me

      // Optimistic update
      const applyLike = (t: SentinelTemplate) =>
        t.id === template.id
          ? {
              ...t,
              liked_by_me: willLike,
              like_count: Math.max(0, (t.like_count ?? 0) + (willLike ? 1 : -1)),
            }
          : t
      setAllTemplates(prev => prev.map(applyLike))
      setSelectedTemplate(prev => (prev?.id === template.id ? applyLike(prev) : prev))

      try {
        const res = await fetch(`/api/templates/${template.id}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet }),
        })
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || 'Failed to update like')
        }
        const { liked, like_count } = await res.json()
        // Reconcile with server state
        const reconcile = (t: SentinelTemplate) =>
          t.id === template.id ? { ...t, liked_by_me: liked, like_count } : t
        setAllTemplates(prev => prev.map(reconcile))
        setSelectedTemplate(prev => (prev?.id === template.id ? reconcile(prev) : prev))
      } catch (err: any) {
        // Revert on failure
        setAllTemplates(prev => prev.map(applyLike))
        setSelectedTemplate(prev => (prev?.id === template.id ? applyLike(prev) : prev))
        toast.error(err.message || 'Something went wrong')
      }
    },
    [wallet]
  )

  const handleCommentCountChange = useCallback((templateId: number, delta: number) => {
    const update = (t: SentinelTemplate) =>
      t.id === templateId ? { ...t, comment_count: Math.max(0, (t.comment_count ?? 0) + delta) } : t
    setAllTemplates(prev => prev.map(update))
    setSelectedTemplate(prev => (prev?.id === templateId ? update(prev) : prev))
  }, [])

  const originTemplates =
    selectedOrigin === 'team'
      ? allTemplates.filter(t => t.origin === 'team')
      : allTemplates.filter(t => t.origin !== 'team')

  const query = searchQuery.trim().toLowerCase()
  const searchedTemplates = query
    ? originTemplates.filter(
        t =>
          t.name.toLowerCase().includes(query) ||
          t.attack_goal?.toLowerCase().includes(query) ||
          t.public_instructions?.toLowerCase().includes(query) ||
          t.hidden_instructions?.toLowerCase().includes(query)
      )
    : originTemplates

  const filteredTemplates =
    sortBy === 'popular'
      ? [...searchedTemplates].sort((a, b) => (b.like_count ?? 0) - (a.like_count ?? 0))
      : searchedTemplates

  const handleCreateClick = () => {
    if (!account?.address) {
      setIsWalletModalOpen(true)
    } else {
      setIsCreateModalOpen(true)
    }
  }

  const copyToClipboard = async (text: string, fieldId: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(fieldId)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return {
    selectedOrigin,
    setSelectedOrigin,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    selectedTemplate,
    setSelectedTemplate,
    filteredTemplates,
    copiedField,
    copyToClipboard,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isWalletModalOpen,
    setIsWalletModalOpen,
    handleCreateClick,
    toggleLike,
    handleCommentCountChange,
    fetchTemplates,
    isLoading,
    allTemplates,
  }
}
