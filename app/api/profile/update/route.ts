import { NextResponse, NextRequest } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'
import type { Database } from '@/lib/database.types'

type SsUsersUpdate = Database['sentinel']['Tables']['ss_users']['Update']

const AVATARS_BUCKET_NAME = 'ss-avatars'

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData()
    const walletAddress = (formData.get('walletAddress') as string)?.toLowerCase()
    const displayName = formData.get('displayName') as string
    const imageFile = formData.get('imageFile') as File | null
    const imageUrl = formData.get('imageUrl') as string | null

    if (!walletAddress || !displayName) {
      return NextResponse.json({ error: 'Missing required text fields' }, { status: 400 })
    }

    // Find user by wallet address via ss_wallet_connections
    const { data: walletConnection, error: findError } = await supabaseServiceClient
      .from('ss_wallet_connections')
      .select('user_id')
      .eq('wallet_address', walletAddress)
      .single()

    if (findError || !walletConnection) {
      return NextResponse.json({ error: 'User not found or unauthorized' }, { status: 404 })
    }

    const user = { id: walletConnection.user_id }

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
