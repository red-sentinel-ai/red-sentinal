import { describe, expect, it } from 'bun:test'

import type {
  BreachCondition,
  DiscoveredMcpTool,
  PreflightCheckResult,
  PreflightReport,
} from './agentic-types'
import {
  applyDiscoveryResult,
  BREACH_CONDITION_TYPES,
  buildConnectedDeploymentPayload,
  buildLocalPreflightChecks,
  computeConfigHash,
  createBreachCondition,
  createMcpConnectionDraft,
  findChangedToolDefinitions,
  findMissingCapabilities,
  getEvidenceSource,
  INITIAL_EXISTING_AGENT_DRAFT,
  INITIAL_PREFLIGHT_FIXTURES,
  isLaunchAllowed,
  mergePreflightChecks,
  redactDeploymentPayload,
  stableStringify,
  toggleApprovedTool,
  updateConnectionEndpoint,
  validateConnectedDeployment,
  validateConnectionUrl,
  DEFAULT_EXECUTION_LIMITS,
} from './deployment-utils'
import { SHOPFAST_DEMO_EXAMPLE } from './shopfast-demo-example'
import type { ConnectedDeploymentState } from './deployment-utils'

const tool = (overrides: Partial<DiscoveredMcpTool> = {}): DiscoveredMcpTool => ({
  name: 'get_weather',
  description: 'Look up the weather',
  arguments: [{ name: 'city', type: 'string', required: true }],
  ...overrides,
})

const condition = (
  type: BreachCondition['type'],
  description: string,
  params: Record<string, string>
): BreachCondition => ({
  ...createBreachCondition(type),
  description,
  params,
})

const hostedState = (
  overrides: Partial<ConnectedDeploymentState> = {}
): ConnectedDeploymentState => {
  const connection = {
    ...createMcpConnectionDraft(),
    url: 'https://mcp.example.com/rpc',
    credential: 'tok',
    verified: true,
    discoveredTools: [tool()],
    approvedTools: [tool()],
  }
  return {
    method: 'hosted_agent',
    mcpConnections: [connection],
    existingAgent: { ...INITIAL_EXISTING_AGENT_DRAFT },
    breachConditions: [
      condition('completed_action', 'sends the funds', {
        tool_name: 'transfer',
        outcome_pattern: 'moved',
      }),
    ],
    executionLimits: { ...DEFAULT_EXECUTION_LIMITS },
    fixtures: {
      legitimateTaskPrompt: 'check the weather',
      legitimateTaskExpectedResult: 'sunny',
      violationPrompt: 'send all funds',
    },
    ...overrides,
  }
}

describe('connection URL format validation', () => {
  it('accepts public HTTPS URLs only', () => {
    expect(validateConnectionUrl('https://mcp.example.com/rpc')).toBeNull()
    expect(validateConnectionUrl('')).toBe('Enter the server URL.')
    expect(validateConnectionUrl('http://mcp.example.com')).toBe('Connections must use HTTPS.')
    expect(validateConnectionUrl('https://localhost')).toBe('Enter a valid host.')
    expect(validateConnectionUrl('not a url')).toBe('Enter a valid URL, including https://.')
  })
})

describe('MCP connection editing', () => {
  it('marks a connection verified only on a successful check', () => {
    const draft = createMcpConnectionDraft()
    const failed = applyDiscoveryResult(draft, { ok: false, reason: 'refused' })
    expect(failed.verified).toBe(false)
    expect(failed.discoveryError).toBe('refused')

    const ok = applyDiscoveryResult(draft, { ok: true, tools: [tool()] })
    expect(ok.verified).toBe(true)
    expect(ok.discoveredTools).toHaveLength(1)
  })

  it('keeps approved tools when a later check fails, but drops them when the URL changes', () => {
    const verified = applyDiscoveryResult(createMcpConnectionDraft(), {
      ok: true,
      tools: [tool()],
    })
    const approved = toggleApprovedTool(verified, tool())
    expect(approved.approvedTools).toHaveLength(1)

    const reCredential = updateConnectionEndpoint(approved, { credential: 'tok2' })
    expect(reCredential.approvedTools).toHaveLength(1)
    expect(reCredential.verified).toBe(false)

    const reUrl = updateConnectionEndpoint(approved, {
      url: 'https://other.example.com/rpc',
    })
    expect(reUrl.approvedTools).toHaveLength(0)
    expect(reUrl.discoveredTools).toHaveLength(0)
    expect(reUrl.verified).toBe(false)
  })

  it('toggles tool approval by name', () => {
    const draft = createMcpConnectionDraft()
    const approved = toggleApprovedTool(draft, tool())
    expect(approved.approvedTools).toHaveLength(1)
    expect(toggleApprovedTool(approved, tool()).approvedTools).toHaveLength(0)
  })

  it('flags approved tools whose server definition changed', () => {
    const discovered = [tool()]
    expect(findChangedToolDefinitions(discovered, [tool()])).toEqual([])
    expect(findChangedToolDefinitions(discovered, [tool({ description: 'CHANGED' })])).toEqual([
      'get_weather',
    ])
    // Removed from the server entirely is a load-time rejection, not a diff.
    expect(findChangedToolDefinitions([], [tool()])).toEqual([])
  })
})

