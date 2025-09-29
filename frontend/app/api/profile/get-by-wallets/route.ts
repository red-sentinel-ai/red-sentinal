import { NextRequest, NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'

export async function POST(request: NextRequest) {
  try {
    const { walletAddresses } = await request.json()

    if (!Array.isArray(walletAddresses) || walletAddresses.length === 0) {
      return NextResponse.json(
        { error: 'walletAddresses must be a non-empty array' },
        { status: 400 }
      )
    }

    const orQuery = walletAddresses.map((addr) => `wallet_addresses.cs.{${addr}}`).join(',')

    const { data, error } = await supabaseServiceClient
      .from('ss_users')
      .select('username, avatar_url, wallet_addresses')
      .or(orQuery)

    if (error) {
      console.error('Error fetching profiles by wallets:', error)
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.log('Error getting user profile', error)
    return NextResponse.json({ error: 'Failed to fetch user profiles' }, { status: 500 })
  }
}
