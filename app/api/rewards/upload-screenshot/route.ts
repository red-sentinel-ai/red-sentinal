import { NextRequest, NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'
import { rateLimit } from '@/lib/server/rate-limit'
import { requireSession } from '@/lib/server/session'

const BUCKET_NAME = 'mission-screenshots'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export async function POST(req: NextRequest) {
  const denied = rateLimit(req, { name: 'upload-screenshot', limit: 10, windowMs: 60_000 })
  if (denied) return denied

  // Identity for the storage path comes from the verified session when the
  // cookie is reachable; the client-supplied wallet_address is only a
  // fallback until session enforcement is switched on (ENFORCE_SERVER_SESSION).
  const { denied: sessionDenied, userId: sessionUserId } = requireSession(req)
  if (sessionDenied) return sessionDenied

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const walletAddress = formData.get('wallet_address') as string | null
    const missionType = formData.get('mission_type') as string | null

    if (!file || !walletAddress || !missionType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // When the session is verifiable, the uploaded file must belong to one of
    // the session user's own wallets.
    if (sessionUserId) {
      const { data: walletRows } = await supabaseServiceClient
        .from('ss_wallet_connections')
        .select('wallet_address')
        .eq('user_id', sessionUserId)

      const ownedWallets = new Set((walletRows ?? []).map(r => r.wallet_address?.toLowerCase()))
      if (!ownedWallets.has(walletAddress.toLowerCase())) {
        return NextResponse.json(
          { error: 'wallet_address does not belong to the authenticated user' },
          { status: 403 }
        )
      }
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, GIF and WebP images are allowed' },
        { status: 400 }
      )
    }

    const ext = file.name.split('.').pop() || 'jpg'
    const timestamp = Date.now()
    const sanitizedWallet = walletAddress.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20)
    const filePath = `${sanitizedWallet}/${missionType}/${timestamp}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    const { error: uploadError } = await supabaseServiceClient.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload screenshot' }, { status: 500 })
    }

    const { data: urlData } = supabaseServiceClient.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)

    return NextResponse.json({ url: urlData.publicUrl })
  } catch (error) {
    console.error('Error uploading screenshot:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
