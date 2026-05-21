import { NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'

export async function POST(request: Request) {
  try {
    const { walletAddress, provider } = await request.json()

    if (!walletAddress || !provider) {
      return NextResponse.json({ error: 'Missing wallet address or provider' }, { status: 400 })
    }

    // Find user by wallet address via ss_wallet_connections
    const { data: walletConnection, error: walletError } = await supabaseServiceClient
      .from('ss_wallet_connections')
      .select('user_id')
      .eq('wallet_address', walletAddress)
      .single()

    if (!walletConnection || walletError) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = { id: walletConnection.user_id }

    const { error: deleteError } = await supabaseServiceClient
      .from('ss_social_connections')
      .delete()
      .eq('user_id', user.id)
      .eq('platform', provider)

    if (deleteError) {
      console.error('Error deleting social connection:', deleteError)
      return NextResponse.json({ error: 'Failed to disconnect provider' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Disconnect API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
