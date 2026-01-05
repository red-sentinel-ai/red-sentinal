import { NextRequest, NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const objectId = searchParams.get('object_id')
  const agentPath = searchParams.get('agent_path')

  if (!objectId && !agentPath) {
    return NextResponse.json(
      { error: 'An agent identifier (object_id or agent_path) is required' },
      { status: 400 }
    )
  }

  let query = supabaseServiceClient
    .from('ss_agents')
    .select(
      'agent_id, agent_name, agent_profile, object_id, owner, is_featured, agent_path, created_at, model_provider, model_name'
    )

  if (objectId) {
    query = query.eq('object_id', objectId)
  } else if (agentPath) {
    query = query.eq('agent_path', agentPath)
  }

  const { data, error } = await query.single()

  if (error) {
    console.error('[Fetch Agent by Identifier Error]', error)
    return NextResponse.json({ error: 'Failed to fetch agent' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 200 })
}
