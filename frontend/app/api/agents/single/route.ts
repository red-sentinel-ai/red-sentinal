import { NextRequest, NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const agentPath = searchParams.get('agent_path')

  if (!agentPath) {
    return NextResponse.json({ error: 'Missing agent_path' }, { status: 400 })
  }

  const { data, error } = await supabaseServiceClient
    .from('ss_agents')
    .select('agent_id, agent_name, agent_profile, object_id, owner, is_featured, agent_path')
    .eq('agent_path', agentPath)
    .single()

  if (error) {
    console.error('[Fetch Agent by agent_path Error]', error)
    return NextResponse.json({ error: 'Failed to fetch agent' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 200 })
}
