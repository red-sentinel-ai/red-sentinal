import { NextRequest, NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('name')
  const currentUserId = searchParams.get('userId')

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 })
  }

  try {
    let query = supabaseServiceClient.from('ss_users').select('id').eq('username', username)

    // If checking for an existing user, exclude their own record from the check
    if (currentUserId) {
      query = query.neq('id', currentUserId)
    }

    const { data, error } = await query.maybeSingle()

    if (error) {
      throw error
    }

    return NextResponse.json({ exists: !!data })
  } catch (err) {
    console.error('[Check Username API Error]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
