import { NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const templateId = Number(id)
    const { wallet: rawWallet } = await request.json()
    const wallet = rawWallet?.toLowerCase()

    if (!templateId || !wallet) {
      return NextResponse.json({ error: 'Missing template id or wallet' }, { status: 400 })
    }

    const { data: existing } = await supabaseServiceClient
      .from('ss_defender_template_likes' as any)
      .select('id')
      .eq('template_id', templateId)
      .eq('user_address', wallet)
      .maybeSingle()

    let liked: boolean
    let like_count: number

    if (existing) {
      const { error: deleteError } = await supabaseServiceClient
        .from('ss_defender_template_likes' as any)
        .delete()
        .eq('id', (existing as any).id)

      if (deleteError) {
        console.error('Error removing like:', deleteError)
        return NextResponse.json({ error: deleteError.message }, { status: 500 })
      }

      like_count = Math.max(0, (await getCurrentCount(templateId)) - 1)
      liked = false
    } else {
      const { error: insertError } = await supabaseServiceClient
        .from('ss_defender_template_likes' as any)
        .insert([{ template_id: templateId, user_address: wallet }])

      if (insertError) {
        if ((insertError as any).code === '23505') {
          // Already liked (unique violation) — idempotent no-op
          return NextResponse.json({ liked: true, like_count: await getCurrentCount(templateId) })
        }
        console.error('Error inserting like:', insertError)
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }

      like_count = (await getCurrentCount(templateId)) + 1
      liked = true
    }

    await supabaseServiceClient
      .from('ss_defender_templates' as any)
      .update({ like_count } as any)
      .eq('id', templateId)

    return NextResponse.json({ liked, like_count })
  } catch (error) {
    console.error('Unexpected error toggling like:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function getCurrentCount(templateId: number): Promise<number> {
  const { data } = await supabaseServiceClient
    .from('ss_defender_templates' as any)
    .select('like_count')
    .eq('id', templateId)
    .single()
  return (data as any)?.like_count ?? 0
}
