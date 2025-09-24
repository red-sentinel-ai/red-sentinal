import { NextRequest, NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const objectId = searchParams.get('object_id')

  if (!objectId) {
    return NextResponse.json({ error: 'Missing object_id' }, { status: 400 })
  }

  const { data, error } = await supabaseServiceClient
    .from('ss_agents')
    .select('agent_id, agent_name, agent_profile, object_id, owner, is_featured, created_at')
    .eq('object_id', objectId)
    .single()

  if (error) {
    console.error('[Fetch Agent by object_id Error]', error)
    return NextResponse.json({ error: 'Failed to fetch agent' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 200 })
}
