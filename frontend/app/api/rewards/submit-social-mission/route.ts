import { NextRequest, NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'
import { SUI_SENTINEL_API_URL } from '@/constants'

const VALID_MISSION_TYPES = ['follow_x', 'retweet', 'share_with_hashtag', 'join_telegram', 'share_content'] as const
type SocialMissionType = (typeof VALID_MISSION_TYPES)[number]

const ONE_TIME_MISSIONS: SocialMissionType[] = ['follow_x', 'join_telegram']

const MISSION_LABELS: Record<SocialMissionType, string> = {
  follow_x: 'Follow Sui Sentinel on X',
  retweet: 'Retweet a Sui Sentinel post',
  share_with_hashtag: 'Share with #SuiSentinel',
  join_telegram: 'Join Sui Sentinel Telegram',
  share_content: 'Share Sui Sentinel Content',
}
const ADMIN_API_TOKEN = process.env.BACKEND_API_ADMIN_TOKEN || ""


export async function POST(req: NextRequest) {
  try {
    const { wallet_address, mission_type, twitter_username, telegram_username, tweet_url, screenshot_url, network, agent_path } =
      await req.json()

    if (!wallet_address || !mission_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!VALID_MISSION_TYPES.includes(mission_type)) {
      return NextResponse.json({ error: 'Invalid mission type' }, { status: 400 })
    }

    const missionType = mission_type as SocialMissionType

    // Validate required proof per mission type
    if (missionType === 'follow_x' && !twitter_username) {
      return NextResponse.json({ error: 'Twitter username is required' }, { status: 400 })
    }
    if (missionType === 'join_telegram' && !telegram_username) {
      return NextResponse.json({ error: 'Telegram username is required' }, { status: 400 })
    }
    if ((missionType === 'retweet' || missionType === 'share_with_hashtag') && !tweet_url) {
      return NextResponse.json({ error: 'Tweet URL is required' }, { status: 400 })
    }

    // Find user by wallet address
    const { data: user, error: userError } = await supabaseServiceClient
      .from('ss_users')
      .select('id, username')
      .contains('wallet_addresses', [wallet_address])
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // For one-time missions, prevent duplicate submissions
    if (ONE_TIME_MISSIONS.includes(missionType)) {
      const { data: existing } = await supabaseServiceClient
        .from('ss_rewards_activity')
        .select('id')
        .eq('user_id', user.id)
        .eq('mission_type', missionType)
        .limit(1)

      if (existing && existing.length > 0) {
        return NextResponse.json(
          { error: 'You have already submitted this mission' },
          { status: 409 }
        )
      }
    }

    // Build metadata
    const metadata: Record<string, string> = { status: 'pending_review' }
    if (twitter_username) metadata.twitter_username = twitter_username
    if (telegram_username) metadata.telegram_username = telegram_username
    if (tweet_url) metadata.tweet_url = tweet_url
    if (screenshot_url) metadata.screenshot_url = screenshot_url
    if (network) metadata.network = network
    if (agent_path) metadata.agent_path = agent_path

    // Insert record
    const { data: insertedActivity, error: dbError } = await supabaseServiceClient
      .from('ss_rewards_activity')
      .insert({
        user_id: user.id,
        mission_type: missionType,
        points_earned: 0,
        metadata,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (dbError || !insertedActivity) {
      console.error('DB Insert Error:', dbError)
      return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 })
    }

    // Send notification to backend service to handle Telegram notification
    if (ADMIN_API_TOKEN && SUI_SENTINEL_API_URL) {
      const submissionId = insertedActivity.id

      // Send submission data to backend service
      await fetch(`${SUI_SENTINEL_API_URL}/rewards/social-missions/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': ADMIN_API_TOKEN,
        },
        body: JSON.stringify({
          submission_id: submissionId,
          mission_type: missionType,
          mission_label: MISSION_LABELS[missionType],
          user: {
            username: user.username || 'Unknown',
            wallet_address,
          },
          proof: {
            twitter_username,
            telegram_username,
            tweet_url,
            screenshot_url,
          },
          network: network || 'testnet',
          submitted_at: insertedActivity.completed_at,
        }),
      }).catch(err => console.error('Backend notification failed:', err))
    }

    return NextResponse.json({ success: true, message: 'Submitted for review' })
  } catch (error) {
    console.error('Error submitting social mission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
