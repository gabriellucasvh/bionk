import type { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { generateUniqueUsername } from '@/utils/generateUsername'
import type { User } from 'next-auth'

const prisma = new PrismaClient()
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  throw new Error("Missing Google OAuth environment variables");
}


interface ExtendedUser extends User {
  id: string
  username?: string
  name?: string
}
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  cookies:
    process.env.NODE_ENV === 'production'
      ? {
          sessionToken: {
            name: '__Secure-next-auth.session-token',
            options: {
              httpOnly: true,
              sameSite: 'lax',
              path: '/',
              secure: true,
            },
          },
        }
      : undefined,

  providers: [
    GoogleProvider({
      clientId,
      clientSecret,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.hashedPassword) return null

        const isValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        )

        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          username: user.username ?? undefined,
          name: user.name ?? undefined,
        }
      },
    }),
  ],
  pages: {
    signIn: '/registro',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account }) {
      const u = user as ExtendedUser
      if (user) {
        token.id = user.id
        token.email = user.email ?? undefined
        token.username = u.username
        token.name = u.name
      }
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        email: token.email ?? '',
        username: token.username as string,
        name: token.name as string,
      }
      return session
    },
    async redirect({ baseUrl }) {
      return `${baseUrl}/dashboard/perfil`
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.username && user.name) {
        const username = await generateUniqueUsername(user.name)
        await prisma.user.update({
          where: { id: user.id },
          data: { username },
        })
      }
    },
  },
}
