import { NextResponse } from 'next/server'

import { SUI_SENTINEL_API_URL } from '@/constants'
import { BACKEND_API_ADMIN_TOKEN } from '@/lib/server/credentials'
import { PRACTICE_NETWORK } from '@/lib/practice'
import { rateLimit } from '@/lib/server/rate-limit'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = rateLimit(req, { name: 'practice-attack', limit: 10, windowMs: 60_000 })
  if (denied) return denied

  try {
    const { id } = await params
    const body = await req.json()
    const {
      attacker_address,
      user_prompt,
      session_id,
      network,
      mode,
      walrus_record_mode,
    } = body

    if (!attacker_address || !user_prompt) {
      return NextResponse.json(
        { error: 'attacker_address and user_prompt are required' },
        { status: 400 }
      )
    }

    const targetNetwork = network || PRACTICE_NETWORK
    const response = await fetch(
      `${SUI_SENTINEL_API_URL}/sentinels/${targetNetwork}/attack/${id}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${BACKEND_API_ADMIN_TOKEN}`,
        },
        body: JSON.stringify({
          attacker_address,
          user_prompt,
          ...(session_id ? { session_id } : {}),
          ...(mode ? { mode } : {}),
          ...(walrus_record_mode ? { walrus_record_mode } : {}),
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error attacking practice sentinel:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
