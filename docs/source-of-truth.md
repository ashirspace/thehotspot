# Source of Truth

## Routing

### React Router routes (main.jsx)
| Path | Component | Notes |
|------|-----------|-------|
| `/` | `App.jsx` | Full dashboard app |
| `/agents` | Redirects to `/agents/lead-finder` | |
| `/agents/:agentId` | `AgentsLayout` + agent page | 12 agents |
| `/agents/*.html` | Static HTML previews | In `/public/agents/` |
| `/meet-the-team.html` | Static HTML | Agent showcase |

### Internal page state (App.jsx)
App.jsx manages a `page` state string for in-app navigation. React Router is only used for `/agents/*`.

| `page` value | View |
|---|---|
| `null` | Home — 5-pillar platform overview |
| `"dashboard"` | Dashboard — stat cards, tool groups, agents grid |
| `"contacts"` | Contacts table |
| `"emailSender"` | Email campaign sender |
| `"emailTemplates"` | Template picker + single email generator |
| `"campaignStatus"` | Campaign status tracker |
| `"emailsSent"` | Sent email history |
| `"successRate"` | Success rate analytics |
| `"totalContacts"` | Full contacts overview |
| `"categories"` | Category breakdown |
| `"settings"` / `"profile"` | Account settings + profile |

## The 12 Agent IDs

```
lead-finder
lead-scoring
landing-page-analyzer
email-sequence-builder
ab-email-tester
reply-detector
blog-generator
competitor-analyzer
backlink-outreach
campaign-dashboard
crm-lite
csv-import-export
```

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/chat` | POST | Claude with tool use (used by AI agents) |
| `/api/generate` | POST | OpenAI email/angle generation |
| `/api/db` | GET/POST | Contacts, users, campaigns CRUD |
| `/api/auth` | POST | Login, signup, Google OAuth |
| `/api/campaigns` | GET/POST | Campaign management |
| `/api/find-leads` | POST | Lead discovery |
| `/api/check-replies` | POST | Gmail reply check |
| `/api/schedule-campaign` | POST | Schedule future sends |
| `/api/track` | GET | Email open/click pixel |
| `/api/sequences/create` | POST | Create email sequence |
| `/api/crons/daily` | GET | Vercel cron trigger |

**Note:** 11 / 12 serverless functions used. No new API files can be added on the current Vercel Hobby plan.

## Database Schema (Neon PostgreSQL)

| Table | Key Columns |
|-------|------------|
| `users` | id, email, password_hash, username, gmail_token, refresh_token |
| `contacts` | id, user_id, name, email, company, category, country, status |
| `campaigns` | id, user_id, name, status, sent_count, open_count, click_count |
| `campaign_emails` | id, campaign_id, contact_id, subject, body, sent_at |
| `scheduled_campaigns` | id, campaign_id, scheduled_for, status |
| `email_events` | id, email_id, event_type (open/click), occurred_at |
| `sequences` | id, user_id, contact_id, steps (JSON), current_step, status |

## Environment Variables

| Variable | Used by | Purpose |
|----------|---------|---------|
| `ANTHROPIC_API_KEY` | `/api/chat` | Claude API (agents) |
| `OPENAI_API_KEY` | `/api/generate` | Email generation |
| `DATABASE_URL` | `/api/db`, `/api/_db.js` | Neon PostgreSQL |
| `VITE_AIRTABLE_API_KEY` | `App.jsx` | Legacy user DB |
| `VITE_AIRTABLE_BASE_ID` | `App.jsx` | Legacy user DB |
| `VITE_AIRTABLE_TABLE_NAME` | `App.jsx` | Defaults to `"Users"` |
| `GMAIL_CLIENT_ID` | `App.jsx` | Google OAuth (hardcoded) |

## Style Rules

- **No emojis** anywhere — use lucide-react in JSX, inline SVG in HTML, plain text in strings
- **Dashboard/home styles:** inline JS objects only (no `S` object — styles are written inline per component)
- **Agent styles:** Tailwind CSS with preflight disabled
- **Icons:** `react-icons/lu` (lucide-react) throughout the dashboard; inline SVG in static HTML files
- **SVG format (HTML files):** `width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"`
- **Color palette:** `#09090d` bg · `#0d0d12` header · `#111116` cards · `#10b981` green · `#0ea5e9` blue · `#f59e0b` amber · `#ec4899` pink · `#8b5cf6` purple · `#f97316` orange · `#6366f1` indigo · `#14b8a6` teal · `#64748b` slate
- **Footer copyright:** `© 2026 thehotspot`

## Sidebar Nav Items

```
Home        → page = null        (platform overview)
Dashboard   → page = "dashboard" (stat cards + tools)
Contacts    → page = "contacts"
Campaigns   → page = "campaignStatus"
Templates   → page = "emailTemplates"
AI Agents   → /agents (external link)
Settings    → page = "settings"
```

Active state: `background: #ffffff0c`, `borderLeft: 2px solid #10b981`, icon color `#10b981`.
