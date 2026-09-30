import { NextRequest, NextResponse } from 'next/server'

import { supabaseServiceClient } from '@/db/config/server'
import type { SentinelAttribution } from '@/types/share'

/**
 * Public: per-Sentinel attribution (deploying organization's X handle + short
 * description) for the attack share card, by numeric agent id. Attribution
 * management lives in the landing-page admin portal.
 */
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('agentId')
  const agentId = Number(raw)

  if (raw === null || !Number.isInteger(agentId) || agentId <= 0) {
    return NextResponse.json(
      { success: false, error: 'A positive agentId is required' },
      { status: 400 }
    )
  }

  try {
    const { data, error } = await supabaseServiceClient
      .from('ss_sentinel_attribution')
      .select('agent_id, org_x_handle, org_description')
      .eq('agent_id', agentId)
      .maybeSingle()

    if (error) {
      console.error('Failed to fetch sentinel attribution:', error)
      return NextResponse.json(
        { success: false, error: 'Could not load sentinel attribution' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      attribution: (data ?? null) as SentinelAttribution | null,
    })
  } catch (error) {
    console.error('Error fetching sentinel attribution:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
