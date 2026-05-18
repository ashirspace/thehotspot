# What Are We Building

## The Product
**thehotspot** is a B2B outreach automation platform built for sales teams and founders. It combines a real-time campaign dashboard with 12 specialized AI agents — each designed to handle one specific part of the outreach workflow better and faster than any manual process.

## Who It's For
Sales professionals, growth marketers, and founders who run cold email outreach campaigns and need to automate research, writing, and follow-up at scale.

## Core Value Proposition
One platform to find leads, write emails, run campaigns, and detect replies — powered by AI at every step.

## The Three Surfaces

### Home (`/`)
A platform overview page showing the 5 core components of the outreach system. Each component is displayed as a pillar card with a feature list and status per item (Live, Soon, or Agent-powered):

| Pillar | What it covers |
|--------|---------------|
| Lead Input | CSV upload, Apollo CRM, HubSpot (soon), manual entry |
| AI Engine | GPT-4o-mini, prompt templates, personalization variables, email sequences |
| Outreach Channels | Gmail (live), LinkedIn / WhatsApp / SMS (roadmap) |
| Sequence / Campaign Manager | Multi-step follow-ups, stop on reply, scheduling |
| Reply Detection & Inbox | Gmail polling, webhook detection (soon), reply classification |

### Dashboard (`/dashboard` via sidebar)
A real-time control center for the full outreach lifecycle:
- Stat cards: contacts, emails sent, success rate, campaign count
- Three tool groups: Outreach, Contacts & Data, Analytics — each linking to the relevant inner page
- AI agents grid: all 12 agents in a compact 4-column layout
- Recent campaigns: last 3 campaign runs with status and delivery stats

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
- Platform is live at [thehotspot.in](https://www.thehotspot.in)
- All 12 agent pages are live at `/agents/*` (React routes) and `/public/agents/*.html` (static previews)
- Authentication is active (email/password + Google OAuth)
- Gmail integration is live for sending and reply detection
- LinkedIn, WhatsApp, and SMS channels are on the roadmap
