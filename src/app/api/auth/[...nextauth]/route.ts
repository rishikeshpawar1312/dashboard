// app/api/auth/[...nextauth]/route.ts

import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import type { Adapter } from "next-auth/adapters"
import NextAuth from "next-auth/next"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? "",
      clientSecret: process.env.GOOGLE_SECRET ?? "",
      httpOptions: {
        timeout: 10000,
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
      
      httpOptions: {
        timeout: 10000,
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Invalid credentials")
          }

          const user = await prisma.user.findUnique({
            where: { 
              email: credentials.email 
            },
            select: {
              id: true,
              email: true,
              name: true,
              hashedPassword: true,
              image: true,
              
              createdAt: true,
              updatedAt: true,
            },
          })

          if (!user || !user.hashedPassword) {
            throw new Error("Invalid credentials")
          }

          const isCorrectPassword = await bcrypt.compare(
            credentials.password,
            user.hashedPassword
          )

          if (!isCorrectPassword) {
            throw new Error("Invalid credentials")
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
             
          }
        } catch (error) {
          console.error("Error in authorize callback:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      try {
        if (user) {
          token.id = user.id
          token.email = user.email
          token.role = user.role
        }
        if (account) {
          token.provider = account.provider
        }
        return token
      } catch (error) {
        console.error("Error in jwt callback:", error)
        return token
      }
    },
    async session({ session, token }) {
      try {
        if (session.user) {
          session.user.id = token.id
          session.user.provider = token.provider
          session.user.role = token.role
          if (token.email) {
            session.user.email = token.email
          }
        }
        return session
      } catch (error) {
        console.error("Error in session callback:", error)
        return session
      }
    },
    async signIn({ user, account, profile }) {
      if (!account || !user.email) return false;
   
      try {
         const existingAccount = await prisma.account.findUnique({
            where: {
               provider_providerAccountId: {
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
               },
            },
            include: { user: true },
         });
   
         if (existingAccount) {
            // If account already exists, proceed with sign-in
            return true;
         }
   
         const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
         });
   
         if (existingUser) {
            // Link the new provider account to the existing user
            await prisma.account.create({
               data: {
                  userId: existingUser.id,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  type: account.type,
                  access_token: account.access_token,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
               },
            });
            return true;
         } else {
            // Create a new user if no matching email or provider account exists
            await prisma.user.create({
               data: {
                  email: user.email,
                  name: user.name,
                  image: user.image,
                  accounts: {
                     create: {
                        provider: account.provider,
                        providerAccountId: account.providerAccountId,
                        type: account.type,
                        access_token: account.access_token,
                        token_type: account.token_type,
                        scope: account.scope,
                        id_token: account.id_token,
                     },
                  },
               },
            });
            return true;
         }
      } catch (error) {
         console.error("Error in signIn callback:", error);
         return false;
      }
      
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }