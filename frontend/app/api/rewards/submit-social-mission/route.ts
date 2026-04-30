import { NextRequest, NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'
import { SUI_SENTINEL_API_URL } from '@/constants'

const VALID_MISSION_TYPES = [
  'follow_x',
  'retweet',
  'share_with_hashtag',
  'join_telegram',
  'share_content',
  // Twitter/X missions
  'like_tweet',
  'repost_tweet',
  'quote_tweet',
  'tag_friends',
  'create_thread',
  'thread_viral',
  // Content missions
  'explainer_thread',
  'short_video',
  'long_video',
  'written_article',
  'viral_content',
] as const
type SocialMissionType = (typeof VALID_MISSION_TYPES)[number]

const ONE_TIME_MISSIONS: SocialMissionType[] = ['follow_x', 'join_telegram']

const MISSION_LABELS: Record<SocialMissionType, string> = {
  follow_x: 'Follow Red Sentinel on X',
  retweet: 'Retweet a Red Sentinel post',
  share_with_hashtag: 'Share with #RedSentinel',
  join_telegram: 'Join Red Sentinel Telegram',
  share_content: 'Share Red Sentinel Content',
  // Twitter/X missions
  like_tweet: 'Like Official Tweet',
  repost_tweet: 'Repost Official Tweet',
  quote_tweet: 'Quote Tweet with Insight',
  tag_friends: 'Tag 3 Friends',
  create_thread: 'Create Thread (5+ Tweets)',
  thread_viral: 'Thread Goes Viral (1K+ Impressions)',
  // Content missions
  explainer_thread: 'Explainer Thread',
  short_video: 'Short Video (< 2 min)',
  long_video: 'Long Video (5+ min)',
  written_article: 'Written Article',
  viral_content: 'Viral Content (10K+ Views)',
}
const ADMIN_API_TOKEN = process.env.BACKEND_API_ADMIN_TOKEN || ""


export async function POST(req: NextRequest) {
  try {
    const {
      wallet_address,
      mission_type,
      username,
      telegram_username,
      content_link,
      description,
      screenshot_url,
      network,
      agent_path
    } = await req.json()

    if (!wallet_address || !mission_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!VALID_MISSION_TYPES.includes(mission_type)) {
      return NextResponse.json({ error: 'Invalid mission type' }, { status: 400 })
    }

    const missionType = mission_type as SocialMissionType

    // Validate required proof per mission type
    if (missionType === 'follow_x' && !username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }
    if (missionType === 'join_telegram' && !telegram_username) {
      return NextResponse.json({ error: 'Telegram username is required' }, { status: 400 })
    }
    // Most missions require content_link (all URL-based submissions)
    const urlBasedMissions: SocialMissionType[] = [
      'retweet',
      'share_with_hashtag',
      'share_content',
      'like_tweet',
      'repost_tweet',
      'quote_tweet',
      'tag_friends',
      'create_thread',
      'explainer_thread',
      'short_video',
      'long_video',
      'written_article',
    ]
    if (urlBasedMissions.includes(missionType) && !content_link) {
      return NextResponse.json({ error: 'Content link is required' }, { status: 400 })
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
    if (username) metadata.username = username
    if (telegram_username) metadata.telegram_username = telegram_username
    if (content_link) metadata.content_link = content_link
    if (description) metadata.description = description
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
            username,
            telegram_username,
            content_link,
            description,
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
