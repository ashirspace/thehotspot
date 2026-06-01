# thehotspot

LinkedIn DM outreach management for approval-first outbound teams.

[Live](https://thehotspot.in) · [Report Bug](https://github.com/ashirspace/thehotspot/issues) · [Request Feature](https://github.com/ashirspace/thehotspot/issues)

## What It Does

thehotspot helps teams import LinkedIn prospects, configure targeting, generate personalized DM drafts with Codex, review and edit every message, and track outreach performance from one dashboard.

The product is built around a strict approval workflow: generated DMs stay in Drafts until a user edits and approves them. Messages can then move through Approved, Sent, and Skipped states while analytics track opens, responses, and engagement trends.

## Tech Stack

| Layer | Choice |
| --- | --- |
| Frontend | Next.js App Router, React 19, TypeScript |
| Styling | Tailwind CSS 4, hand-coded utility classes |
| UI primitives | shadcn-style local components |
| API | Next.js Route Handlers |
| Database | Neon PostgreSQL |
| ORM | Prisma |
| Authentication | NextAuth with LinkedIn OAuth |
| AI | Codex/OpenAI Responses API adapter |
| Email | Resend |
| Jobs/cache | Upstash Redis |
| Deployment | Vercel |
| Infrastructure | Cloudflare |

## Run Locally

```bash
npm install
cp .env.example .env.local
npm run prisma:generate
npm run dev
```

The dev server runs at http://localhost:5173.

Useful commands:

```bash
npm run dev              # Start Next.js dev server on port 5173
npm run build            # Generate Prisma client and build for production
npm run preview          # Start production server on port 5173
npm run lint             # Run ESLint
npm run prisma:migrate   # Create/apply local Prisma migration
npm run prisma:deploy    # Apply migrations in production
npm run prisma:studio    # Open Prisma Studio
```

## Required Environment

Use `.env.local` for local secrets and Vercel environment variables for deployed environments.

```bash
DATABASE_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
OPENAI_API_KEY=
CLOUDFLARE_ZONE_ID=
CLOUDFLARE_API_TOKEN=
```

## Product Areas

- LinkedIn OAuth gate on first load
- Responsive dashboard for desktop, tablet, and mobile
- Analytics timeline with Past Hour, Past Day, and Past Week filters
- DM management tabs: Drafts, Approved, Sent, Skipped
- Message search, sorting, editing, approval, skipping, and status movement
- Campaign setup with campaign context, targeting fields, and live recipient count
- Bulk CSV/Excel import with validation and recipient mapping
- Codex-powered DM generation stored with campaign context
- Resend route for transactional email
- Upstash-backed job queue and Vercel cron processor

## Folder Structure

```text
outreach-dashboard/
├── src/
│   ├── app/
│   │   ├── page.tsx                         # LinkedIn gate and dashboard entry
│   │   ├── layout.tsx                       # Root app shell
│   │   ├── globals.css                      # Tailwind v4 globals
│   │   └── api/                             # Next.js API routes
│   ├── components/
│   │   ├── dashboard/                       # Product dashboard UI
│   │   └── ui/                              # shadcn-style local primitives
│   ├── lib/                                 # Auth, Prisma, Redis, Resend, Codex helpers
│   └── types/                               # NextAuth type augmentation
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── docs/
├── components.json
├── next.config.ts
├── postcss.config.mjs
├── prisma.config.ts
└── tsconfig.json
```

## Deployment

Vercel builds with:

```bash
npm run build
```

Before first production deploy, set all required environment variables and apply the database schema:

```bash
npm run prisma:deploy
```

`vercel.json` schedules `/api/jobs/process` every 10 minutes for queued campaign work.

## Brand

- Product name: thehotspot
- Tone: professional, direct, approval-first
- Palette: slate neutrals with restrained LinkedIn blue, green, and orange states
- UI direction: minimal SaaS dashboard, compact spacing, small radii, no template-like decoration
