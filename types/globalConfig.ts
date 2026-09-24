import { RewardsConfig } from './Rewards'

export interface GlobalConfigValues {
  admin_wallets: string[]
  rewards?: RewardsConfig
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
