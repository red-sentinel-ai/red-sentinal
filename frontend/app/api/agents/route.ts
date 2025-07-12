import { supabaseServiceClient } from '@/db/config/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const { agent_id, agent_name, agent_profile, message_price, object_id, owner, digest } = body

  if (!agent_id || !agent_name || !object_id || !owner) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabaseServiceClient
    .from('ss_agents')
    .insert([
      {
        agent_id,
        agent_name,
        agent_profile,
        message_price,
        object_id,
        owner,
        digest,
      },
    ])
    .select('*')

  if (error) {
    console.error('[Insert Agent Error]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(
    { message: 'Agent created successfully', data: data?.[0] },
    { status: 200 }
  )
}
