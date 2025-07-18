import { NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'
import { GlobalConfigValues } from '@/types/globalConfig'
import {
  CompleteMissionRequest,
  CompleteMissionResponse,
  RHUser,
  RewardsMission,
} from '@/types/Rewards'
import { REWARDS_CONSTANTS } from '@/constants/rewards'

export async function POST(
  request: Request
): Promise<NextResponse<CompleteMissionResponse | { error: string }>> {
  try {
    const body: CompleteMissionRequest = await request.json()
    const { wallet_address, mission_type, transaction_hash, metadata } = body

    if (!wallet_address || !mission_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: userData, error: userError } = await supabaseServiceClient
      .from('ss_users')
      .select('id')
      .contains('wallet_addresses', [wallet_address])
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = userData.id

    const { data: configData } = await supabaseServiceClient
      .from('global_config')
      .select('*')
      .eq('name', 'sui_sentinel_settings')
      .single()

    if (!configData) {
      return NextResponse.json({ error: 'Rewards configuration not found' }, { status: 404 })
    }

    const config = configData.config_values as unknown as GlobalConfigValues
    const missions = config.rewards?.missions || REWARDS_CONSTANTS.DEFAULT_MISSIONS
    const mission = missions.find((m: RewardsMission) => m.type === mission_type)
    console.log('mission', mission)

    if (!mission || !mission.enabled) {
      return NextResponse.json({ error: 'Mission not found or disabled' }, { status: 404 })
    }

    if (mission.frequency === 'one_time') {
      const { count } = await supabaseServiceClient
        .from('ss_rewards_activity')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('mission_type', mission_type)

      if (count && count > 0) {
        return NextResponse.json({ error: 'Mission already completed' }, { status: 400 })
      }
    }

    // Check weekly limits
    if (mission.max_per_week) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      weekStart.setHours(0, 0, 0, 0)

      const { count } = await supabaseServiceClient
        .from('ss_rewards_activity')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('mission_type', mission_type)
        .gte('completed_at', weekStart.toISOString())

      if (count && count >= mission.max_per_week) {
        return NextResponse.json({ error: 'Weekly limit reached' }, { status: 400 })
      }
    }

    if (mission.max_per_day) {
      const dayStart = new Date()
      dayStart.setHours(0, 0, 0, 0)

      const { count } = await supabaseServiceClient
        .from('ss_rewards_activity')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('mission_type', mission_type)
        .gte('completed_at', dayStart.toISOString())

      if (count && count >= mission.max_per_day) {
        return NextResponse.json({ error: 'Daily limit reached' }, { status: 400 })
      }
    }

    // Record the activity
    const { error: activityError } = await supabaseServiceClient
      .from('ss_rewards_activity')
      .insert({
        user_id: userId,
        mission_type,
        points_earned: mission.points,
        transaction_hash,
        completed_at: new Date().toISOString(),
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : {},
      })

    if (activityError) {
      throw activityError
    }

    // Get user from ss_users table
    const { data: existingUser } = await supabaseServiceClient
      .from('ss_users')
      .select('*')
      .contains('wallet_addresses', [wallet_address])
      .single()

    let user: RHUser

    if (existingUser) {
      // Update existing user - handle null values
      const currentTotalPoints = existingUser.total_points || 0
      const currentLifetimePoints = existingUser.lifetime_points || 0

      const newTotalPoints = currentTotalPoints + mission.points
      const newLifetimePoints = currentLifetimePoints + mission.points

      // Determine tier
      let newTier: RHUser['rewards_tier'] = 'bronze'
      if (newTotalPoints >= REWARDS_CONSTANTS.TIERS.PLATINUM.minPoints) {
        newTier = 'platinum'
      } else if (newTotalPoints >= REWARDS_CONSTANTS.TIERS.GOLD.minPoints) {
        newTier = 'gold'
      } else if (newTotalPoints >= REWARDS_CONSTANTS.TIERS.SILVER.minPoints) {
        newTier = 'silver'
      }

      const { data: updatedUser, error: updateError } = await supabaseServiceClient
        .from('ss_users')
        .update({
          total_points: newTotalPoints,
          lifetime_points: newLifetimePoints,
          rewards_tier: newTier,
          rewards_updated_at: new Date().toISOString(),
        })
        .eq('id', existingUser.id)
        .select()
        .single()

      if (updateError) throw updateError
      user = updatedUser as RHUser
    } else {
      // TODO: no need to create new user, we will handle this differently
      const { data: newUser, error: createError } = await supabaseServiceClient
        .from('ss_users')
        .insert({
          wallet_addresses: [wallet_address],
          total_points: mission.points,
          lifetime_points: mission.points,
          rewards_tier: 'bronze',
          rewards_updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (createError) throw createError
      user = newUser as RHUser
    }

    return NextResponse.json({
      success: true,
      points_earned: mission.points,
      new_total: user.total_points,
      new_tier: user.rewards_tier,
      user,
    })
  } catch (error) {
    console.error('Error completing mission:', error)
    return NextResponse.json({ error: 'Failed to complete mission' }, { status: 500 })
  }
}
