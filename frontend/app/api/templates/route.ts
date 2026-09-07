import { NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'
import { TEAM_MEMBER_WALLETS } from '@/constants'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get('wallet')?.toLowerCase()
    const sort = searchParams.get('sort')

    let query = supabaseServiceClient
      .from('ss_defender_templates' as any)
      .select('*')

    if (sort === 'popular') {
      query = query
        .order('like_count' as any, { ascending: false, nullsFirst: false })
        .order('rank', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
    } else {
      query = query
        .order('rank', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching templates:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    let templates = data as any[]

    if (wallet && templates.length > 0) {
      const { data: likes } = await supabaseServiceClient
        .from('ss_defender_template_likes' as any)
        .select('template_id')
        .eq('user_address', wallet)
        .in(
          'template_id',
          templates.map(t => t.id)
        )
      const likedIds = new Set((likes as any[] | null)?.map(l => l.template_id) ?? [])
      templates = templates.map(t => ({ ...t, liked_by_me: likedIds.has(t.id) }))
    }

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Unexpected error fetching templates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const AGENTS_BUCKET_NAME = 'ss-agents'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const tags = formData.get('tags') as string | null
    const public_instructions = formData.get('public_instructions') as string
    const private_instructions = formData.get('private_instructions') as string
    const attack_goal = formData.get('attack_goal') as string
    const creator_address = formData.get('creator_address') as string
    const imageFile = formData.get('image') as File | null
    const imageUrlString = formData.get('image_url') as string | null

    if (!name || !public_instructions || !private_instructions || !attack_goal || !creator_address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let avatarUrl: string | null = null

    if (imageFile && imageFile.name) {
      if (imageFile.size > MAX_IMAGE_SIZE) {
        return NextResponse.json({ error: 'Image must be smaller than 5MB' }, { status: 400 })
      }
      if (!ALLOWED_IMAGE_TYPES.includes(imageFile.type)) {
        return NextResponse.json(
          { error: 'Invalid image type. Supported: JPEG, PNG, GIF, WebP' },
          { status: 400 }
        )
      }

      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const fileExt = imageFile.name.split('.').pop()
      const safeName = name.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50)
      const filePath = `templates/${Date.now()}_${safeName}.${fileExt}`

      const { error: uploadError } = await supabaseServiceClient.storage
        .from(AGENTS_BUCKET_NAME)
        .upload(filePath, buffer, {
          contentType: imageFile.type,
          upsert: false,
        })

      if (uploadError) {
        console.error('Error uploading template image:', uploadError)
        return NextResponse.json({ error: uploadError.message }, { status: 500 })
      }

      const { data: urlData } = supabaseServiceClient.storage
        .from(AGENTS_BUCKET_NAME)
        .getPublicUrl(filePath)

      avatarUrl = urlData.publicUrl
    } else if (imageUrlString) {
      avatarUrl = imageUrlString
    }

    // Convert comma-separated string to array
    const tagsArray = tags 
      ? tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) 
      : []

    const isTeam = TEAM_MEMBER_WALLETS.includes(creator_address.toLowerCase())
    const origin = isTeam ? 'team' : 'community'

    const { data, error } = await supabaseServiceClient
      .from('ss_defender_templates' as any)
      .insert([
        {
          name,
          tags: tagsArray,
          public_instructions,
          private_instructions,
          attack_goal,
          creator_address,
          avatar_url: avatarUrl,
          origin,
          rank: 0
        }
      ])
      .select()

    if (error) {
      console.error('Error inserting template:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Unexpected error inserting template:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
