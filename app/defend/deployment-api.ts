import type {
  ConnectedDeploymentPayload,
  DiscoveredMcpTool,
  McpToolArgument,
  PreflightCheckResult,
  PreflightCheckStatus,
  PreflightSentinelContext,
} from './agentic-types'

/**
 * Client for the connector and preflight services. The Next.js proxy routes
 * forward to the backend, which delivers the actual connector execution and
 * preflight orchestration separately — the Launch Form must cope with the
 * service being unavailable by reporting failed checks, never by treating a
 * connection as verified.
 */

export const MCP_DISCOVERY_ENDPOINT = '/api/defend/mcp/discover'
export const PREFLIGHT_ENDPOINT = '/api/defend/preflight'

export type McpDiscoveryResult =
  | { ok: true; tools: DiscoveredMcpTool[] }
  | { ok: false; reason: string }

type FetchLike = typeof fetch

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeArguments(raw: unknown): McpToolArgument[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap(item => {
    if (!isRecord(item) || typeof item.name !== 'string') return []
    return [
      {
        name: item.name,
        type: typeof item.type === 'string' ? item.type : 'any',
        required: item.required === true,
        ...(typeof item.description === 'string' ? { description: item.description } : {}),
      },
    ]
  })
}

function normalizeTools(raw: unknown): DiscoveredMcpTool[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap(item => {
    if (!isRecord(item) || typeof item.name !== 'string') return []
    return [
      {
        name: item.name,
        description: typeof item.description === 'string' ? item.description : '',
        arguments: normalizeArguments(item.arguments),
      },
    ]
  })
}

async function extractErrorReason(response: Response): Promise<string> {
  try {
    const data = await response.json()
    if (isRecord(data)) {
      for (const key of ['error', 'reason', 'detail', 'message']) {
        if (typeof data[key] === 'string' && data[key]) return data[key]
      }
    }
  } catch {
    // fall through to status-only reason
  }
  return `the service responded with status ${response.status}`
}

/**
 * Connection check for an MCP server: HTTPS endpoint with optional bearer
 * token. On success returns the discovered tools; on failure returns the
 * reason and — importantly — no tools and no verified state.
 */
export async function discoverMcpTools(
  connection: { url: string; credential?: string; allowedHosts?: string[] },
  fetchImpl: FetchLike = fetch
): Promise<McpDiscoveryResult> {
  try {
    const response = await fetchImpl(MCP_DISCOVERY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: connection.url,
        ...(connection.credential ? { credential: connection.credential } : {}),
        ...(connection.allowedHosts?.length ? { allowed_hosts: connection.allowedHosts } : {}),
      }),
    })

    if (!response.ok) {
      return {
        ok: false,
        reason: `Connection check failed — ${await extractErrorReason(response)}`,
      }
    }

    const data = await response.json()
    if (isRecord(data) && data.ok === false) {
      return {
        ok: false,
        reason:
          (typeof data.reason === 'string' && data.reason) ||
          (typeof data.error === 'string' && data.error) ||
          'Connection check failed.',
      }
    }
    if (!isRecord(data) || !Array.isArray(data.tools)) {
      return { ok: false, reason: 'Connection check returned an unexpected response.' }
    }
    return { ok: true, tools: normalizeTools(data.tools) }
  } catch (error) {
    return {
      ok: false,
      reason: `Could not reach the connection check service: ${
        error instanceof Error ? error.message : 'unknown error'
      }`,
    }
  }
}

const VALID_CHECK_STATUSES: PreflightCheckStatus[] = ['passed', 'failed', 'unsupported']

function normalizeCheck(raw: unknown): PreflightCheckResult {
  if (!isRecord(raw) || typeof raw.id !== 'string' || typeof raw.label !== 'string') {
    return {
      id: 'unknown_check',
      label: 'Preflight check',
      status: 'failed',
      detail: 'The preflight service returned a malformed check result.',
    }
  }
  const status = VALID_CHECK_STATUSES.includes(raw.status as PreflightCheckStatus)
    ? (raw.status as PreflightCheckStatus)
    : 'failed'
  return {
    id: raw.id,
    label: raw.label,
    status,
    ...(typeof raw.detail === 'string' ? { detail: raw.detail } : {}),
  }
}

/**
 * Run Preflight Validation server-side. The defender's model settings and
 * instructions ride along so a hosted agent's fixtures can run; the backend
 * uses them for those runs only and never stores them. Never throws: if the
 * service is unreachable the defender sees a failed check instead of a launch
 * path.
 */
export async function requestPreflightChecks(
  payload: ConnectedDeploymentPayload,
  sentinelContext?: PreflightSentinelContext | null,
  fetchImpl: FetchLike = fetch
): Promise<PreflightCheckResult[]> {
  try {
    const response = await fetchImpl(PREFLIGHT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        ...(sentinelContext ? { sentinel: sentinelContext } : {}),
      }),
    })
    if (!response.ok) {
      return [
        {
          id: 'preflight_service',
          label: 'Preflight validation service',
          status: 'failed',
          detail: `Preflight could not run — ${await extractErrorReason(response)}`,
        },
      ]
    }
    const data = await response.json()
    const checks = isRecord(data) && Array.isArray(data.checks) ? data.checks : []
    if (checks.length === 0) {
      return [
        {
          id: 'preflight_service',
          label: 'Preflight validation service',
          status: 'failed',
          detail: 'Preflight returned no check results.',
        },
      ]
    }
    return checks.map(normalizeCheck)
  } catch (error) {
    return [
      {
        id: 'preflight_service',
        label: 'Preflight validation service',
        status: 'failed',
        detail: `Preflight could not run — ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      },
    ]
  }
}
