import { NextRequest, NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const agentName = searchParams.get('name')

  if (!agentName) {
    return NextResponse.json({ error: 'Agent name is required' }, { status: 400 })
  }

  const agentPath = agentName.toLowerCase().replace(/\s+/g, '_')

  try {
    const { data, error } = await supabaseServiceClient
      .from('ss_agents')
      .select('agent_path')
      .eq('agent_path', agentPath)
      .maybeSingle()

    if (error) {
      console.error('[Check Agent Name Error]', error)
      return NextResponse.json({ error: 'Error checking name availability' }, { status: 500 })
    }

    return NextResponse.json({ exists: !!data }, { status: 200 })
  } catch (err) {
    console.error('[Check Name API Error]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
