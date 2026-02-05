import { NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'

type AmbassadorInsert = TablesInsert<'ss_ambassador_applications'>
type AmbassadorUpdate = TablesUpdate<'ss_ambassador_applications'>

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, ...applicationData } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const { data: existingDraft } = await supabaseServiceClient
      .from('ss_ambassador_applications')
      .select('*')
      .eq('email', email)
      .eq('status', 'draft')
      .single()

    if (existingDraft) {
      return NextResponse.json({
        success: true,
        data: existingDraft,
        isExisting: true,
      })
    }

    const { data: existingSubmission } = await supabaseServiceClient
      .from('ss_ambassador_applications')
      .select('id')
      .eq('email', email)
      .eq('status', 'submitted')
      .single()

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'An application has already been submitted with this email.' },
        { status: 400 }
      )
    }

    const insertData: AmbassadorInsert = {
      email,
      current_step: 1,
      status: 'draft',
      ...applicationData,
    }

    const { data, error } = await supabaseServiceClient
      .from('ss_ambassador_applications')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data, isExisting: false })
  } catch (err) {
    console.error('API route error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unknown error occurred' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 })
    }

    const updatePayload: AmbassadorUpdate = {
      ...updateData,
    }

    if (updateData.status === 'submitted') {
      updatePayload.submitted_at = new Date().toISOString()
    }

    const { data, error } = await supabaseServiceClient
      .from('ss_ambassador_applications')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('API route error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unknown error occurred' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const email = searchParams.get('email')

    if (!id && !email) {
      return NextResponse.json({ error: 'ID or email is required' }, { status: 400 })
    }

    let query = supabaseServiceClient.from('ss_ambassador_applications').select('*')

    if (id) {
      query = query.eq('id', id)
    } else if (email) {
      query = query.eq('email', email).eq('status', 'draft')
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ data: null })
      }
      console.error('Supabase select error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('API route error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unknown error occurred' },
      { status: 500 }
    )
  }
}
