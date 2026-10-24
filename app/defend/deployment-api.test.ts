import { describe, expect, it } from 'bun:test'

import type { PreflightCheckResult } from './agentic-types'
import { discoverMcpTools, requestPreflightChecks } from './deployment-api'

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const mockFetch = (respond: (url: string, init: RequestInit) => Response): typeof fetch =>
  (async (input: RequestInfo | URL, init: RequestInit = {}) =>
    respond(String(input), init)) as unknown as typeof fetch

const payload = {
  deployment_config: {
    method: 'existing_agent' as const,
    endpoint: { url: 'https://agent.example.com/api' },
    request_mapping: { prompt_path: 'input.prompt' },
    response_mapping: { output_path: 'reply.text' },
    session_capabilities: { session: { path: 'input.session_id' } },
    execution_limits: { max_tool_steps: 4, turn_time_budget_seconds: 35 },
    evidence_source: 'connected_agent' as const,
  },
  breach_conditions: [
    { type: 'completed_action' as const, description: 'moves funds', params: {} },
  ],
  preflight_fixtures: {
    legitimate_task: { prompt: 'say hi', expected_result: 'hi' },
    violation: { prompt: 'be bad' },
  },
  config_hash: 'deadbeef',
}

describe('preflight client', () => {
  it('sends the payload plus the sentinel context and returns normalized checks', async () => {
    let received: any = null
    const fetchImpl = mockFetch((url, init) => {
      expect(url).toBe('/api/defend/preflight')
      received = JSON.parse(String(init.body))
      return jsonResponse({
        passed: true,
        checks: [
          { id: 'endpoint_check', label: 'Endpoint', status: 'passed' },
          { id: 'fixture_violation', label: 'Violation', status: 'failed', detail: 'held' },
          { id: 'garbage', label: 'Garbage', status: 'nonsense' },
        ],
      })
    })

    const checks = await requestPreflightChecks(
      payload,
      {
        public_instructions: 'p',
        hidden_instructions: 'h',
        model_provider: 'openai',
        model_name: 'gpt',
      },
      fetchImpl
    )

    expect(received.config_hash).toBe('deadbeef')
    expect(received.sentinel.model_provider).toBe('openai')
    expect(checks).toHaveLength(3)
    const failed = checks.find(c => c.id === 'fixture_violation') as PreflightCheckResult
    expect(failed.status).toBe('failed')
    // A malformed check from the service must read as failed, never passed.
    expect(checks.find(c => c.id === 'garbage')?.status).toBe('failed')
  })

  it('works without a sentinel context', async () => {
    let received: any = null
    await requestPreflightChecks(
      payload,
      null,
      mockFetch((_url, init) => {
        received = JSON.parse(String(init.body))
        return jsonResponse({ checks: [{ id: 'x', label: 'X', status: 'passed' }] })
      })
    )
    expect(received.sentinel).toBeUndefined()
  })

  it('turns a service error into a failed check instead of a launch path', async () => {
    const checks = await requestPreflightChecks(
      payload,
      null,
      mockFetch(() => jsonResponse({ error: 'backend down' }, 503))
    )
    expect(checks).toHaveLength(1)
    expect(checks[0].status).toBe('failed')
    expect(checks[0].detail).toContain('backend down')
  })

  it('reports an empty or unreachable service as failed', async () => {
    const empty = await requestPreflightChecks(
      payload,
      null,
      mockFetch(() => jsonResponse({ checks: [] }))
    )
    expect(empty[0].status).toBe('failed')

    const unreachable = await requestPreflightChecks(payload, null, (async () => {
      throw new Error('socket hang up')
    }) as unknown as typeof fetch)
    expect(unreachable[0].status).toBe('failed')
    expect(unreachable[0].detail).toContain('socket hang up')
  })
})

describe('MCP discovery client', () => {
  it('normalizes discovered tools', async () => {
    const result = await discoverMcpTools(
      { url: 'https://mcp.example.com/rpc', credential: 'tok', allowedHosts: ['mcp.example.com'] },
      mockFetch((_url, init) => {
        const body = JSON.parse(String(init.body))
        expect(body.credential).toBe('tok')
        expect(body.allowed_hosts).toEqual(['mcp.example.com'])
        return jsonResponse({
          ok: true,
          tools: [
            {
              name: 'get_weather',
              description: 'weather',
              arguments: [
                { name: 'city', type: 'string', required: true, description: 'where' },
                { name: 'units', required: false },
              ],
            },
          ],
        })
      })
    )
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.tools[0].arguments).toEqual([
        { name: 'city', type: 'string', required: true, description: 'where' },
        { name: 'units', type: 'any', required: false },
      ])
    }
  })

  it('returns the failure reason without tools', async () => {
    const result = await discoverMcpTools(
      { url: 'https://mcp.example.com/rpc' },
      mockFetch(() => jsonResponse({ ok: false, reason: 'HTTP 401' }))
    )
    expect(result).toEqual({ ok: false, reason: 'HTTP 401' })

    const proxyError = await discoverMcpTools(
      { url: 'https://mcp.example.com/rpc' },
      mockFetch(() => jsonResponse({ error: 'disallowed destination' }, 400))
    )
    expect(proxyError.ok).toBe(false)
    expect(proxyError.ok === false && proxyError.reason).toContain('disallowed destination')

    const unreachable = await discoverMcpTools(
      { url: 'https://mcp.example.com/rpc' },
      (async () => {
        throw new Error('offline')
      }) as unknown as typeof fetch
    )
    expect(unreachable.ok).toBe(false)
  })
})
