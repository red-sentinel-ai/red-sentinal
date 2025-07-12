import { supabaseServiceClient } from '@/db/config/server'
import { NextRequest, NextResponse } from 'next/server'

const AGENTS_BUCKET_NAME = 'ss-agents'

export async function POST(req: NextRequest) {
  const formData = await req.formData()

  const agent_id = formData.get('agent_id') as string
  const agent_name = formData.get('agent_name') as string
  const object_id = formData.get('object_id') as string
  const owner = formData.get('owner') as string
  const message_price = formData.get('message_price')
  const digest = formData.get('digest')
  const imageFile = formData.get('image') as File | null

  if (!agent_id || !agent_name || !object_id || !owner) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  let imageUrl: string | null = null

  if (imageFile) {
    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const fileExt = imageFile.name.split('.').pop()
    const filePath = `${agent_name}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabaseServiceClient.storage
      .from(AGENTS_BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: imageFile.type,
        upsert: true,
      })

    console.log('Uploaded data to storage', uploadData)

    if (uploadError) {
      console.error('[Upload Error]', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: urlData } = supabaseServiceClient.storage
      .from(AGENTS_BUCKET_NAME)
      .getPublicUrl(filePath)

    imageUrl = urlData.publicUrl
  }

  const agent_id_number = Number(agent_id)
  const message_price_number = message_price ? Number(message_price.toString()) : undefined
  const digest_str = digest?.toString()

  const { data, error } = await supabaseServiceClient
    .from('ss_agents')
    .insert([
      {
        agent_id: agent_id_number,
        agent_name,
        agent_profile: imageUrl,
        message_price: message_price_number,
        object_id,
        owner,
        digest: digest_str,
      },
    ])
    .select('*')

  if (error) {
    console.error('[Insert Agent Error]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(
    { message: 'Agent created successfully', data: data?.[0] },
    { status: 200 }
  )
}
