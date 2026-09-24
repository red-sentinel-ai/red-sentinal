import { NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'

const MAX_COMMENT_LENGTH = 1000

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const templateId = Number(id)

    if (!templateId) {
      return NextResponse.json({ error: 'Missing template id' }, { status: 400 })
    }

    const { data: comments, error } = await supabaseServiceClient
      .from('ss_defender_template_comments' as any)
      .select('id, user_address, comment, created_at')
      .eq('template_id', templateId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching template comments:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const hydrated = await hydrateProfiles(comments as any[] ?? [])
    return NextResponse.json(hydrated)
  } catch (error) {
    console.error('Unexpected error fetching template comments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const templateId = Number(id)
    const { wallet: rawWallet, comment } = await request.json()
    const wallet = rawWallet?.toLowerCase()

    if (!templateId || !wallet) {
      return NextResponse.json({ error: 'Missing template id or wallet' }, { status: 400 })
    }

    const trimmed = typeof comment === 'string' ? comment.trim() : ''
    if (!trimmed || trimmed.length > MAX_COMMENT_LENGTH) {
      return NextResponse.json(
        { error: `Comment must be 1-${MAX_COMMENT_LENGTH} characters` },
        { status: 400 }
      )
    }

    const { data: inserted, error: insertError } = await supabaseServiceClient
      .from('ss_defender_template_comments' as any)
      .insert([{ template_id: templateId, user_address: wallet, comment: trimmed }])
      .select('id, user_address, comment, created_at')
      .single()

    if (insertError) {
      console.error('Error inserting template comment:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    const { data: current } = await supabaseServiceClient
      .from('ss_defender_templates' as any)
      .select('comment_count')
      .eq('id', templateId)
      .single()

    const comment_count = ((current as any)?.comment_count ?? 0) + 1
    await supabaseServiceClient
      .from('ss_defender_templates' as any)
      .update({ comment_count } as any)
      .eq('id', templateId)

    const [hydrated] = await hydrateProfiles([inserted as any])
    return NextResponse.json({ comment: hydrated, comment_count })
  } catch (error) {
    console.error('Unexpected error posting template comment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

type RawComment = { id: number; user_address: string; comment: string; created_at: string }

async function hydrateProfiles(comments: RawComment[]) {
  if (comments.length === 0) return []

  const addresses = [...new Set(comments.map(c => c.user_address))]

  const { data: connections } = await supabaseServiceClient
    .from('ss_wallet_connections')
    .select('wallet_address, ss_users(username, avatar_url, display_name)')
    .in('wallet_address', addresses)

  const profileMap = new Map<string, { username: string | null; avatar_url: string | null; display_name: string | null }>()
  for (const conn of (connections as any[]) ?? []) {
    profileMap.set(conn.wallet_address?.toLowerCase(), {
      username: conn.ss_users?.username ?? null,
      avatar_url: conn.ss_users?.avatar_url ?? null,
      display_name: conn.ss_users?.display_name ?? null,
    })
  }

  return comments.map(c => ({
    id: c.id,
    user_address: c.user_address,
    comment: c.comment,
    created_at: c.created_at,
    ...(profileMap.get(c.user_address) ?? { username: null, avatar_url: null, display_name: null }),
  }))
}
