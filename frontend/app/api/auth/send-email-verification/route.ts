import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { sendEmailVerificationLink } from '@/lib/emailUtils'

const SECRET = process.env.NEXTAUTH_SECRET || ''
const APP_URL = process.env.NEXTAUTH_URL || 'https://app.redsentinel.xyz'
const TOKEN_TTL_MS = 15 * 60 * 1000 // 15 minutes

function createToken(email: string, walletAddress: string): string {
  const payload = Buffer.from(JSON.stringify({ email, walletAddress, exp: Date.now() + TOKEN_TTL_MS })).toString(
    'base64url'
  )
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

export async function POST(request: Request) {
  try {
    const { email, walletAddress: rawWalletAddress } = await request.json()

    if (!email || !rawWalletAddress) {
      return NextResponse.json({ error: 'Missing email or walletAddress' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Normalize to lowercase so verify-email lookup always matches the DB
    const walletAddress = rawWalletAddress.toLowerCase()
    const token = createToken(email, walletAddress)
    const verificationUrl = `${APP_URL}/verify-email?token=${encodeURIComponent(token)}`

    const result = await sendEmailVerificationLink(email, verificationUrl)

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending verification email:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
