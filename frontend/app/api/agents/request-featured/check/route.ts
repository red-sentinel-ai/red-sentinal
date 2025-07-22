import { NextRequest, NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const agent_id = searchParams.get('agent_id')
  const wallet_address = searchParams.get('wallet_address')

  if (!agent_id || !wallet_address) {
    return NextResponse.json({ error: 'Missing query params' }, { status: 400 })
  }

  const { data, error } = await supabaseServiceClient
    .from('ss_feature_requests')
    .select('id')
    .eq('agent_id', Number(agent_id))
    .eq('wallet_address', wallet_address)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ alreadyRequested: !!data }, { status: 200 })
}
