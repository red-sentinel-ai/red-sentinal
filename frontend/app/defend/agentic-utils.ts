import type {
  AgenticConfig,
  EnvironmentTemplateDetail,
  EnvironmentToolMeta,
} from './agentic-types'

export function getEnabledWriteTools(
  tools: EnvironmentToolMeta[],
  enabledToolIds: string[]
): EnvironmentToolMeta[] {
  return tools.filter(
    tool => enabledToolIds.includes(tool.tool_id) && tool.side_effecting
  )
}

interface BuildAgenticConfigArgs {
  templateDetail: EnvironmentTemplateDetail
  enabledToolIds: string[]
  initialEnvironment: Record<string, unknown>
}

export function buildAgenticConfig({
  templateDetail,
  enabledToolIds,
  initialEnvironment,
}: BuildAgenticConfigArgs): AgenticConfig {
  const writeTools = getEnabledWriteTools(templateDetail.tools, enabledToolIds)

  return {
    scenario: {
      template_ids: [templateDetail.template_id],
      template_versions: { [templateDetail.template_id]: templateDetail.version },
      initial_environment: initialEnvironment,
    },
    enabledTools: enabledToolIds.map(toolId => ({ tool_id: toolId, enabled: true })),
    userTask: null,
    attackSuccessChecks: writeTools.map(tool => ({
      type: 'tool_called',
      params: { tool: tool.tool_id },
      weight: 1,
    })),
    utilityChecks: [],
    evaluationMode: 'hybrid',
  }
}

interface ValidateAgenticSelectionArgs {
  templateDetail: EnvironmentTemplateDetail | null | undefined
  enabledToolIds: string[]
}

export function validateAgenticSelection({
  templateDetail,
  enabledToolIds,
}: ValidateAgenticSelectionArgs): string | null {
  if (!templateDetail) {
    return 'Select an environment for your agentic Sentinel.'
  }
  if (enabledToolIds.length === 0) {
    return 'Enable at least one tool for your agentic Sentinel.'
  }
  if (getEnabledWriteTools(templateDetail.tools, enabledToolIds).length === 0) {
    return 'Enable at least one write tool — those are what attackers try to trigger, and how a breach is detected.'
  }
  return null
}
