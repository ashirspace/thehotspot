# AGENTS.md

This file provides guidance to Codex when working in this repository.

## Commands

```bash
npm run dev              # Start Next.js dev server at http://localhost:5173
npm run build            # Generate Prisma client and build production app
npm run lint             # Run ESLint
npm run preview          # Start production server at http://localhost:5173
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Create/apply local migrations
npm run prisma:deploy    # Apply migrations in deployed environments
npm run prisma:studio    # Inspect data locally
```

## Architecture

This is a Next.js App Router application for **thehotspot**, a LinkedIn DM outreach management platform.

The current production surface is a responsive dashboard under `src/app` and `src/components/dashboard`. The older Vite source still exists in `src/*.jsx` and related folders, but Next is configured with `pageExtensions: ["ts", "tsx"]` so only the new TypeScript App Router files participate in the app build.

## Required Stack

- Frontend: Next.js, React, TypeScript
- Styling: Tailwind CSS only
- UI: shadcn-style local primitives in `src/components/ui`
- Backend: Next.js Route Handlers in `src/app/api`
- Database: Neon PostgreSQL
- ORM: Prisma
- Auth: NextAuth with LinkedIn OAuth
- Email: Resend
- Jobs/cache: Upstash Redis
- AI: Codex/OpenAI Responses API adapter
- Deployment: Vercel
- Infrastructure: Cloudflare

## Key Files

- `src/app/page.tsx` - server-side auth gate. Shows LinkedIn connection screen until a session exists.
- `src/components/dashboard/dashboard-shell.tsx` - main responsive product UI.
- `src/app/api/*/route.ts` - API routes for analytics, campaigns, messages, import, generation, email, auth, and jobs.
- `src/lib/auth.ts` - NextAuth configuration and LinkedIn provider.
- `src/lib/prisma.ts` - lazy Prisma client using Neon driver adapter.
- `src/lib/codex.ts` - Codex/OpenAI DM generation adapter with local fallback.
- `src/lib/redis.ts` - Upstash queue helper.
- `src/lib/resend.ts` - lazy Resend client.
- `src/lib/cloudflare.ts` - Cloudflare cache purge helper.
- `prisma/schema.prisma` - NextAuth and outreach data model.

## Auth Flow

Initial page load checks `getServerSession(getAuthOptions())`.

- No session: render the LinkedIn OAuth connection screen.
- Session exists: render the dashboard.
- NextAuth stores sessions and OAuth accounts in Neon through Prisma.

Required auth environment variables:

```bash
NEXTAUTH_URL=
NEXTAUTH_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
```

## Product Workflow

1. Import people or companies with CSV/Excel.
2. Configure campaign targeting by person, company, role, profession, or category.
3. Add campaign context, reference links, and base DM content.
4. Generate drafts with Codex.
5. Edit each DM in the approval panel.
6. Move messages between Drafts, Approved, Sent, and Skipped.
7. Track activity, opens, replies, and engagement in analytics.

## Styling Rules

- Use Tailwind CSS utility classes only for new UI.
- Prefer the local shadcn-style components in `src/components/ui`.
- Keep the palette professional and minimal: slate surfaces, restrained LinkedIn blue, green success, orange skipped states.
- Maintain responsive behavior for mobile, tablet, and desktop.
- On mobile, navigation should collapse behind the menu button and dense tables should become stacked rows.
- Do not introduce external CSS frameworks.

## Database Notes

Prisma 7 uses the Neon driver adapter in `src/lib/prisma.ts`. Keep service clients lazy so `next build` does not initialize missing runtime services too early.

After schema changes:

```bash
npm run prisma:generate
npm run prisma:migrate
```

For production:

```bash
npm run prisma:deploy
```
