# Context

## Why This Exists

thehotspot was built to solve a real problem: running B2B cold email outreach manually is slow, inconsistent, and doesn't scale. Most tools either do the CRM part or the AI writing part — none combine lead discovery, email generation, campaign management, and reply handling in one place.

The platform was built by Ashir Ayaan as an integrated outreach system for agencies and sales teams that need volume and quality at the same time.

## What's Done

- Full authentication system (email/password + Google OAuth)
- Contact management with categories, search, and bulk actions
- Campaign creation, scheduling, and send tracking
- Email open/click tracking via pixel
- Claude-powered chat assistant with tool use (can send emails, find leads, pause campaigns)
- OpenAI-powered email and angle generation
- 12 AI agent pages — all live and functional
- Static HTML preview pages for all 12 agents (with splash loading screen)
- Agent showcase page at `/meet-the-team.html`
- Vercel deployment with daily cron job

## Key Decisions Made

**React Router instead of separate pages** — Agents are React routes under `/agents/:agentId` rather than separate HTML builds, enabling shared state and a consistent sidebar layout.

**Vercel Hobby plan constraint** — Capped at 12 serverless functions. Currently at 11. All future agent features must reuse existing endpoints.

**Airtable as legacy user DB** — Early user auth was Airtable-based. The system is partially migrated to PostgreSQL (Neon) but Airtable is still read in `App.jsx` for some auth flows.

**App.jsx as a monolith** — The dashboard is intentionally kept in one file (~4800 lines). Splitting it into smaller components is a future refactor, not a current priority.

**No new env vars needed for agents** — All agents reuse `ANTHROPIC_API_KEY`, `DATABASE_URL`, and `OPENAI_API_KEY` already set in Vercel.

## What's Pending / Next

- Complete migration from Airtable to PostgreSQL for user auth
- Refactor `App.jsx` into smaller components (non-urgent)
- Add more Claude tool use actions for the chat assistant
- Potentially upgrade Vercel plan if more serverless functions are needed
- Build out the email sequences feature end-to-end (currently partially implemented)

## Repository

- **GitHub:** github.com/ashirspace/thehotspot
- **Production:** thehotspot.in
- **Branch strategy:** push to `main` → Vercel auto-deploys

## Design Constraints

- No emojis anywhere in the codebase
- No Tailwind in `App.jsx` (only in agents)
- No new API files until the Vercel function count limit is resolved
- All AI calls must go through proxy endpoints (CORS restriction)
