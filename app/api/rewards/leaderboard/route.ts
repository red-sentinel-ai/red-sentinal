import { NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'
import { LeaderboardEntry } from '@/types/Rewards'
import { TEAM_MEMBER_WALLETS } from '@/constants'

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[]
  limit: number
  offset: number
}

export async function GET(
  request: Request
): Promise<NextResponse<LeaderboardResponse | { error: string }>> {
  try {
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const search = url.searchParams.get('search') || ''

    let query = supabaseServiceClient.from('ss_rewards_leaderboard').select('*')

    if (TEAM_MEMBER_WALLETS.length > 0) {
      query = query.not('wallet_addresses', 'cs', `{${TEAM_MEMBER_WALLETS.join(',')}}`)
    }

    if (search) {
      query = query.or(`discord_username.ilike.%${search}%,twitter_username.ilike.%${search}%`)
    }

    query = query
      .order('total_points', { ascending: false })
      .order('user_id', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: leaderboard, error } = await query
    if (error) throw error

    const typedLeaderboard = (leaderboard || []) as LeaderboardEntry[]

    return NextResponse.json({
      leaderboard: typedLeaderboard,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
