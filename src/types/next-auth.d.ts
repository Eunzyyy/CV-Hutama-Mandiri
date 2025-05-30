// src/types/next-auth.d.ts - DIPERBAIKI
import { DefaultSession, DefaultUser } from "next-auth"
import { Role } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      phone?: string | null
      address?: string | null
      createdAt?: Date
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: Role
    phone?: string | null
    address?: string | null
    createdAt?: Date
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role
    phone?: string | null
    address?: string | null
    createdAt?: Date
  }
}