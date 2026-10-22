'use client'

import { CheckCircle, Loader2, MinusCircle, RefreshCw, ShieldCheck, XCircle } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { PreflightCheckResult, PreflightReport } from '@/app/defend/agentic-types'
import {
  fieldLabelClassName,
  fieldSubLabelClassName,
  panelClassName,
  primaryButtonClassName,
} from './field-styles'

interface PreflightPanelProps {
  report: PreflightReport | null
  /** A previous report exists but the configuration changed since. */
  hasStaleReport: boolean
  isRunning: boolean
  launchAllowed: boolean
  /** Blocking configuration problem found before preflight, if any. */
  validationError: string | null
  onRun: () => void
}

const STATUS_PRESENTATION: Record<
  PreflightCheckResult['status'],
  { label: string; icon: typeof CheckCircle; className: string }
> = {
  passed: { label: 'Passed', icon: CheckCircle, className: 'text-[var(--color-success)]' },
  failed: { label: 'Failed', icon: XCircle, className: 'text-[var(--color-danger)]' },
  unsupported: {
    label: 'Unsupported',
    icon: MinusCircle,
    className: 'text-[var(--color-warning)]',
  },
}

export function PreflightPanel({
  report,
  hasStaleReport,
  isRunning,
  launchAllowed,
  validationError,
  onRun,
}: PreflightPanelProps) {
  const failedCount = report?.checks.filter(check => check.status !== 'passed').length ?? 0

  return (
    <div id="preflight-section" className="flex flex-col gap-3">
      <div>
        <label className={fieldLabelClassName}>Preflight Validation</label>
        <span className={fieldSubLabelClassName}>
          Checks connectivity, authentication, approved-tool availability, required session and
          evidence capabilities, and both fixtures. Launch stays blocked until every check passes;
          any change to connections, approved tools, conditions, fixtures, or limits requires
          running it again.
        </span>
      </div>

      <div className={panelClassName}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onRun}
            disabled={isRunning}
            className={primaryButtonClassName}
          >
            {isRunning ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : report ? (
              <RefreshCw className="h-3.5 w-3.5" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5" />
            )}
            {isRunning
              ? 'Validating…'
              : report
                ? failedCount > 0
                  ? 'Retry failed checks'
                  : 'Run again'
                : 'Run Preflight Validation'}
          </button>
          {launchAllowed ? (
            <span className="inline-flex items-center gap-1 text-xs text-[var(--color-success)]">
              <CheckCircle className="h-4 w-4" />
              Validated — ready to launch
            </span>
          ) : report ? (
            <span className="text-xs text-[var(--color-danger)]">
              {failedCount} check{failedCount === 1 ? '' : 's'} blocking launch
            </span>
          ) : hasStaleReport ? (
            <span className="text-xs text-[var(--color-warning)]">
              Configuration changed since the last validation — run it again.
            </span>
          ) : (
            <span className="text-xs text-[var(--color-text-muted)]">Not validated yet.</span>
          )}
        </div>

        {validationError && !isRunning && (
          <p className="border-[var(--color-warning)]/40 bg-[var(--color-warning)]/10 rounded-lg border p-3 text-xs text-[var(--color-text-secondary)]">
            {validationError}
          </p>
        )}

        {report && (
          <ul className="flex flex-col divide-y divide-[var(--color-border-subtle)]">
            {report.checks.map(check => {
              const presentation = STATUS_PRESENTATION[check.status]
              const Icon = presentation.icon
              return (
                <li key={check.id} className="flex items-start gap-3 py-2.5">
                  <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', presentation.className)} />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm text-[var(--color-text-primary)]">
                        {check.label}
                      </span>
                      <span className={cn('text-xs font-medium', presentation.className)}>
                        {presentation.label}
                      </span>
                    </div>
                    {check.detail && (
                      <span className="text-xs text-[var(--color-text-muted)]">{check.detail}</span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {report && failedCount > 0 && (
          <p className="text-xs text-[var(--color-text-muted)]">
            Fix the failed or unsupported checks above and retry — the rest of your configuration is
            kept as-is.
          </p>
        )}
      </div>
    </div>
  )
}
