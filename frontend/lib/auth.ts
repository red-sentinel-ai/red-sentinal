
import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.connectedProviders = token.connectedProviders || []

        if (!token.connectedProviders.includes(account.provider)) {
          token.connectedProviders.push(account.provider)
        }

        token.googleData = {
          id: profile.sub || (profile as any).id || '',
          username: profile.email || (profile as any).name || 'Unknown',
          avatar: (profile as any).picture || null,
        }
      }
      return token
    },

    async session({ session, token }) {
      session.connectedProviders = (token.connectedProviders as string[]) || []
      session.hasGoogle = session.connectedProviders.includes('google')
      if (token.googleData) session.googleData = token.googleData as any
      return session
    },
  },
  pages: {
    error: '/profile?error=social-auth',
  },
}
