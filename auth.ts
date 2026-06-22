import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { z } from "zod";
import { getSql } from "@/lib/db";

const providers = [
  Credentials({
    credentials: { email: {}, password: {} },
    authorize: async (credentials) => {
      const parsed = z.object({ email: z.email(), password: z.string().min(8) }).safeParse(credentials);
      if (!parsed.success) return null;
      const sql = getSql();
      const rows = await sql`SELECT id, name, email, password_hash FROM users WHERE LOWER(email) = LOWER(${parsed.data.email}) LIMIT 1`;
      const user = rows[0] as { id: string; name: string; email: string; password_hash: string | null } | undefined;
      if (!user?.password_hash || !(await compare(parsed.data.password, user.password_hash))) return null;
      return { id: user.id, name: user.name, email: user.email };
    },
  }),
];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(Google({
    clientId: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
    authorization: { params: { scope: "openid email profile https://www.googleapis.com/auth/gmail.send", access_type: "offline", prompt: "consent" } },
  }) as never);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || (process.env.NODE_ENV === "development" ? "thehotspot-local-development-secret" : undefined),
  providers,
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user.email) return true;
      const sql = getSql();
      const [saved] = await sql`INSERT INTO users (name, email, google_id, google_access_token, google_refresh_token, google_token_expires_at) VALUES (${user.name ?? "User"}, ${user.email}, ${account.providerAccountId}, ${account.access_token ?? null}, ${account.refresh_token ?? null}, ${account.expires_at ? new Date(account.expires_at * 1000) : null}) ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, google_id = EXCLUDED.google_id, google_access_token = EXCLUDED.google_access_token, google_refresh_token = COALESCE(EXCLUDED.google_refresh_token, users.google_refresh_token), google_token_expires_at = EXCLUDED.google_token_expires_at RETURNING id`;
      user.id = String(saved.id);
      return true;
    },
    async jwt({ token, user, account }) {
      if (user?.id) token.userId = user.id;
      if (account?.access_token) token.accessToken = account.access_token;
      if (account?.refresh_token) token.refreshToken = account.refresh_token;
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId ?? token.sub ?? "";
      session.accessToken = token.accessToken;
      return session;
    },
  },
});
