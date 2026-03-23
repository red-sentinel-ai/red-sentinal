import { NextResponse } from 'next/server'
import { checkSocialConnections } from '@/utils/socialConnectionCheck'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ walletAddress: string }> }
) {
  try {
    const walletAddress = (await params).walletAddress
    const result = await checkSocialConnections(walletAddress)

    return NextResponse.json({
      wallet_address: result.wallet_address,
      isXConnected: result.isXConnected,
      isDiscordConnected: result.isDiscordConnected,
    })
  } catch (error) {
    console.error('Error fetching social status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
