import type {
  AgenticConfig,
  EnvironmentTemplateDetail,
  EnvironmentToolMeta,
  ScenarioConfig,
  ToolConfig,
} from './agentic-types'

const EMPTY_SCENARIO: ScenarioConfig = {
  template_ids: [],
  template_versions: {},
  initial_environment: {},
}

export function getEnabledWriteTools(
  tools: EnvironmentToolMeta[],
  enabledToolIds: string[]
): EnvironmentToolMeta[] {
  return tools.filter(
    tool => enabledToolIds.includes(tool.tool_id) && tool.side_effecting
  )
}

interface BuildAgenticConfigArgs {
  templateDetail?: EnvironmentTemplateDetail | null
  enabledToolIds: string[]
  enabledLiveToolIds: string[]
  initialEnvironment: Record<string, unknown>
}

export function buildAgenticConfig({
  templateDetail,
  enabledToolIds,
  enabledLiveToolIds,
  initialEnvironment,
}: BuildAgenticConfigArgs): AgenticConfig {
  const writeTools = templateDetail
    ? getEnabledWriteTools(templateDetail.tools, enabledToolIds)
    : []

  const enabledTools: ToolConfig[] = [
    ...(templateDetail ? enabledToolIds : []),
    ...enabledLiveToolIds,
  ].map(toolId => ({ tool_id: toolId, enabled: true }))

  return {
    scenario: templateDetail
      ? {
          template_ids: [templateDetail.template_id],
          template_versions: { [templateDetail.template_id]: templateDetail.version },
          initial_environment: initialEnvironment,
        }
      : EMPTY_SCENARIO,
    enabledTools,
    userTask: null,
    attackSuccessChecks: writeTools.map(tool => ({
      type: 'tool_called',
      params: { tool: tool.tool_id },
      weight: 1,
    })),
    utilityChecks: [],
    evaluationMode: templateDetail ? 'hybrid' : 'llm',
  }
}

interface ValidateAgenticSelectionArgs {
  templateDetail: EnvironmentTemplateDetail | null | undefined
  enabledToolIds: string[]
  enabledLiveToolIds: string[]
}

export function validateAgenticSelection({
  templateDetail,
  enabledToolIds,
  enabledLiveToolIds,
}: ValidateAgenticSelectionArgs): string | null {
  const hasLiveTools = enabledLiveToolIds.length > 0

  if (!templateDetail) {
    return hasLiveTools
      ? null
      : 'Select an environment or enable a live tool for your agentic Sentinel.'
  }

  if (enabledToolIds.length === 0) {
    return 'Enable at least one tool for your agentic Sentinel.'
  }
  if (getEnabledWriteTools(templateDetail.tools, enabledToolIds).length === 0) {
    return 'Enable at least one write tool — those are what attackers try to trigger, and how a breach is detected.'
  }
  return null
}
