'use client'

import { useMemo } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'

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

async function fetchEnvironmentTemplate(templateId: string): Promise<EnvironmentTemplateDetail> {
  const res = await fetch(`/api/environment-templates/${templateId}`)
  if (!res.ok) throw new Error('Failed to fetch environment template')
  const data: EnvironmentTemplateDetailResponse = await res.json()
  return data.template
}

export function useEnvironmentTemplateDetails(
  templateIds: string[]
): EnvironmentTemplateDetail[] {
  const results = useQueries({
    queries: templateIds.map(templateId => ({
      queryKey: ['environment-template', templateId],
      queryFn: () => fetchEnvironmentTemplate(templateId),
      staleTime: 5 * 60_000,
    })),
  })

  const loadedTemplates = results
    .map(result => result.data)
    .filter((template): template is EnvironmentTemplateDetail => Boolean(template))

  const loadedTemplatesKey = loadedTemplates
    .map(template => `${template.template_id}@${template.version}`)
    .join(',')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => loadedTemplates, [loadedTemplatesKey])
}
