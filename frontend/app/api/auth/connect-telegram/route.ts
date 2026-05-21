import { NextResponse } from 'next/server'
import { createHmac, createHash } from 'crypto'
import { supabaseServiceClient } from '@/db/config/server'

function verifyTelegramHash(params: URLSearchParams): boolean {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) return false

  const hash = params.get('hash')
  if (!hash) return false

  const dataCheckString = Array.from(params.entries())
    .filter(([key]) => key !== 'hash' && key !== 'wallet')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  const secretKey = createHash('sha256').update(botToken).digest()
  const expectedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

  return expectedHash === hash
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const params = url.searchParams

  try {
    const walletAddress = params.get('wallet')
    const id = params.get('id')
    const hash = params.get('hash')
    const auth_date = params.get('auth_date')

    if (!walletAddress || !id || !hash || !auth_date) {
      return NextResponse.redirect(new URL('/profile?error=telegram-auth', url.origin))
    }

    const authAge = Math.floor(Date.now() / 1000) - parseInt(auth_date)
    if (authAge > 600) {
      return NextResponse.redirect(new URL('/profile?error=telegram-auth', url.origin))
    }

    if (!verifyTelegramHash(params)) {
      return NextResponse.redirect(new URL('/profile?error=telegram-auth', url.origin))
    }

    // Find user by wallet address via ss_wallet_connections
    const { data: walletConnection, error: userError } = await supabaseServiceClient
      .from('ss_wallet_connections')
      .select('user_id')
      .eq('wallet_address', walletAddress)
      .single()

    if (userError || !walletConnection) {
      return NextResponse.redirect(new URL('/profile?error=telegram-auth', url.origin))
    }

    const user = { id: walletConnection.user_id }

    const username = params.get('username') ||
      [params.get('first_name'), params.get('last_name')].filter(Boolean).join(' ') ||
      `user_${id}`

    await supabaseServiceClient.from('ss_social_connections').upsert(
      {
        user_id: user.id,
        platform: 'telegram',
        platform_user_id: id,
        platform_username: username,
        platform_avatar_url: params.get('photo_url') || null,
      },
      { onConflict: 'user_id,platform' }
    )

    return NextResponse.redirect(new URL('/profile?connected=Telegram', url.origin))
  } catch (error) {
    console.error('Telegram callback error:', error)
    return NextResponse.redirect(new URL('/profile?error=telegram-auth', url.origin))
  }
}
