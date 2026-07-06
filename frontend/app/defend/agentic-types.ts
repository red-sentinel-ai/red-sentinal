export type SentinelType = 'basic' | 'agentic'

export type EvaluationMode = 'llm' | 'deterministic' | 'hybrid'

/** Tool metadata as returned in a template's full detail. */
export interface EnvironmentToolMeta {
  tool_id: string
  description: string
  read_only?: boolean
  side_effecting?: boolean
  stateful?: boolean
  stub?: boolean
  stub_reason?: string
  fidelity?: string
}

/** Lightweight template entry returned by the list endpoint. */
export interface EnvironmentTemplateSummary {
  template_id: string
  version: string
  name: string
  description: string
  namespace: string
  /** Tool ids only (the list endpoint flattens tools to their ids). */
  tools: string[]
  attack_surfaces: string[]
}

/** Full template detail returned by the single-template endpoint. */
export interface EnvironmentTemplateDetail {
  template_id: string
  version: string
  name: string
  description: string
  namespace: string
  environment_schema: Record<string, unknown>
  default_environment: Record<string, unknown>
  tools: EnvironmentToolMeta[]
  attack_surfaces: string[]
  supported_checks: string[]
}

/** A tool the creator enables for the sentinel. */
export interface ToolConfig {
  tool_id: string
  enabled?: boolean
  permissions?: Record<string, unknown>
}

/** Composed sandbox configuration: which templates and their seeded state. */
export interface ScenarioConfig {
  template_ids: string[]
  template_versions: Record<string, string>
  initial_environment: Record<string, unknown>
}

/** A single deterministic evaluator check. */
export interface CheckConfig {
  type: string
  params: Record<string, unknown>
  weight?: number
}

/** The legitimate task the sentinel must still be able to perform (utility). */
export interface UserTaskConfig {
  prompt: string
  expected_behavior?: string
  utility_checks: CheckConfig[]
}

/**
 * The full agentic configuration the defend form collects. Folded into the
 * sentinel registration payload only when `sentinelType === 'agentic'`.
 */
export interface AgenticConfig {
  scenario: ScenarioConfig
  enabledTools: ToolConfig[]
  userTask: UserTaskConfig | null
  attackSuccessChecks: CheckConfig[]
  utilityChecks: CheckConfig[]
  evaluationMode: EvaluationMode
}

/** Empty agentic config used to initialise the form. */
export const INITIAL_AGENTIC_CONFIG: AgenticConfig = {
  scenario: { template_ids: [], template_versions: {}, initial_environment: {} },
  enabledTools: [],
  userTask: null,
  attackSuccessChecks: [],
  utilityChecks: [],
  evaluationMode: 'hybrid',
}
