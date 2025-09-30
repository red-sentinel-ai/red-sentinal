import { NextResponse } from 'next/server'
import { generateSlug } from 'random-word-slugs'
import { supabaseServiceClient } from '@/db/config/server'
import { generateGradientAvatar } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const { walletAddress } = await request.json()

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
    }

    const { data: existingUser, error: findError } = await supabaseServiceClient
      .from('ss_users')
      .select('*')
      .contains('wallet_addresses', [walletAddress])
      .single()

    if (findError && findError.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      throw findError
    }

    if (existingUser) {
      return NextResponse.json(existingUser)
    }

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

    const { data: newUser, error: createError } = await supabaseServiceClient
      .from('ss_users')
      .insert({
        wallet_addresses: [walletAddress],
        username: newUsername,
        display_name: newUsername,
        avatar_url: avatarUrl,
      })
      .select()
      .single()

    if (createError) {
      throw createError
    }

    return NextResponse.json(newUser)
  } catch (error) {
    console.error('Error in get-or-create profile:', error)
    return NextResponse.json({ error: 'Failed to get or create profile' }, { status: 500 })
  }
}
