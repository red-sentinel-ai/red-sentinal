import { NextRequest, NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'

export async function GET(req: NextRequest) {
  const owner = req.nextUrl.searchParams.get('owner')

  if (!owner) {
    return NextResponse.json({ error: 'Missing owner address' }, { status: 400 })
  }

  const { data, error } = await supabaseServiceClient
    .from('ss_agents')
    .select('agent_id, agent_name, agent_profile, object_id, owner, is_featured')
    .eq('owner', owner)

  if (error) {
    console.error('[Fetch Agents By Owner Error]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 200 })
}
