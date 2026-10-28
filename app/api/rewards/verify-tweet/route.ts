import { NextRequest, NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'
import {
  TELEGRAM_NOTIFICATION_API, SUI_SENTINEL_ALERTS_TELEGRAM_GROUP_ID } from '@/constants'
import { ADMIN_API_TOKEN } from '@/lib/server/credentials'
import { rateLimit } from '@/lib/server/rate-limit'
import { requireSession } from '@/lib/server/session'

export async function POST(req: NextRequest) {
  const denied = rateLimit(req, { name: 'verify-tweet', limit: 10, windowMs: 60_000 })
  if (denied) return denied

  // Rewards submissions credit whoever owns wallet_address — require a
  // verifiable session once cookies reach this app (ENFORCE_SERVER_SESSION).
  const { denied: sessionDenied } = requireSession(req)
  if (sessionDenied) return sessionDenied

  try {
    const { wallet_address: raw_wallet_address, tweet_url, agent_name, agent_id } = await req.json()
    const wallet_address = raw_wallet_address?.toLowerCase()

    if (!wallet_address || !tweet_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Find user by wallet address via ss_wallet_connections
    const { data: walletConnection, error: walletError } = await supabaseServiceClient
      .from('ss_wallet_connections')
      .select('user_id, ss_users(id, username)')
      .eq('wallet_address', wallet_address)
      .single()

    if (walletError || !walletConnection?.ss_users) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const user = walletConnection.ss_users as { id: string; username: string }

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
