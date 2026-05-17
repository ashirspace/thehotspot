# What Are We Building

## The Product
**thehotspot** is a B2B outreach automation platform built for sales teams and founders. It combines a real-time campaign dashboard with 12 specialized AI agents — each designed to handle one specific part of the outreach workflow better and faster than any manual process.

## Who It's For
Sales professionals, growth marketers, and founders who run cold email outreach campaigns and need to automate research, writing, and follow-up at scale.

## Core Value Proposition
One platform to find leads, write emails, run campaigns, and analyze results — powered by AI at every step.

## The Two Surfaces

### Dashboard (`/`)
A unified control center for the full outreach lifecycle:
- Contacts table with search, filter, and bulk actions
- Campaign management (create, schedule, track)
- Real-time stats: contacts, emails sent, success rate, category breakdown
- AI chat assistant (Claude) that can take actions: send emails, find leads, pause campaigns

### AI Agents (`/agents/*`)
12 autonomous agents, each with one job:

| # | Agent | What it does |
|---|-------|-------------|
| 1 | Lead Finder | Discovers B2B companies by industry, location, and size |
| 2 | Lead Scoring | Scores leads 1–10 on conversion likelihood |
| 3 | Landing Page Analyzer | Audits a URL for copy, UX, and CTA effectiveness |
| 4 | Email Sequence Builder | Writes multi-step cold email sequences |
| 5 | A/B Email Tester | Compares two email variants and picks the winner |
| 6 | Reply Detector | Classifies inbound replies and suggests responses |
| 7 | Blog Generator | Writes full blog posts for content marketing |
| 8 | Competitor Analyzer | SWOT analysis of any competitor |
| 9 | Backlink Outreach | Finds backlink opportunities and writes outreach emails |
| 10 | Campaign Dashboard | Live metrics: sent, opened, clicked |
| 11 | CRM Lite | Lightweight contact management with inline editing |
| 12 | CSV Import/Export | Bulk import contacts and export the full database |

## Current State
- Dashboard is live and fully functional at [thehotspot.in](https://www.thehotspot.in)
- All 12 agent pages are live at `/agents/[agent-id].html` and `/agents/*` (React routes)
- Static HTML preview pages exist for every agent under `/public/agents/`
- Authentication is active (email/password + Google OAuth)
