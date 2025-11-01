import { supabaseServiceClient } from '@/db/config/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { job_title, name, email, portfolio_link, notes } = body

    if (!job_title || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: job_title, name, and email are required.' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseServiceClient
      .from('ss_job_applications')
      .insert([
        {
          job_title,
          name,
          email,
          portfolio_link,
          notes,
        },
      ])
      .select()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data }, { status: 200 })
  } catch (err) {
    console.error('API route error:', err)
    let errorMessage = 'An unknown error occurred'
    if (err instanceof Error) {
      errorMessage = err.message
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
