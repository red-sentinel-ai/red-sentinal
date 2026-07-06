'use client'

import { useQuery } from '@tanstack/react-query'

import type {
  EnvironmentTemplateDetail,
  EnvironmentTemplateSummary,
} from '../agentic-types'

interface EnvironmentTemplatesResponse {
  network: string
  templates: EnvironmentTemplateSummary[]
}

interface EnvironmentTemplateDetailResponse {
  network: string
  template: EnvironmentTemplateDetail
}

export function useEnvironmentTemplates() {
  return useQuery<EnvironmentTemplateSummary[]>({
    queryKey: ['environment-templates'],
    queryFn: async () => {
      const res = await fetch('/api/environment-templates')
      if (!res.ok) throw new Error('Failed to fetch environment templates')
      const data: EnvironmentTemplatesResponse = await res.json()
      return data.templates ?? []
    },
    staleTime: 5 * 60_000,
  })
}

export function useEnvironmentTemplate(templateId: string | null) {
  return useQuery<EnvironmentTemplateDetail>({
    queryKey: ['environment-template', templateId],
    enabled: !!templateId,
    queryFn: async () => {
      const res = await fetch(`/api/environment-templates/${templateId}`)
      if (!res.ok) throw new Error('Failed to fetch environment template')
      const data: EnvironmentTemplateDetailResponse = await res.json()
      return data.template
    },
    staleTime: 5 * 60_000,
  })
}
