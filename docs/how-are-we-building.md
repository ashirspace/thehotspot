# How Are We Building It

## Tech Stack

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Build tool | Vite |
| Routing | React Router 7 |
| Styling | Inline JS objects (dashboard) + Tailwind CSS 4 (agents) |
| Icons | Inline SVG `I` object (dashboard) / lucide-react (agents) |
| Charts | Recharts |
| HTTP | Axios |

### Backend (Serverless)
| Layer | Technology |
|-------|-----------|
| Runtime | Vercel Serverless Functions (Node.js) |
| Database | Neon (PostgreSQL serverless) |
| AI — Chat & Agents | Anthropic Claude (claude-sonnet) |
| AI — Email Generation | OpenAI GPT-4o-mini |
| Lead Discovery | External leads API via `/api/find-leads` |
| Email | Gmail API (OAuth 2.0) |
| Auth DB | Airtable (legacy) + PostgreSQL (primary) |
| Scheduled jobs | Vercel Cron (daily at 9 AM UTC) |

## Architecture Decisions

**No CSS frameworks in the dashboard** — All styles are plain JS objects in the `S` object inside `App.jsx`. This keeps the main component self-contained and avoids stylesheet conflicts.

**Tailwind is scoped to agents only** — `corePlugins: { preflight: false }` prevents CSS reset from touching the dashboard's inline styles.

**All AI calls go through Vercel proxy endpoints** — Direct browser-to-Anthropic/OpenAI calls are blocked by CORS. Every agent routes through `/api/chat` (Claude) or `/api/generate` (OpenAI).

**12 serverless function limit (Vercel Hobby)** — No new API files can be added. All new agent features must route through the 11 existing functions.

**Static HTML agent previews** — `/public/agents/*.html` are standalone pages that load immediately without React hydration. They serve as fast-loading entry points before the React app kicks in.

## Folder Structure

```
outreach-dashboard/
├── src/
│   ├── App.jsx                  # Main dashboard (monolithic, ~4800 lines)
│   ├── main.jsx                 # BrowserRouter + route config
│   ├── agents/
│   │   ├── AgentsLayout.jsx     # Sidebar + Outlet
│   │   ├── pages/               # 12 agent components
│   │   ├── components/          # AgentCard, AgentInput, AgentOutput, AgentStatus
│   │   ├── hooks/useAgent.js    # Shared async state (loading, result, error)
│   │   └── utils/
│   │       ├── anthropicClient.js  # POST /api/chat wrapper
│   │       └── apolloClient.js     # POST /api/find-leads wrapper
├── api/
│   ├── chat.js                  # Claude with tool use
│   ├── generate.js              # OpenAI email/angle generation
│   ├── db.js                    # Contacts, users, campaigns CRUD
│   ├── auth.js                  # Login, signup, Google OAuth
│   ├── campaigns.js             # Campaign management
│   ├── find-leads.js            # Lead discovery
│   ├── check-replies.js         # Gmail reply polling
│   ├── schedule-campaign.js     # Scheduled sends
│   ├── track.js                 # Open/click tracking pixel
│   ├── sequences/create.js      # Multi-step sequences
│   └── crons/daily.js           # Daily background job
├── public/
│   ├── agents/                  # Static HTML previews for all 12 agents
│   └── meet-the-team.html       # Agent showcase page
└── docs/                        # You are here
```

## Data Flow

```
User → React UI
         │
         ├─ /api/chat       → Claude (tool use) → Gmail / DB actions
         ├─ /api/generate   → OpenAI → email draft
         ├─ /api/db         → Neon PostgreSQL → contacts / campaigns
         ├─ /api/find-leads → lead search API → company list
         └─ /api/auth       → Airtable + PostgreSQL → session
```

## Deployment

- **Platform:** Vercel (auto-deploy on push to `main`)
- **Domain:** thehotspot.in
- **SPA routing:** Vercel rewrites all non-API paths to `index.html`
- **Cron:** `/api/crons/daily` fires daily at 9:00 AM UTC
- **Build command:** `npm run build` (Vite)
- **Function count:** 11 / 12 max (Vercel Hobby limit)
