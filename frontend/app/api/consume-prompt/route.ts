import { APP_ENVIRONMENT, APP_NETWORK, LOCAL_API_PATH } from '@/constants'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${LOCAL_API_PATH}/${APP_ENVIRONMENT}/${APP_NETWORK}/consume-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend Response Error:', errorText)

      throw new Error(`External API error! status: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error in consume-prompt API route:', error)

    return NextResponse.json({ error: error.message || 'Failed to consume agent' }, { status: 500 })
  }
}
