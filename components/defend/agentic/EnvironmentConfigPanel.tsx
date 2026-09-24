'use client'

import type { EnvironmentTemplateDetail } from '@/app/defend/agentic-types'
import { EnvironmentSeedEditor } from './EnvironmentSeedEditor'
import { EnabledToolsChecklist } from './EnabledToolsChecklist'

interface EnvironmentConfigPanelProps {
  template: EnvironmentTemplateDetail
  environment: Record<string, unknown>
  onEnvironmentChange: (environment: Record<string, unknown>) => void
  enabledToolIds: string[]
  onEnabledToolIdsChange: (enabledToolIds: string[]) => void
}

export function EnvironmentConfigPanel({
  template,
  environment,
  onEnvironmentChange,
  enabledToolIds,
  onEnabledToolIdsChange,
}: EnvironmentConfigPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      <EnvironmentSeedEditor
        templateDetail={template}
        value={environment}
        onChange={onEnvironmentChange}
      />
      <EnabledToolsChecklist
        tools={template.tools}
        enabledToolIds={enabledToolIds}
        onChange={onEnabledToolIdsChange}
      />
    </div>
  )
}
