'use client'

import { CheckCircle, Loader2, Trash2, XCircle } from 'lucide-react'

import type {
  DiscoveredMcpTool,
  McpConnectionDraft,
  McpConnectionPermissions,
} from '@/app/defend/agentic-types'
import {
  approvedToolKey,
  findChangedToolDefinitions,
  MCP_URL_HINT,
  validateConnectionUrl,
} from '@/app/defend/deployment-utils'
import { MaskedCredentialInput } from './MaskedCredentialInput'
import { McpDiscoveredToolRow } from './McpDiscoveredToolRow'
import {
  fieldInputClassName,
  fieldLabelClassName,
  fieldSubLabelClassName,
  panelClassName,
  secondaryButtonClassName,
} from './field-styles'

interface McpConnectionCardProps {
  connection: McpConnectionDraft
  index: number
  isChecking: boolean
  onEndpointChange: (changes: { url?: string; credential?: string }) => void
  onPermissionsChange: (permissions: McpConnectionPermissions) => void
  onCheckConnection: () => void
  onToggleTool: (tool: DiscoveredMcpTool) => void
  onRemove: () => void
}

export function McpConnectionCard({
  connection,
  index,
  isChecking,
  onEndpointChange,
  onPermissionsChange,
  onCheckConnection,
  onToggleTool,
  onRemove,
}: McpConnectionCardProps) {
  const urlError = connection.url ? validateConnectionUrl(connection.url) : null
  const changedDefinitions = new Set(
    findChangedToolDefinitions(connection.discoveredTools, connection.approvedTools)
  )
  const approvedKeys = new Set(connection.approvedTools.map(approvedToolKey))
  const visibleTools: DiscoveredMcpTool[] =
    connection.discoveredTools.length > 0 ? connection.discoveredTools : connection.approvedTools

  return (
    <div className={panelClassName}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            MCP connection {index + 1}
          </p>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
            Remote HTTPS Model Context Protocol server with optional bearer-token authentication.
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove MCP connection ${index + 1}`}
          className="text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-danger)]"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div>
          <label className={fieldLabelClassName}>Server URL</label>
          <span className={fieldSubLabelClassName}>{MCP_URL_HINT}</span>
        </div>
        <input
          type="url"
          value={connection.url}
          onChange={event => onEndpointChange({ url: event.target.value })}
          placeholder="https://mcp.your-test-environment.example/mcp"
          autoComplete="off"
          spellCheck="false"
          className={fieldInputClassName}
        />
        {urlError && <p className="font-body text-xs text-[var(--color-danger)]">{urlError}</p>}
      </div>

      <MaskedCredentialInput
        label="Bearer token"
        subLabel="Optional. The token your server checks, sent as “Authorization: Bearer …”. It is stored server-side and never exposed to attackers or your browser."
        value={connection.credential}
        onChange={credential => onEndpointChange({ credential })}
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onCheckConnection}
          disabled={isChecking || !connection.url}
          className={secondaryButtonClassName}
        >
          {isChecking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {isChecking
            ? 'Checking…'
            : connection.verified
              ? 'Re-check connection'
              : 'Check connection'}
        </button>
        {connection.verified ? (
          <span className="inline-flex items-center gap-1 text-xs text-[var(--color-success)]">
            <CheckCircle className="h-4 w-4" />
            Connection verified — {connection.discoveredTools.length} tool
            {connection.discoveredTools.length === 1 ? '' : 's'} discovered
          </span>
        ) : connection.discoveryError ? (
          <span className="inline-flex items-start gap-1 text-xs text-[var(--color-danger)]">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{connection.discoveryError}</span>
          </span>
        ) : (
          <span className="text-xs text-[var(--color-text-muted)]">Not verified yet.</span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div>
          <label className={fieldLabelClassName}>Tool approval</label>
          <span className={fieldSubLabelClassName}>
            No tools are enabled until you approve them. The agent invokes only approved tools, and
            each approval freezes the tool&apos;s definition — if the server changes it, approve it
            again.
          </span>
        </div>
        {visibleTools.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[var(--color-border-default)] p-3 text-xs text-[var(--color-text-muted)]">
            Run a connection check to discover this server&apos;s tools, then approve the ones your
            Sentinel may use.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {visibleTools.map(tool => (
              <McpDiscoveredToolRow
                key={approvedToolKey(tool)}
                tool={tool}
                isApproved={approvedKeys.has(approvedToolKey(tool))}
                isChanged={changedDefinitions.has(approvedToolKey(tool))}
                onToggle={() => onToggleTool(tool)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div>
          <label className={fieldLabelClassName}>Connection permissions</label>
          <span className={fieldSubLabelClassName}>
            Nothing needed here for a normal deployment — leave the hosts empty. Private and local
            addresses are always rejected, whatever you set. Fill this in only if you want an extra
            lock: the connection may then talk to the listed hosts only (e.g. mcp.shopfast.example,
            *.shopfast.example), so a redirected or lookalike URL is refused even if someone edits
            the server URL later.
          </span>
        </div>
        <input
          type="text"
          value={connection.permissions.allowed_hosts.join(', ')}
          onChange={event =>
            onPermissionsChange({
              ...connection.permissions,
              allowed_hosts: event.target.value
                .split(',')
                .map(host => host.trim())
                .filter(Boolean),
            })
          }
          placeholder="Allowed hosts, comma-separated — or leave empty (e.g. mcp.staging.example, *.staging.example)"
          autoComplete="off"
          spellCheck="false"
          className={fieldInputClassName}
        />
        <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--color-text-secondary)]">
          <input
            type="checkbox"
            checked={connection.permissions.allow_side_effects}
            onChange={event =>
              onPermissionsChange({
                ...connection.permissions,
                allow_side_effects: event.target.checked,
              })
            }
            className="h-4 w-4 accent-[var(--color-gold-primary)]"
          />
          Allow side-effecting tools to run (payments, cancellations, address changes…)
        </label>
        <p className="text-xs text-[var(--color-text-muted)]">
          Read-only tools always run. Tools that change state are registered only when this is
          checked — if approved tools are missing at attack time, check this first. Turn it on for
          demo or sandbox servers; keep it off when your tools act on production data.
        </p>
      </div>
    </div>
  )
}
