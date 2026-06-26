'use client'

import { useEffect, useState } from 'react'
import JsonView from '@uiw/react-json-view'
import { darkTheme } from '@uiw/react-json-view/dark'
import { AlertCircle } from 'lucide-react'

interface JsonTextEditorProps {
  /** The current (always-valid) object value. */
  value: unknown
  /** Called with the parsed object whenever the text is valid JSON. */
  onChange: (value: unknown) => void
}

/**
 * Escape-hatch JSON editor: an editable textarea with live validation, paired
 * with a read-only @uiw/react-json-view preview of the last valid value. Used
 * for environments without a structured editor and as the "Edit as JSON" tab.
 */
export function JsonTextEditor({ value, onChange }: JsonTextEditorProps) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2))
  const [error, setError] = useState<string | null>(null)

  // Resync the textarea only when the value changes for an external reason
  // (e.g. edits made in the structured Form tab). Skipping when our own valid
  // text already matches keeps typing from being interrupted by reformatting.
  useEffect(() => {
    try {
      if (JSON.stringify(JSON.parse(text)) === JSON.stringify(value)) return
    } catch {
      // Current text is invalid — fall through and resync from the value.
    }
    setText(JSON.stringify(value, null, 2))
    setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const handleChange = (next: string) => {
    setText(next)
    try {
      const parsed = JSON.parse(next)
      setError(null)
      onChange(parsed)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={text}
        onChange={e => handleChange(e.target.value)}
        spellCheck={false}
        className="font-mono min-h-[220px] w-full resize-y rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-3 text-xs text-[var(--color-text-primary)] transition-all focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-primary)]"
      />
      {error ? (
        <p className="flex items-center gap-1.5 text-xs text-[var(--color-danger)]">
          <AlertCircle className="h-3.5 w-3.5" />
          Invalid JSON: {error}
        </p>
      ) : (
        <div className="overflow-auto rounded-lg border border-[var(--color-border-subtle)] p-3">
          <JsonView
            value={value as object}
            style={darkTheme}
            displayDataTypes={false}
            displayObjectSize={false}
            enableClipboard={false}
          />
        </div>
      )}
    </div>
  )
}
