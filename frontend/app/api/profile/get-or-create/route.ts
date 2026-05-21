import { NextResponse } from 'next/server'
import { generateSlug } from 'random-word-slugs'
import { supabaseServiceClient } from '@/db/config/server'
import { generateGradientAvatar } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const { walletAddress: rawWalletAddress, chainType = 'sui', chainId } = await request.json()

    if (!rawWalletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
    }

    const walletAddress = rawWalletAddress.toLowerCase()

    // Find existing user by wallet address in ss_wallet_connections
    const { data: existingWallet, error: findError } = await supabaseServiceClient
      .from('ss_wallet_connections')
      .select('user_id, ss_users(*)')
      .eq('wallet_address', walletAddress)
      .eq('chain_type', chainType)
      .single()

    if (findError && findError.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      throw findError
    }

    if (existingWallet?.ss_users) {
      return NextResponse.json(existingWallet.ss_users)
    }

    // Generate unique username
    let newUsername = ''
    let isUsernameUnique = false
    let attempts = 0

    while (!isUsernameUnique && attempts < 5) {
      newUsername = generateSlug(2, { format: 'kebab' }) + `-${walletAddress.slice(-4)}`
      const { data: usernameCheck } = await supabaseServiceClient
        .from('ss_users')
        .select('id')
        .eq('username', newUsername)
        .single()

      if (!usernameCheck) {
        isUsernameUnique = true
      }
      attempts++
    }

    if (!isUsernameUnique) {
      newUsername = `user-${Date.now()}`
    }

    const avatarUrl = generateGradientAvatar(walletAddress)

    // Create user in ss_users
    const { data: newUser, error: createError } = await supabaseServiceClient
      .from('ss_users')
      .insert({
        username: newUsername,
        display_name: newUsername,
        avatar_url: avatarUrl,
      })
      .select()
      .single()

    if (createError) {
      throw createError
    }

    // Add wallet to ss_wallet_connections
    const { error: walletError } = await supabaseServiceClient.from('ss_wallet_connections').insert({
      user_id: newUser.id,
      chain_type: chainType,
      chain_id: chainId || null,
      wallet_address: walletAddress,
      is_primary: true,
    })

    if (walletError) {
      // Rollback user creation if wallet insert fails
      await supabaseServiceClient.from('ss_users').delete().eq('id', newUser.id)
      throw walletError
    }

    return NextResponse.json(newUser)
  } catch (error) {
    console.error('Error in get-or-create profile:', error)
    return NextResponse.json({ error: 'Failed to get or create profile' }, { status: 500 })
  }
}
