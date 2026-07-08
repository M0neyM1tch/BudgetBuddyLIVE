# BudgetBuddyLIVE Cloudflare Cutover

Last updated: 2026-07-07

This note records the exact remaining production deployment work for moving the public BudgetBuddy site from the current V1 Cloudflare Pages setup to the V2 Goal Packs deployment repo.

## Current Verified State

- Deployment repo: `M0neyM1tch/BudgetBuddyLIVE`
- Deployment branch: `main`
- Deployment repo remote: `https://github.com/M0neyM1tch/BudgetBuddyLIVE.git`
- Source repo: `M0neyM1tch/budgetbuddy-v2`
- Source branch: `goal-packs/pre-phase9-test-readiness`
- Supabase project ref: `cebykmbauxbucvforwzj`
- Supabase URL: `https://cebykmbauxbucvforwzj.supabase.co`
- Production domain target: `https://budg.ca`
- V2 staging Pages project: `budgetbuddy-v2`
- V2 staging URL: `https://budgetbuddy-v2.pages.dev`
- V2 staging deployment: `a884b28b-33a4-436f-83a8-8137d1046639`
- Vite build output: `dist`
- SPA fallback exists: `public/_redirects` contains `/* /index.html 200`
- Live Supabase app tables have RLS enabled.
- Live Supabase app tables and public RPCs currently have no `anon` or `public` grants.
- `process-recurring` Edge Function is deployed as version 3 with JWT verification enabled.
- `APP_ENV=production` and `ALLOWED_ORIGINS` are set for the V2 Edge Function.

## Codex Cloudflare Access Check

Codex can access Cloudflare through the Cloudflare API connector. Wrangler is available through `npx`, but the local Wrangler session is not authenticated:

```powershell
npx --yes wrangler whoami
```

Result:

```text
You are not authenticated. Please run `wrangler login`.
```

The Cloudflare API connector was used instead of Wrangler to create the V2 staging project. A direct live `budg.ca` cutover still requires explicit approval because it mutates the existing production Pages project.

## V2 Staging Project Created

Cloudflare Pages project `budgetbuddy-v2` was created on 2026-07-08.

Verified configuration:

- Project URL: `https://budgetbuddy-v2.pages.dev`
- Source: `M0neyM1tch/BudgetBuddyLIVE`
- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Production deployment commit: `d5489c484a7d192dd659408a225f867cfdf21778`
- Deployment status: success
- Routes verified with HTTP `200`:
  - `https://budgetbuddy-v2.pages.dev`
  - `https://budgetbuddy-v2.pages.dev/reset-password`
  - `https://budgetbuddy-v2.pages.dev/signup/confirm-email`
  - `https://budgetbuddy-v2.pages.dev/dashboard`

The existing production project `budgetbuddy` remains unchanged and still serves `budg.ca` from the V1 repo until a live cutover is explicitly approved.

## Cloudflare Pages Repo Cutover

Preferred path: update the existing Cloudflare Pages project if Cloudflare Dashboard allows the Git configuration change cleanly.

1. Cloudflare Dashboard -> Workers & Pages.
2. Open the current BudgetBuddy Pages project serving `budg.ca`.
3. Go to Settings.
4. Update Git configuration to:
   - Git provider: GitHub
   - Repository: `M0neyM1tch/BudgetBuddyLIVE`
   - Production branch: `main`
5. Confirm build settings:
   - Framework preset: React / Vite, or manual settings
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: repository root
6. Save and trigger a production deployment.

Fallback path if the existing Pages project cannot be safely re-linked:

1. Create a new Cloudflare Pages project from `M0neyM1tch/BudgetBuddyLIVE`.
2. Deploy `main` successfully on the generated `*.pages.dev` URL first.
3. Add `budg.ca` as a custom domain on the new Pages project.
4. Remove the old Pages custom domain/DNS association only when the new project is ready.
5. Keep the Cloudflare zone/domain in Cloudflare. Do not transfer the domain away for this cutover.

## Cloudflare Pages Environment Variables

Set these for the production environment:

```text
NODE_VERSION=22.13.0
VITE_SUPABASE_URL=https://cebykmbauxbucvforwzj.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<current Supabase publishable key>
VITE_GOAL_PACKS_ENABLED=true
```

Optional:

