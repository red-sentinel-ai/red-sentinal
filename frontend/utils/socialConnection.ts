import { signIn } from 'next-auth/react'
import { toast } from 'sonner'

export const handleConnectTwitter = async (
  walletAddress: string | undefined,
  callbackUrl: string = '/profile?connected=Twitter'
) => {
  if (!walletAddress) {
    toast.error('Please connect your wallet first')
    return
  }

  try {
    // Set wallet address in cookie
    await fetch('/api/auth/set-wallet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress }),
    })

    // Start OAuth flow
    signIn('twitter', { callbackUrl })
  } catch (error) {
    toast.error(`Failed to start Twitter connection: ${error}`)
  }
}

export const handleConnectDiscord = async (
  walletAddress: string | undefined,
  callbackUrl: string = '/profile?connected=Discord'
) => {
  if (!walletAddress) {
    toast.error('Please connect your wallet first')
    return
  }

  try {
    // Set wallet address in cookie
    await fetch('/api/auth/set-wallet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress }),
    })

    // Start OAuth flow
    signIn('discord', { callbackUrl })
  } catch (error) {
    toast.error(`Failed to start Discord connection: ${error}`)
  }
}
