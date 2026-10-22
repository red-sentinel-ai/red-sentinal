import type {
  BreachCondition,
  BreachConditionType,
  ConnectedDeploymentMethod,
  ConnectedDeploymentPayload,
  DeploymentConfigPayload,
  DeploymentMethod,
  DiscoveredMcpTool,
  ExistingAgentCapability,
  ExistingAgentDeploymentPayload,
  ExistingAgentDraft,
  ExecutionLimits,
  McpConnectionDraft,
  PreflightCheckResult,
  PreflightFixtures,
  PreflightReport,
  EvidenceSource,
} from './agentic-types'
import { EXECUTION_LIMIT_BOUNDS, DEFAULT_EXECUTION_LIMITS } from './agentic-types'

/** Everything the connected-deployment builders and validators need. */
export interface ConnectedDeploymentState {
  method: ConnectedDeploymentMethod
  mcpConnections: McpConnectionDraft[]
  existingAgent: ExistingAgentDraft
  breachConditions: BreachCondition[]
  executionLimits: ExecutionLimits
  fixtures: PreflightFixtures
}

// ---------------------------------------------------------------------------
// Connection URL validation — format only. A syntactically valid URL never
// implies a verified connection; that comes from a connection check or
// Preflight Validation.
// ---------------------------------------------------------------------------

export const CONNECTION_URL_HINT =
  'Format check only — the connection counts as verified after a successful connection check.'

export function validateConnectionUrl(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return 'Enter the server URL.'
  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return 'Enter a valid URL, including https://.'
  }
  if (parsed.protocol !== 'https:') {
    return 'Connections must use HTTPS.'
  }
  if (!parsed.hostname || !parsed.hostname.includes('.')) {
    return 'Enter a valid host.'
  }
  return null
}

let idCounter = 0

export function createId(prefix: string): string {
  idCounter += 1
  return `${prefix}_${Date.now().toString(36)}${idCounter.toString(36)}${Math.random()
    .toString(36)
    .slice(2, 8)}`
}

// ---------------------------------------------------------------------------
// Draft state factories
// ---------------------------------------------------------------------------

export function createMcpConnectionDraft(): McpConnectionDraft {
  return {
    id: createId('mcp'),
    url: '',
    credential: '',
    verified: false,
    discoveredTools: [],
    approvedTools: [],
    permissions: { allowed_hosts: [], allow_side_effects: false },
    discoveryError: null,
  }
}

export const INITIAL_EXISTING_AGENT_DRAFT: ExistingAgentDraft = {
  url: '',
  credential: '',
  requestPromptPath: 'prompt',
  responseOutputPath: 'output',
  capabilities: {
    session: { enabled: false, path: '' },
    reset: { enabled: false, path: '' },
    evidence: { enabled: false, path: '' },
  },
}

export const INITIAL_PREFLIGHT_FIXTURES: PreflightFixtures = {
  legitimateTaskPrompt: '',
  legitimateTaskExpectedResult: '',
  violationPrompt: '',
}

// ---------------------------------------------------------------------------
// MCP connection editing
// ---------------------------------------------------------------------------

export interface McpDiscoveryOutcome {
  ok: boolean
  tools?: DiscoveredMcpTool[]
  reason?: string
}

/**
 * Fold a connection-check result into a draft. Only a successful check marks
 * the connection verified; a failed check keeps the approved tools so a retry
 * preserves the rest of the configuration.
 */
export function applyDiscoveryResult(
  connection: McpConnectionDraft,
  outcome: McpDiscoveryOutcome
): McpConnectionDraft {
  if (!outcome.ok) {
    return {
      ...connection,
      verified: false,
      discoveryError: outcome.reason ?? 'Connection check failed.',
    }
  }
  return {
    ...connection,
    verified: true,
    discoveryError: null,
    discoveredTools: outcome.tools ?? [],
  }
}

/**
 * Edit the endpoint. Changing the URL invalidates everything discovered from
 * the previous server; changing only the credential keeps the discovery but
 * requires a new connection check.
 */
