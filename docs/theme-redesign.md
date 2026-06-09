# thehotspot.in Theme Redesign

## Color Palette

The redesign keeps the original teal identity while adopting a sharper Growleads-inspired editorial layout.

| Token | Hex | Usage |
| --- | --- | --- |
| `--teal-deep` | `#0f766e` | Hover states, section labels, status text |
| `--teal` | `#0d9488` | Primary buttons, logo-adjacent accents, selected borders |
| `--teal-bright` | `#14b8a6` | Logo compatibility, gradients, chart highlights |
| `--teal-pale` | `#ccfbf1` | Soft panels, alert fills, selected row backgrounds |
| `--teal-ink` | `#134e4a` | Deep teal text accents |
| `--surface-base` | `#f7faf9` | Page background |
| `--surface-card` | `#ffffff` | Cards, dashboard panels, form surfaces |
| `--surface-raised` | `#eef7f5` | Section bands and app sidebar surfaces |
| `--dark-base` | `#09090d` | CTA band and dark auth gradients |

Legacy `--orange` variables are intentionally mapped to teal values so existing app screens inherit the new theme without a broad behavioral rewrite.

## Component Library

Navigation:
- Sticky marketing header with compact centered nav links.
- Active/hover treatment uses a thin teal underline.
- `HubLogo` now uses `/brand/thehotspot-logo.png`, the supplied logo asset, across marketing, auth, and app shells.

Buttons:
- Primary: teal filled, white text, 8px radius, subtle teal shadow.
- Secondary: transparent with slate border, teal hover border, pale teal hover fill.
- Text CTA: plain text with inline `ArrowRight` icon.

Cards and panels:
- `precision-card`: white surface, 1px border, 8px radius.
- `growth-panel`: white/teal-tinted panel, 1px border, subtle teal elevation.
- No nested card styling is used for marketing sections; sections use bands, grids, and row-based layouts.

Marketing sections:
- Hero: large italic serif headline, compact CTA group, right-side campaign dashboard panel, grid background, trust strip preview below the fold.
- About: two-column editorial intro with principle rows.
- Product overview: left narrative column, right dashboard-style proof panels.
- Services: numbered Growleads-style rows with teal metric pills.
- Footer CTA: dark dotted navy block with centered bold CTA, teal action button, “Ready to grow connections?” row, link columns, and bottom meta.
- Resources and FAQ: bordered report panel plus simple row links/details.

Forms:
- Inputs and textareas use teal focus borders and teal focus rings.
- Auth screens inherit the same logo and teal focus treatment.

## Integration Notes

- Shared theme tokens live in `src/styles.css`.
- Shared UI primitives live in `src/components/ui.tsx`.
- The marketing shell is `src/shell/marketing-layout.tsx`.
- The redesigned homepage is `src/pages/marketing/landing.tsx`.
- Secondary marketing pages were updated in `src/pages/marketing/about.tsx`, `src/pages/marketing/blog.tsx`, `src/pages/marketing/pricing.tsx`, and `src/pages/marketing/legal.tsx`.
- The logo asset is stored at `public/brand/thehotspot-logo.png`; because it is served from `public`, components reference it as `/brand/thehotspot-logo.png`.
- `index.html` uses the same logo asset for favicon and Apple touch icon.

To extend the theme, prefer the existing tokens and panel classes instead of introducing one-off colors. If an older app component still references `--orange`, keep the alias unless the component needs a semantic rename; visually it already resolves to teal.
