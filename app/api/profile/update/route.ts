import { NextResponse, NextRequest } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'
import type { Database } from '@/lib/database.types'
import { rateLimit } from '@/lib/server/rate-limit'
import { requireSession } from '@/lib/server/session'

type SsUsersUpdate = Database['sentinel']['Tables']['ss_users']['Update']

const AVATARS_BUCKET_NAME = 'ss-avatars'

export async function PUT(request: NextRequest) {
  const denied = rateLimit(request, { name: 'profile-update', limit: 10, windowMs: 60_000 })
  if (denied) return denied

  // Profile mutations authorize via the verified session user, not the
  // client-supplied wallet address (wallet addresses are public).
  const { denied: sessionDenied, userId: sessionUserId } = requireSession(request)
  if (sessionDenied) return sessionDenied

  try {
    const formData = await request.formData()
    const walletAddress = (formData.get('walletAddress') as string)?.toLowerCase()
    const displayName = formData.get('displayName') as string
    const imageFile = formData.get('imageFile') as File | null
    const imageUrl = formData.get('imageUrl') as string | null

    if (!walletAddress || !displayName) {
      return NextResponse.json({ error: 'Missing required text fields' }, { status: 400 })
    }

    // Prefer the verified session user; fall back to the wallet lookup only
    // while the session cookie can't reach this app (see requireSession).
    let userId: string | undefined
    if (sessionUserId) {
      userId = sessionUserId
    } else {
      const { data: walletConnection, error: findError } = await supabaseServiceClient
        .from('ss_wallet_connections')
        .select('user_id')
        .eq('wallet_address', walletAddress)
        .single()

      if (findError || !walletConnection) {
        return NextResponse.json({ error: 'User not found or unauthorized' }, { status: 404 })
      }
      userId = walletConnection.user_id
    }

    const user = { id: userId }

    let newAvatarUrl: string | undefined = undefined

    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer())
      const filePath = `${user.id}.${imageFile.name.split('.').pop()}`
      await supabaseServiceClient.storage
        .from(AVATARS_BUCKET_NAME)
        .upload(filePath, buffer, { contentType: imageFile.type, upsert: true })
      newAvatarUrl = `${
        supabaseServiceClient.storage.from(AVATARS_BUCKET_NAME).getPublicUrl(filePath).data
          .publicUrl
      }?t=${new Date().getTime()}`
    } else if (imageUrl) {
      newAvatarUrl = imageUrl
    }

    // Username is generated once at signup and is permanent — never updated here.
    const updateData: SsUsersUpdate = {
      display_name: displayName,
      rewards_updated_at: new Date().toISOString(),
    }

    if (formData.has('emailNotifications')) {
      updateData.email_notifications = formData.get('emailNotifications') === 'true'
    }

    if (newAvatarUrl !== undefined) {
      updateData.avatar_url = newAvatarUrl
    }

    const { data: updatedUser, error: updateError } = await supabaseServiceClient
      .from('ss_users')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
