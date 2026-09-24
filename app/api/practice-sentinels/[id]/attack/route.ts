import { NextResponse } from 'next/server'

import { BACKEND_API_ADMIN_TOKEN, SUI_SENTINEL_API_URL } from '@/constants'
import { PRACTICE_NETWORK } from '@/lib/practice'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { attacker_address, user_prompt, session_id, network, mode } = body

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
