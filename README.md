# BudgBeacon

Personal finance application for goals, debts, transactions, recurring activity, and financial planning.

Start with [project status](docs/project-status.md) for the current release state and [the release runbook](docs/release-runbook.md) before promoting changes. The Product/UX Follow-Ups 2 candidate has been rehearsed, but its production promotion is not verified complete. A frontend deployment must follow its database migrations.

## Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Backend:** Supabase Postgres + Edge Functions
- **Hosting:** Cloudflare Pages
- **State:** TanStack Query
- **Routing:** React Router v7

## Scripts

- `npm run dev` starts the local Vite app.
- `npm run typecheck` runs TypeScript project checks.
- `npm run lint` runs ESLint.
- `npm test` runs the test suite once; `npm run test:watch` watches tests.
- `npm run build` runs typecheck and production build.
- `npm run preview` serves the built frontend locally.

## Local development

1. Use Node 22.13.0 or newer and npm 9 or newer. The repository's `.nvmrc` and CI identify the current runtime baseline.
2. Run `npm ci` from the repository root.
3. Configure an ignored `.env.local` on your own machine using the variables below. Choose the rehearsal project for development and use synthetic accounts. Keep production configuration in the deployment platform.
4. Run `npm run dev`, then use the local address printed by Vite.
5. Before sharing changes, run typecheck, lint, tests, and build. Database changes also need rehearsal validation; frontend tests do not validate a hosted schema.

The variable contract comes from `src/shared/lib/env.ts`:

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Required URL of the intended Supabase project. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser-safe publishable key for that same project. |
| `VITE_SUPABASE_ANON_KEY` | Legacy fallback only when the publishable-key variable is absent. |
| `VITE_GOAL_PACKS_ENABLED` | Set to `true` to exercise the Goal Packs MVP; defaults to disabled. |
| `VITE_APP_VERSION` | Optional display/build version; defaults to `2.0.0`. |

Vite embeds `VITE_` values in the browser build. Never put database passwords, service-role keys, secret keys, or provider tokens in those variables. Do not commit local environment files or print configuration values in diagnostics. Restart Vite after changing local configuration.

One repository supports separate production and rehearsal environments. Local development currently uses the hosted rehearsal database; this repository does not yet define a complete local Supabase stack. Do not assume `supabase start` or a database reset is part of ordinary frontend setup. Never copy rehearsal accounts or financial rows into production to promote a release.

## Features

- Dashboard: net worth and cashflow summary
- Transactions: income and expense tracking
- Analytics: spending trends and charts
- Goals: savings goal tracking
- Debts: debt payoff planning
- Calculator: financial calculators

## Architecture

See [architecture](docs/architecture.md) and [security](docs/security.md). Schema and RLS changes belong in `supabase/migrations`; privileged server behavior belongs in `supabase/functions`.

## Documentation

- [Project status](docs/project-status.md): current evidence, open blockers, and development boundaries.
- [Release runbook](docs/release-runbook.md): recovery, migration, deployment, and verification sequence.
- [Latest historical production preflight](docs/Product-UX-Follow-Ups-2-Final-Merge-Readiness-and-Production-Preflight-2026-08-26.md): the August checkpoint, not proof of today's hosted state.
- [Rehearsal history](docs/Product-UX-Follow-Ups-2-Backup-and-Restore-Rehearsal-Report-2026-07-22.md): cumulative migration and browser evidence through August.
- [Backup and restore runbook](docs/Product-UX-Follow-Ups-2-Free-Plan-Backup-and-Restore-Runbook-2026-07-21.md): recovery scope and procedure; use the current release runbook's migration manifest.

Dated reports are historical records. They may contain older hashes, statuses, proposed work, or instructions for completed tasks. Use current status and verified platform state to decide what to do next.
