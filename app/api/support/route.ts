import { NextRequest, NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'
import {
  TELEGRAM_NOTIFICATION_API, SUI_SENTINEL_ALERTS_TELEGRAM_GROUP_ID } from '@/constants'
import { ADMIN_API_TOKEN } from '@/lib/server/credentials'

const SUPPORT_BUCKET_NAME = 'ss-support'
const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const subject = (formData.get('subject') as string | null)?.trim()
    const description = (formData.get('description') as string | null)?.trim()
    const email = (formData.get('email') as string | null)?.trim() || null
    const walletAddress = (formData.get('walletAddress') as string | null)?.toLowerCase() || null
    const chain = (formData.get('chain') as string | null)?.trim() || null
    const screenshot = formData.get('screenshot') as File | null

    if (!subject || !description) {
      return NextResponse.json({ error: 'Subject and description are required' }, { status: 400 })
    }

    if (screenshot && screenshot.size > 0) {
      if (!screenshot.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Screenshot must be an image file' }, { status: 400 })
      }
      if (screenshot.size > MAX_SCREENSHOT_BYTES) {
        return NextResponse.json({ error: 'Screenshot must be under 5MB' }, { status: 400 })
      }
    }

    let userId: string | null = null
    if (walletAddress) {
      const { data: walletConnection } = await supabaseServiceClient
        .from('ss_wallet_connections')
        .select('user_id')
        .eq('wallet_address', walletAddress)
        .single()
      userId = walletConnection?.user_id ?? null
    }

    let screenshotUrl: string | null = null
    if (screenshot && screenshot.size > 0) {
      const arrayBuffer = await screenshot.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const fileExt = screenshot.name.split('.').pop() || 'png'
      const filePath = `${walletAddress ?? 'anonymous'}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}.${fileExt}`

      const { error: uploadError } = await supabaseServiceClient.storage
        .from(SUPPORT_BUCKET_NAME)
        .upload(filePath, buffer, { contentType: screenshot.type, upsert: false })

      if (uploadError) throw uploadError

      const { data: urlData } = supabaseServiceClient.storage
        .from(SUPPORT_BUCKET_NAME)
        .getPublicUrl(filePath)

      screenshotUrl = urlData.publicUrl
    }

    const { data: supportRequest, error: insertError } = await supabaseServiceClient
      .from('ss_support_requests')
      .insert({
        user_id: userId,
        wallet_address: walletAddress,
        chain,
        subject,
        description,
        email,
        screenshot_url: screenshotUrl,
        user_agent: req.headers.get('user-agent'),
      })
      .select('id')
      .single()

    if (insertError) throw insertError

    // Non-fatal: the DB row is the durable record, so a Telegram outage should
    // never fail the user's submission.
    if (!ADMIN_API_TOKEN) {
      console.error('ADMIN_API_TOKEN is not defined. Skipping Telegram notification.')
    } else {
      try {
        let formattedMessage = `🆘 *New Support Request*\n\n`

        if (walletAddress) {
          formattedMessage += `*Wallet*: \`${walletAddress}\`\n`
        }
        if (chain) {
          formattedMessage += `*Chain*: ${chain}\n`
        }
        if (email) {
          formattedMessage += `*Email*: ${email}\n`
        }

        formattedMessage += `\n*Subject*: ${subject}\n`
        formattedMessage += `\n*Description*:\n${description}\n`

        if (screenshotUrl) {
          formattedMessage += `\n🖼 *Screenshot*: ${screenshotUrl}\n`
        }

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
          console.error('Failed to send support Telegram notification:', await response.text())
        }
      } catch (telegramError) {
        console.error('Error sending support Telegram notification:', telegramError)
      }
    }

    return NextResponse.json({
      success: true,
      id: supportRequest?.id ?? null,
      message: 'Support request submitted successfully',
    })
  } catch (error) {
    console.error('[Support Request Error]', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      {
        error: 'Failed to submit support request',
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}
