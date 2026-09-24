import { useState } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { toast } from 'sonner'

interface TemplateFormData {
  name: string
  tags: string
  public_instructions: string
  private_instructions: string
  attack_goal: string
}

const EMPTY_FORM: TemplateFormData = {
  name: '',
  tags: '',
  public_instructions: '',
  private_instructions: '',
  attack_goal: '',
}

export interface SelectedTemplateImage {
  url: string
  isCustom: boolean
  file?: File | null
}

export function useCreateTemplate(onSuccess?: () => void) {
  const account = useCurrentAccount()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState<TemplateFormData>(EMPTY_FORM)
  const [selectedImage, setSelectedImage] = useState<SelectedTemplateImage | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const reset = () => {
    setFormData(EMPTY_FORM)
    setSelectedImage(null)
    setIsSubmitted(false)
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
      !formData.attack_goal
    ) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setIsSubmitting(true)
      const payload = new FormData()
      payload.append('name', formData.name)
      payload.append('tags', formData.tags)
      payload.append('public_instructions', formData.public_instructions)
      payload.append('private_instructions', formData.private_instructions)
      payload.append('attack_goal', formData.attack_goal)
      payload.append('creator_address', account.address)
      if (selectedImage?.isCustom && selectedImage.file) {
        payload.append('image', selectedImage.file)
      } else if (selectedImage?.url) {
        payload.append('image_url', selectedImage.url)
      }

      const res = await fetch('/api/templates', {
        method: 'POST',
        body: payload,
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to create template')
      }

      setFormData(EMPTY_FORM)
      setIsSubmitted(true)
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return { formData, selectedImage, setSelectedImage, isSubmitting, isSubmitted, reset, handleChange, handleSubmit }
}
