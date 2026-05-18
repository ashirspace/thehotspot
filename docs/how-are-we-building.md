# How Are We Building It

## Tech Stack

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Build tool | Vite |
| Routing | React Router 7 |
| Styling | Inline JS objects (dashboard + home) / Tailwind CSS 4 (agents) |
| Icons | lucide-react (`react-icons/lu`) throughout |
| Charts | Recharts |
| HTTP | Axios |

### Backend (Serverless)
| Layer | Technology |
|-------|-----------|
| Runtime | Vercel Serverless Functions (Node.js) |
| Database | Neon (PostgreSQL serverless) |
| AI — Agents | Anthropic Claude (claude-sonnet) via `/api/chat` |
| AI — Email Generation | OpenAI GPT-4o-mini via `/api/generate` |
| Lead Discovery | External leads API via `/api/find-leads` |
| Email | Gmail API (OAuth 2.0) |
| Auth DB | Airtable (legacy) + PostgreSQL (primary) |
| Scheduled jobs | Vercel Cron (daily at 9 AM UTC) |

## Architecture Decisions

**No CSS frameworks in the dashboard** — All styles are plain JS objects. This keeps `App.jsx` self-contained and avoids stylesheet conflicts with Tailwind (used in agents).

**Tailwind is scoped to agents only** — `corePlugins: { preflight: false }` prevents the CSS reset from touching dashboard inline styles.

**All AI calls go through Vercel proxy endpoints** — Direct browser-to-Anthropic/OpenAI calls are blocked by CORS. Agents route through `/api/chat` (Claude) or `/api/generate` (OpenAI).

**12 serverless function limit (Vercel Hobby)** — No new API files can be added. Currently at 11 / 12. All new features must reuse existing endpoints.

**Static HTML agent previews** — `/public/agents/*.html` are standalone pages that load immediately without React hydration, serving as fast-loading entry points.

**App.jsx as a monolith** — The dashboard is intentionally kept in one file. Splitting into smaller components is a future refactor, not a current priority.

**Chatbot removed** — The Claude-powered chat assistant was removed in favour of a structured platform overview homepage and direct navigation. All campaign logic (`runEmailCampaign`, scheduling) still works; it no longer outputs to a chat UI.

## Folder Structure

```
outreach-dashboard/
├── src/
│   ├── App.jsx                  # Main app (~3800 lines after chatbot removal)
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
│   ├── chat.js                  # Claude with tool use (used by agents)
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

## Page Routing (within App.jsx)

`App.jsx` manages its own internal `page` state (separate from React Router, which only handles `/agents/*`).

| `page` value | What renders |
|---|---|
| `null` | `HomePage` — 5-pillar platform overview |
| `"dashboard"` | `DashboardPage` — stat cards, tool groups, agents grid |
| `"contacts"` | Contacts table |
| `"emailSender"` | Email campaign sender |
| `"emailTemplates"` | Template picker + single email generator |
| `"campaignStatus"` | Campaign status tracker |
| `"emailsSent"` | Sent email history |
| `"successRate"` | Success rate analytics |
| `"totalContacts"` | Full contacts overview |
| `"categories"` | Category breakdown |
| `"settings"` / `"profile"` | Account settings |

## Sidebar Navigation

7 items in the sidebar:

```
Home        → page = null       (platform overview)
Dashboard   → page = "dashboard" (stat cards + tools)
Contacts    → page = "contacts"
Campaigns   → page = "campaignStatus"
Templates   → page = "emailTemplates"
AI Agents   → window.location = "/agents" (external nav)
Settings    → page = "settings"
```

## Data Flow

```
User → React UI
         │
         ├─ /api/chat       → Claude (tool use) → used by agents
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
