import { NextRequest, NextResponse } from 'next/server'
import { APP_NETWORK, RED_TEAM_API_URL } from '@/constants'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const agentId = searchParams.get('agent_id')

    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 })
    }

    const response = await fetch(`${RED_TEAM_API_URL}${APP_NETWORK}/sentinels/${agentId}/public`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error(`Failed to fetch attack goal for agent ${agentId}: ${response.statusText}`)
       return NextResponse.json({ attack_goal: null }, { status: 200 })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching attack goal:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
