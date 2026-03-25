import { NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'

export async function GET() {
  try {
    const { data, error } = await supabaseServiceClient
      .from('ss_defender_templates' as any)
      .select('*')
      .order('rank', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching templates:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error fetching templates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, public_instructions, private_instructions, attack_goal, jury_prompt, creator_address } = body

    if (!name || !public_instructions || !private_instructions || !attack_goal || !jury_prompt || !creator_address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabaseServiceClient
      .from('ss_defender_templates' as any)
      .insert([
        {
          name,
          public_instructions,
          private_instructions,
          attack_goal,
          jury_prompt,
          creator_address,
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
