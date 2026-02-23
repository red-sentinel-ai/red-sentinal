import { NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'
import { TablesInsert } from '@/lib/database.types'
import { sendDemoRequestConfirmationEmail } from '@/lib/emailUtils'

type DemoRequestInsert = TablesInsert<'ss_demo_requests'>

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      first_name,
      last_name,
      email,
      company_name,
      message,
      join_beta
    } = body

    if (!first_name || !first_name.trim()) {
      return NextResponse.json(
        { error: 'First name is required' },
        { status: 400 }
      )
    }

    if (!last_name || !last_name.trim()) {
      return NextResponse.json(
        { error: 'Last name is required' },
        { status: 400 }
      )
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    if (!company_name || !company_name.trim()) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      )
    }

    const { data: existingRequest } = await supabaseServiceClient
      .from('ss_demo_requests')
      .select('id, status')
      .eq('email', email.toLowerCase().trim())
      .eq('status', 'pending')
      .single()

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending demo request. We will contact you soon!' },
        { status: 409 }
      )
    }

    const insertData: DemoRequestInsert = {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.toLowerCase().trim(),
      company_name: company_name.trim(),
      message: message?.trim() || null,
      join_beta: join_beta === true,
      status: 'pending',
    }

    const { data, error } = await supabaseServiceClient
      .from('ss_demo_requests')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: 'Failed to submit demo request. Please try again.' },
        { status: 500 }
      )
    }

    if (data?.email) {
      sendDemoRequestConfirmationEmail(data.email, data.first_name).catch((err) =>
        console.error('Failed to send demo request confirmation email:', err)
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Demo request submitted successfully!'
    })

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
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseServiceClient
      .from('ss_demo_requests')
      .select('id, status, created_at')
      .eq('email', email.toLowerCase().trim())
      .eq('status', 'pending')
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase select error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      hasPendingRequest: !!data,
      data: data || null
    })

  } catch (err) {
    console.error('API route error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unknown error occurred' },
      { status: 500 }
    )
  }
}
