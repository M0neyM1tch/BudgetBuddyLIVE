# Pre-Phase 9 Deployment Runbook

Last updated: 2026-07-07

This note captures the pre-premium launch setup that remains outside normal app code.

## Current Readiness Evidence

- Exact Cloudflare cutover details are recorded in `docs/BudgetBuddyLIVE-Cloudflare-Cutover-2026-07-07.md`.
- Cloudflare Pages staging project `budgetbuddy-v2` is deployed from `M0neyM1tch/BudgetBuddyLIVE` on `main` at `https://budgetbuddy-v2.pages.dev`.
- Cloudflare Pages live project `budgetbuddy` now deploys from `M0neyM1tch/BudgetBuddyLIVE` on `main` and serves `https://budg.ca`.
- Initial live cutover deployment `07dc6044-3b58-4d9b-8bd2-06271f08d9bb` completed successfully from commit `4386d8c1b94661202d3fb40f464a7d975033f121`.
- Latest verified live production deployment `f57f86ae-0591-470f-9ff9-62b5287debb1` completed successfully from commit `de2f15175241ef6b5510966468ec1d636d2d48e8`.
- Live routes verified with HTTP `200`: `/`, `/dashboard`, `/reset-password`, and `/signup/confirm-email`.
- Live Cloudflare Pages production and preview env vars point to Supabase project `cebykmbauxbucvforwzj`; legacy V1 env vars were removed.
- The linked Supabase project is on PostgreSQL 17.6, so the Postgres 14 end-of-support issue is not blocking this project.
- Goal Pack migrations through `20260707193257_phase3_live_permission_hardening` are represented in the repo.
- The linked Supabase project was hardened on 2026-07-07: current app tables and RPCs have no `anon` or `public` grants, app tables have RLS enabled, signed-in app RPCs are granted to `authenticated`, and `process_due_recurring_rules` is restricted to `service_role`.
- Edge Function `process-recurring` is deployed as version 4 with JWT verification enabled, and CORS throws in production if `ALLOWED_ORIGINS` is unset.
- `process-recurring` CORS was verified from `https://budg.ca` with HTTP `200` and `Access-Control-Allow-Origin: https://budg.ca`.
- `AnalyticsPage` remains the largest lazy route chunk. This is acceptable before network testing because it is route-lazy; split chart-heavy Recharts views later if analytics load time becomes user-visible.
- Verification refreshed on 2026-07-07: typecheck, tests, lint, build, production and full npm audit, tracked-file secret scan, live Supabase grant audit, anonymous REST denial check, Edge Function deployment verification, and landing-page browser smoke checks passed with the accepted notes below.
- Supabase CLI is currently `2.90.0`; it reports `2.109.1` is available. Updating is recommended before final production deployment, but not blocking for this readiness branch.

## Manual Supabase Gates

1. In Supabase Dashboard, keep automatic exposure of new tables/functions disabled or verify every new object gets explicit grants and RLS. Current launch objects were checked and hardened on 2026-07-07, but `supabase_admin` default privileges could not be changed through the MCP SQL role.
2. Leaked password protection is currently unavailable on the project plan. Accepted pre-launch risk: proceed without it for the free pre-premium test release, require strong password guidance in product copy where practical, and re-enable this gate if/when the Supabase project moves to a plan that supports it.
3. Treat current performance advisor `unused_index` info notices as expected on the young test database unless they persist after real usage.
4. Confirm production Auth Site URL in Supabase Dashboard is the Cloudflare production domain: `https://budg.ca`.
5. Confirm production Redirect URLs in Supabase Dashboard:
   - `https://budg.ca/signup/confirm-email`
   - `https://budg.ca/reset-password`
   - Optional/future only: `https://budg.ca/auth/callback` if OAuth callback routing is added.
6. Email confirmation can remain enabled now that the production confirm-email route returns HTTP `200`.

## Resend Email Confirmation

1. In Resend, add and verify a sending domain. Prefer a sending subdomain such as `mail.example.com` or `updates.example.com`.
2. Create a Resend API key.
3. In Supabase Dashboard, open Authentication -> Emails / Notifications -> SMTP Settings.
4. Configure:
   - Host: `smtp.resend.com`
   - Port: `465`
   - Username: `resend`
   - Password: the Resend API key
   - Sender email: a verified sender on the Resend domain
   - Sender name: `BudgetBuddy`
5. Save, send a signup test, and confirm the email arrives with the production redirect URL.

## Clean V2 Deployment Repo

Recommended approach: create a new private GitHub repo for the deployment-grade V2 pivot and push the current branch as its `main`.

```powershell
git remote add v2-deploy git@github.com:<github-user-or-org>/budgetbuddy-v2.git
git push v2-deploy goal-packs/pre-phase9-test-readiness:main
```

For a single clean initial commit instead of preserving branch history, copy the prepared project to a fresh folder, remove `.git`, initialize a new repo, commit once, and push that new repo to GitHub. Keep `.env.local`, Supabase service-role keys, and any local test data out of the repo.

## Cloudflare Pages

1. Live Pages project: `budgetbuddy`.
2. Deployment repo: `M0neyM1tch/BudgetBuddyLIVE`.
3. Production branch: `main`.
4. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: repository root
5. Environment variables:
   - `NODE_VERSION=22.13.0`
   - `VITE_SUPABASE_URL=https://cebykmbauxbucvforwzj.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY=<current Supabase publishable key>`
   - `VITE_GOAL_PACKS_ENABLED=true`
   - `VITE_APP_VERSION=2.0.0`
6. Supabase Edge Function environment:
   - `APP_ENV=production`
   - `ALLOWED_ORIGINS=https://budg.ca,https://www.budg.ca,https://budgetbuddy-v2.pages.dev,http://localhost:5173` during staging/local testing; tighten to production domains when local/staging production-data testing is no longer needed.
7. Custom domain `budg.ca` is active on the live Pages project.
8. Confirm Supabase Auth Site URL and Redirect URLs in the dashboard because the available connector/CLI cannot read those managed Auth settings.

## Phase 9 Start Gate

Do not begin premium gating/payment work until:

- A tester can create an account, confirm email, complete Goal Pack onboarding, create optional recurring rules, use dashboard actions, recalculate plans, and delete goals/debts from the production-like deployment.
- Supabase Auth email confirmation and redirect URLs are verified on the Cloudflare production domain.
- The remaining Supabase security advisor warning for leaked password protection is either resolved or explicitly accepted.
