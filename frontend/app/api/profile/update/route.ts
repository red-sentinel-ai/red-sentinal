import { NextResponse, NextRequest } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'

const AVATARS_BUCKET_NAME = 'ss-avatars'

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData()
    const walletAddress = formData.get('walletAddress') as string
    const username = formData.get('username') as string
    const displayName = formData.get('displayName') as string
    const imageFile = formData.get('imageFile') as File | null
    const imageUrl = formData.get('imageUrl') as string | null

    if (!walletAddress || !username || !displayName) {
      return NextResponse.json({ error: 'Missing required text fields' }, { status: 400 })
    }

    const { data: user, error: findError } = await supabaseServiceClient
      .from('ss_users')
      .select('id')
      .contains('wallet_addresses', [walletAddress])
      .single()

    if (findError || !user) {
      return NextResponse.json({ error: 'User not found or unauthorized' }, { status: 404 })
    }

    const { data: existingUsername } = await supabaseServiceClient
      .from('ss_users')
      .select('id')
      .eq('username', username)
      .neq('id', user.id)
      .single()

    if (existingUsername) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 409 })
    }

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

    const updateData: { [key: string]: unknown } = {
      username: username,
      display_name: displayName,
      rewards_updated_at: new Date().toISOString(),
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
