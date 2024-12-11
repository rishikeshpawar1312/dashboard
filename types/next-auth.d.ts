// types/next-auth.d.ts

import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      provider?: string
      role?: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string
    role?: string
    createdAt?: Date
    updatedAt?: Date
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    provider?: string
    role?: string
  }
}