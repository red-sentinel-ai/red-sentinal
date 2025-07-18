import { NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'
import { RAVEN_REWARDS_CONSTANTS } from '@/constants/ravenRewards'
import { GlobalConfigResponse } from '@/types/globalConfig'
import { RavenRewardsMission } from '@/types/ravenRewards'

interface MissionsResponse {
  enabled: boolean
  missions: RavenRewardsMission[]
  points_name: string
  points_symbol: string
  message?: string
}

export async function GET(): Promise<NextResponse<MissionsResponse>> {
  try {
    const { data: configData, error } = await supabaseServiceClient
      .from('global_config')
      .select('*')
      .eq('name', 'sui_sentinel_settings')
      .single()

    if (error || !configData) {
      console.error('Error fetching config:', error)
      return NextResponse.json({
        enabled: false,
        missions: [],
        points_name: 'Raven Points',
        points_symbol: 'RP',
        message: 'Failed to fetch configuration',
      })
    }

    const configResponse = configData as unknown as GlobalConfigResponse
    const config = configResponse.config_values
    const ravenRewards = config.raven_rewards

    if (!ravenRewards?.enabled) {
      return NextResponse.json({
        enabled: false,
        missions: [],
        points_name: 'Raven Points',
        points_symbol: 'RP',
        message: 'Raven Rewards program is currently disabled',
      })
    }

    const missions = ravenRewards.missions || RAVEN_REWARDS_CONSTANTS.DEFAULT_MISSIONS

    return NextResponse.json({
      enabled: true,
      missions: missions.filter((m: RavenRewardsMission) => m.enabled),
      points_name: ravenRewards.points_name || 'Raven Points',
      points_symbol: ravenRewards.points_symbol || 'RP',
    })
  } catch (error) {
    console.error('Error fetching missions:', error)
    return NextResponse.json(
      {
        enabled: false,
        missions: [],
        points_name: 'Raven Points',
        points_symbol: 'RP',
        message: 'Failed to fetch missions',
      },
      { status: 500 }
    )
  }
}
