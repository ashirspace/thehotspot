# Changelog

All notable changes to thehotspot are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [2.0.0] — Light Theme Redesign — 2026-05-19

### Changed

- Complete landing page UI overhaul: dark AI-template aesthetic replaced
  with a premium editorial light theme (Stripe × Linear × Notion ×
  Superhuman)
- `src/styles/theme.css` rewritten from scratch — new CSS custom property
  system (`--bg`, `--teal`, `--text`, `--font-display`, `--radius`)
- New bento grid feature section replacing the 3-column layout
- New typography system: Plus Jakarta Sans (display) + Inter (body)
- Refreshed color palette centered on teal `#0d9488`
- Asymmetric 60/40 hero layout with a product dashboard mockup
- Editorial-style single pull-quote testimonial

### Added

- Announcement bar with beta callout
- Horizontal-scroll logo marquee
- Animated stat counters (rAF, IntersectionObserver)
- FAQ accordion section
- Mobile drawer navigation
- Dot grid hero background

### Removed

- Dark theme variants and `--th-*` CSS variables
- Emoji icons in feature cards
- Generic 3-column testimonial cards
- Soft pill buttons

### Performance

- No animation libraries — all motion is CSS / rAF only
- `prefers-reduced-motion` disables marquee and scroll reveals
- Lazy-loaded images, explicit dimensions to avoid layout shift

---

## [1.x] — prior

See git log for earlier history.
