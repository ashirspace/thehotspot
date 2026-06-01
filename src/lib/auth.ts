import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import LinkedInProvider from "next-auth/providers/linkedin";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { getPrisma } from "@/lib/prisma";

export function getAuthOptions(): NextAuthOptions {
  return {
    adapter: PrismaAdapter(getPrisma()),
    session: {
      strategy: "jwt",
    },
    pages: {
      signIn: "/",
    },
    providers: [
      // ── Google OAuth (sign-in + sign-up on the landing/signup pages) ──
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      }),

      // ── LinkedIn (ONLY used from the LinkedIn DM navbar action → /dashboard) ──
      LinkedInProvider({
        clientId: process.env.LINKEDIN_CLIENT_ID || "",
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
        authorization: {
          params: { scope: "openid profile email" },
        },
        profile(profile) {
          const p = profile as {
            sub?: string; name?: string; email?: string; picture?: string;
            localizedFirstName?: string; localizedLastName?: string;
          };
          return {
            id: p.sub || p.email || crypto.randomUUID(),
            name: p.name || [p.localizedFirstName, p.localizedLastName].filter(Boolean).join(" "),
            email: p.email,
            image: p.picture,
          };
        },
      }),

      // ── Credentials (email + password, sign-in only — registration via /api/auth/register) ──
      CredentialsProvider({
        name: "credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) return null;

          const prisma = getPrisma();
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
          });

          if (!user?.password) return null;

          const valid = await compare(credentials.password, user.password);
          if (!valid) return null;

          return { id: user.id, name: user.name, email: user.email, image: user.image };
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user) token.sub = user.id;
        return token;
      },
      async session({ session, token }) {
        if (session.user && token.sub) {
          session.user.id = token.sub;
        }
        return session;
      },
    },
  };
}
