'use client'

import { useCallback, useMemo, useState } from 'react'

import type {
  BreachCondition,
  DeploymentMethod,
  DiscoveredMcpTool,
  ExistingAgentDraft,
  ExecutionLimits,
  McpConnectionDraft,
  McpConnectionPermissions,
  PreflightFixtures,
  PreflightReport,
  PreflightSentinelContext,
} from '../agentic-types'
import { DEFAULT_DEPLOYMENT_METHOD, DEFAULT_EXECUTION_LIMITS } from '../agentic-types'
import {
  applyDiscoveryResult,
  buildConnectedDeploymentPayload,
  buildLocalPreflightChecks,
  createBreachCondition,
  createMcpConnectionDraft,
  INITIAL_EXISTING_AGENT_DRAFT,
  INITIAL_PREFLIGHT_FIXTURES,
  isLaunchAllowed,
  mergePreflightChecks,
  toggleApprovedTool,
  updateConnectionEndpoint,
  validateConnectionUrl,
  type ConnectedDeploymentState,
} from '../deployment-utils'
import { discoverMcpTools, requestPreflightChecks } from '../deployment-api'

/**
 * Owns every connected-deployment setting of the Launch Form and the
 * Preflight Validation state around them. Any configuration change clears a
 * previous preflight result, so a validated launch can never silently run
 * against a stale configuration.
 */
