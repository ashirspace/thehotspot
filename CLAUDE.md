# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

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

This repository now builds as a Next.js App Router application for **thehotspot**, a LinkedIn DM outreach management platform.

Primary application code is TypeScript under:

- `src/app`
- `src/components/dashboard`
- `src/components/ui`
- `src/lib`
- `prisma`

Legacy Vite/React files remain in the repository for historical context, but `next.config.ts` limits route extensions to `ts` and `tsx`, so the active app build ignores old `.jsx` pages.

## Integrations

- **Neon PostgreSQL**: primary data store via `DATABASE_URL`
- **Prisma**: ORM and migrations
- **NextAuth**: session management and LinkedIn OAuth
- **LinkedIn OAuth**: entry point for users
- **Codex/OpenAI**: DM generation in `src/lib/codex.ts`
- **Resend**: email route in `src/app/api/email/send`
- **Upstash Redis**: campaign/job queue helper
- **Vercel Cron**: invokes `/api/jobs/process`
- **Cloudflare**: cache purge helper for deployment infrastructure

## Main Product Features

- LinkedIn OAuth connection screen before dashboard access
- Analytics timeline with Past Hour, Past Day, and Past Week filters
- DM tabs for Drafts, Approved, Sent, and Skipped
- Search, sort, edit, approve, skip, and move message statuses
- Campaign setup with targeting and live recipient count
- Campaign context and reference material storage
- CSV/Excel bulk import with validation
- Approval editor for generated DM copy
- Responsive desktop, tablet, and mobile layouts

## Styling Convention

New UI uses Tailwind CSS utility classes and local shadcn-style primitives only. Do not add CSS modules, styled-components, or another component framework.

Keep the design restrained:

- slate and white surfaces
- LinkedIn blue accents
- compact spacing
- small radius cards and controls
- clear focus, loading, empty, and error states

## Service Client Rule

Database, Redis, Resend, Cloudflare, and model clients must be initialized lazily inside helper functions. Avoid module-scope SDK initialization that can fail during `next build`.
