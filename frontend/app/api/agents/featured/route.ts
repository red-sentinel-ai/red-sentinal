import { NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'

export async function GET() {
  const { data, error } = await supabaseServiceClient
    .from('ss_agents')
    .select('agent_id, agent_profile')
    .eq('is_featured', true)

  if (error) {
    console.error('[Featured Agents Fetch Error]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const response = data.map(agent => ({
    is_featured: true,
    agent_id: agent.agent_id,
    agent_profile: agent.agent_profile,
  }))

  return NextResponse.json(response, { status: 200 })
}
