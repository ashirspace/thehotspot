# thehotspot — Grow Connections Easily

AI-powered cold outreach that gets real replies. Find leads, write personalised emails, run campaigns, and watch replies land in your own Gmail inbox.

**Production:** [thehotspot.in](https://www.thehotspot.in)

---

## What It Is

thehotspot has three surfaces:

- **Landing (`/`)** — editorial-grade public homepage (Inter + Plus Jakarta Sans, light theme, bento feature grid, horizontal how-it-works scroll)
- **Dashboard (post-login)** — real-time control center: stat cards, campaign manager, AI agent grid, and analytics
- **AI Agents (`/agents/*`)** — 12 specialised agents, each with one job

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + Vite |
| Routing | React Router 7 |
| Landing page styles | `src/styles/theme.css` (CSS custom properties) |
| Dashboard styles | Inline JS objects — dark theme |
| Icons | lucide-react (dashboard) · inline SVG (landing page) |
| Charts | Recharts |
| Backend | Vercel Serverless Functions (Node.js) |
| Database | Neon (PostgreSQL serverless) |
| AI | Anthropic Claude + OpenAI GPT-4o-mini |
| Email | Gmail API (OAuth 2.0) |
| Auth DB | Airtable (legacy) + PostgreSQL |

---

## Commands

```bash
npm run dev       # Start dev server → http://localhost:5173
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build locally
```

---

## Landing Page Architecture

The public homepage is built from 12 composable components assembled in `src/pages/Home.jsx`:

```
AnnouncementBar → Navbar → Hero (60/40 split)
→ LogoMarquee → Features (bento grid) → HowItWorks (scroll-snap)
→ Stats (animated counters) → Testimonial → Pricing
→ FAQ (accordion) → CTA → Footer
```

All landing page styles live in `src/styles/theme.css`. CSS custom properties:

```css
--bg: #ffffff         /* page background */
--teal: #0d9488       /* brand accent */
--text: #0f172a       /* body text */
--font-sans: 'Inter'
--font-display: 'Plus Jakarta Sans'
--radius: 6px         /* sharp, not bubbly */
```

The authenticated app and admin panel use inline dark styles — completely independent of `theme.css`.

---

## The 12 AI Agents

| Agent | Route |
|-------|-------|
| Lead Finder | `/agents/lead-finder` |
| Lead Scoring | `/agents/lead-scoring` |
| Landing Page Analyzer | `/agents/landing-page-analyzer` |
| Email Sequence Builder | `/agents/email-sequence-builder` |
| A/B Email Tester | `/agents/ab-email-tester` |
| Reply Detector | `/agents/reply-detector` |
| Blog Generator | `/agents/blog-generator` |
| Competitor Analyzer | `/agents/competitor-analyzer` |
| Backlink Outreach | `/agents/backlink-outreach` |
| Campaign Dashboard | `/agents/campaign-dashboard` |
| CRM Lite | `/agents/crm-lite` |
| CSV Import/Export | `/agents/csv-import-export` |

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Claude API (agents) |
| `OPENAI_API_KEY` | Email/angle generation |
| `DATABASE_URL` | Neon PostgreSQL |
| `VITE_AIRTABLE_API_KEY` | Legacy user auth |
| `VITE_AIRTABLE_BASE_ID` | Legacy user auth |
| `VITE_AIRTABLE_TABLE_NAME` | Defaults to `"Users"` |

---

## Docs

| File | Contents |
|------|----------|
| [`docs/what-are-we-building.md`](docs/what-are-we-building.md) | Product overview, surfaces, agents, current state |
| [`docs/how-are-we-building.md`](docs/how-are-we-building.md) | Tech stack, architecture decisions, data flow |
| [`docs/source-of-truth.md`](docs/source-of-truth.md) | Routing, API endpoints, DB schema, env vars, style rules |
| [`docs/context.md`](docs/context.md) | Why it exists, decisions made, what's next |

---

## Deployment

Auto-deploys to Vercel on push to `main`. Serverless function limit: 11 / 12 (Vercel Hobby).
