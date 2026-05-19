import { NextResponse } from 'next/server'
import { APP_NETWORK, SUI_SENTINEL_API_URL } from '@/constants'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const url = new URL(request.url)
    const walletAddress = url.searchParams.get('wallet_address')
    const network = url.searchParams.get('network') || APP_NETWORK
    if (!walletAddress) {
      return NextResponse.json({ error: 'wallet_address is required' }, { status: 400 })
    }
    const upstream = await fetch(
      `${SUI_SENTINEL_API_URL}/telegram/${network}/subscriptions/${encodeURIComponent(id)}?wallet_address=${encodeURIComponent(walletAddress)}`,
      { method: 'DELETE' }
    )
    const data = await upstream.json()
    return NextResponse.json(data, { status: upstream.status })
  } catch (err) {
    console.error('telegram delete subscription proxy error:', err)
    return NextResponse.json(
      { error: 'Failed to delete subscription' },
      { status: 500 }
    )
  }
}
