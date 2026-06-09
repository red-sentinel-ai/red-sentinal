import { RED_TEAM_API_URL } from '@/constants'
import { PRACTICE_NETWORK } from '@/lib/practice'

export const REDTEAM_BASE = `${RED_TEAM_API_URL}${PRACTICE_NETWORK}`

export const redteamAuthHeader = () => `Bearer ${process.env.RED_TEAM_API_AUTH}`
