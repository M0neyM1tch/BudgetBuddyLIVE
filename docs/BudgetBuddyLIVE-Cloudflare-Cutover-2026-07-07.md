# BudgetBuddyLIVE Cloudflare Cutover

Last updated: 2026-07-07

This note records the production deployment work for moving the public BudgetBuddy site from the previous V1 Cloudflare Pages setup to the V2 Goal Packs deployment repo.

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
- Live Pages project: `budgetbuddy`
- Live production deployment: `07dc6044-3b58-4d9b-8bd2-06271f08d9bb`
- Live production deployment commit: `4386d8c1b94661202d3fb40f464a7d975033f121`
- Live production deployment status: success
- Live production aliases: `https://budg.ca`
- Vite build output: `dist`
- SPA fallback exists: `public/_redirects` contains `/* /index.html 200`
- Live Supabase app tables have RLS enabled.
- Live Supabase app tables and public RPCs currently have no `anon` or `public` grants.
- `process-recurring` Edge Function is deployed as version 4 with JWT verification enabled.
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

The Cloudflare API connector was used instead of Wrangler to create the V2 staging project and perform the approved live `budg.ca` cutover.

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

The existing production project `budgetbuddy` now serves `budg.ca` from `M0neyM1tch/BudgetBuddyLIVE` on `main`.

## Cloudflare Pages Repo Cutover

Completed path: the existing Cloudflare Pages project was updated in place so the domain and Web Analytics association remained on the same project.

Verified live configuration:

- Git provider: GitHub
- Repository: `M0neyM1tch/BudgetBuddyLIVE`
- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: repository root
- Production deployment ID: `07dc6044-3b58-4d9b-8bd2-06271f08d9bb`
- Production deployment status: success
- Production alias: `https://budg.ca`

The separate `budgetbuddy-v2` Pages project remains available as staging. It has no custom domain attached.

## Cloudflare Pages Environment Variables

Set for the production and preview environments on the live `budgetbuddy` Pages project:

```text
NODE_VERSION=22.13.0
VITE_SUPABASE_URL=https://cebykmbauxbucvforwzj.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<current Supabase publishable key>
VITE_GOAL_PACKS_ENABLED=true
VITE_APP_VERSION=2.0.0
```

Removed legacy V1 variables from the live project:

```text
VITE_APP_URL
VITE_GAMIFICATION_ENABLED
VITE_SUPABASE_ANON_KEY
```

Do not set or expose any Supabase service-role key in Cloudflare Pages frontend environment variables. The app only needs the publishable key.

Preview deployments currently hit the same V2 Supabase project during pre-launch testing. If preview deployments should be isolated later, create a separate Supabase project/branch and use that project URL and publishable key for Preview.

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

Codex could not verify managed-project Site URL or Redirect URLs through the available Supabase connector/CLI. The public Auth settings endpoint only exposes general auth flags, not Site URL or Redirect URL configuration. Confirm these values in Supabase Dashboard before full public launch.

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
Origin: https://budg.ca
Access-Control-Allow-Origin: https://budg.ca
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

Verified Cloudflare domain/project state:

- `budg.ca` is present in Cloudflare Registrar.
- Registrar expiry: `2026-10-24T14:13:09.000Z`
- Auto-renew: enabled
- Domain lock: enabled
- Existing live Pages project: `budgetbuddy`
- Existing live project custom domain: `budg.ca`
- Existing live project custom domain status: active
- Existing live project Web Analytics tag: present
- Existing live project source: `M0neyM1tch/BudgetBuddyLIVE`
- Existing live project production branch: `main`
- V2 staging Pages project: `budgetbuddy-v2`
- V2 staging custom domains: none yet

For traffic data:

- Use Cloudflare Web Analytics / zone analytics in the dashboard for operational review.
- Use Cloudflare GraphQL Analytics API later if a CSV/API export workflow is needed.
- The current Codex Cloudflare connector can read Pages and Registrar state, but zone DNS/Web Analytics reads returned Cloudflare API auth errors. To export traffic analytics through Codex, grant the connector/API token zone analytics/Web Analytics read access.

## Cutover Definition Of Done

- Cloudflare Pages production deployment is connected to `M0neyM1tch/BudgetBuddyLIVE`. Complete.
- Production branch is `main`. Complete.
- Production build succeeds with `npm run build` and output directory `dist`. Complete.
- `https://budg.ca` serves the V2 Goal Packs app. Complete; public routes return HTTP `200`.
- SPA routes refresh correctly, including `/dashboard`, `/reset-password`, and `/signup/confirm-email`. Complete; routes return HTTP `200`.
- Supabase Auth Site URL is `https://budg.ca`. Manual dashboard confirmation remains.
- Supabase Redirect URLs include the required production URLs. Manual dashboard confirmation remains.
- `process-recurring` CORS allows the production domain through `ALLOWED_ORIGINS`. Complete.
- Test signup, email confirmation, password reset, onboarding, recurring backdating, dashboard actions, and transactions work on the production domain.
- Supabase Data API automatic exposure remains disabled/manual for future objects. Manual dashboard control remains; current object grants/RLS are verified.
- Cloudflare analytics/domain remain in Cloudflare. Complete.
