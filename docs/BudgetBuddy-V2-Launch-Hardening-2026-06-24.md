# BudgetBuddy V2 Launch Hardening

Date: 2026-06-24
Branch: `phase-3/launch-hardening`
Base: `origin/develop`

## Summary

This branch closes the final code-level launch readiness gaps identified in the June 23 and June 24 audits while keeping BudgetBuddy proprietary and preserving the current V2 data model.

## Implemented Scope

- Reconciled local migration filenames with the live Supabase migration history.
- Added legal acceptance columns to `profiles` and updated the auth-user trigger to capture signup consent metadata.
- Added least-privilege table grants and revoked direct execute from trigger helper functions.
- Added signup Terms/Privacy acceptance, confirm-email routing, password reset pages, legal route aliases, and wildcard 404 routing.
- Replaced the transaction `.limit(500)` cap with paginated queries and added amount-range filters.
- Switched Compound Growth to annual compounding for launch checklist consistency.
- Added Vitest, focused launch tests, Node pinning, GitHub Actions CI, Cloudflare Pages routing/security files, robots, manifest, and public metadata.

## Manual Launch Gates

- Configure Resend SMTP in Supabase Auth.
- Set production Site URL and Redirect URLs in Supabase Auth.
- Enable email confirmation only after this branch is deployed.
- Enable leaked-password protection if the Supabase plan allows it; otherwise document the accepted risk.
- Configure Cloudflare Pages, production env vars, custom domain, DNS, and HTTPS.
- Complete final lawyer review of Terms, Privacy, calculator disclaimers, retention language, and launch jurisdictions.

## Verification Checklist

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`
- `git diff --check`
- `npm audit --omit=dev`
- Supabase advisors
- RLS and grants verification queries
- Browser smoke on desktop and 375px mobile
