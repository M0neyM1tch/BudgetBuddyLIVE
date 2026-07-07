# BudgetBuddyLIVE Launch Audit

Date: 2026-07-07

Scope: BudgetBuddy V2 post-pivot launch candidate for network testing, including the Goal Packs pivot, landing page updates, Supabase permission hardening, and clean export to `BudgetBuddyLIVE`.

## Result

BudgetBuddy V2 is ready for limited external testing with your network, provided the remaining manual production configuration gates are completed before public launch.

No hardcoded secrets were found in tracked files, dependency audits reported zero known vulnerabilities, automated app checks passed, and the live Supabase project was hardened so current app tables/RPCs are not granted to `anon` or `public`.

This audit cannot prove that no vulnerability will ever exist. It confirms that the launch candidate passed the checks listed below and that the known remaining risks are documented.

## GitHub Publication

- Source repo: `M0neyM1tch/budgetbuddy-v2`
- Source branch: `goal-packs/pre-phase9-test-readiness`
- Source branch hardening commit: `f145255`
- Live repo: `M0neyM1tch/BudgetBuddyLIVE`
- Live branch: `main`
- Live repo strategy: sanitized tracked-file export with a fresh git history, so ignored local files and development history were not carried into the live repo.

## Automated Checks

All checks passed on the source repo:

- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd run test` - 11 files, 41 tests
- `npm.cmd run build`
- `npm.cmd audit --omit=dev --audit-level=moderate` - 0 vulnerabilities
- `npm.cmd audit --audit-level=moderate` - 0 vulnerabilities
- `git diff --check`
- tracked-file secret scan

All checks passed again on the clean `BudgetBuddyLIVE` export:

- `npm.cmd ci` - 0 vulnerabilities
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd run test` - 11 files, 41 tests
- `npm.cmd run build`

Note: local `npm ci` warned that the shell Node version was `22.12.0` while the project requires `>=22.13.0`. CI is configured for Node `22.13.0`; Cloudflare should use the same or newer Node version.

## Secret And Repo Hygiene

- `.env.local` is ignored and was not included in the live repo.
- `node_modules` is ignored and was not included in the live repo.
- `dist` is ignored and was not included in the live repo.
- `.env.example` contains placeholders only.
- `LICENSE` and `package.json` keep the project proprietary / `UNLICENSED`.
- The live repo was created from `git archive HEAD`, then initialized as a new repository.

## Supabase Audit

Current live project: `cebykmbauxbucvforwzj`

Confirmed after hardening:

- Current app tables have RLS enabled.
- Current app tables have no `anon` table grants.
- Current app tables have no `public` table grants.
- Current app RPCs have no `anon` function grants.
- Current app RPCs have no `public` function grants.
- Signed-in app RPCs are granted to `authenticated`.
- `process_due_recurring_rules` is not granted to `authenticated`; it is service-role only.
- Anonymous REST request to `public.transactions` returned `401` / `42501 permission denied`.
- Edge Function `process-recurring` is active as version 3.
- Edge Function `process-recurring` has `verify_jwt: true`.
- Edge Function CORS helper now throws in production if `ALLOWED_ORIGINS` is unset.

Repo migration added:

- `supabase/migrations/20260707193257_phase3_live_permission_hardening.sql`

## Remaining Manual Gates

- In Supabase Dashboard, keep automatic exposure of new tables/functions disabled or verify every new object has explicit grants and RLS. Existing launch objects were hardened, but `supabase_admin` default privileges could not be changed through the MCP SQL role.
- Configure production Cloudflare Pages env vars:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
  - `VITE_GOAL_PACKS_ENABLED=true`
- Configure Edge Function secrets/env:
  - `APP_ENV=production`
  - `ALLOWED_ORIGINS=https://<production-domain>`
- Confirm Supabase Auth production Site URL and Redirect URLs.
- Keep Resend SMTP confirmed for production email.
- Leaked password protection remains unavailable on the current Supabase plan; this is an accepted pre-premium testing risk and should be enabled if the project moves to a plan that supports it.

## Testing Recommendation

Use `BudgetBuddyLIVE` for Cloudflare Pages deployment and limited network testing. Before inviting testers, complete one production smoke test:

1. Create a new user.
2. Confirm email.
3. Complete Goal Pack onboarding.
4. Create optional recurring income/expense rules with a prior start date.
5. Confirm backdated transactions appear.
6. Recalculate dashboard plan.
7. Complete a next action.
8. Delete a test goal/debt.
9. Run the anonymous REST denial check again after any Supabase dashboard Data API changes.
