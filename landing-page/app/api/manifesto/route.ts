import { NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const { error } = await supabaseServiceClient
      .from('ss_manifesto_signatures')
      .insert([{ email }])

    if (error) {
      if (error.code === '23505') {
         return NextResponse.json({ success: true, message: 'Already signed' }, { status: 200 })
      }
      throw error
    }

    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error) {
    console.error('Manifesto sign error:', error)
    return NextResponse.json(
      { error: 'Failed to sign manifesto' },
      { status: 500 }
    )
  }
}