export function updateConnectionEndpoint(
  connection: McpConnectionDraft,
  changes: { url?: string; credential?: string }
): McpConnectionDraft {
  const urlChanged = changes.url !== undefined && changes.url !== connection.url
  const credentialChanged =
    changes.credential !== undefined && changes.credential !== connection.credential
  if (!urlChanged && !credentialChanged) return connection

  return {
    ...connection,
    ...(changes.url !== undefined ? { url: changes.url } : {}),
    ...(changes.credential !== undefined ? { credential: changes.credential } : {}),
    verified: false,
    discoveryError: null,
    ...(urlChanged ? { discoveredTools: [], approvedTools: [] } : {}),
  }
}

export function toggleApprovedTool(
  connection: McpConnectionDraft,
  tool: DiscoveredMcpTool
): McpConnectionDraft {
  const isApproved = connection.approvedTools.some(
    approved => approvedToolKey(approved) === approvedToolKey(tool)
  )
  return {
    ...connection,
    approvedTools: isApproved
      ? connection.approvedTools.filter(
          approved => approvedToolKey(approved) !== approvedToolKey(tool)
        )
      : [...connection.approvedTools, tool],
  }
}

/** Stable identity of a discovered/approved tool definition. */
export function approvedToolKey(tool: DiscoveredMcpTool): string {
  return tool.name
}

/**
 * Approved tools whose current definition differs from the approved snapshot.
 * The hosted agent must reject these until the defender re-approves.
 */
export function findChangedToolDefinitions(
  discovered: DiscoveredMcpTool[],
  approved: DiscoveredMcpTool[]
): string[] {
  const discoveredByName = new Map(discovered.map(tool => [approvedToolKey(tool), tool]))
  return approved
    .filter(tool => {
      const current = discoveredByName.get(approvedToolKey(tool))
      return current && JSON.stringify(current) !== JSON.stringify(tool)
    })
    .map(tool => approvedToolKey(tool))
}

// ---------------------------------------------------------------------------
// Breach Conditions
// ---------------------------------------------------------------------------

export interface BreachConditionTypeMeta {
  type: BreachConditionType
  label: string
  description: string
  requiresEvidence: boolean
  params: Array<{ key: string; label: string; placeholder: string }>
}

export const BREACH_CONDITION_TYPES: BreachConditionTypeMeta[] = [
  {
    type: 'output',
    label: 'Output condition',
    description:
      'The reply itself matches a forbidden pattern. Evaluated from the response alone — no tool evidence needed.',
    requiresEvidence: false,
    params: [
      {
        key: 'pattern',
        label: 'Forbidden text or pattern',
        placeholder: 'e.g. the value of the secret API key',
      },
    ],
  },
  {
    type: 'tool_argument',
    label: 'Tool-argument condition',
    description:
      'A tool was invoked with forbidden arguments. Needs execution evidence of the call.',
    requiresEvidence: true,
    params: [
      { key: 'tool_name', label: 'Tool name', placeholder: 'e.g. send_money' },
      { key: 'argument_name', label: 'Argument name', placeholder: 'e.g. recipient' },
      {
        key: 'argument_pattern',
        label: 'Forbidden argument value or pattern',
        placeholder: 'e.g. the attacker-supplied IBAN',
      },
    ],
  },
  {
    type: 'completed_action',
    label: 'Completed-action condition',
    description:
      'A forbidden action actually completed. Requires completion evidence — the agent claiming it did it is not enough.',
    requiresEvidence: true,
    params: [
      { key: 'tool_name', label: 'Tool name', placeholder: 'e.g. delete_record' },
      {
        key: 'outcome_pattern',
        label: 'Completed outcome indicating the breach',
        placeholder: 'e.g. record deleted successfully',
      },
    ],
  },
  {
    type: 'environment_change',
    label: 'Environment-change condition',
    description:
      'The test environment shows a forbidden change after the turn. Observed directly in the environment state.',
    requiresEvidence: true,
    params: [
      { key: 'path', label: 'Environment path', placeholder: 'e.g. banking.balance' },
      {
        key: 'expected',
        label: 'Change that constitutes the breach',
        placeholder: 'e.g. balance dropped below the starting value',
      },
    ],
  },
]

export function getBreachConditionTypeMeta(type: BreachConditionType): BreachConditionTypeMeta {
  return BREACH_CONDITION_TYPES.find(meta => meta.type === type) ?? BREACH_CONDITION_TYPES[0]
}

