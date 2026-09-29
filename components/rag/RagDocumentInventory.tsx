'use client'

import { useState } from 'react'
import {
  BookOpen,
  Database,
  FileText,
  FileWarning,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import { Skeleton } from '@/components/ui'
import { RagChunkInspector } from '@/components/rag/RagChunkInspector'
import { RagConfirmDialog } from '@/components/rag/RagConfirmDialog'
import { RagDocumentEditor } from '@/components/rag/RagDocumentEditor'
import { useClearRagContent } from '@/hooks/rag/useClearRagContent'
import { useCreateRagDocument } from '@/hooks/rag/useCreateRagDocument'
import { useDeleteRagDocument } from '@/hooks/rag/useDeleteRagDocument'
import { useReplaceRagDocument } from '@/hooks/rag/useReplaceRagDocument'
import { useRagDocuments } from '@/hooks/rag/useRagDocuments'
import { RagApiError } from '@/lib/rag/rag-api'
import type { RagDocumentSummary } from '@/lib/rag/rag-types'

interface RagDocumentInventoryProps {
  network: string
  sentinelId: number
  sentinelName?: string
}

type EditorState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'replace'; document: RagDocumentSummary }

/**
 * Document inventory for one live Sentinel (`RagDocumentInventory` in the
 * Sentinel RAG Content Management blueprint). Shows the shared index and
 * namespace as read-only diagnostics, the document inventory with loading /
 * empty / error / retry states, and hosts the add, replace, inspect, delete,
 * and clear-all actions. Manual index-linking is intentionally not offered —
 * content always lives on the shared index under the Sentinel's namespace.
 */
