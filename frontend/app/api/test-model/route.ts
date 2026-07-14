import { NextResponse } from 'next/server'

import { BACKEND_API_ADMIN_TOKEN, SUI_SENTINEL_API_URL } from '@/constants'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { model_provider, api_base_url, api_key, model_name, test_prompt } = body

    if (!api_base_url || !api_key || !model_name) {
      return NextResponse.json(
        { error: 'api_base_url, api_key, and model_name are required' },
        { status: 400 }
      )
    }

    const response = await fetch(`${SUI_SENTINEL_API_URL}/sentinels/test-model`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${BACKEND_API_ADMIN_TOKEN}`,
      },
      body: JSON.stringify({
        model_provider: model_provider || 'custom',
        api_base_url,
        api_key,
        model_name,
        test_prompt: test_prompt || 'Say OK if you can hear me',
      }),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error testing model:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
