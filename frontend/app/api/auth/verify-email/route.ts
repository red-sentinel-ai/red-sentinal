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

    // Find user by wallet address via ss_wallet_connections
    const { data: walletConnection, error: walletError } = await supabaseServiceClient
      .from('ss_wallet_connections')
      .select('user_id')
      .eq('wallet_address', walletAddress)
      .single()

    if (walletError || !walletConnection) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = { id: walletConnection.user_id }

    const { error: upsertError } = await supabaseServiceClient
      .from('ss_social_connections')
      .upsert(
        {
          user_id: user.id,
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
