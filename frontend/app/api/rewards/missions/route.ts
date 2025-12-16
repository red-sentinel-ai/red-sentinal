import { NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'
import { REWARDS_CONSTANTS } from '@/constants/rewards'
import { GlobalConfigResponse } from '@/types/globalConfig'
import { RewardsMission } from '@/types/Rewards'

interface MissionsResponse {
  enabled: boolean
  missions: RewardsMission[]
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
        points_name: 'Sentinel Tokens',
        points_symbol: 'SENTINEL',
        message: 'Failed to fetch configuration',
      })
    }

    const configResponse = configData as unknown as GlobalConfigResponse
    const config = configResponse.config_values
    const rewards = config.rewards

    if (!rewards?.enabled) {
      return NextResponse.json({
        enabled: false,
        missions: [],
        points_name: 'Sentinel Tokens',
        points_symbol: 'SENTINEL',
        message: 'Rewards program is currently disabled',
      })
    }

    const missions = rewards.missions || REWARDS_CONSTANTS.DEFAULT_MISSIONS

    return NextResponse.json({
      enabled: true,
      missions: missions.filter((m: RewardsMission) => m.enabled),
      points_name: rewards.points_name || 'Sentinel Tokens',
      points_symbol: rewards.points_symbol || 'SENTINEL',
    })
  } catch (error) {
    console.error('Error fetching missions:', error)
    return NextResponse.json(
      {
        enabled: false,
        missions: [],
        points_name: 'Sentinel Tokens',
        points_symbol: 'SENTINEL',
        message: 'Failed to fetch missions',
      },
      { status: 500 }
    )
  }
}