export function conditionRequiresEvidence(type: BreachConditionType): boolean {
  return getBreachConditionTypeMeta(type).requiresEvidence
}

export function createBreachCondition(type: BreachConditionType = 'output'): BreachCondition {
  return { id: createId('breach'), type, description: '', params: {} }
}

/**
 * Existing-agent capabilities each Breach Condition type requires. Output
 * conditions never require evidence; anything about tool actions or observed
 * environment needs an evidence mapping, and observed environment changes
 * additionally need an isolated, resettable session.
 */
export const CAPABILITY_REQUIREMENTS: Record<BreachConditionType, ExistingAgentCapability[]> = {
  output: [],
  tool_argument: ['evidence'],
  completed_action: ['evidence'],
  environment_change: ['evidence', 'session', 'reset'],
}

export interface MissingCapability {
  capability: ExistingAgentCapability
  /** Which condition created the requirement. */
  requiredBy: string
  guidance: string
}

/**
 * Capabilities the existing agent API must expose through mappings for the
 * selected conditions — each gap means an adapter is needed.
 */
export function findMissingCapabilities(
  method: DeploymentMethod,
  existingAgent: ExistingAgentDraft,
  breachConditions: BreachCondition[]
): MissingCapability[] {
  if (method !== 'existing_agent') return []

  const missing: MissingCapability[] = []
  const seen = new Set<ExistingAgentCapability>()

  for (const condition of breachConditions) {
    for (const capability of CAPABILITY_REQUIREMENTS[condition.type]) {
      const mapping = existingAgent.capabilities[capability]
      if (mapping.enabled && mapping.path.trim()) continue
      if (seen.has(capability)) continue
      seen.add(capability)
      missing.push({
        capability,
        requiredBy: condition.description || getBreachConditionTypeMeta(condition.type).label,
        guidance:
          capability === 'evidence'
            ? 'Your API does not expose execution evidence. Add an adapter that reports tool identity, arguments, and outcomes — or use an output condition, which needs no evidence.'
            : capability === 'session'
              ? 'Your API does not expose a session identifier, so attacker tests cannot be isolated. Add an adapter that maps a session field, or restrict the configuration to output conditions.'
              : 'Your API does not expose a reset capability, so the test state cannot return to its starting state between attackers. Add an adapter that maps a reset call, or restrict the configuration to output conditions.',
      })
    }
  }
  return missing
}

/** An existing agent only supplies evidence when its API maps an evidence field. */
export function getExistingAgentEvidenceSource(
  existingAgent: ExistingAgentDraft
): 'connected_agent' | 'none' {
  return existingAgent.capabilities.evidence.enabled &&
    existingAgent.capabilities.evidence.path.trim()
    ? 'connected_agent'
    : 'none'
}

/** Whether action evidence is observed by Red Sentinel or supplied by the connected agent. */
export function getEvidenceSource(
  method: DeploymentMethod,
  existingAgent: ExistingAgentDraft
): EvidenceSource {
  if (method === 'existing_agent') return getExistingAgentEvidenceSource(existingAgent)
  return 'red_sentinel'
}

export function describeEvidenceSource(source: EvidenceSource): string {
  switch (source) {
    case 'red_sentinel':
      return 'Observed by Red Sentinel — tool calls, outcomes, and environment changes are recorded by the runtime.'
    case 'connected_agent':
      return 'Supplied by your connected agent — Red Sentinel relies on the evidence your API reports.'
    case 'none':
      return 'No action-evidence source configured — only output conditions can be evaluated.'
  }
}

// ---------------------------------------------------------------------------
// Validation before preflight
// ---------------------------------------------------------------------------

function validateExecutionLimits(limits: ExecutionLimits): string | null {
  const { max_tool_steps, turn_time_budget_seconds } = EXECUTION_LIMIT_BOUNDS
  if (
    !Number.isFinite(limits.max_tool_steps) ||
    limits.max_tool_steps < max_tool_steps.min ||
    limits.max_tool_steps > max_tool_steps.max
  ) {
    return `Tool-calling steps must be between ${max_tool_steps.min} and ${max_tool_steps.max}.`
  }
  if (
    !Number.isFinite(limits.turn_time_budget_seconds) ||
    limits.turn_time_budget_seconds < turn_time_budget_seconds.min ||
    limits.turn_time_budget_seconds > turn_time_budget_seconds.max
  ) {
    return `The turn time budget must be between ${turn_time_budget_seconds.min} and ${turn_time_budget_seconds.max} seconds.`
  }
  return null
}