export function useConnectedDeployment() {
  const [method, setMethodState] = useState<DeploymentMethod>(DEFAULT_DEPLOYMENT_METHOD)
  const [mcpConnections, setMcpConnections] = useState<McpConnectionDraft[]>([])
  const [existingAgent, setExistingAgent] = useState<ExistingAgentDraft>(
    INITIAL_EXISTING_AGENT_DRAFT
  )
  const [breachConditions, setBreachConditions] = useState<BreachCondition[]>([])
  const [executionLimits, setExecutionLimits] = useState<ExecutionLimits>(DEFAULT_EXECUTION_LIMITS)
  const [fixtures, setFixtures] = useState<PreflightFixtures>(INITIAL_PREFLIGHT_FIXTURES)
  const [preflightReport, setPreflightReport] = useState<PreflightReport | null>(null)
  const [isPreflightRunning, setIsPreflightRunning] = useState(false)
  const [checkingConnectionId, setCheckingConnectionId] = useState<string | null>(null)

  const clearPreflight = useCallback(() => setPreflightReport(null), [])

  const setMethod = useCallback(
    (next: DeploymentMethod) => {
      setMethodState(next)
      clearPreflight()
    },
    [clearPreflight]
  )

  // --- MCP connections (hosted agent) ---------------------------------------

  const addMcpConnection = useCallback(() => {
    setMcpConnections(prev => [...prev, createMcpConnectionDraft()])
    clearPreflight()
  }, [clearPreflight])

  const removeMcpConnection = useCallback(
    (connectionId: string) => {
      setMcpConnections(prev => prev.filter(connection => connection.id !== connectionId))
      clearPreflight()
    },
    [clearPreflight]
  )

  const updateMcpConnection = useCallback(
    (connectionId: string, changes: { url?: string; credential?: string }) => {
      setMcpConnections(prev =>
        prev.map(connection =>
          connection.id === connectionId
            ? updateConnectionEndpoint(connection, changes)
            : connection
        )
      )
      clearPreflight()
    },
    [clearPreflight]
  )

  const updateMcpPermissions = useCallback(
    (connectionId: string, permissions: McpConnectionPermissions) => {
      setMcpConnections(prev =>
        prev.map(connection =>
          connection.id === connectionId ? { ...connection, permissions } : connection
        )
      )
      clearPreflight()
    },
    [clearPreflight]
  )

  const checkMcpConnection = useCallback(
    async (connectionId: string) => {
      const target = mcpConnections.find(connection => connection.id === connectionId)
      if (!target || checkingConnectionId) return
      setCheckingConnectionId(connectionId)
      try {
        const urlError = validateConnectionUrl(target.url)
        const outcome = urlError
          ? ({ ok: false, reason: urlError } as const)
          : await discoverMcpTools({
              url: target.url.trim(),
              ...(target.credential ? { credential: target.credential } : {}),
              allowedHosts: target.permissions.allowed_hosts,
            })
        setMcpConnections(prev =>
          prev.map(connection =>
            connection.id === connectionId ? applyDiscoveryResult(connection, outcome) : connection
          )
        )
      } finally {
        setCheckingConnectionId(null)
        clearPreflight()
      }
    },
    [mcpConnections, checkingConnectionId, clearPreflight]
  )

  const toggleMcpToolApproval = useCallback(
    (connectionId: string, tool: DiscoveredMcpTool) => {
      setMcpConnections(prev =>
        prev.map(connection =>
          connection.id === connectionId ? toggleApprovedTool(connection, tool) : connection
        )
      )
      clearPreflight()
    },
    [clearPreflight]
  )

  // --- Existing agent connection --------------------------------------------

  const updateExistingAgent = useCallback(
    (changes: Partial<ExistingAgentDraft>) => {
      setExistingAgent(prev => ({ ...prev, ...changes }))
      clearPreflight()
    },
    [clearPreflight]
  )

  const updateExistingAgentCapability = useCallback(
    (
      capability: keyof ExistingAgentDraft['capabilities'],
      changes: { enabled?: boolean; path?: string }
    ) => {
      setExistingAgent(prev => ({
        ...prev,
        capabilities: {
          ...prev.capabilities,
          [capability]: { ...prev.capabilities[capability], ...changes },
        },
      }))
      clearPreflight()
    },
    [clearPreflight]
  )

  // --- Shared connected settings --------------------------------------------

  const updateExecutionLimits = useCallback(
    (changes: Partial<ExecutionLimits>) => {
      setExecutionLimits(prev => ({ ...prev, ...changes }))
      clearPreflight()
    },
    [clearPreflight]
  )

  const addBreachCondition = useCallback(
    (type?: BreachCondition['type']) => {
      setBreachConditions(prev => [...prev, createBreachCondition(type)])
      clearPreflight()
    },
    [clearPreflight]
  )

  const updateBreachCondition = useCallback(
    (conditionId: string, changes: Partial<Omit<BreachCondition, 'id'>>) => {
      setBreachConditions(prev =>
        prev.map(condition =>
          condition.id === conditionId ? { ...condition, ...changes } : condition
        )
      )
      clearPreflight()
    },
    [clearPreflight]
  )

  const removeBreachCondition = useCallback(
    (conditionId: string) => {
      setBreachConditions(prev => prev.filter(condition => condition.id !== conditionId))
      clearPreflight()
    },
    [clearPreflight]
  )

  const updateFixtures = useCallback(
    (changes: Partial<PreflightFixtures>) => {
      setFixtures(prev => ({ ...prev, ...changes }))
      clearPreflight()
    },
    [clearPreflight]
  )

  // --- Derived state ----------------------------------------------------------

  const state = useMemo<ConnectedDeploymentState | null>(
    () =>
      method === 'template'
        ? null
        : {
            method,
            mcpConnections,
            existingAgent,
            breachConditions,
            executionLimits,
            fixtures,
          },
    [method, mcpConnections, existingAgent, breachConditions, executionLimits, fixtures]
  )

  const payload = useMemo(() => (state ? buildConnectedDeploymentPayload(state) : null), [state])

  const runPreflight = useCallback(
    async (sentinelContext?: PreflightSentinelContext | null) => {
      if (!state || !payload || isPreflightRunning) return
      setIsPreflightRunning(true)
      try {
        const remoteChecks = await requestPreflightChecks(payload, sentinelContext)
        setPreflightReport({
          checks: mergePreflightChecks(buildLocalPreflightChecks(state), remoteChecks),
          configHash: payload.config_hash,
          completedAt: Date.now(),
        })
      } finally {
        setIsPreflightRunning(false)
      }
    },
    [state, payload, isPreflightRunning]
  )

  /** True when the shown preflight results belong to the current configuration. */
  const isPreflightCurrent = useMemo(() => {
    if (!preflightReport || !payload) return false
    return preflightReport.configHash === payload.config_hash
  }, [preflightReport, payload])

  const launchAllowed = isLaunchAllowed(isPreflightCurrent ? preflightReport : null)

  /** Clear everything, including entered credentials. */
  const reset = useCallback(() => {
    setMethodState(DEFAULT_DEPLOYMENT_METHOD)
    setMcpConnections([])
    setExistingAgent(INITIAL_EXISTING_AGENT_DRAFT)
    setBreachConditions([])
    setExecutionLimits(DEFAULT_EXECUTION_LIMITS)
    setFixtures(INITIAL_PREFLIGHT_FIXTURES)
    setPreflightReport(null)
    setIsPreflightRunning(false)
    setCheckingConnectionId(null)
  }, [])

  return {
    method,
    setMethod,
    // hosted agent (MCP)
    mcpConnections,
    addMcpConnection,
    removeMcpConnection,
    updateMcpConnection,
    updateMcpPermissions,
    checkMcpConnection,
    toggleMcpToolApproval,
    checkingConnectionId,
    // existing agent
    existingAgent,
    updateExistingAgent,
    updateExistingAgentCapability,
    // shared
    breachConditions,
    addBreachCondition,
    updateBreachCondition,
    removeBreachCondition,
    executionLimits,
    updateExecutionLimits,
    fixtures,
    updateFixtures,
    // preflight
    preflightReport: isPreflightCurrent ? preflightReport : null,
    isPreflightCurrent,
    hasStaleReport: !!preflightReport && !isPreflightCurrent,
    isPreflightRunning,
    runPreflight,
    launchAllowed,
    // payload / reset
    payload,
    state,
    reset,
  }
}

export type ConnectedDeploymentApi = ReturnType<typeof useConnectedDeployment>
