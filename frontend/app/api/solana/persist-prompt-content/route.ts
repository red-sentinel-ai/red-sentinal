import { NextRequest, NextResponse } from 'next/server'
import { SS_ADMIN_TOKEN, APP_NETWORK, SUI_SENTINEL_API_URL } from '@/constants'

interface PersistPromptContentBody {
  tx_digest: string
  agent_id: string
  attacker: string
  message: string
  agent_response?: string | null
  jury_response?: string | null
  fun_response?: string | null
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PersistPromptContentBody

    if (!body.tx_digest || !body.agent_id || !body.attacker || !body.message) {
      return NextResponse.json(
        { error: 'tx_digest, agent_id, attacker and message are required' },
        { status: 400 }
      )
    }

    if (!SS_ADMIN_TOKEN) {
      console.error('SS_ADMIN_TOKEN is not defined')
      return NextResponse.json(
        { error: 'Server not configured' },
        { status: 500 }
      )
    }

    const response = await fetch(
      `${SUI_SENTINEL_API_URL}/agents/solana-prompt-content`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': SS_ADMIN_TOKEN,
        },
        body: JSON.stringify({
          network: APP_NETWORK,
          tx_digest: body.tx_digest,
          agent_id: body.agent_id,
          attacker: body.attacker,
          message: body.message,
          agent_response: body.agent_response ?? null,
          jury_response: body.jury_response ?? null,
          fun_response: body.fun_response ?? null,
        }),
      }
    )

    const text = await response.text()
    if (!response.ok) {
      console.error('[persist-prompt-content] backend error:', response.status, text)
      return NextResponse.json(
        { error: text || `Backend returned ${response.status}` },
        { status: response.status }
      )
    }

    return NextResponse.json(text ? JSON.parse(text) : { success: true })
  } catch (error: any) {
    console.error('[persist-prompt-content] error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to persist prompt content' },
      { status: 500 }
    )
  }
}
