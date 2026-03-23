import { signIn } from 'next-auth/react'
import { toast } from 'sonner'

export const handleConnectGoogle = async (
  walletAddress: string | undefined,
  callbackUrl: string = '/profile?connected=Google'
) => {
  if (!walletAddress) {
    toast.error('Please connect your wallet first')
    return
  }

  signIn('google', { callbackUrl })
}
