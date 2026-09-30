import { NextResponse } from 'next/server'

import { supabaseServiceClient } from '@/db/config/server'
import type { ShareFact } from '@/types/share'

/**
 * Public: active educational facts for the attack share card. One is picked at
 * random client-side and folded into the editable X post. Fact management
 * lives in the landing-page admin portal.
 */
export async function GET() {
  try {
    const { data, error } = await supabaseServiceClient
      .from('ss_share_facts')
      .select('fact_id, fact, is_active, created_at, updated_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Failed to list share facts:', error)
      return NextResponse.json({ success: false, error: 'Could not load share facts' }, { status: 500 })
    }

    return NextResponse.json({ success: true, facts: (data ?? []) as ShareFact[] })
  } catch (error) {
    console.error('Error listing share facts:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
