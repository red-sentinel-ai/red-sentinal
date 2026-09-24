'use client'

import { LIVE_TOOLS_BY_PROVIDER } from '@/app/defend/live-tools'
import { LiveToolOption } from '@/components/defend/agentic/LiveToolOption'

interface LiveToolsChecklistProps {
  enabledLiveToolIds: string[]
  onChange: (enabledLiveToolIds: string[]) => void
}

export function LiveToolsChecklist({ enabledLiveToolIds, onChange }: LiveToolsChecklistProps) {
  const toggle = (toolId: string) => {
    if (enabledLiveToolIds.includes(toolId)) {
      onChange(enabledLiveToolIds.filter(id => id !== toolId))
    } else {
      onChange([...enabledLiveToolIds, toolId])
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
          Live Tools
        </label>
        <span className="mt-1 block text-xs text-[var(--color-text-muted)]">
          Optional add-ons — real integrations your Sentinel can call to answer questions. They run
          against live services, on top of the environment you selected.
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {LIVE_TOOLS_BY_PROVIDER.map(({ provider, tools }) => (
          <div key={provider} className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-faint)]">
              {provider}
            </span>
            {tools.map(tool => (
              <LiveToolOption
                key={tool.tool_id}
                tool={tool}
                isEnabled={enabledLiveToolIds.includes(tool.tool_id)}
                onToggle={() => toggle(tool.tool_id)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
