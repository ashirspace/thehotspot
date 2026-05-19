# Contributing to thehotspot

---

## Branch naming

```
feature/<short-slug>      # new functionality
fix/<short-slug>          # bug fix
chore/<short-slug>        # tooling, deps, config
docs/<short-slug>         # documentation only
redesign/<short-slug>     # visual/CSS changes
```

Examples: `feature/csv-bulk-import`, `fix/navbar-scroll-shadow`, `redesign/hero-mobile`

---

## Commit messages — Conventional Commits

```
<type>(<scope>): <short imperative sentence>
```

Types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `perf`

Scope is optional but encouraged: `landing`, `app`, `agents`, `admin`, `theme`, `api`

Good examples:
```
feat(landing): add horizontal scroll-snap to HowItWorks section
fix(app): prevent login modal from rendering behind hero overlay
chore: upgrade Vite to 8.x
```

Keep the subject line under 72 characters. Body is optional — use it when the why isn't obvious from the subject.

---

## Pull request template

When opening a PR, include:

**What changed**
One or two sentences. What does this PR do?

**Why**
Motivation — user story, bug report, performance issue, design spec.

**How to test**
Step-by-step for a reviewer to verify the change works and nothing regressed.

**Screenshots / recordings** (UI changes only)
Before + after, or a short screen recording.

**Checklist**
- [ ] `npm run build` passes with zero errors
- [ ] Tested in Chrome at 1280px, 768px, 375px
- [ ] Authenticated app (post-login) still renders correctly
- [ ] Admin panel at `/admin` unaffected
- [ ] Agents at `/agents/*` unaffected
- [ ] No new console errors or warnings

---

## Style rules

- Landing page: CSS classes in `src/styles/theme.css`, no inline styles
- Dashboard/app: inline JS style objects, no new CSS files
- No Tailwind in the landing page; no CSS custom properties in the authenticated app
- Buttons on the landing page: `border-radius` max 10px (sharp — no pill shapes)
- No emoji icons except 🇮🇳 in the footer
- No gradient glow orbs, no hero blobs, no translucent glass cards

---

## Dev setup

```bash
git clone <repo>
npm install
cp .env.example .env.local   # fill in API keys
npm run dev                  # http://localhost:5173
```
