import { NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'
import {
  UserRewardsData,
  RHUser,
  RHRewardsActivity,
  RewardsMission,
  MissionCompletionCounts,
} from '@/types/Rewards'
import { GlobalConfigValues } from '@/types/globalConfig'
import { checkSocialConnections } from '@/utils/socialConnectionCheck'

const getMissionCompletionCounts = (
  activities: RHRewardsActivity[],
  missions: RewardsMission[]
): Record<string, MissionCompletionCounts> => {
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const dayStart = new Date()
  dayStart.setHours(0, 0, 0, 0)

  const counts: Record<string, MissionCompletionCounts> = {}

  missions.forEach((mission) => {
    counts[mission.type] = { total: 0, current_period: 0 }
  })

  activities.forEach((activity) => {
    if (!counts[activity.mission_type]) {
      counts[activity.mission_type] = { total: 0, current_period: 0 }
    }
    counts[activity.mission_type].total += 1
  })

  missions.forEach((mission) => {
    if (mission.max_per_week || mission.max_per_day) {
      const startDate = mission.max_per_week ? weekStart : dayStart
      const periodActivities = activities.filter(
        (activity) =>
          activity.mission_type === mission.type && new Date(activity.completed_at) >= startDate
      )
      counts[mission.type].current_period = periodActivities.length
    }
  })

  return counts
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
): Promise<NextResponse<UserRewardsData | { error: string }>> {
  try {
    const address = (await params).address

    // Check if user has social authentication
    const socialCheck = await checkSocialConnections(address)
    if (!socialCheck.hasAnyConnection) {
      return NextResponse.json(
        { error: 'Social authentication required. Please connect at least one social account.' },
        { status: 403 }
      )
    }

    const userData = await supabaseServiceClient
      .from('ss_users')
      .select('*')
      .contains('wallet_addresses', [address])
      .single()

    if (!userData.data) {
      return NextResponse.json(
        {
          error:
            'User not found. Please complete your first mission to initialize your rewards account.',
        },
        { status: 404 }
      )
    }

    const user = userData.data as RHUser

    const { data: activities, error: activitiesError } = await supabaseServiceClient
      .from('ss_rewards_activity')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })

    if (activitiesError) throw activitiesError

    const typedActivities = (activities || []) as unknown as RHRewardsActivity[]

    const { data: configData } = await supabaseServiceClient
      .from('global_config')
      .select('*')
      .eq('name', 'sui_sentinel_settings')
      .single()

    let missions: RewardsMission[] = []
    if (configData) {
      const config = configData.config_values as unknown as GlobalConfigValues
      missions = config.rewards?.missions || []
    }

    const completedMissions = getMissionCompletionCounts(typedActivities, missions)

    // Get recent activity (last 10)
    const recentActivity = typedActivities.slice(0, 10)

    return NextResponse.json({
      user,
      completed_missions: completedMissions,
      recent_activity: recentActivity,
    })
  } catch (error) {
    console.error('Error fetching user rewards:', error)
    return NextResponse.json({ error: 'Failed to fetch user rewards' }, { status: 500 })
  }
}
