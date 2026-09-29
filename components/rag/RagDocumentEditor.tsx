'use client'

import { useEffect, useRef, useState } from 'react'
import { FileText, Loader2, Upload } from 'lucide-react'

import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const SUPPORTED_FILE_EXTENSIONS = ['.txt', '.md', '.markdown']
const MAX_CONTENT_LENGTH = 2_000_000

interface RagDocumentEditorProps {
  open: boolean
  /** When set the editor replaces that document; otherwise it adds a new one. */
  documentId?: string | null
  /** Pre-fills the editor when replacing (title before the dialog opens). */
  initialTitle?: string
  initialContent?: string
  submitting: boolean
  errorMessage?: string | null
  onSubmit: (payload: { title?: string; content: string }) => void
  onOpenChange: (open: boolean) => void
}

/**
 * Add/replace editor for RAG Content Documents (`RagDocumentEditor` in the
 * Sentinel RAG Content Management blueprint). Supports direct text entry and
 * supported local text-file selection (.txt / .md). Empty content is
 * rejected with an explanation, mirroring the API contract.
 */
export function RagDocumentEditor({
  open,
  documentId,
  initialTitle = '',
  initialContent = '',
  submitting,
  errorMessage,
  onSubmit,
  onOpenChange,
}: RagDocumentEditorProps) {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [fileName, setFileName] = useState<string | null>(null)
  const [touchedSubmit, setTouchedSubmit] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset the draft whenever the dialog opens for a different target.
  useEffect(() => {
    if (open) {
      setTitle(initialTitle)
      setContent(initialContent)
      setFileName(null)
      setTouchedSubmit(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, documentId])

  const trimmedContent = content.trim()
  const contentMissing = trimmedContent.length === 0
  const showContentError = contentMissing && (touchedSubmit || content.length > 0)

  const handleFileSelected = async (file: File | null) => {
    if (!file) return

    const lowerName = file.name.toLowerCase()
    if (!SUPPORTED_FILE_EXTENSIONS.some(ext => lowerName.endsWith(ext))) {
      setFileName(file.name)
      setContent('')
      return
    }

    const text = await file.text()
    setFileName(file.name)
    // The stored title defaults to the file name when none was typed.
    if (!title.trim()) setTitle(file.name.replace(/\.[^.]+$/, ''))
    setContent(text.slice(0, MAX_CONTENT_LENGTH))
  }

  const handleSubmit = () => {
    setTouchedSubmit(true)
    if (contentMissing || submitting) return
    onSubmit({ title: title.trim() || undefined, content })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto bg-[var(--color-bg-surface)] sm:max-w-2xl sm:rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-[var(--color-text-primary)]">
            {documentId ? 'Replace document' : 'Add document'}
          </DialogTitle>
          <DialogDescription>
            {documentId
              ? 'The new revision is indexed before the previous one is removed, so the knowledge stays available if indexing fails.'
              : 'The content is chunked and indexed into this live Sentinel’s namespace.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label htmlFor="rag-document-title" className="text-sm text-[var(--color-text-muted)]">
              Title <span className="text-[var(--color-text-muted)]">(optional)</span>
            </label>
            <Input
              id="rag-document-title"
              value={title}
              onChange={event => setTitle(event.target.value)}
              placeholder="e.g. Protocol security policy"
              disabled={submitting}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="rag-document-content"
                className="text-sm text-[var(--color-text-muted)]"
              >
                Content <span className="text-[var(--color-danger)]">*</span>
              </label>
              <div className="flex items-center gap-2">
                {fileName && (
                  <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                    <FileText className="size-3" />
                    {fileName}
                  </span>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={submitting}
                >
                  <Upload className="mr-1.5 size-3.5" />
                  Upload text file
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.markdown,text/plain,text/markdown"
                  className="hidden"
                  onChange={event => {
                    void handleFileSelected(event.target.files?.[0] ?? null)
                    event.target.value = ''
                  }}
                />
              </div>
            </div>
            <textarea
              id="rag-document-content"
              value={content}
              onChange={event => setContent(event.target.value)}
              placeholder="Paste or type the knowledge this Sentinel should retrieve during attacks…"
              rows={12}
              disabled={submitting}
              className="w-full resize-y rounded-md border border-[var(--color-border-default)] bg-[var(--color-bg-deepest)] p-3 font-mono text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)] disabled:opacity-50"
            />
            <div className="flex items-center justify-between text-xs">
              <span
                className={
                  showContentError ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-muted)]'
                }
              >
                {showContentError
                  ? 'Content is required — enter text or upload a supported text file.'
                  : `${content.length.toLocaleString()} characters`}
              </span>
              <span className="text-[var(--color-text-muted)]">
                {MAX_CONTENT_LENGTH.toLocaleString()} character limit
              </span>
            </div>
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="border-[var(--color-danger)]/30 rounded-md border bg-[var(--color-danger-muted)] px-3 py-2 text-sm text-[var(--color-danger)]"
            >
              {errorMessage}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || contentMissing}>
            {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            {documentId ? 'Replace document' : 'Add document'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