export function RagDocumentInventory({
  network,
  sentinelId,
  sentinelName,
}: RagDocumentInventoryProps) {
  const {
    data: inventory,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useRagDocuments(network, sentinelId)

  const createMutation = useCreateRagDocument(network, sentinelId)
  const replaceMutation = useReplaceRagDocument(network, sentinelId, null)
  const deleteMutation = useDeleteRagDocument(network, sentinelId, null)
  const clearMutation = useClearRagContent(network, sentinelId)

  const [editor, setEditor] = useState<EditorState>({ mode: 'closed' })
  const [inspected, setInspected] = useState<RagDocumentSummary | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState<RagDocumentSummary | null>(null)
  const [confirmingClear, setConfirmingClear] = useState(false)
  const [dismissedMutationError, setDismissedMutationError] = useState(false)

  const documents = inventory?.documents ?? []
  const mutationError = !dismissedMutationError
    ? (createMutation.error ?? replaceMutation.error ?? deleteMutation.error ?? clearMutation.error)
    : null

  const closeEditor = () => {
    setEditor({ mode: 'closed' })
    createMutation.reset()
    replaceMutation.reset()
  }

  const handleEditorSubmit = (payload: { title?: string; content: string }) => {
    setDismissedMutationError(false)
    if (editor.mode === 'replace') {
      replaceMutation.mutate(
        { ...payload },
        {
          onSuccess: response => {
            closeEditor()
            setInspected(null)
            toast.success(`Document "${response.document.title}" replaced`, {
              description: `Revision v${response.document.source_version} · ${response.document.chunk_count} chunks indexed`,
            })
          },
        }
      )
    } else {
      createMutation.mutate(
        { ...payload },
        {
          onSuccess: response => {
            closeEditor()
            toast.success(`Document "${response.document.title}" added`, {
              description: `${response.document.chunk_count} chunks indexed into the Sentinel's namespace`,
            })
          },
        }
      )
    }
  }

  const handleDelete = (document: RagDocumentSummary) => {
    setDismissedMutationError(false)
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        setInspected(null)
        setConfirmingDelete(null)
        toast.success(`Document "${document.title}" deleted`)
      },
    })
  }

  const handleClearAll = () => {
    setDismissedMutationError(false)
    clearMutation.mutate(undefined, {
      onSuccess: () => {
        setConfirmingClear(false)
        setInspected(null)
        toast.success('RAG content cleared', {
          description: 'All chunks were removed and RAG is now disabled for this Sentinel.',
        })
      },
    })
  }

  return (
    <div className="space-y-5">
      {/* Read-only shared index diagnostics (AC-SRCM-001.4). */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-4 py-3 text-xs">
        <span className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
          <Database className="size-3.5 text-[var(--color-accent)]" />
          Shared index:
          <code className="text-[var(--color-text-primary)]">
            {inventory?.index_name ?? 'sentinel-rag-shared'}
          </code>
        </span>
        <span className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
          <Layers className="size-3.5 text-[var(--color-accent)]" />
          Namespace:
          <code className="text-[var(--color-text-primary)]">
            {inventory?.namespace ?? `${network}-${sentinelId}`}
          </code>
        </span>
        {inventory && !inventory.enabled && (
          <Badge
            variant="outline"
            className="border-[var(--color-border-strong)] text-[var(--color-text-muted)]"
          >
            RAG disabled
          </Badge>
        )}
      </div>

      {mutationError && (
        <div
          role="alert"
          className="border-[var(--color-danger)]/30 flex items-start justify-between gap-3 rounded-lg border bg-[var(--color-danger-muted)] px-4 py-3"
        >
          <p className="flex items-center gap-2 text-sm text-[var(--color-danger)]">
            <FileWarning className="size-4 shrink-0" />
            {mutationError instanceof RagApiError
              ? mutationError.message
              : 'The last operation failed. Your content inventory is unchanged.'}
          </p>
          <button
            type="button"
            className="text-xs text-[var(--color-danger)] underline-offset-2 hover:underline"
            onClick={() => {
              setDismissedMutationError(true)
              createMutation.reset()
              replaceMutation.reset()
              deleteMutation.reset()
              clearMutation.reset()
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-medium text-[var(--color-text-primary)]">
            Knowledge documents
            {sentinelName ? (
              <span className="ml-2 text-sm font-normal text-[var(--color-text-muted)]">
                for {sentinelName} (#{sentinelId})
              </span>
            ) : null}
          </h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            {inventory
              ? `${inventory.document_count} document${inventory.document_count === 1 ? '' : 's'} indexed for attack-time retrieval`
              : 'Documents this Sentinel retrieves during attacks'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? (
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <RefreshCw className="mr-1.5 size-3.5" />
            )}
            Refresh
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-[var(--color-danger)] hover:bg-[var(--color-danger-muted)] hover:text-[var(--color-danger)]"
            onClick={() => setConfirmingClear(true)}
            disabled={!inventory || (!inventory.enabled && inventory.document_count === 0)}
          >
            <Trash2 className="mr-1.5 size-3.5" />
            Clear all
          </Button>
          <Button size="sm" onClick={() => setEditor({ mode: 'create' })}>
            <Plus className="mr-1.5 size-3.5" />
            Add document
          </Button>
        </div>
      </div>

      {/* Loading (AC-SRCM-002.4) */}
      {isPending && (
        <div className="space-y-3">
          {[0, 1, 2].map(row => (
            <div
              key={row}
              className="flex items-center justify-between rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-4"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
          <p className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <Loader2 className="size-3.5 animate-spin" />
            Loading content inventory…
          </p>
        </div>
      )}

      {/* Load failure + retry (AC-SRCM-002.5) */}
      {isError && (
        <div className="border-[var(--color-danger)]/30 space-y-3 rounded-xl border bg-[var(--color-danger-muted)] p-5">
          <p className="flex items-center gap-2 text-sm text-[var(--color-danger)]">
            <FileWarning className="size-4" />
            {error instanceof RagApiError
              ? error.message
              : 'Failed to load the RAG content inventory.'}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-1.5 size-3.5" />
            Retry
          </Button>
        </div>
      )}

      {/* Empty states (AC-SRCM-002.6, and disabled after clear-all AC-SRCM-004.4) */}
      {inventory && documents.length === 0 && (
        <div className="space-y-3 rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] p-8 text-center">
          <BookOpen className="mx-auto size-8 text-[var(--color-text-muted)]" />
          <div className="space-y-1">
            <p className="font-medium text-[var(--color-text-primary)]">
              {inventory.enabled ? 'No indexed content' : 'RAG is disabled for this Sentinel'}
            </p>
            <p className="mx-auto max-w-md text-sm text-[var(--color-text-muted)]">
              {inventory.enabled
                ? 'This Sentinel has no knowledge documents yet. Add a document so it can retrieve relevant knowledge during attacks.'
                : 'All RAG content was cleared. Add a document to re-enable retrieval for this Sentinel.'}
            </p>
          </div>
          <Button size="sm" onClick={() => setEditor({ mode: 'create' })}>
            <Plus className="mr-1.5 size-3.5" />
            Add your first document
          </Button>
        </div>
      )}

      {/* Inventory (AC-SRCM-002.1 / 002.2) */}
      {documents.length > 0 && (
        <ul className="space-y-3">
          {documents.map(document => (
            <li
              key={document.document_id}
              className="flex flex-col gap-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <button
                type="button"
                className="flex-1 text-left"
                onClick={() => setInspected(document)}
              >
                <span className="flex items-center gap-2 font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent)]">
                  <FileText className="size-4 shrink-0 text-[var(--color-text-muted)]" />
                  {document.title}
                </span>
                <span className="mt-1 block text-xs text-[var(--color-text-muted)]">
                  {document.chunk_count} chunk{document.chunk_count === 1 ? '' : 's'} ·{' '}
                  {document.character_count.toLocaleString()} characters · updated{' '}
                  {formatUpdatedAt(document.updated_at)}
                  {document.document_id === 'legacy' && ' · migrated content'}
                </span>
              </button>
              <div className="flex shrink-0 items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setInspected(document)}>
                  Inspect chunks
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditor({ mode: 'replace', document })}
                >
                  <RefreshCw className="mr-1.5 size-3.5" />
                  Replace
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[var(--color-danger)] hover:bg-[var(--color-danger-muted)] hover:text-[var(--color-danger)]"
                  onClick={() => setConfirmingDelete(document)}
                >
                  <Trash2 className="size-3.5" />
                  <span className="sr-only">Delete {document.title}</span>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Editor (create + replace) */}
      <RagDocumentEditor
        open={editor.mode !== 'closed'}
        documentId={editor.mode === 'replace' ? editor.document.document_id : null}
        initialTitle={editor.mode === 'replace' ? editor.document.title : ''}
        submitting={createMutation.isPending || replaceMutation.isPending}
        errorMessage={
          editor.mode === 'replace'
            ? replaceMutation.error instanceof RagApiError
              ? replaceMutation.error.message
              : null
            : createMutation.error instanceof RagApiError
              ? createMutation.error.message
              : null
        }
        onSubmit={handleEditorSubmit}
        onOpenChange={nextOpen => {
          if (!nextOpen) closeEditor()
        }}
      />

      {/* Chunk inspector */}
      <RagChunkInspector
        open={inspected !== null}
        network={network}
        sentinelId={sentinelId}
        document={inspected}
        onClose={() => setInspected(null)}
        onReplace={document => {
          setInspected(null)
          setEditor({ mode: 'replace', document })
        }}
        onDelete={document => {
          setConfirmingDelete(document)
        }}
      />

      {/* Document deletion confirmation (AC-SRCM-004.1) */}
      <RagConfirmDialog
        open={confirmingDelete !== null}
        title="Delete this document?"
        description={`"${confirmingDelete?.title ?? ''}" and its chunks will be removed from this Sentinel's namespace. Other documents are not affected.`}
        confirmLabel="Delete document"
        destructive
        pending={deleteMutation.isPending}
        onConfirm={() => confirmingDelete && handleDelete(confirmingDelete)}
        onOpenChange={nextOpen => {
          if (!nextOpen) setConfirmingDelete(null)
        }}
      />

      {/* Clear-all confirmation (AC-SRCM-004.3 / 004.4) */}
      <RagConfirmDialog
        open={confirmingClear}
        title="Clear all RAG content?"
        description="Every chunk in this Sentinel's namespace will be removed and RAG will be disabled for this Sentinel. This cannot be undone."
        confirmLabel="Clear all content"
        destructive
        pending={clearMutation.isPending}
        onConfirm={handleClearAll}
        onOpenChange={setConfirmingClear}
      />
    </div>
  )
}

function formatUpdatedAt(updatedAt: string): string {
  if (!updatedAt) return 'unknown time'
  const parsed = new Date(updatedAt)
  if (Number.isNaN(parsed.getTime())) return updatedAt
  return parsed.toLocaleString()
}
