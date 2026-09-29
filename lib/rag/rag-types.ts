/**
 * Contract types for the live-Sentinel RAG Content Document API.
 *
 * Mirrors the backend routes under
 * `/sentinels/:network/rag/:sentinel_id/documents` (WO-13). Pinecone is the
 * source of truth: a document is the active revision of its stored chunks.
 */

/** Inventory summary of one RAG Content Document's active revision. */
export interface RagDocumentSummary {
  document_id: string
  title: string
  chunk_count: number
  character_count: number
  source_version: number
  /** ISO-8601 timestamp of the active revision. */
  updated_at: string
}

/** One stored chunk as shown by the chunk inspector. */
export interface RagDocumentChunkView {
  chunk_id: string
  chunk_index: number
  text: string
}

/** Read-only shared-index diagnostics shown in the management view. */
export interface RagDiagnostics {
  sentinel_id: number
  network: string
  index_name: string
  namespace: string
  enabled: boolean
}

/** Response of GET …/documents — the document inventory. */
export interface RagDocumentsListResponse extends RagDiagnostics {
  document_count: number
  documents: RagDocumentSummary[]
}

/** Response of GET …/documents/:document_id — reconstructed content + chunks. */
export interface RagDocumentDetailResponse extends RagDiagnostics, RagDocumentSummary {
  content: string
  chunks: RagDocumentChunkView[]
}

/** Status returned by document mutations. */
export type RagDocumentMutationStatus =
  | 'document_created'
  | 'document_replaced'
  | 'document_deleted'

/** Response of document mutations: affected summary, refreshed inventory,
 *  and the sentinel's refreshed RAG status. */
export interface RagDocumentMutationResponse extends RagDiagnostics {
  status: RagDocumentMutationStatus
  document: RagDocumentSummary
  document_count: number
  documents: RagDocumentSummary[]
}

/** Body for creating or replacing a document. */
export interface RagDocumentPayload {
  title?: string
  content: string
}

/** Minimal sentinel fields needed by the admin sentinel picker. */
export interface AdminSentinelListItem {
  sentinel_id: number
  name: string
  network: string
  is_active: boolean
  rag_config: {
    enabled: boolean
    index_name: string
    namespace: string
  } | null
}

export interface AdminSentinelsListResponse {
  sentinels: AdminSentinelListItem[]
  total: number
  page: number
  limit: number
}
