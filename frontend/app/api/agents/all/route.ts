import { NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'

export async function GET() {
  const { data, error } = await supabaseServiceClient
    .from('ss_agents')
    .select('agent_id, agent_name, agent_profile, object_id, owner, is_featured , agent_path')

  if (error) {
    console.error('[Fetch All Agents Error]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 200 })
}