function validateBreachConditions(conditions: BreachCondition[]): string | null {
  if (conditions.length === 0) {
    return 'Define at least one Breach Condition — a connected Sentinel must say exactly what outcome counts as a breach.'
  }
  for (const condition of conditions) {
    const label = condition.description || getBreachConditionTypeMeta(condition.type).label
    if (!condition.description.trim()) {
      return `Describe what "${label}" looks like, so attacks can be evaluated against it.`
    }
    for (const param of getBreachConditionTypeMeta(condition.type).params) {
      if (!condition.params[param.key]?.trim()) {
        return `Fill in "${param.label}" for the condition "${label}".`
      }
    }
  }
  return null
}

/**
 * Blocking problems a defender must fix before Preflight Validation can mean
 * anything. Missing fixtures are deliberately not here — Preflight Validation
 * reports them as launch blockers itself.
 */
export function validateConnectedDeployment(state: ConnectedDeploymentState): string | null {
  if (state.method === 'hosted_agent') {
    if (state.mcpConnections.length === 0) {
      return 'Add at least one MCP connection for your Hosted Agent.'
    }
    const changedDefinitions: string[] = []
    let approvedCount = 0
    for (const [index, connection] of state.mcpConnections.entries()) {
      const label = `MCP connection ${index + 1}`
      const urlError = validateConnectionUrl(connection.url)
      if (urlError) return `${label}: ${urlError}`
      if (!connection.verified) {
        return `${label}: run a successful connection check before launch — a valid URL format does not verify the connection.`
      }
      changedDefinitions.push(
        ...findChangedToolDefinitions(connection.discoveredTools, connection.approvedTools)
      )
      approvedCount += connection.approvedTools.length
    }
    if (changedDefinitions.length > 0) {
      return `The definition of ${changedDefinitions.join(', ')} changed on the server — re-approve ${changedDefinitions.length === 1 ? 'it' : 'them'} before launch.`
    }
    if (approvedCount === 0) {
      return 'Approve at least one tool — a Hosted Agent starts with no tools enabled.'
    }
  }

  if (state.method === 'existing_agent') {
    const urlError = validateConnectionUrl(state.existingAgent.url)
    if (urlError) return `Agent endpoint: ${urlError}`
    if (!state.existingAgent.requestPromptPath.trim()) {
      return 'Map where the attacker prompt goes in the request body.'
    }
    if (!state.existingAgent.responseOutputPath.trim()) {
      return 'Map where the agent reply is read from the response body.'
    }
    const missing = findMissingCapabilities(
      state.method,
      state.existingAgent,
      state.breachConditions
    )
    if (missing.length > 0) {
      const first = missing[0]
      return `Your API is missing the "${first.capability}" capability required by "${first.requiredBy}". ${first.guidance}`
    }
  }

  const conditionError = validateBreachConditions(state.breachConditions)
  if (conditionError) return conditionError

  return validateExecutionLimits(state.executionLimits)
}

// ---------------------------------------------------------------------------
// Preflight checks
// ---------------------------------------------------------------------------

/**
 * Checks the Launch Form evaluates itself, so defenders see immediate results
 * even before the backend connector checks arrive. Missing fixtures appear
 * here as failed launch blockers.
 */
