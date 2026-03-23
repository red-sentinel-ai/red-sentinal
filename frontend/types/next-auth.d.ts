// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth, { DefaultSession, DefaultUser } from 'next-auth'
import { DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    connectedProviders: string[]
    hasGoogle: boolean
    googleData?: {
      id: string
      username: string
      avatar: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    connectedProviders: string[]
    googleData?: {
      id: string
      username: string
      avatar: string | null
    }
  }
}
