import { NextRequest, NextResponse } from 'next/server'

import { supabaseServiceClient } from '@/db/config/server'
import type { SentinelTag } from '@/types/tags'

const MAX_IDS = 100

/**
 * Public: tags assigned to a set of sentinels, for the /attacks directory.
 *
 * GET /api/agents/tags?ids=12,34,56
 * → { success: true, tagsByAgentId: { "12": [SentinelTag, ...] } }
 */
export async function GET(req: NextRequest) {
  try {
    const idsParam = req.nextUrl.searchParams.get('ids') ?? ''
    const ids = Array.from(
      new Set(
        idsParam
          .split(',')
          .map(raw => Number(raw.trim()))
          .filter(id => Number.isInteger(id) && id > 0)
      )
    ).slice(0, MAX_IDS)

    if (ids.length === 0) {
      return NextResponse.json({ success: true, tagsByAgentId: {} })
    }

    const { data, error } = await supabaseServiceClient
      .from('ss_sentinel_tags')
      .select('sentinel_id, tag:ss_tags(tag_id, name, slug, description, is_active, created_at)')
      .in('sentinel_id', ids)

    if (error) {
      console.error('Failed to fetch sentinel tags:', error)
      return NextResponse.json(
        { success: false, error: 'Could not load sentinel tags' },
        { status: 500 }
      )
    }

    const tagsByAgentId: Record<string, SentinelTag[]> = {}
    for (const row of data ?? []) {
      const tag = row.tag as unknown as SentinelTag | null
      if (!tag || !tag.is_active) continue
      const key = String(row.sentinel_id)
      tagsByAgentId[key] = [...(tagsByAgentId[key] ?? []), tag]
    }

    return NextResponse.json({ success: true, tagsByAgentId })
  } catch (error) {
    console.error('Error fetching sentinel tags:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