export function buildLocalPreflightChecks(state: ConnectedDeploymentState): PreflightCheckResult[] {
  const checks: PreflightCheckResult[] = []

  if (state.method === 'hosted_agent') {
    state.mcpConnections.forEach((connection, index) => {
      const label = `MCP connection ${index + 1}`
      checks.push({
        id: `connection_${index}_url`,
        label: `${label} URL format`,
        status: validateConnectionUrl(connection.url) ? 'failed' : 'passed',
        detail: validateConnectionUrl(connection.url) ?? undefined,
      })
      checks.push({
        id: `connection_${index}_check`,
        label: `${label} connection check`,
        status: connection.verified ? 'passed' : 'failed',
        detail: connection.verified
          ? undefined
          : (connection.discoveryError ?? 'Run the connection check for this server.'),
      })
      const changed = findChangedToolDefinitions(
        connection.discoveredTools,
        connection.approvedTools
      )
      checks.push({
        id: `connection_${index}_definitions`,
        label: `${label} approved tool definitions`,
        status: changed.length > 0 ? 'failed' : 'passed',
        detail:
          changed.length > 0
            ? `Definition changed for ${changed.join(', ')} — re-approve before launch.`
            : undefined,
      })
    })
    const approvedCount = state.mcpConnections.reduce(
      (sum, connection) => sum + connection.approvedTools.length,
      0
    )
    checks.push({
      id: 'approved_tools',
      label: 'Approved tools selected',
      status: approvedCount > 0 ? 'passed' : 'failed',
      detail:
        approvedCount > 0 ? `${approvedCount} tool(s) approved` : 'Approve at least one tool.',
    })
  }

  if (state.method === 'existing_agent') {
    const urlError = validateConnectionUrl(state.existingAgent.url)
    checks.push({
      id: 'endpoint_url',
      label: 'Agent endpoint URL format',
      status: urlError ? 'failed' : 'passed',
      detail: urlError ?? undefined,
    })
    const mappingsPresent =
      !!state.existingAgent.requestPromptPath.trim() &&
      !!state.existingAgent.responseOutputPath.trim()
    checks.push({
      id: 'request_response_mappings',
      label: 'Request and response mappings',
      status: mappingsPresent ? 'passed' : 'failed',
      detail: mappingsPresent
        ? undefined
        : 'Map the prompt input and the response output of your API.',
    })
    for (const missing of findMissingCapabilities(
      state.method,
      state.existingAgent,
      state.breachConditions
    )) {
      checks.push({
        id: `capability_${missing.capability}`,
        label: `Required capability: ${missing.capability}`,
        status: 'unsupported',
        detail: `Required by "${missing.requiredBy}". ${missing.guidance}`,
      })
    }
  }

  checks.push({
    id: 'breach_conditions',
    label: 'At least one Breach Condition defined',
    status: state.breachConditions.length > 0 ? 'passed' : 'failed',
    detail:
      state.breachConditions.length > 0
        ? `${state.breachConditions.length} condition(s) defined`
        : 'Define what outcome counts as a breach before launch.',
  })

  const limitsError = validateExecutionLimits(state.executionLimits)
  checks.push({
    id: 'execution_limits',
    label: 'Execution limits within bounds',
    status: limitsError ? 'failed' : 'passed',
    detail:
      limitsError ??
      `${state.executionLimits.max_tool_steps} steps / ${state.executionLimits.turn_time_budget_seconds}s per turn`,
  })

  checks.push({
    id: 'fixture_legitimate_task',
    label: 'Legitimate-task fixture',
    status: state.fixtures.legitimateTaskPrompt.trim() ? 'passed' : 'failed',
    detail: state.fixtures.legitimateTaskPrompt.trim()
      ? undefined
      : 'Provide a legitimate task the Sentinel should be allowed to complete.',
  })
  checks.push({
    id: 'fixture_violation',
    label: 'Violation fixture',
    status: state.fixtures.violationPrompt.trim() ? 'passed' : 'failed',
    detail: state.fixtures.violationPrompt.trim()
      ? undefined
      : 'Provide a violation prompt that should trigger a Breach Condition.',
  })

  return checks
}

/** Remote checks override local checks with the same id; the rest merge in. */
export function mergePreflightChecks(
  local: PreflightCheckResult[],
  remote: PreflightCheckResult[]
): PreflightCheckResult[] {
  const remoteById = new Map(remote.map(check => [check.id, check]))
  const merged = local.map(check => remoteById.get(check.id) ?? check)
  const localIds = new Set(local.map(check => check.id))
  for (const check of remote) {
    if (!localIds.has(check.id)) merged.push(check)
  }
  return merged
}

/**
 * Launch is allowed only when a completed preflight report exists and every
 * check passed — failed and unsupported results both block.
 */
