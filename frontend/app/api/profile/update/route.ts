import { NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'

export async function PUT(request: Request) {
  try {
    const { walletAddress, username, displayName } = await request.json()

    if (!walletAddress || !username || !displayName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Find the user by their wallet address (authentication check)
    const { data: user, error: findError } = await supabaseServiceClient
      .from('ss_users')
      .select('id')
      .contains('wallet_addresses', [walletAddress])
      .single()

    if (findError || !user) {
      return NextResponse.json({ error: 'User not found or unauthorized' }, { status: 404 })
    }

    // 2. Final uniqueness check for the username, excluding the current user
    const { data: existingUsername, error: uniqueError } = await supabaseServiceClient
      .from('ss_users')
      .select('id')
      .eq('username', username)
      .neq('id', user.id)
      .single()

    if (uniqueError && uniqueError.code !== 'PGRST116') throw uniqueError
    if (existingUsername) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 409 })
    }

    // 3. Update the user's profile
    const { data: updatedUser, error: updateError } = await supabaseServiceClient
      .from('ss_users')
      .update({
        username: username,
        display_name: displayName,
        rewards_updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
