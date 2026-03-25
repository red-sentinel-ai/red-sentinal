import { useState } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { toast } from 'sonner'

interface TemplateFormData {
  name: string
  tags: string
  public_instructions: string
  private_instructions: string
  attack_goal: string
  jury_prompt: string
}

const EMPTY_FORM: TemplateFormData = {
  name: '',
  tags: '',
  public_instructions: '',
  private_instructions: '',
  attack_goal: '',
  jury_prompt: '',
}

export function useCreateTemplate(onSuccess?: () => void, onClose?: () => void) {
  const account = useCurrentAccount()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<TemplateFormData>(EMPTY_FORM)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!account?.address) {
      toast.error('Please connect your wallet first')
      return
    }

    if (
      !formData.name ||
      !formData.public_instructions ||
      !formData.private_instructions ||
      !formData.attack_goal ||
      !formData.jury_prompt
    ) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setIsSubmitting(true)
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, creator_address: account.address }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to create template')
      }

      toast.success('Template created successfully!')
      setFormData(EMPTY_FORM)
      onSuccess?.()
      onClose?.()
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return { formData, isSubmitting, handleChange, handleSubmit }
}