export function isLaunchAllowed(report: PreflightReport | null): boolean {
  return (
    !!report && report.checks.length > 0 && report.checks.every(check => check.status === 'passed')
  )
}

// ---------------------------------------------------------------------------
// Payload building
// ---------------------------------------------------------------------------

/**
 * Build the submitted Deployment Configuration from the active method only —
 * inactive-method settings never appear in the payload.
 */
export function buildConnectedDeploymentPayload(
  state: ConnectedDeploymentState
): ConnectedDeploymentPayload | null {
  let config: DeploymentConfigPayload

  if (state.method === 'hosted_agent') {
    config = {
      method: 'hosted_agent',
      mcp_connections: state.mcpConnections.map(connection => ({
        url: connection.url.trim(),
        ...(connection.credential ? { credential: connection.credential } : {}),
        approved_tools: connection.approvedTools,
        permissions: connection.permissions,
      })),
      execution_limits: state.executionLimits,
      evidence_source: 'red_sentinel',
    }
  } else {
    const capabilities: ExistingAgentDeploymentPayload['session_capabilities'] = {}
    for (const capability of ['session', 'reset', 'evidence'] as ExistingAgentCapability[]) {
      const mapping = state.existingAgent.capabilities[capability]
      if (mapping.enabled && mapping.path.trim()) {
        capabilities[capability] = { path: mapping.path.trim() }
      }
    }
    config = {
      method: 'existing_agent',
      endpoint: {
        url: state.existingAgent.url.trim(),
        ...(state.existingAgent.credential ? { credential: state.existingAgent.credential } : {}),
      },
      request_mapping: { prompt_path: state.existingAgent.requestPromptPath.trim() },
      response_mapping: { output_path: state.existingAgent.responseOutputPath.trim() },
      session_capabilities: capabilities,
      execution_limits: state.executionLimits,
      evidence_source: getExistingAgentEvidenceSource(state.existingAgent),
    }
  }

  const payload: ConnectedDeploymentPayload = {
    deployment_config: config,
    breach_conditions: state.breachConditions.map(condition => ({
      type: condition.type,
      description: condition.description,
      params: condition.params,
    })),
    preflight_fixtures: {
      legitimate_task: {
        prompt: state.fixtures.legitimateTaskPrompt,
        expected_result: state.fixtures.legitimateTaskExpectedResult,
      },
      violation: { prompt: state.fixtures.violationPrompt },
    },
    config_hash: '',
  }
  return { ...payload, config_hash: computeConfigHash(payload) }
}

/**
 * Copy of a payload with credentials replaced by presence flags — used for
 * hashing, dedupe, and anywhere the configuration is displayed or stored.
 */
export function redactDeploymentPayload(
  payload: ConnectedDeploymentPayload
): ConnectedDeploymentPayload {
  const config = payload.deployment_config
  const redactedConfig: DeploymentConfigPayload =
    config.method === 'hosted_agent'
      ? {
          ...config,
          mcp_connections: config.mcp_connections.map(connection => ({
            url: connection.url,
            ...(connection.credential ? { has_credential: true } : {}),
            approved_tools: connection.approved_tools,
            permissions: connection.permissions,
          })),
        }
      : {
          ...config,
          endpoint: {
            url: config.endpoint.url,
            ...(config.endpoint.credential ? { has_credential: true } : {}),
          },
        }
  return { ...payload, deployment_config: redactedConfig, config_hash: '' }
}

/** Stable JSON with recursively sorted object keys, so equal configs hash equally. */
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  return `{${entries.map(([key, v]) => `${JSON.stringify(key)}:${stableStringify(v)}`).join(',')}}`
}

/** FNV-1a 32-bit — a cheap, dependency-free fingerprint for change detection. */
export function hashString(input: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

/** Hash of the non-secret configuration — credentials never enter the hash. */
export function computeConfigHash(payload: ConnectedDeploymentPayload): string {
  return hashString(stableStringify(redactDeploymentPayload(payload)))
}

// Re-exports so consumers only need this module for connected-deployment logic.
export { DEFAULT_EXECUTION_LIMITS, EXECUTION_LIMIT_BOUNDS }
