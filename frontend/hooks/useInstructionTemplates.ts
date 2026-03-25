import { useState, useEffect } from 'react'
import { SENTINEL_TEMPLATES, SentinelTemplate } from '@/constants/sentinel-templates'
import { useCurrentAccount } from '@mysten/dapp-kit'

export function useInstructionTemplates() {
  const account = useCurrentAccount()
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'basic' | 'rag'>('all')
  const [selectedTemplate, setSelectedTemplate] = useState<SentinelTemplate | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [dbTemplates, setDbTemplates] = useState<SentinelTemplate[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates')
      const data = await res.json()
      if (Array.isArray(data)) {
        const mapped = data.map((t: any) => ({
          name: t.name,
          sentinel_type: t.sentinel_type || 'basic',
          public_instructions: t.public_instructions,
          hidden_instructions: t.private_instructions,
          attack_goal: t.attack_goal,
          judge_prompt: t.jury_prompt 
        }))
        setDbTemplates(mapped)
      }
    } catch (err) {
      console.error('Error fetching templates:', err)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const allTemplates = [...dbTemplates, ...SENTINEL_TEMPLATES]

  const filteredTemplates =
    selectedCategory === 'all'
      ? allTemplates
      : allTemplates.filter(t => t.sentinel_type === selectedCategory)

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
    fetchTemplates
  }
}
