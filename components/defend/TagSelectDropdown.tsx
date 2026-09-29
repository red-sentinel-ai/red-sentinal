'use client'

import { Check, ChevronDown, Loader2 } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTags } from '@/hooks/tags/useTags'

interface TagSelectDropdownProps {
  selectedTagIds: string[]
  onChange: (tagIds: string[]) => void
}

/**
 * Multi-select dropdown of admin-managed tags for the launch-sentinel form.
 * Tags are fetched from GET /api/tags; users can only pick existing tags —
 * new tags are created by admins from the admin UI.
 */
export function TagSelectDropdown({ selectedTagIds, onChange }: TagSelectDropdownProps) {
  const { data: tags, isPending, isError, refetch } = useTags()

  const toggleTag = (tagId: string) => {
    onChange(
      selectedTagIds.includes(tagId)
        ? selectedTagIds.filter(id => id !== tagId)
        : [...selectedTagIds, tagId]
    )
  }

  const selectedNames = (tags ?? [])
    .filter(tag => selectedTagIds.includes(tag.tag_id))
    .map(tag => tag.name)

  return (
    <div className="flex flex-col gap-2">
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
          Tags
        </label>
        <span className="mt-1 block text-xs text-[var(--color-text-muted)]">
          Categorize your Sentinel so attackers can discover it. Tags are curated by the Red
          Sentinel team.
        </span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="font-body flex min-h-10 w-full items-center justify-between gap-2 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2 text-left text-sm text-[var(--color-text-primary)] transition-all focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-primary)]"
          >
            {isPending ? (
              <span className="flex items-center gap-2 text-[var(--color-text-muted)]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading tags…
              </span>
            ) : selectedNames.length > 0 ? (
              <span className="flex flex-wrap gap-1.5">
                {selectedNames.map(name => (
                  <span
                    key={name}
                    className="rounded-md bg-[var(--color-bg-subtle)] px-2 py-0.5 text-xs font-medium"
                  >
                    {name}
                  </span>
                ))}
              </span>
            ) : (
              <span className="text-[var(--color-text-faint)]">Select tags…</span>
            )}
            <ChevronDown className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          className="max-h-[300px] w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]"
        >
          {isError ? (
            <DropdownMenuItem
              onSelect={() => refetch()}
              className="px-3 py-2.5 text-sm text-[var(--color-danger)]"
            >
              Failed to load tags — retry
            </DropdownMenuItem>
          ) : (tags ?? []).length === 0 && !isPending ? (
            <div className="px-3 py-2.5 text-sm text-[var(--color-text-muted)]">
              No tags available yet
            </div>
          ) : (
            (tags ?? []).map(tag => (
              <DropdownMenuItem
                key={tag.tag_id}
                onSelect={event => {
                  // Keep the menu open while picking multiple tags.
                  event.preventDefault()
                  toggleTag(tag.tag_id)
                }}
                className="flex items-center justify-between px-3 py-2.5 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)] focus:bg-[var(--color-bg-subtle)]"
              >
                <div>
                  <span className="font-body block text-sm font-medium">{tag.name}</span>
                  {tag.description && (
                    <span className="font-body block text-xs text-[var(--color-text-muted)]">
                      {tag.description}
                    </span>
                  )}
                </div>
                {selectedTagIds.includes(tag.tag_id) && (
                  <Check className="h-4 w-4 shrink-0 text-[var(--color-success)]" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