describe('capability requirements for existing agents', () => {
  it('requires nothing for hosted agents', () => {
    expect(
      findMissingCapabilities('hosted_agent', INITIAL_EXISTING_AGENT_DRAFT, [
        condition('environment_change', 'vault opens', { path: 'vault.open' }),
      ])
    ).toEqual([])
  })

  it('lists each missing capability with adapter guidance', () => {
    const missing = findMissingCapabilities('existing_agent', INITIAL_EXISTING_AGENT_DRAFT, [
      condition('environment_change', 'vault opens', { path: 'vault.open' }),
    ])
    expect(missing.map(m => m.capability).sort()).toEqual(['evidence', 'reset', 'session'])
    expect(missing[0].guidance).toContain('adapter')
  })

  it('accepts output-only configurations without any capability', () => {
    expect(
      findMissingCapabilities('existing_agent', INITIAL_EXISTING_AGENT_DRAFT, [
        condition('output', 'leaks the key', { pattern: 'sk-.*' }),
      ])
    ).toEqual([])
  })

  it('reports the evidence source from the mapping, not the method', () => {
    expect(getEvidenceSource('hosted_agent', INITIAL_EXISTING_AGENT_DRAFT)).toBe('red_sentinel')
    expect(getEvidenceSource('existing_agent', INITIAL_EXISTING_AGENT_DRAFT)).toBe('none')
    expect(
      getEvidenceSource('existing_agent', {
        ...INITIAL_EXISTING_AGENT_DRAFT,
        capabilities: {
          ...INITIAL_EXISTING_AGENT_DRAFT.capabilities,
          evidence: { enabled: true, path: 'reply.evidence' },
        },
      })
    ).toBe('connected_agent')
  })
})

describe('pre-preflight validation', () => {
  it('passes a complete hosted configuration', () => {
    expect(validateConnectedDeployment(hostedState())).toBeNull()
  })

  it('demands a verified connection and at least one approved tool', () => {
    const unverified = hostedState({
      mcpConnections: [{ ...createMcpConnectionDraft(), url: 'https://mcp.example.com' }],
    })
    expect(validateConnectedDeployment(unverified)).toContain('connection check')

    const noTools = hostedState({
      mcpConnections: [
        { ...createMcpConnectionDraft(), url: 'https://mcp.example.com', verified: true },
      ],
    })
    expect(validateConnectedDeployment(noTools)).toContain('Approve at least one tool')
  })

  it('requires conditions, mappings, and in-bounds limits', () => {
    expect(validateConnectedDeployment(hostedState({ breachConditions: [] }))).toContain(
      'at least one Breach Condition'
    )
    expect(
      validateConnectedDeployment(
        hostedState({ executionLimits: { max_tool_steps: 99, turn_time_budget_seconds: 35 } })
      )
    ).toContain('Tool-calling steps')
  })

  it('blocks existing agents missing a capability their conditions need', () => {
    const state = hostedState({
      method: 'existing_agent',
      mcpConnections: [],
      existingAgent: {
        ...INITIAL_EXISTING_AGENT_DRAFT,
        url: 'https://agent.example.com/api',
      },
      breachConditions: [
        condition('completed_action', 'sends the funds', {
          tool_name: 'transfer',
          outcome_pattern: 'moved',
        }),
      ],
    })
    const error = validateConnectedDeployment(state)
    expect(error).toContain('"evidence"')
    expect(error).toContain('adapter')
  })
})

describe('local preflight checks', () => {
  it('reports missing fixtures as failed blockers', () => {
    const checks = buildLocalPreflightChecks(
      hostedState({
        fixtures: { ...INITIAL_PREFLIGHT_FIXTURES },
      })
    )
    const byId = new Map(checks.map(check => [check.id, check]))
    expect(byId.get('fixture_legitimate_task')?.status).toBe('failed')
    expect(byId.get('fixture_violation')?.status).toBe('failed')
  })

  it('lets remote checks override local ones by id and blocks on unsupported', () => {
    const local = buildLocalPreflightChecks(hostedState())
    const remote: PreflightCheckResult[] = [
      {
        id: 'fixture_violation',
        label: 'Violation fixture',
        status: 'failed',
        detail: 'no breach',
      },
      { id: 'capability_environment', label: 'env', status: 'unsupported', detail: 'n/a' },
    ]
    const merged = mergePreflightChecks(local, remote)
    const byId = new Map(merged.map(check => [check.id, check]))
    expect(byId.get('fixture_violation')?.detail).toBe('no breach')
    expect(byId.get('fixture_legitimate_task')?.status).toBe('passed')

    const report: PreflightReport = {
      checks: merged,
      configHash: 'h',
      completedAt: 1,
    }
    expect(isLaunchAllowed(report)).toBe(false)
    expect(
      isLaunchAllowed({
        checks: local,
        configHash: 'h',
        completedAt: 1,
      })
    ).toBe(true)
    expect(isLaunchAllowed(null)).toBe(false)
  })
})

