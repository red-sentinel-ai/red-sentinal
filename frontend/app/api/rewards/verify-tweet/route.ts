import { NextRequest, NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'
import {
  TELEGRAM_NOTIFICATION_API,
  SUI_SENTINEL_ALERTS_TELEGRAM_GROUP_ID,
  ADMIN_API_TOKEN,
} from '@/constants'

export async function POST(req: NextRequest) {
  try {
    const { wallet_address, tweet_url, agent_name, agent_id } = await req.json()

    if (!wallet_address || !tweet_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: user, error: userError } = await supabaseServiceClient
      .from('ss_users')
      .select('id, username')
      .contains('wallet_addresses', [wallet_address])
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const { error: dbError } = await supabaseServiceClient.from('ss_rewards_activity').insert({
      user_id: user.id,
      mission_type: 'twitter_share_submission',
      points_earned: 0,
      metadata: {
        tweet_url,
        agent_name,
        agent_id,
        status: 'pending_review',
      },
      completed_at: new Date().toISOString(),
    })

    if (dbError) {
      console.error('DB Insert Error:', dbError)
    }

    if (ADMIN_API_TOKEN) {
      const message =
        `🔍 *Manual Tweet Verification Needed*\n\n` +
        `*User*: ${user.username || 'Unknown'}\n` +
        `*Wallet*: \`${wallet_address}\`\n` +
        `*Agent*: ${agent_name}\n` +
        `*Tweet*: ${tweet_url}\n\n` +
        `Check link and award points manually.`

      await fetch(TELEGRAM_NOTIFICATION_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': ADMIN_API_TOKEN,
        },
        body: JSON.stringify({
          message,
          groupId: SUI_SENTINEL_ALERTS_TELEGRAM_GROUP_ID,
        }),
      })
    }

    return NextResponse.json({ success: true, message: 'Submitted for verification' })
  } catch (error) {
    console.error('Error verifying tweet:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
