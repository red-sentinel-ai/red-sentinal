import { NextRequest, NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'

const AVATARS_BUCKET_NAME = 'ss-avatars'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const walletAddress = formData.get('walletAddress') as string
    const imageFile = formData.get('image') as File | null
    const imageUrlString = formData.get('image_url') as string | null

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
    }

    const { data: user, error: findError } = await supabaseServiceClient
      .from('ss_users')
      .select('id')
      .contains('wallet_addresses', [walletAddress])
      .single()

    if (findError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let newAvatarUrl: string | null = null

    if (imageFile && imageFile.name) {
      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const fileExt = imageFile.name.split('.').pop()
      const filePath = `${user.id}.${fileExt}`

      const { error: uploadError } = await supabaseServiceClient.storage
        .from(AVATARS_BUCKET_NAME)
        .upload(filePath, buffer, { contentType: imageFile.type, upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabaseServiceClient.storage
        .from(AVATARS_BUCKET_NAME)
        .getPublicUrl(filePath)
        
      newAvatarUrl = `${urlData.publicUrl}?t=${new Date().getTime()}`
    } else if (imageUrlString) {
      newAvatarUrl = imageUrlString
    } else {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const { data, error } = await supabaseServiceClient
      .from('ss_users')
      .update({ avatar_url: newAvatarUrl })
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ message: 'Avatar updated successfully', data }, { status: 200 })
  } catch (error) {
    console.error('[Update Avatar Error]', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
