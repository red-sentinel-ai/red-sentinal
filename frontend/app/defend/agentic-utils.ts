import type {
  AgenticConfig,
  EnvironmentTemplateDetail,
  EnvironmentToolMeta,
  ToolConfig,
} from './agentic-types'

export function getEnabledWriteTools(
  tools: EnvironmentToolMeta[],
  enabledToolIds: string[]
): EnvironmentToolMeta[] {
  return tools.filter(
    tool => enabledToolIds.includes(tool.tool_id) && tool.side_effecting
  )
}

function collectTemplateTools(
  templates: EnvironmentTemplateDetail[]
): EnvironmentToolMeta[] {
  return templates.flatMap(template => template.tools)
}

function resolveActiveTemplateToolIds(
  templates: EnvironmentTemplateDetail[],
  enabledToolIds: string[]
): string[] {
  const templateToolIds = new Set(collectTemplateTools(templates).map(tool => tool.tool_id))
  return enabledToolIds.filter(toolId => templateToolIds.has(toolId))
}

interface BuildAgenticConfigArgs {
  templates: EnvironmentTemplateDetail[]
  enabledToolIds: string[]
  enabledLiveToolIds: string[]
  initialEnvironment: Record<string, unknown>
}

export function buildAgenticConfig({
  templates,
  enabledToolIds,
  enabledLiveToolIds,
  initialEnvironment,
}: BuildAgenticConfigArgs): AgenticConfig {
  const activeTemplateToolIds = resolveActiveTemplateToolIds(templates, enabledToolIds)
  const writeTools = getEnabledWriteTools(collectTemplateTools(templates), activeTemplateToolIds)

  const enabledTools: ToolConfig[] = [...activeTemplateToolIds, ...enabledLiveToolIds].map(
    toolId => ({ tool_id: toolId, enabled: true })
  )

  const selectedNamespaces = new Set(templates.map(template => template.namespace))
  const initial_environment = Object.fromEntries(
    Object.entries(initialEnvironment).filter(([namespace]) => selectedNamespaces.has(namespace))
  )

  return {
    scenario: {
      template_ids: templates.map(template => template.template_id),
      template_versions: Object.fromEntries(
        templates.map(template => [template.template_id, template.version])
      ),
      initial_environment,
    },
    enabledTools,
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
  templates: EnvironmentTemplateDetail[]
  enabledToolIds: string[]
}

export function validateAgenticSelection({
  templates,
  enabledToolIds,
}: ValidateAgenticSelectionArgs): string | null {
  if (templates.length === 0) {
    return 'Select an environment — every agentic Sentinel needs a sandbox to defend. Live tools are add-ons on top of it.'
  }

  const activeTemplateToolIds = resolveActiveTemplateToolIds(templates, enabledToolIds)
  if (activeTemplateToolIds.length === 0) {
    return 'Enable at least one tool for your agentic Sentinel.'
  }
  if (getEnabledWriteTools(collectTemplateTools(templates), activeTemplateToolIds).length === 0) {
    return 'Enable at least one write tool — those are what attackers try to trigger, and how a breach is detected.'
  }
  return null
}
