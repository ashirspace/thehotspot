# Contributing to thehotspot

Thanks for helping build thehotspot. This guide keeps the codebase consistent.

## Branch Naming

Use short, descriptive branch names:

```text
feat/short-description      new feature
fix/short-description       bug fix
chore/short-description     tooling, dependency, or docs work
redesign/short-description  product UI redesign work
```

Codex-created branches should use the `codex/` prefix unless a task asks for a different prefix.

## Commit Messages

Prefer Conventional Commits:

```text
feat(dashboard): add approval queue
fix(auth): handle missing linkedin profile email
chore(deps): update next config
docs(readme): document prisma deploy flow
```

Keep the subject under 70 characters. Use the body for the why when the change is not obvious.

## Pull Request Checklist

```text
## Summary
- <1-3 bullets>

## Test plan
- [ ] npm run lint
- [ ] npm run build
- [ ] npx prisma validate
- [ ] Checked responsive layout at mobile, tablet, and desktop widths
```

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run prisma:generate
npm run dev
```

The app runs at http://localhost:5173.

## Code Style

- Use TypeScript for active app code.
- Keep new routes in `src/app`.
- Keep reusable UI primitives in `src/components/ui`.
- Keep product-specific UI in `src/components/dashboard`.
- Keep service integrations in `src/lib`.
- Use Tailwind CSS utility classes only for styling.
- Prefer small, focused components over large one-off blocks when adding new behavior.
- Keep service clients lazy to avoid build-time environment failures.
- Do not commit secrets. Use `.env.local` locally and Vercel environment variables in deployment.

## UI Standards

- Mobile, tablet, and desktop must all be usable.
- Use restrained slate/white surfaces and LinkedIn blue accents.
- Include loading, empty, error, active, and disabled states where relevant.
- Avoid decorative gradients, glassmorphism, oversized radii, and template-like visual filler.
- Use accessible labels for icon-only controls.

## Database Changes

After editing `prisma/schema.prisma`, generate and test migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
npx prisma validate
```

Production deploys should use:

```bash
npm run prisma:deploy
```

## Before Opening a PR

```bash
npm run lint
npm run build
npx prisma validate
```

All three should pass before review.