describe('payload building', () => {
  it('includes only the active method and derives the evidence source', () => {
    const hostedPayload = buildConnectedDeploymentPayload(hostedState())!
    expect(hostedPayload.deployment_config.method).toBe('hosted_agent')
    expect(hostedPayload.breach_conditions[0].type).toBe('completed_action')
    expect(hostedPayload.preflight_fixtures.violation.prompt).toBe('send all funds')
    expect(hostedPayload.config_hash).not.toBe('')

    const existingPayload = buildConnectedDeploymentPayload(
      hostedState({
        method: 'existing_agent',
        mcpConnections: [],
        existingAgent: {
          ...INITIAL_EXISTING_AGENT_DRAFT,
          url: 'https://agent.example.com/api',
          requestPromptPath: 'input.prompt',
          responseOutputPath: 'reply.text',
          capabilities: {
            session: { enabled: true, path: 'input.session_id' },
            reset: { enabled: false, path: '' },
            evidence: { enabled: true, path: 'reply.evidence' },
          },
        },
      })
    )!
    const config = existingPayload.deployment_config
    expect(config.method).toBe('existing_agent')
    if (config.method === 'existing_agent') {
      expect(config.evidence_source).toBe('connected_agent')
      expect(config.session_capabilities).toEqual({
        session: { path: 'input.session_id' },
        evidence: { path: 'reply.evidence' },
      })
    }
  })

  it('hashes the configuration without the credentials', () => {
    const payload = buildConnectedDeploymentPayload(hostedState())!
    const otherToken = buildConnectedDeploymentPayload(
      hostedState({
        mcpConnections: [{ ...hostedState().mcpConnections[0], credential: 'different-token' }],
      })
    )!
    expect(computeConfigHash(payload)).toBe(computeConfigHash(otherToken))

    // Any material change does invalidate the hash.
    const changedLimits = buildConnectedDeploymentPayload(
      hostedState({
        executionLimits: { max_tool_steps: 5, turn_time_budget_seconds: 35 },
      })
    )!
    expect(computeConfigHash(payload)).not.toBe(computeConfigHash(changedLimits))
  })

  it('redacts credentials into presence flags', () => {
    const payload = buildConnectedDeploymentPayload(hostedState())!
    const redacted = redactDeploymentPayload(payload)
    expect(JSON.stringify(redacted)).not.toContain('tok')
    const config = redacted.deployment_config
    if (config.method === 'hosted_agent') {
      expect(config.mcp_connections[0].has_credential).toBe(true)
      expect(config.mcp_connections[0].credential).toBeUndefined()
    }
  })

  it('stable-stringifies regardless of key order', () => {
    expect(stableStringify({ b: 1, a: [2, { d: 3, c: 4 }] })).toBe(
      stableStringify({ a: [2, { c: 4, d: 3 }], b: 1 })
    )
  })
})

describe('ShopFast demo example', () => {
  const example = SHOPFAST_DEMO_EXAMPLE

  it('points at a format-valid HTTPS endpoint', () => {
    expect(validateConnectionUrl(example.mcpUrl)).toBeNull()
    expect(example.mcpUrl.endsWith('/mcp')).toBe(true)
    expect(example.allowedHosts.length).toBeGreaterThan(0)
    expect(example.bearerToken.trim()).not.toBe('')
  })

  it('carries complete Breach Conditions with every required param', () => {
    expect(example.breachConditions.length).toBeGreaterThanOrEqual(1)
    for (const condition of example.breachConditions) {
      expect(condition.description.trim()).not.toBe('')
      const meta = BREACH_CONDITION_TYPES.find(entry => entry.type === condition.type)
      expect(meta).toBeDefined()
      for (const param of meta!.params) {
        expect(condition.params[param.key]?.trim()).not.toBe('')
      }
    }
  })

  it('ships all three preflight fixtures filled in', () => {
    expect(example.fixtures.legitimateTaskPrompt.trim()).not.toBe('')
    expect(example.fixtures.legitimateTaskExpectedResult.trim()).not.toBe('')
    expect(example.fixtures.violationPrompt.trim()).not.toBe('')
  })

  it('provides non-empty instructions and attack objective', () => {
    expect(example.publicInstructions.trim().length).toBeGreaterThan(100)
    expect(example.privateInstructions.trim().length).toBeGreaterThan(100)
    expect(example.attackGoal.trim().length).toBeGreaterThan(50)
  })
})
