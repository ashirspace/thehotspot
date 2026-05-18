# Context

## Why This Exists

thehotspot was built to solve a real problem: running B2B cold email outreach manually is slow, inconsistent, and doesn't scale. Most tools either do the CRM part or the AI writing part — none combine lead discovery, email generation, campaign management, and reply handling in one place.

The platform was built by Ashir Ayaan as an integrated outreach system for agencies and sales teams that need volume and quality at the same time.

## What's Done

- Full authentication system (email/password + Google OAuth)
- Contact management with categories, search, and bulk actions
- Campaign creation, scheduling, and send tracking
- Email open/click tracking via pixel
- OpenAI-powered email and angle generation
- Gmail integration for sending and reply polling
- 12 AI agent pages — all live and functional
- Static HTML preview pages for all 12 agents (with splash loading screen)
- Agent showcase page at `/meet-the-team.html`
- Vercel deployment with daily cron job
- Platform overview homepage with 5 pillars (Lead Input, AI Engine, Outreach Channels, Sequence Manager, Reply Detection)
- Modern SaaS UI redesign: dark dense layout, redesigned header and sidebar
- Dashboard page with stat cards, tool groups, AI agents grid, and recent campaigns

## Key Decisions Made

**React Router instead of separate pages** — Agents are React routes under `/agents/:agentId` rather than separate HTML builds, enabling shared state and a consistent sidebar layout.

**Vercel Hobby plan constraint** — Capped at 12 serverless functions. Currently at 11. All future features must reuse existing endpoints.

**Airtable as legacy user DB** — Early user auth was Airtable-based. The system is partially migrated to PostgreSQL (Neon) but Airtable is still read in `App.jsx` for some auth flows.

**App.jsx as a monolith** — The dashboard is intentionally kept in one file. Splitting it into smaller components is a future refactor, not a current priority.

**No new env vars needed for agents** — All agents reuse `ANTHROPIC_API_KEY`, `DATABASE_URL`, and `OPENAI_API_KEY` already set in Vercel.

**Chatbot removed** — The Claude-powered chat assistant was removed to simplify the UI and reduce scope. The email campaign runner (`runEmailCampaign`) still works internally; scheduled campaigns now surface via toast notifications instead of chat messages. Navigation is now fully sidebar-driven.

**Home vs Dashboard split** — The default route (`/`) now shows a platform overview (what the product does and what's live vs. coming soon). The operational dashboard (stat cards, tools, campaigns) is accessible from the sidebar as "Dashboard". This makes the product immediately legible to new users.

## What's Pending / Next

- Complete migration from Airtable to PostgreSQL for user auth
- LinkedIn outreach channel (Phantombuster or official API)
- WhatsApp outreach channel (Twilio)
- SMS outreach channel (Twilio)
- HubSpot CRM integration for lead import
- Webhook-based reply detection (currently polling only)
- Refactor `App.jsx` into smaller components (non-urgent)
- Potentially upgrade Vercel plan if more serverless functions are needed

## Repository

- **GitHub:** github.com/ashirspace/thehotspot
- **Production:** thehotspot.in
- **Branch strategy:** push to `main` → Vercel auto-deploys

## Design Constraints

- No emojis anywhere in the codebase
- No Tailwind in `App.jsx` (only in agents)
- No new API files until the Vercel function count limit is resolved
- All AI calls must go through proxy endpoints (CORS restriction)
- lucide-react (`react-icons/lu`) for all icons in the dashboard
