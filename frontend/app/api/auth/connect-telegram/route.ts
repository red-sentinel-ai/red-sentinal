import { NextResponse } from 'next/server'
import { createHmac, createHash } from 'crypto'
import { supabaseServiceClient } from '@/db/config/server'

type TelegramAuthData = {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

function verifyTelegramHash(data: TelegramAuthData): boolean {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) return false

  const { hash, ...rest } = data

  // Build the data check string: sorted key=value pairs joined by \n
  const dataCheckString = Object.entries(rest)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  // secret_key = SHA256(bot_token)
  const secretKey = createHash('sha256').update(botToken).digest()
  const expectedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

  return expectedHash === hash
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { telegramData, walletAddress } = body as {
      telegramData: TelegramAuthData
      walletAddress: string
    }

    if (!telegramData || !walletAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Reject auth data older than 10 minutes
    const authAge = Math.floor(Date.now() / 1000) - telegramData.auth_date
    if (authAge > 600) {
      return NextResponse.json({ error: 'Telegram auth data has expired' }, { status: 400 })
    }

    if (!verifyTelegramHash(telegramData)) {
      return NextResponse.json({ error: 'Invalid Telegram auth signature' }, { status: 401 })
    }

    const { data: user, error: userError } = await supabaseServiceClient
      .from('ss_users')
      .select('id')
      .contains('wallet_addresses', [walletAddress])
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const username =
      telegramData.username ||
      [telegramData.first_name, telegramData.last_name].filter(Boolean).join(' ') ||
      `user_${telegramData.id}`

    await supabaseServiceClient.from('ss_social_connections').upsert(
      {
        user_id: user.id,
        platform: 'telegram',
        platform_user_id: String(telegramData.id),
        platform_username: username,
        platform_avatar_url: telegramData.photo_url || null,
      },
      { onConflict: 'user_id,platform' }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error connecting Telegram:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
