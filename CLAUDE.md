# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (http://localhost:5173)
npm run build     # Production build
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

## Architecture

This is a single-page React 19 + Vite app called **thehotspot** — an outreach dashboard. Almost all application code lives in one file: `src/App.jsx`.

### Key External Integrations

- **Airtable** — used as the user database (login, signup, contact storage). Credentials come from env vars: `VITE_AIRTABLE_API_KEY`, `VITE_AIRTABLE_BASE_ID`, `VITE_AIRTABLE_TABLE_NAME` (defaults to `"Users"`).
- **Google OAuth / Gmail API** — Google Sign-In and Gmail read/send scopes. Client ID is hardcoded in `App.jsx` at the top (`GMAIL_CLIENT_ID`). On login, fetches real Google Contacts count and sent email count via Gmail API.
- **n8n** — webhook URL (`N8N_WEBHOOK_URL`) for workflow automation (send emails, pause/resume). Currently a placeholder string.

### Code Organization in App.jsx

- **CONFIG block** — Airtable and Gmail constants at top of file
- **`I` object** — all icons as inline SVG React components (no icon library)
- **`S` object** — all shared styles as plain JS objects (no CSS modules or Tailwind)
- **`CAT` object** — category color themes for Network, CPS, CPL, CPA, Mobile
- **`LoginPage`** — handles password login, signup, and Google OAuth flow
- **`getSmartResponse()`** — keyword-based chatbot logic (no LLM API needed)
- **`StatCard`, `Badge`** — reusable UI components
- **Main `App` component** — dashboard layout with sidebar nav, stats, contacts table, and chat panel

### Auth Flow

Users are stored in Airtable. Session is persisted in `localStorage` under the key `"thehotspot_user"`. Google login fetches real contacts/sent counts from Google APIs and saves the access token to the user object.

### Styling Convention

All styles are inline JS objects. Color palette is dark (`#09090d` background, `#111116` cards, `#10b981` green accent, `#0ea5e9` blue accent). Do not introduce external CSS frameworks.
