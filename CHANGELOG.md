# Changelog

All notable changes to thehotspot are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [3.0.0] - LinkedIn DM Outreach Platform - 2026-06-01

### Added

- Next.js App Router application with strict TypeScript.
- LinkedIn OAuth entry screen using NextAuth.
- Prisma schema for users, accounts, sessions, recipients, campaigns, campaign context, direct messages, activity events, and import batches.
- Initial Prisma migration for Neon PostgreSQL.
- Responsive dashboard for analytics, DM management, campaign setup, bulk import, and approval editing.
- DM management tabs for Drafts, Approved, Sent, and Skipped.
- Search, sorting, editing, approval, skipping, and status movement for DMs.
- Campaign setup form with audience type, targeting fields, campaign context, reference link, and live recipient count.
- CSV and Excel import route with validation and recipient creation.
- Codex/OpenAI DM generation adapter with a fallback message generator when no API key is configured.
- Resend email route.
- Upstash Redis job queue helper and Vercel cron route for background processing.
- Cloudflare cache purge helper.
- Local shadcn-style UI primitives for buttons, cards, badges, inputs, and textareas.
- `.env.example` documenting required runtime configuration.

### Changed

- Build system moved from Vite to Next.js on port `5173`.
- Styling for active product UI moved to Tailwind CSS utility classes.
- ESLint configuration moved to `eslint.config.mjs` with Next.js rules.
- Vercel routing config now uses native Next.js routing and a cron for `/api/jobs/process`.
- Next build is constrained to TypeScript routes via `pageExtensions`.

### Security

- Replaced the vulnerable `xlsx` package with `read-excel-file` for Excel imports.
- Kept secrets out of tracked environment files; `.env.local` remains ignored.

---

## [2.0.0] - Light Theme Redesign - 2026-05-19

### Changed

- Complete landing page UI overhaul from a dark AI-template aesthetic to a premium editorial light theme.
- `src/styles/theme.css` rewritten with a new CSS custom property system.
- New bento grid feature section replacing the 3-column layout.
- New typography system: Plus Jakarta Sans for display and Inter for body.
- Refreshed color palette centered on teal.
- Asymmetric hero layout with a product dashboard mockup.
- Editorial-style single pull-quote testimonial.

### Added

- Announcement bar with beta callout.
- Horizontal-scroll logo marquee.
- Animated stat counters.
- FAQ accordion section.
- Mobile drawer navigation.
- Dot grid hero background.

### Removed

- Dark theme variants and old `--th-*` CSS variables.
- Emoji icons in feature cards.
- Generic 3-column testimonial cards.
- Soft pill buttons.

### Performance

- Motion implemented without animation libraries.
- `prefers-reduced-motion` disables marquee and scroll reveals.
- Lazy-loaded images and explicit dimensions to avoid layout shift.

---

## [1.x] - Prior

See git log for earlier history.
