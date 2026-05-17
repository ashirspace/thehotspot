# thehotspot

B2B outreach automation platform — find leads, write emails, run campaigns, and analyze results, powered by AI at every step.

**Production:** [thehotspot.in](https://www.thehotspot.in)

---

## What It Is

thehotspot has two surfaces:

- **Dashboard (`/`)** — contacts, campaigns, stats, and an AI chat assistant (Claude) that can send emails, find leads, and pause campaigns
- **AI Agents (`/agents/*`)** — 12 specialized agents, each with one job (lead finder, email writer, reply detector, competitor analyzer, etc.)

See [`docs/what-are-we-building.md`](docs/what-are-we-building.md) for the full product overview.

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + Vite |
| Routing | React Router 7 |
| Styling | Inline JS objects (dashboard) / Tailwind CSS 4 (agents) |
| Icons | Inline SVG (dashboard) / lucide-react (agents) |
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
| `ANTHROPIC_API_KEY` | Claude API (chat + agents) |
| `OPENAI_API_KEY` | Email/angle generation |
| `DATABASE_URL` | Neon PostgreSQL |
| `VITE_AIRTABLE_API_KEY` | Legacy user auth |
| `VITE_AIRTABLE_BASE_ID` | Legacy user auth |
| `VITE_AIRTABLE_TABLE_NAME` | Defaults to `"Users"` |

---

## Docs

| File | Contents |
|------|----------|
| [`docs/what-are-we-building.md`](docs/what-are-we-building.md) | Product overview, agents, current state |
| [`docs/how-are-we-building.md`](docs/how-are-we-building.md) | Tech stack, architecture decisions, data flow |
| [`docs/source-of-truth.md`](docs/source-of-truth.md) | Routing, API endpoints, DB schema, env vars, style rules |
| [`docs/context.md`](docs/context.md) | Why it exists, decisions made, what's next |

---

## Deployment

Auto-deploys to Vercel on push to `main`. Serverless function limit: 11 / 12 (Vercel Hobby).
