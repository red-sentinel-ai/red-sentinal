import { NextRequest, NextResponse } from 'next/server'

import { supabaseServiceClient } from '@/db/config/server'
import { ADMIN_API_TOKEN } from '@/constants'

const NAME_MAX_LENGTH = 60
const DESCRIPTION_MAX_LENGTH = 500

function isAdminRequest(req: NextRequest): boolean {
  if (!ADMIN_API_TOKEN) return false
  return req.headers.get('x-admin-key') === ADMIN_API_TOKEN
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Public: list active tags for the launch-sentinel Tags dropdown.
 * Admins (x-admin-key) get the full list including inactive tags.
 */
export async function GET(req: NextRequest) {
  try {
    let query = supabaseServiceClient
      .from('ss_tags')
      .select('tag_id, name, slug, description, is_active, created_at')
      .order('name', { ascending: true })

    if (!isAdminRequest(req)) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

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

/**
 * Admin-only: create a tag. Send the admin key in the `x-admin-key` header.
 */
export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await req.json().catch(() => ({}))) as {
      name?: string
      description?: string
    }

    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const description =
      typeof body.description === 'string' && body.description.trim()
        ? body.description.trim()
        : null

    if (!name) {
      return NextResponse.json({ success: false, error: 'Tag name is required' }, { status: 400 })
    }
    if (name.length > NAME_MAX_LENGTH) {
      return NextResponse.json(
        { success: false, error: `Tag name must be ${NAME_MAX_LENGTH} characters or fewer` },
        { status: 400 }
      )
    }
    if (description && description.length > DESCRIPTION_MAX_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          error: `Description must be ${DESCRIPTION_MAX_LENGTH} characters or fewer`,
        },
        { status: 400 }
      )
    }

    const slug = slugify(name)
    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Tag name must contain at least one letter or number' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseServiceClient
      .from('ss_tags')
      .insert({ name, slug, description })
      .select('tag_id, name, slug, description, is_active, created_at')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'A tag with this name already exists' },
          { status: 409 }
        )
      }
      console.error('Failed to create tag:', error)
      return NextResponse.json({ success: false, error: 'Could not create tag' }, { status: 500 })
    }

    return NextResponse.json({ success: true, tag: data }, { status: 201 })
  } catch (error) {
    console.error('Error creating tag:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
