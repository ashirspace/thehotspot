# Contributing to thehotspot

Thanks for helping build thehotspot. This guide keeps the codebase
consistent.

## Branch naming

```
feat/short-description     new feature
fix/short-description      bug fix
chore/short-description    tooling, deps, docs
redesign/short-description landing or UI redesign work
```

## Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(hero): add product mockup to hero section
fix(navbar): correct scroll shadow on Safari
chore(deps): bump vite to 8.0.1
docs(readme): update folder structure
```

Keep the subject under 70 characters. Use the body for the *why*.

## Pull request template

```
## Summary
<1–3 bullet points>

## Test plan
- [ ] npm run dev — zero console errors
- [ ] npm run build — succeeds
- [ ] Checked at 375px / 768px / 1440px
```

## Style rules

- **Landing page styling lives in `src/styles/theme.css`** — no Tailwind
  classes on landing components, no inline style objects for layout.
- No glows, gradient blobs, or glassmorphism.
- Border radius on CTAs and cards stays at 10px or below — no pill
  buttons.
- No emoji icons (the only exception is 🇮🇳 in the footer).
- Animations are CSS or `requestAnimationFrame` only — no GSAP, no
  Framer Motion.
- Respect `prefers-reduced-motion`.

## Before opening a PR

```bash
npm run lint
npm run build
```

Both must pass.