```text
VITE_APP_VERSION=2.0.0
```

Do not set or expose any Supabase service-role key in Cloudflare Pages frontend environment variables. The app only needs the publishable key.

Preview deployment choice:

- If preview deployments should hit the same Supabase project during pre-launch testing, copy the same non-secret Vite variables into Preview.
- If preview deployments should be isolated later, create a separate Supabase project/branch and use that project URL and publishable key for Preview.

## Supabase Auth URL Configuration

Set production Site URL:

```text
https://budg.ca
```

Required Redirect URLs for the current password/email flow:

```text
https://budg.ca/reset-password
https://budg.ca/signup/confirm-email
```

Useful testing Redirect URLs:

```text
http://localhost:5173/**
https://<cloudflare-pages-project>.pages.dev/**
```

Optional/future Redirect URL:

```text
https://budg.ca/auth/callback
```

Only keep `/auth/callback` if OAuth/social login is added or a callback route is implemented. The current React router does not define `/auth/callback`, so it is not required for the current email/password launch path.

Supabase guidance: use exact redirect URLs in production. Wildcards are useful for local and preview deployments, but production should stay tight.

## Supabase Edge Function Environment

Current Edge Function secrets/environment variables for `process-recurring`:

```text
APP_ENV=production
ALLOWED_ORIGINS=https://budg.ca,https://www.budg.ca,https://budgetbuddy-v2.pages.dev,http://localhost:5173
```

Tighten `ALLOWED_ORIGINS` after testing:

```text
ALLOWED_ORIGINS=https://budg.ca,https://www.budg.ca
```

Keep `http://localhost:5173` only while local production-data testing is intentionally allowed. The deployed CORS helper throws in production if `ALLOWED_ORIGINS` is empty.

Verified preflight:

```text
Origin: https://budgetbuddy-v2.pages.dev
Access-Control-Allow-Origin: https://budgetbuddy-v2.pages.dev
Status: 200
```

The function also requires Supabase service configuration. The deployed code supports the platform-provided `SUPABASE_SECRET_KEYS.default` path and the legacy `SUPABASE_SERVICE_ROLE_KEY` path. Do not expose either key to the frontend.

## Supabase Data API Exposure Policy

Keep automatic exposure of future objects disabled/manual in Supabase Data API settings.

Why:

- Supabase Data API access has two layers: grants decide which roles can reach objects, and RLS decides which rows are visible after access is granted.
- Existing launch objects have been hardened.
- The SQL role available to Codex could not alter `supabase_admin` default privileges, so future dashboard-created objects must still be reviewed manually.

For every future table/function:

1. Decide whether it should be reachable from the browser.
2. Enable RLS on every table in an exposed schema.
3. Grant only the minimum privileges required.
4. Revoke `anon`/`public` access unless intentionally needed.
5. Re-run a grant audit before public release.

## Cloudflare Domain And Analytics Recommendation

Keep `budg.ca` in Cloudflare. Do not transfer the domain or zone for this deployment.

Reason:

- Keeping the zone in Cloudflare allows the custom domain to be moved between Pages projects with the least DNS disruption.
- Zone-level traffic analytics remain in Cloudflare.
- Pages-project analytics may be project-specific, so creating a new Pages project could split historical Pages analytics from future Pages analytics.

For traffic data:

- Use Cloudflare Web Analytics / zone analytics in the dashboard for operational review.
- Use Cloudflare GraphQL Analytics API later if a CSV/API export workflow is needed.

## Cutover Definition Of Done

- Cloudflare Pages production deployment is connected to `M0neyM1tch/BudgetBuddyLIVE`.
- Production branch is `main`.
- Production build succeeds with `npm run build` and output directory `dist`.
- `https://budg.ca` serves the V2 Goal Packs app.
- SPA routes refresh correctly, including `/dashboard`, `/reset-password`, and `/signup/confirm-email`.
- Supabase Auth Site URL is `https://budg.ca`.
- Supabase Redirect URLs include the required production URLs.
- `process-recurring` CORS allows the production domain through `ALLOWED_ORIGINS`.
- Test signup, email confirmation, password reset, onboarding, recurring backdating, dashboard actions, and transactions work on the production domain.
- Supabase Data API automatic exposure remains disabled/manual for future objects.
- Cloudflare analytics/domain remain in Cloudflare.
