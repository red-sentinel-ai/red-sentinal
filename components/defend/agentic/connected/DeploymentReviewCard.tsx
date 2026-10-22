'use client'

import type {
  BreachCondition,
  EvidenceSource,
  ExecutionLimits,
  ExistingAgentDraft,
  McpConnectionDraft,
  ConnectedDeploymentMethod,
} from '@/app/defend/agentic-types'
import { getBreachConditionTypeMeta } from '@/app/defend/deployment-utils'
import { EVIDENCE_SOURCE_LABELS } from './EvidenceSourceNotice'
import { fieldLabelClassName, fieldSubLabelClassName, panelClassName } from './field-styles'

const METHOD_LABELS: Record<ConnectedDeploymentMethod, string> = {
  hosted_agent: 'Hosted Agent with MCP connections',
  existing_agent: 'Existing Agent Connection',
}

interface DeploymentReviewCardProps {
  method: ConnectedDeploymentMethod
  mcpConnections: McpConnectionDraft[]
  existingAgent: ExistingAgentDraft
  breachConditions: BreachCondition[]
  evidenceSource: EvidenceSource
  executionLimits: ExecutionLimits
  bounty: string
  attackFee: string
  tokenSymbol: string
  launchAllowed: boolean
}

interface ReviewRowProps {
  label: string
  children: React.ReactNode
}

function ReviewRow({ label, children }: ReviewRowProps) {
  return (
    <div className="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-[180px_1fr] sm:gap-4">
      <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-faint)]">
        {label}
      </span>
      <div className="text-sm text-[var(--color-text-primary)]">{children}</div>
    </div>
  )
}

export function DeploymentReviewCard({
  method,
  mcpConnections,
  existingAgent,
  breachConditions,
  evidenceSource,
  executionLimits,
  bounty,
  attackFee,
  tokenSymbol,
  launchAllowed,
}: DeploymentReviewCardProps) {
  const approvedTools = mcpConnections.flatMap(connection =>
    connection.approvedTools.map(tool => ({ server: connection.url, name: tool.name }))
  )
  const enabledCapabilities = (
    Object.keys(existingAgent.capabilities) as Array<keyof ExistingAgentDraft['capabilities']>
  ).filter(capability => existingAgent.capabilities[capability].enabled)

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className={fieldLabelClassName}>Review deployment</label>
        <span className={fieldSubLabelClassName}>
          {launchAllowed
            ? 'This is the validated configuration that will launch.'
            : 'What will launch once Preflight Validation passes.'}
        </span>
      </div>
      <div className={`${panelClassName} gap-0 divide-y divide-[var(--color-border-subtle)]`}>
        <ReviewRow label="Execution method">{METHOD_LABELS[method]}</ReviewRow>

        <ReviewRow label="Connected environment">
          {method === 'hosted_agent' ? (
            mcpConnections.length === 0 ? (
              <span className="text-[var(--color-text-muted)]">No MCP connections</span>
            ) : (
              <ul className="flex flex-col gap-0.5">
                {mcpConnections.map(connection => (
                  <li key={connection.id} className="font-mono text-xs">
                    {connection.url || (
                      <span className="text-[var(--color-text-muted)]">(no URL)</span>
                    )}
                    {connection.credential ? ' · token set' : ''}
                    {connection.verified ? ' · verified' : ' · not verified'}
                  </li>
                ))}
              </ul>
            )
          ) : (
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-xs">
                {existingAgent.url || (
                  <span className="text-[var(--color-text-muted)]">(no URL)</span>
                )}
                {existingAgent.credential ? ' · token set' : ''}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                Capabilities:{' '}
                {enabledCapabilities.length > 0 ? enabledCapabilities.join(', ') : 'none mapped'}
              </span>
            </div>
          )}
        </ReviewRow>

        {method === 'hosted_agent' && (
          <ReviewRow label="Approved tools">
            {approvedTools.length === 0 ? (
              <span className="text-[var(--color-text-muted)]">None approved</span>
            ) : (
              <ul className="flex flex-wrap gap-1.5">
                {approvedTools.map(tool => (
                  <li
                    key={`${tool.server}:${tool.name}`}
                    className="rounded-full border border-[var(--color-border-subtle)] px-2 py-0.5 font-mono text-xs"
                  >
                    {tool.name}
                  </li>
                ))}
              </ul>
            )}
          </ReviewRow>
        )}

        <ReviewRow label="Breach Conditions">
          {breachConditions.length === 0 ? (
            <span className="text-[var(--color-text-muted)]">None defined</span>
          ) : (
            <ul className="flex flex-col gap-1">
              {breachConditions.map(condition => (
                <li key={condition.id} className="text-xs">
                  <span className="font-medium">
                    {getBreachConditionTypeMeta(condition.type).label}
                  </span>
                  {condition.description ? ` — ${condition.description}` : ''}
                </li>
              ))}
            </ul>
          )}
        </ReviewRow>

        <ReviewRow label="Evidence source">{EVIDENCE_SOURCE_LABELS[evidenceSource]}</ReviewRow>

        <ReviewRow label="Execution limits">
          {executionLimits.max_tool_steps} tool-calling steps ·{' '}
          {executionLimits.turn_time_budget_seconds}s per turn
        </ReviewRow>

        <ReviewRow label="Bounty">
          {bounty ? (
            `${bounty} ${tokenSymbol}`
          ) : (
            <span className="text-[var(--color-text-muted)]">Not set</span>
          )}
        </ReviewRow>

        <ReviewRow label="Attack fee">
          {attackFee ? (
            `${attackFee} ${tokenSymbol} per message`
          ) : (
            <span className="text-[var(--color-text-muted)]">Not set</span>
          )}
        </ReviewRow>
      </div>
    </div>
  )
}
