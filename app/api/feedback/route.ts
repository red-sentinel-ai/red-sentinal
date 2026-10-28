import { NextRequest, NextResponse } from 'next/server'
import {
  TELEGRAM_NOTIFICATION_API, SUI_SENTINEL_ALERTS_TELEGRAM_GROUP_ID } from '@/constants'
import { ADMIN_API_TOKEN } from '@/lib/server/credentials'
import { rateLimit } from '@/lib/server/rate-limit'

interface FeedbackRequest {
  name?: string
  email?: string
  wallet_address?: string
  feedback_type?: string
  message: string
}

export async function POST(req: NextRequest) {
  // Anonymous endpoint that forwards into a Telegram alert channel — a spam
  // magnet. Keep the window tight.
  const denied = rateLimit(req, { name: 'feedback', limit: 5, windowMs: 600_000 })
  if (denied) return denied

  try {
    const { name, email, wallet_address, feedback_type, message } =
      (await req.json()) as FeedbackRequest

    if (!message) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    if (message.length > 5_000) {
      return NextResponse.json({ error: 'Message is too long (max 5000 characters)' }, { status: 400 })
    }

    if (!ADMIN_API_TOKEN) {
      console.error('ADMIN_API_TOKEN is not defined. Cannot send Telegram notification.')
      return NextResponse.json({ error: 'Failed to process feedback' }, { status: 500 })
    }

    let formattedMessage = `📬 *New User Feedback*\n\n`

    if (name) {
      formattedMessage += `*From*: ${name}\n`
    }
    if (email) {
      formattedMessage += `*Email*: ${email}\n`
    }
    if (wallet_address) {
      formattedMessage += `*Wallet*: \`${wallet_address}\`\n`
    }
    if (feedback_type) {
      formattedMessage += `*Type*: ${feedback_type}\n`
    }

    formattedMessage += `\n*Message*:\n${message}\n`
    formattedMessage += `\n📅 *Time*: ${new Date().toISOString()}`

    const response = await fetch(TELEGRAM_NOTIFICATION_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': ADMIN_API_TOKEN,
      },
      body: JSON.stringify({
        message: formattedMessage,
        groupId: SUI_SENTINEL_ALERTS_TELEGRAM_GROUP_ID,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Failed to send Telegram notification:', errorData)
      return NextResponse.json({ error: 'Failed to forward feedback to Telegram' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Feedback submitted successfully' })
  } catch (error) {
    console.error('Error processing feedback request:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        error: 'Internal server error while processing feedback',
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}
