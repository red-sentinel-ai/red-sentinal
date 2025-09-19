import { NextRequest, NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name,
      email_id,
      wallet_address,
      description,
      agent_id,
      telegram_username,
      twitter_username,
    } = body

    if (!name || !email_id || !wallet_address || !description || !agent_id) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const { error } = await supabaseServiceClient.from('ss_feature_requests').insert([
      {
        name,
        email_id,
        wallet_address,
        description,
        agent_id,
        telegram_username,
        twitter_username,
      },
    ])

    if (error) {
      console.error('[Feature Request Error]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('[Request Feature API Error]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
