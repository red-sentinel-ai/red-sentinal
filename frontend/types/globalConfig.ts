import { RavenRewardsConfig } from './ravenRewards'

export interface GlobalConfigValues {
  admin_wallets: string[]
  raven_rewards?: RavenRewardsConfig
}

export interface GlobalConfigResponse {
  id: number
  name: string | null
  config_values: GlobalConfigValues
  created_at: string
}

export interface GlobalConfigState {
  [configName: string]: GlobalConfigValues
}
