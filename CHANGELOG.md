# Changelog

All notable changes to thehotspot are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [2.0.0] — 2026-05-19

### Changed

- **Landing page complete visual overhaul** — dark AI-template aesthetic replaced with a premium editorial light theme (Stripe × Linear × Notion × Superhuman)
- `src/styles/theme.css` rewritten from scratch: new CSS custom property system (`--bg`, `--teal`, `--text`, `--font-sans`, `--font-display`, `--radius`), zero `--th-` prefix
- Fonts upgraded: Plus Jakarta Sans (display) + Inter (body); DM Sans retained for authenticated app
- `index.html`: new title, meta description, OG/Twitter card tags

### Added

- `src/components/AnnouncementBar.jsx` — dismissable beta announcement strip
- `src/components/Navbar.jsx` — sticky white 64px nav, scroll shadow, mobile hamburger drawer
- `src/components/Hero.jsx` — 60/40 asymmetric split, dot-grid background, browser mockup
- `src/components/LogoMarquee.jsx` — infinite CSS marquee, pauses on hover, `prefers-reduced-motion` safe
- `src/components/Features.jsx` — bento grid (CSS Grid varied spans), IntersectionObserver reveal
- `src/components/HowItWorks.jsx` — horizontal scroll-snap, 3 steps, large teal outline numbers
- `src/components/Stats.jsx` — dark strip, rAF-based animated counters
- `src/components/Testimonial.jsx` — single pull quote, no stars, teal-tint background
- `src/components/Pricing.jsx` — 3-tier cards, inline SVG checkmarks, popular card teal border
- `src/components/FAQ.jsx` — accordion with Set-based open state, max-height CSS transition
- `src/components/CTA.jsx` — white background, centered headline
- `src/components/Footer.jsx` — dark background, 2fr/1fr/1fr/1fr column grid, inline SVG social icons
- `src/pages/Home.jsx` — assembles all 12 landing page components

### Removed

- All inline landing page JSX and inline `<style>` tag from `LoginPage` in `src/App.jsx` — extracted to components
- Old dark landing page CSS variables (`--th-*` prefix) from `theme.css`

### Internal

- `src/App.jsx` `LoginPage` return now renders `<Home onSignIn=... onGetStarted=... />` — auth modal flow unchanged

---

## [1.x] — prior

See git log for earlier history.
