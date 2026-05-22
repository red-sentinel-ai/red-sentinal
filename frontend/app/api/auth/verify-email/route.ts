import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseServiceClient } from '@/db/config/server'

const SECRET = process.env.NEXTAUTH_SECRET || ''

function verifyToken(token: string): { email: string; walletAddress: string } | null {
  const dotIndex = token.lastIndexOf('.')
  if (dotIndex === -1) return null

  const payload = token.slice(0, dotIndex)
  const sig = token.slice(dotIndex + 1)

  const expectedSig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url')

  if (sig.length !== expectedSig.length) return null
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null

  let parsed: { email: string; walletAddress: string; exp: number }
  try {
    parsed = JSON.parse(Buffer.from(payload, 'base64url').toString())
  } catch {
    return null
  }

  if (!parsed.email || !parsed.walletAddress || !parsed.exp) return null
  if (Date.now() > parsed.exp) return null

  return { email: parsed.email, walletAddress: parsed.walletAddress }
}

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 })
    }

    const verified = verifyToken(token)
    if (!verified) {
      return NextResponse.json({ error: 'Invalid or expired verification link' }, { status: 400 })
    }

    const { email, walletAddress: rawWalletAddress } = verified
    const walletAddress = rawWalletAddress.toLowerCase()

    console.log('[verify-email] looking up wallet:', walletAddress)

    // Find the user who owns this wallet — use ilike for case-insensitive match
    // to handle wallets stored before the lowercase normalization was applied
    const { data: walletConnections, error: walletError } = await supabaseServiceClient
      .from('ss_wallet_connections')
      .select('user_id')
      .ilike('wallet_address', walletAddress)
      .limit(1)

    const walletConnection = walletConnections?.[0] ?? null

    console.log('[verify-email] walletConnection:', walletConnection, 'error:', walletError)

    if (walletError || !walletConnection) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const currentUserId = walletConnection.user_id

    // Check if this email is already linked to a DIFFERENT user
    const { data: existingEmailConn } = await supabaseServiceClient
      .from('ss_social_connections')
      .select('user_id, ss_users(id, username, avatar_url, total_points, lifetime_points)')
      .eq('platform', 'email')
      .eq('platform_user_id', email)
      .neq('user_id', currentUserId)
      .single()

    if (existingEmailConn?.ss_users) {
      const otherUser = existingEmailConn.ss_users as {
        id: string
        username: string
        avatar_url: string | null
        total_points: number | null
        lifetime_points: number | null
      }

      // Get the other user's wallets so we can show them in the merge prompt
      const { data: otherWallets } = await supabaseServiceClient
        .from('ss_wallet_connections')
        .select('wallet_address, chain_type')
        .eq('user_id', otherUser.id)

      return NextResponse.json({
        needsMerge: true,
        email,
        currentUserId,
        otherAccount: {
          userId: otherUser.id,
          username: otherUser.username,
          avatarUrl: otherUser.avatar_url,
          totalPoints: otherUser.total_points ?? 0,
          lifetimePoints: otherUser.lifetime_points ?? 0,
          wallets: (otherWallets ?? []).map(w => ({ address: w.wallet_address, chainType: w.chain_type })),
        },
      })
    }

    // No conflict — link the email to the current user
    const { error: upsertError } = await supabaseServiceClient
      .from('ss_social_connections')
      .upsert(
        {
          user_id: currentUserId,
          platform: 'email',
          platform_user_id: email,
          platform_username: email,
          platform_avatar_url: null,
        },
        { onConflict: 'user_id,platform' }
      )

    if (upsertError) {
      console.error('Upsert error:', upsertError)
      return NextResponse.json({ error: 'Failed to save email connection' }, { status: 500 })
    }

    return NextResponse.json({ success: true, email })
  } catch (error) {
    console.error('Error verifying email:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
