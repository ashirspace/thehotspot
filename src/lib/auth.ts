import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import LinkedInProvider from "next-auth/providers/linkedin";
import { getPrisma } from "@/lib/prisma";

export function getAuthOptions(): NextAuthOptions {
  return {
    adapter: PrismaAdapter(getPrisma()),
    session: {
      strategy: "database",
    },
    pages: {
      signIn: "/",
    },
    providers: [
      LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID || "missing-linkedin-client-id",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "missing-linkedin-client-secret",
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
      profile(profile) {
        const typed = profile as {
          sub?: string;
          name?: string;
          email?: string;
          picture?: string;
          localizedFirstName?: string;
          localizedLastName?: string;
        };

        return {
          id: typed.sub || typed.email || typed.name || crypto.randomUUID(),
          name:
            typed.name ||
            [typed.localizedFirstName, typed.localizedLastName].filter(Boolean).join(" "),
          email: typed.email,
          image: typed.picture,
        };
      },
      }),
    ],
    callbacks: {
      async session({ session, user }) {
        if (session.user) {
          session.user.id = user.id;
        }

        return session;
      },
    },
  };
}
