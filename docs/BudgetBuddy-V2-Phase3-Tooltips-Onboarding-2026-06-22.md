# BudgetBuddy V2 Phase 3 Tooltips & Onboarding

Date: 2026-06-22
Branch: `phase-3/tooltips-onboarding`
Base: `origin/develop`

## Summary

This branch starts Phase 3 launch prep by adding first-run onboarding, progressive tooltips, empty-state calls to action, and a lightweight preferences reset surface.

## Supabase

Applied migration:

- `supabase/migrations/20260622162000_phase3_onboarding_preferences.sql`

Schema changes:

- `public.user_preferences.onboarding_completed_at timestamptz`
- `public.user_preferences.dismissed_tooltips text[] not null default '{}'`

The migration is idempotent and was applied to the connected V2 Supabase project. `user_preferences` still has RLS enabled.

## App Changes

- Added `src/features/onboarding` with:
  - onboarding preference API functions
  - React Query hooks
  - five-step welcome wizard
  - dismissible tooltip wrapper
  - localStorage fallback for tooltip dismissal responsiveness
- Added shared `Tooltip` UI component.
- Added `PreferencesPage` for restarting onboarding and re-showing dismissed tips.
- Added `/dashboard/preferences` route and nav item.
- Mounted `OnboardingRoot` inside `AppShell`.
- Added empty-state CTAs for dashboard snapshots, transactions, analytics, goals, and debts.
- Added first-use tooltips for:
  - transaction add flow
  - analytics range selector
  - first goal card
  - first debt card
  - calculator planner tabs
- Added `/dashboard/transactions?new=1` support to open the add transaction modal on first render.

## Validation

- `npm.cmd run typecheck` passed.
- `npm.cmd run lint` passed.
- `npm.cmd run build` passed.
- Supabase table inspection confirmed the new columns exist on `public.user_preferences`.
- Browser smoke testing passed with temporary process-only Vite env values:
  - desktop landing render loads with no horizontal overflow
  - mobile landing render at 375px loads with no horizontal overflow
  - unauthenticated `/dashboard/transactions?new=1` redirects to `/login`

## Notes

- No new RLS policy was required because the feature only adds columns to the existing `user_preferences` table and continues to use the existing per-user access boundary.
- Tooltip dismissals are stored in Supabase and mirrored locally for immediate UI response.
- The onboarding reset intentionally lives in Preferences so launch testers have a visible way to replay onboarding without database edits.
