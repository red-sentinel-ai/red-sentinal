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

export interface LiveToolMeta {
  tool_id: string
  provider: string
  name: string
  description: string
}

export interface LiveToolProviderGroup {
  provider: string
  tools: LiveToolMeta[]
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

// ---------------------------------------------------------------------------
// Connected deployment paths — Red Sentinel-hosted agent with MCP connections,
// or an existing agent endpoint. Only tool-using Sentinels have these.
// ---------------------------------------------------------------------------

/**
 * Where a tool-using Sentinel's agent executes. `template` is the existing
 * sandbox path and the default; the other two are "connected" methods that
 * need Breach Conditions and Preflight Validation before launch.
 */
export type DeploymentMethod = 'template' | 'hosted_agent' | 'existing_agent'

export const DEFAULT_DEPLOYMENT_METHOD: DeploymentMethod = 'template'

export type ConnectedDeploymentMethod = Exclude<DeploymentMethod, 'template'>

export const isConnectedDeploymentMethod = (
  method: DeploymentMethod
): method is ConnectedDeploymentMethod => method !== 'template'

/** Argument definition of an MCP tool, as discovered from the server. */
export interface McpToolArgument {
  name: string
  type: string
  required: boolean
  description?: string
}

/** A tool discovered on a remote MCP server by a connection check. */
export interface DiscoveredMcpTool {
  name: string
  description: string
  arguments: McpToolArgument[]
}

export interface McpConnectionPermissions {
  /** Hosts the connection may reach. Empty means only the MCP server itself. */
  allowed_hosts: string[]
  /** Whether side-effecting tools may execute, not just read-only ones. */
  allow_side_effects: boolean
}

/** One MCP connection as the defender edits it in the Launch Form. */
export interface McpConnectionDraft {
  id: string
  url: string
  /** Bearer token. Masked in the UI, never persisted client-side, cleared on reset. */
  credential: string
  /** True only after a successful connection check for the current url/credential. */
  verified: boolean
  discoveredTools: DiscoveredMcpTool[]
  /** Definitions frozen at approval time; a changed definition needs re-approval. */
  approvedTools: DiscoveredMcpTool[]
  permissions: McpConnectionPermissions
  discoveryError: string | null
}

export interface ExecutionLimits {
  max_tool_steps: number
  turn_time_budget_seconds: number
}

/** Current hosted-agent defaults: four tool-calling steps and a 35-second turn budget. */
export const DEFAULT_EXECUTION_LIMITS: ExecutionLimits = {
  max_tool_steps: 4,
  turn_time_budget_seconds: 35,
}

export const EXECUTION_LIMIT_BOUNDS = {
  max_tool_steps: { min: 1, max: 20 },
  turn_time_budget_seconds: { min: 5, max: 300 },
} as const

/** Optional capabilities an existing agent API may expose through mappings. */
export type ExistingAgentCapability = 'session' | 'reset' | 'evidence'

export interface ExistingAgentCapabilityMapping {
  enabled: boolean
  /** Request field written (session id, reset flag) or response field read (evidence). */
  path: string
}

/** The existing-agent connection as the defender edits it in the Launch Form. */
export interface ExistingAgentDraft {
  url: string
  /** Bearer token. Masked in the UI, never persisted client-side, cleared on reset. */
  credential: string
  /** Request body field that receives the attacker prompt. */
  requestPromptPath: string
  /** Response body field holding the agent's reply. */
  responseOutputPath: string
  capabilities: Record<ExistingAgentCapability, ExistingAgentCapabilityMapping>
}

export type BreachConditionType =
  | 'output'
  | 'tool_argument'
  | 'completed_action'
  | 'environment_change'

/** A defender-defined rule for what observable result counts as a breach. */
export interface BreachCondition {
  id: string
  type: BreachConditionType
  description: string
  params: Record<string, string>
}

/** Defender-supplied fixtures Preflight Validation runs against the configuration. */
export interface PreflightFixtures {
  legitimateTaskPrompt: string
  legitimateTaskExpectedResult: string
  violationPrompt: string
}

export type PreflightCheckStatus = 'passed' | 'failed' | 'unsupported'

export interface PreflightCheckResult {
  id: string
  label: string
  status: PreflightCheckStatus
  detail?: string
}

export interface PreflightReport {
  checks: PreflightCheckResult[]
  /** Hash of the non-secret configuration the checks ran against. */
  configHash: string
  completedAt: number
}

/**
 * Defender-side settings Preflight Validation needs to run the fixtures of a
 * hosted agent. Sent per request only — the backend never stores these.
 */
export interface PreflightSentinelContext {
  public_instructions: string
  hidden_instructions: string
  model_provider: string
  model_name: string
  api_base_url?: string
  api_key?: string
}

/** Who produces action evidence for breach evaluation. */
export type EvidenceSource = 'red_sentinel' | 'connected_agent' | 'none'

// --- Submitted Deployment Configuration ------------------------------------

export interface McpConnectionPayload {
  url: string
  /** Present only when the defender entered a token. */
  credential?: string
  /** Set in redacted views instead of `credential`, so a stored config can say a token exists without exposing it. */
  has_credential?: boolean
  approved_tools: DiscoveredMcpTool[]
  permissions: McpConnectionPermissions
}

export interface HostedAgentDeploymentPayload {
  method: 'hosted_agent'
  mcp_connections: McpConnectionPayload[]
  execution_limits: ExecutionLimits
  evidence_source: 'red_sentinel'
}

export interface ExistingAgentDeploymentPayload {
  method: 'existing_agent'
  endpoint: { url: string; credential?: string; has_credential?: boolean }
  request_mapping: { prompt_path: string }
  response_mapping: { output_path: string }
  session_capabilities: Partial<Record<ExistingAgentCapability, { path: string }>>
  execution_limits: ExecutionLimits
  evidence_source: 'connected_agent' | 'none'
}

export type DeploymentConfigPayload = HostedAgentDeploymentPayload | ExistingAgentDeploymentPayload

export interface BreachConditionPayload {
  type: BreachConditionType
  description: string
  params: Record<string, string>
}

export interface PreflightFixturesPayload {
  legitimate_task: { prompt: string; expected_result: string }
  violation: { prompt: string }
}

/**
 * Everything a connected tool-using Sentinel adds to the registration
 * payload. Built only from the active method's settings — inactive-method
 * fields never appear here.
 */
export interface ConnectedDeploymentPayload {
  deployment_config: DeploymentConfigPayload
  breach_conditions: BreachConditionPayload[]
  preflight_fixtures: PreflightFixturesPayload
  /** Hash of the validated non-secret configuration, for duplicate-launch detection. */
  config_hash: string
}
