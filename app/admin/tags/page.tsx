'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, Tags } from 'lucide-react'
import { toast } from 'sonner'

import type { SentinelTag } from '@/types/tags'

const ADMIN_KEY_SESSION_KEY = 'rs_admin_key'

async function fetchAllTags(adminKey: string): Promise<SentinelTag[]> {
  const response = await fetch('/api/tags', { headers: { 'x-admin-key': adminKey } })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Failed to load tags')
  return data.tags ?? []
}

async function createTag(
  adminKey: string,
  input: { name: string; description: string }
): Promise<SentinelTag> {
  const response = await fetch('/api/tags', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
    body: JSON.stringify(input),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Failed to create tag')
  return data.tag
}

export default function AdminTagsPage() {
  const queryClient = useQueryClient()
  const [adminKey, setAdminKey] = useState<string>(() =>
    typeof window === 'undefined' ? '' : (sessionStorage.getItem(ADMIN_KEY_SESSION_KEY) ?? '')
  )
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const {
    data: tags,
    isPending,
    isError,
    error,
  } = useQuery<SentinelTag[], Error>({
    queryKey: ['admin-tags'],
    queryFn: () => fetchAllTags(adminKey),
    enabled: Boolean(adminKey),
    retry: false,
  })

  const createMutation = useMutation({
    mutationFn: (input: { name: string; description: string }) => createTag(adminKey, input),
    onSuccess: tag => {
      toast.success(`Tag "${tag.name}" created`)
      setName('')
      setDescription('')
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] })
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
    onError: (mutationError: Error) => {
      toast.error(mutationError.message)
    },
  })

  const handleSaveKey = (value: string) => {
    setAdminKey(value)
    sessionStorage.setItem(ADMIN_KEY_SESSION_KEY, value)
  }

  if (!adminKey) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col justify-center px-4 py-12">
        <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-6">
          <div className="mb-4 flex items-center gap-2 text-[var(--color-accent)]">
            <Tags className="size-5" />
            <span className="text-xs font-medium uppercase tracking-widest">Admin</span>
          </div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Tag management</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Enter the admin key to manage Sentinel tags.
          </p>
          <form
            className="mt-4 flex gap-2"
            onSubmit={event => {
              event.preventDefault()
              const value = new FormData(event.currentTarget).get('admin_key')
              if (typeof value === 'string' && value.trim()) handleSaveKey(value.trim())
            }}
          >
            <input
              name="admin_key"
              type="password"
              placeholder="Admin key"
              className="font-body h-10 flex-1 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-deepest)] px-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-gold-primary)] focus:outline-none"
            />
            <button
              type="submit"
              className="h-10 rounded-lg bg-[var(--color-gold-primary)] px-4 text-sm font-medium text-[var(--color-text-on-gold)] hover:bg-[var(--color-gold-light)]"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="mb-8 space-y-2">
        <div className="flex items-center gap-2 text-[var(--color-accent)]">
          <Tags className="size-5" />
          <span className="text-xs font-medium uppercase tracking-widest">Administration</span>
        </div>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] sm:text-3xl">
          Sentinel tags
        </h1>
        <p className="max-w-2xl text-sm text-[var(--color-text-muted)] sm:text-base">
          Tags shown in the launch-sentinel form. Users can only select from this list — new tags
          are created here.
        </p>
      </header>

      <section className="mb-8 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-4">
        <h2 className="mb-3 text-sm font-medium text-[var(--color-text-secondary)]">
          Add a new tag
        </h2>
        <form
          className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]"
          onSubmit={event => {
            event.preventDefault()
            if (!name.trim()) {
              toast.error('Tag name is required')
              return
            }
            createMutation.mutate({ name: name.trim(), description: description.trim() })
          }}
        >
          <input
            value={name}
            onChange={event => setName(event.target.value)}
            placeholder="Tag name (e.g. DeFi)"
            maxLength={60}
            className="font-body h-10 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-deepest)] px-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-gold-primary)] focus:outline-none"
          />
          <input
            value={description}
            onChange={event => setDescription(event.target.value)}
            placeholder="Description (optional)"
            maxLength={500}
            className="font-body h-10 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-deepest)] px-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-gold-primary)] focus:outline-none"
          />
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--color-gold-primary)] px-4 text-sm font-medium text-[var(--color-text-on-gold)] hover:bg-[var(--color-gold-light)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            Add tag
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]">
        {isPending ? (
          <div className="flex items-center gap-2 p-6 text-sm text-[var(--color-text-muted)]">
            <Loader2 className="size-4 animate-spin" />
            Loading tags…
          </div>
        ) : isError ? (
          <div className="p-6 text-sm text-[var(--color-danger)]">
            {error.message}
            {error.message === 'Unauthorized' && (
              <button
                type="button"
                className="ml-2 underline underline-offset-2"
                onClick={() => handleSaveKey('')}
              >
                Re-enter admin key
              </button>
            )}
          </div>
        ) : (tags ?? []).length === 0 ? (
          <div className="p-6 text-sm text-[var(--color-text-muted)]">
            No tags yet — add the first one above.
          </div>
        ) : (
          <ul className="divide-y divide-[var(--color-border-subtle)]">
            {(tags ?? []).map(tag => (
              <li key={tag.tag_id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <span className="font-body block truncate text-sm font-medium text-[var(--color-text-primary)]">
                    {tag.name}
                  </span>
                  {tag.description && (
                    <span className="font-body block truncate text-xs text-[var(--color-text-muted)]">
                      {tag.description}
                    </span>
                  )}
                </div>
                <span className="shrink-0 text-xs text-[var(--color-text-faint)]">{tag.slug}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
