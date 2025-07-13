// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth, { DefaultSession, DefaultUser } from 'next-auth'
import { DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    connectedProviders: string[]
    walletAddress?: string
    hasTwitter: boolean
    hasDiscord: boolean
    twitterData?: {
      id: string
      username: string
      avatar: string | null
    }
    discordData?: {
      id: string
      username: string
      avatar: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    connectedProviders: string[]
    walletAddress?: string
    twitterData?: {
      id: string
      username: string
      avatar: string | null
    }
    discordData?: {
      id: string
      username: string
      avatar: string | null
    }
  }
}
