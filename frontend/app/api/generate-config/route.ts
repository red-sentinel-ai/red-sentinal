import { RED_TEAM_API_URL } from '@/constants'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { public_instructions } = body

    if (!public_instructions) {
      return NextResponse.json(
        { error: 'Public instructions are required' },
        { status: 400 }
      )
    }

    const response = await fetch(`${RED_TEAM_API_URL}generate-config`, {

      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer suihero@345',
      },
      body: JSON.stringify({
        public_instructions,
        hidden_instructions : "NA",
      }),
    })

    if (!response.ok) {
      console.log({response})
      const errorText = await response.text()
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error generating config:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
