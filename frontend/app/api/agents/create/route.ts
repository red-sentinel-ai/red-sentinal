import { supabaseServiceClient } from '@/db/config/server'
import { NextRequest, NextResponse } from 'next/server'

const AGENTS_BUCKET_NAME = 'ss-agents'

export async function POST(req: NextRequest) {
  const formData = await req.formData()

  const agent_id = formData.get('agent_id') as string
  const agent_name = formData.get('agent_name') as string
  const object_id = formData.get('object_id') as string
  const owner = formData.get('owner') as string
  const digest = formData.get('digest')
  const imageFile = formData.get('image') as File | null
  const imageUrlString = formData.get('image_url') as string | null

  if (!agent_id || !agent_name || !object_id || !owner) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  let imageUrl: string | null = null

  if (imageFile && imageFile.name) {
    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const fileExt = imageFile.name.split('.').pop()
    const safeAgentName = agent_name.replace(/\s+/g, '_')
    const filePath = `${agent_id}_${safeAgentName}.${fileExt}`

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
  } else if (imageUrlString) {
    imageUrl = imageUrlString
  }

  const agent_id_number = Number(agent_id)
  const digest_str = digest?.toString()
  const agent_path = agent_name.toLowerCase().replace(/\s+/g, '_')

  const { data, error } = await supabaseServiceClient
    .from('ss_agents')
    .insert([
      {
        agent_id: agent_id_number,
        agent_name,
        agent_path: agent_path,
        agent_profile: imageUrl,
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
