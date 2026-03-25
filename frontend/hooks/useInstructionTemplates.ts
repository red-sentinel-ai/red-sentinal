import { useState, useEffect } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { SentinelTemplate } from '@/types'

export function useInstructionTemplates() {
  const account = useCurrentAccount()
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'basic' | 'rag'>('all')
  const [selectedTemplate, setSelectedTemplate] = useState<SentinelTemplate | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [allTemplates, setAllTemplates] = useState<SentinelTemplate[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchTemplates = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/templates')
      const data = await res.json()
      if (Array.isArray(data)) {
        const mapped = data.map((t: any) => ({
          name: t.name,
          sentinel_type: (t.tags?.includes('rag') ? 'rag' : 'basic') as 'basic' | 'rag', 
          public_instructions: t.public_instructions,
          hidden_instructions: t.private_instructions,
          attack_goal: t.attack_goal,
          jury_prompt: t.jury_prompt
        }))
        setAllTemplates(mapped)
      }
    } catch (err) {
      console.error('Error fetching templates:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const filteredTemplates =
    selectedCategory === 'all'
      ? allTemplates
      : allTemplates.filter(t => t.sentinel_type === selectedCategory)

  const handleCreateClick = () => {
    if (!account?.address) {
      setIsWalletModalOpen(true)
    }
    else {
      setIsCreateModalOpen(true)
    }
  }

  const copyToClipboard = async (text: string, fieldId: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(fieldId)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return {
    selectedCategory,
    setSelectedCategory,
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
    fetchTemplates,
    isLoading,
    allTemplates
  }
}
