/**
 * Client-side access to the live-Sentinel RAG Content Document API.
 *
 * All calls go through the Next.js admin proxy routes under `/api/sentinels/rag`
 * which attach the backend admin token server-side. The browser never sees it.
 */

import type {
  RagDocumentDetailResponse,
  RagDocumentMutationResponse,
  RagDocumentPayload,
  RagDocumentsListResponse,
  AdminSentinelsListResponse,
} from './rag-types'

/** Error carrying the API failure message and HTTP status for UI display. */
export class RagApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'RagApiError'
    this.status = status
  }
}

interface ProxyErrorBody {
  error?: string
  message?: string
}

async function requestJson<TResponse>(url: string, init?: RequestInit): Promise<TResponse> {
  let response: Response
  try {
    response = await fetch(url, {
      cache: 'no-store',
      ...init,
    })
  } catch {
    throw new RagApiError('Network request failed', 0)
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`
    try {
      const body = (await response.json()) as ProxyErrorBody
      message = body.error ?? body.message ?? message
    } catch {
      // Non-JSON error body — keep the generic message.
    }
    throw new RagApiError(message, response.status)
  }

  return (await response.json()) as TResponse
}

function ragParams(network: string, sentinelId: number): string {
  return `network=${encodeURIComponent(network)}&sentinel_id=${sentinelId}`
}

/** Load the document inventory for one live Sentinel. */
export function fetchRagDocuments(
  network: string,
  sentinelId: number
): Promise<RagDocumentsListResponse> {
  return requestJson(`/api/sentinels/rag/documents?${ragParams(network, sentinelId)}`)
}

/** Load one document with its reconstructed content and ordered chunks. */
export function fetchRagDocument(
  network: string,
  sentinelId: number,
  documentId: string
): Promise<RagDocumentDetailResponse> {
  return requestJson(
    `/api/sentinels/rag/document?${ragParams(network, sentinelId)}&document_id=${encodeURIComponent(documentId)}`
  )
}

/** Add a new RAG Content Document to the Sentinel's namespace. */
export function createRagDocument(
  network: string,
  sentinelId: number,
  payload: RagDocumentPayload
): Promise<RagDocumentMutationResponse> {
  return requestJson(`/api/sentinels/rag/documents?${ragParams(network, sentinelId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

/** Replace one document's content (prior revision preserved on failure). */
export function replaceRagDocument(
  network: string,
  sentinelId: number,
  documentId: string,
  payload: RagDocumentPayload
): Promise<RagDocumentMutationResponse> {
  return requestJson(
    `/api/sentinels/rag/document?${ragParams(network, sentinelId)}&document_id=${encodeURIComponent(documentId)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  )
}

/** Delete one document's chunks from the Sentinel's namespace. */
export function deleteRagDocument(
  network: string,
  sentinelId: number,
  documentId: string
): Promise<RagDocumentMutationResponse> {
  return requestJson(
    `/api/sentinels/rag/document?${ragParams(network, sentinelId)}&document_id=${encodeURIComponent(documentId)}`,
    { method: 'DELETE' }
  )
}

/** Clear all RAG content for the Sentinel and disable RAG. */
export function clearRagContent(
  network: string,
  sentinelId: number
): Promise<{ sentinel_id: number; status: 'rag_cleared' }> {
  return requestJson(`/api/sentinels/rag?${ragParams(network, sentinelId)}`, {
    method: 'DELETE',
  })
}

/** List active live Sentinels for the admin picker. */
export function fetchAdminSentinels(network: string): Promise<AdminSentinelsListResponse> {
  return requestJson(`/api/sentinels/list?network=${encodeURIComponent(network)}`)
}
