import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseServiceClient } from '@/db/config/server'

export async function POST(request: Request) {
  try {
    const { walletAddress, provider } = await request.json()

    if (!walletAddress || !provider) {
      return NextResponse.json({ error: 'Missing walletAddress or provider' }, { status: 400 })
    }

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'No active session' }, { status: 401 })
    }

    let platformUserId: string | undefined
    let platformUsername: string | undefined
    let platformAvatarUrl: string | null = null

    if (provider === 'google' && session.googleData) {
      platformUserId = session.googleData.id
      platformUsername = session.googleData.username
      platformAvatarUrl = session.googleData.avatar || null
    }

    if (!platformUserId) {
      console.error('No platform user ID found in session for provider:', provider, session)
      return NextResponse.json({ error: 'No profile data in session' }, { status: 400 })
    }

    const { data: user, error: userError } = await supabaseServiceClient
      .from('ss_users')
      .select('id')
      .contains('wallet_addresses', [walletAddress])
      .single()

    if (userError || !user) {
      console.error('User not found for wallet:', walletAddress, userError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { error: upsertError } = await supabaseServiceClient
      .from('ss_social_connections')
      .upsert(
        {
          user_id: user.id,
          platform: provider,
          platform_user_id: platformUserId,
          platform_username: platformUsername,
          platform_avatar_url: platformAvatarUrl,
        },
        { onConflict: 'user_id,platform' }
      )

    if (upsertError) {
      console.error('Upsert error:', upsertError)
      return NextResponse.json({ error: 'Failed to save connection' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving social connection:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
