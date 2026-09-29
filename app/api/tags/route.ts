import { NextResponse } from 'next/server'

import { supabaseServiceClient } from '@/db/config/server'

/**
 * Public: list active tags for the launch-sentinel Tags dropdown.
 * Tag management (create/update) lives in the landing-page admin portal.
 */
export async function GET() {
  try {
    const { data, error } = await supabaseServiceClient
      .from('ss_tags')
      .select('tag_id, name, slug, description, is_active, created_at')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('Failed to list tags:', error)
      return NextResponse.json({ success: false, error: 'Could not load tags' }, { status: 500 })
    }

    return NextResponse.json({ success: true, tags: data ?? [] })
  } catch (error) {
    console.error('Error listing tags:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
