import { NextRequest, NextResponse } from 'next/server'
import { getAddress, isAddress } from 'viem'
import { supabaseServiceClient } from '@/db/config/server'

const toChecksumIfEvm = (addr: string) => {
  try {
    if (isAddress(addr)) return getAddress(addr)
  } catch {}
  return addr
}

type UserWithWallets = {
  username: string
  avatar_url: string | null
  wallet_addresses: string[]
}

export async function POST(request: NextRequest) {
  try {
    const { walletAddresses } = await request.json()

    if (!Array.isArray(walletAddresses) || walletAddresses.length === 0) {
      return NextResponse.json(
        { error: 'walletAddresses must be a non-empty array' },
        { status: 400 }
      )
    }

    const normalizedAddresses = walletAddresses.map(toChecksumIfEvm)

    // Query wallet connections with user data
    const { data: walletConnections, error } = await supabaseServiceClient
      .from('ss_wallet_connections')
      .select('wallet_address, user_id, ss_users(username, avatar_url)')
      .in('wallet_address', normalizedAddresses)

    if (error) {
      console.error('Error fetching profiles by wallets:', error)
      throw error
    }

    // Group wallets by user and aggregate wallet addresses
    const userMap = new Map<string, UserWithWallets>()

    for (const conn of walletConnections || []) {
      if (!conn.ss_users || !conn.user_id) continue

      const user = conn.ss_users as { username: string; avatar_url: string | null }

      if (userMap.has(conn.user_id)) {
        userMap.get(conn.user_id)!.wallet_addresses.push(conn.wallet_address)
      } else {
        userMap.set(conn.user_id, {
          username: user.username,
          avatar_url: user.avatar_url,
          wallet_addresses: [conn.wallet_address],
        })
      }
    }

    return NextResponse.json(Array.from(userMap.values()))
  } catch (error) {
    console.log('Error getting user profile', error)
    return NextResponse.json({ error: 'Failed to fetch user profiles' }, { status: 500 })
  }
}
