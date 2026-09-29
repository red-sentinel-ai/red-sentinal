'use client'

import { FileWarning, Layers, Loader2, RefreshCw, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useRagDocument } from '@/hooks/rag/useRagDocument'
import { RagApiError } from '@/lib/rag/rag-api'
import type { RagDocumentSummary } from '@/lib/rag/rag-types'

interface RagChunkInspectorProps {
  open: boolean
  network: string
  sentinelId: number
  document: RagDocumentSummary | null
  onClose: () => void
  onReplace: (document: RagDocumentSummary) => void
  /** Invoked without its own confirmation — the inventory owns the dialog. */
  onDelete: (document: RagDocumentSummary) => void
}

/**
 * Chunk inspector for one RAG Content Document (`RagChunkInspector` in the
 * Sentinel RAG Content Management blueprint). Shows the reconstructed source
 * content and every chunk of the document's active revision with its
 * sequence. Only chunks stored under this sentinel's namespace and this
 * document's id are displayed. Provides document-scoped replace and delete.
 */
export function RagChunkInspector({
  open,
  network,
  sentinelId,
  document,
  onClose,
  onReplace,
  onDelete,
}: RagChunkInspectorProps) {
  const {
    data: detail,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useRagDocument(open ? network : null, open ? sentinelId : null, document?.document_id ?? null)

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={nextOpen => {
          if (!nextOpen) onClose()
        }}
      >
        <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden bg-[var(--color-bg-surface)] sm:max-w-3xl sm:rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[var(--color-text-primary)]">
              {document?.title ?? 'Document'}
              {detail && (
                <Badge
                  variant="outline"
                  className="border-[var(--color-border-default)] text-[var(--color-text-muted)]"
                >
                  revision v{detail.source_version}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {detail
                ? `${detail.chunk_count} chunk${detail.chunk_count === 1 ? '' : 's'} · ${detail.character_count.toLocaleString()} characters · updated ${formatUpdatedAt(detail.updated_at)}`
                : 'Reconstructing stored content from its chunks…'}
            </DialogDescription>
          </DialogHeader>

          <div className="-mr-2 flex-1 space-y-5 overflow-y-auto pr-2">
            {isPending && (
              <div className="flex items-center gap-2 py-10 text-sm text-[var(--color-text-muted)]">
                <Loader2 className="size-4 animate-spin" />
                Loading document content…
              </div>
            )}

            {isError && (
              <div className="border-[var(--color-danger)]/30 space-y-3 rounded-lg border bg-[var(--color-danger-muted)] p-4">
                <p className="flex items-center gap-2 text-sm text-[var(--color-danger)]">
                  <FileWarning className="size-4" />
                  {error instanceof RagApiError ? error.message : 'Failed to load the document.'}
                </p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="mr-1.5 size-3.5" />
                  Retry
                </Button>
              </div>
            )}

            {detail && (
              <>
                <section className="space-y-2">
                  <h4 className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                    Stored content
                  </h4>
                  <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-deepest)] p-3 font-mono text-xs leading-relaxed text-[var(--color-text-primary)]">
                    {detail.content}
                  </pre>
                </section>

                <section className="space-y-2">
                  <h4 className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                    <Layers className="size-3.5" />
                    Chunks ({detail.chunks.length})
                  </h4>
                  {detail.chunks.length === 0 ? (
                    <p className="text-sm text-[var(--color-text-muted)]">
                      This document has no stored chunks.
                    </p>
                  ) : (
                    <ol className="space-y-2">
                      {detail.chunks.map(chunk => (
                        <li
                          key={chunk.chunk_id}
                          className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-deepest)] p-3"
                        >
                          <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-[var(--color-accent)]">
                            Chunk {chunk.chunk_index}
                          </span>
                          <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-[var(--color-text-primary)]">
                            {chunk.text}
                          </p>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              </>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-[var(--color-border-subtle)] pt-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => document && onReplace(document)}
                disabled={!detail || isFetching}
              >
                <RefreshCw className="mr-1.5 size-3.5" />
                Replace
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-[var(--color-danger)] hover:bg-[var(--color-danger-muted)] hover:text-[var(--color-danger)]"
                onClick={() => document && onDelete(document)}
                disabled={!detail}
              >
                <Trash2 className="mr-1.5 size-3.5" />
                Delete
              </Button>
            </div>
            {isFetching && !isPending && (
              <Loader2 className="size-4 animate-spin text-[var(--color-text-muted)]" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function formatUpdatedAt(updatedAt: string): string {
  if (!updatedAt) return 'unknown time'
  const parsed = new Date(updatedAt)
  if (Number.isNaN(parsed.getTime())) return updatedAt
  return parsed.toLocaleString()
}
