import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { APP_NETWORK, SUI_SENTINEL_API_URL } from '@/constants'
import {
  isSentinelReport,
  type ReportsListResponse,
  type SentinelSecurityReport,
} from '@/lib/reports'

async function fetchReportsList(limit: number, offset: number): Promise<ReportsListResponse> {
  const res = await fetch(
    `${SUI_SENTINEL_API_URL}/reports/${APP_NETWORK}?limit=${limit}&offset=${offset}`
  )
  if (!res.ok) throw new Error(`Failed to fetch security reports: ${res.status}`)
  return (await res.json()) as ReportsListResponse
}

/**
 * Public directory of generated per-Sentinel security reports.
 */
export function useSecurityReports(limit = 50, offset = 0) {
  return useQuery<ReportsListResponse>({
    queryKey: ['security-reports', APP_NETWORK, limit, offset],
    queryFn: () => fetchReportsList(limit, offset),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    refetchInterval: 300_000,
  })
}

async function fetchSentinelReport(sentinelId: number): Promise<SentinelSecurityReport> {
  const res = await fetch(
    `${SUI_SENTINEL_API_URL}/reports/${APP_NETWORK}/sentinel/${sentinelId}`
  )
  if (res.status === 404) throw new Error('No report available for this Sentinel')
  if (!res.ok) throw new Error(`Failed to fetch security report: ${res.status}`)
  const parsed: unknown = await res.json()
  if (!isSentinelReport(parsed)) throw new Error('Report payload failed validation')
  return parsed
}

/**
 * One Sentinel's shareable security report. Cold reports generate on demand
 * server-side, which can take a few seconds on first view.
 */
export function useSentinelReport(sentinelId: number) {
  return useQuery<SentinelSecurityReport>({
    queryKey: ['security-report', APP_NETWORK, sentinelId],
    queryFn: () => fetchSentinelReport(sentinelId),
    staleTime: 5 * 60_000,
    retry: 1,
  })
}
