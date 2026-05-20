# thehotspot.in

> Grow Connections Easily — AI-powered cold outreach automation.

[Live](https://thehotspot.in) · [Report Bug](https://github.com/ashirspace/thehotspot/issues) · [Request Feature](https://github.com/ashirspace/thehotspot/issues)

## What it does

thehotspot is an AI outreach platform that helps marketing teams,
agencies, and founders send cold emails that actually get replies. We
combine AI personalization with battle-tested deliverability
infrastructure so you can scale outreach without spamming inboxes.

## Tech stack

| Layer            | Choice                          |
| ---------------- | ------------------------------- |
| Frontend         | React 19 + Vite                 |
| Styling          | Custom CSS (`src/styles/theme.css`) |
| Hosting          | Vercel (auto-deploy from `main`) |
| Backend automation | n8n                           |
| Email delivery   | Gmail API                       |
| Data             | Airtable + Google Sheets        |

## Run locally

```bash
git clone https://github.com/ashirspace/thehotspot
cd thehotspot
npm install
npm run dev
```

The dev server runs at http://localhost:5173.

```bash
npm run build     # production build
npm run preview   # preview the production build
npm run lint      # run ESLint
```

## Deploy

Push to `main` → Vercel deploys automatically.

## Folder structure

```
thehotspot/
├── index.html                  Google Fonts + meta tags
├── src/
│   ├── main.jsx                router entry
│   ├── App.jsx                 auth + authenticated dashboard
│   ├── styles/
│   │   └── theme.css           single source of truth for landing CSS
│   ├── components/             12 landing page sections
│   │   ├── AnnouncementBar.jsx
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── LogoMarquee.jsx
│   │   ├── Features.jsx
│   │   ├── HowItWorks.jsx
│   │   ├── Stats.jsx
│   │   ├── Testimonial.jsx
│   │   ├── Pricing.jsx
│   │   ├── FAQ.jsx
│   │   ├── CTA.jsx
│   │   └── Footer.jsx
│   └── pages/
│       └── Home.jsx            assembles the landing page
├── README.md
├── CHANGELOG.md
└── CONTRIBUTING.md
```

## Brand

- Primary: `#0d9488` (teal)
- Typography: Plus Jakarta Sans (display) + Inter (body)
- Logo: thehotspot (always lowercase, one word)
- Parent: Ibra Digitals Branding Services LLC

## Links

- Site: https://thehotspot.in
- Repo: https://github.com/ashirspace/thehotspot
