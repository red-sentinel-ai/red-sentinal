import { NextResponse } from 'next/server'
import { APP_NETWORK, SUI_SENTINEL_API_URL } from '@/constants'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const walletAddress = url.searchParams.get('wallet_address')
    const network = url.searchParams.get('network') || APP_NETWORK
    if (!walletAddress) {
      return NextResponse.json({ error: 'wallet_address is required' }, { status: 400 })
    }
    const upstream = await fetch(
      `${SUI_SENTINEL_API_URL}/telegram/${network}/subscriptions?wallet_address=${encodeURIComponent(walletAddress)}`,
      { cache: 'no-store' }
    )
    const data = await upstream.json()
    return NextResponse.json(data, { status: upstream.status })
  } catch (err) {
    console.error('telegram subscriptions proxy error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}
