# BudgetBuddyLIVE Free Launch Readiness Audit

Prepared: 2026-07-15

Branch audited:

```text
free-launch-readiness
```

Commit audited:

```text
8b2e1cb1252bf8fe6f4ae0493fb164a02ac5ea88
Onboarding touch up (#2)
```

## Summary

The free launch readiness branch is ready to merge to `main`.

The branch currently points to the same application commit as `main`, and the audit found no launch-blocking code, build, Supabase, Cloudflare, or dependency issues. The only new branch artifact from this pass is this audit report.

## Local Release Gates

All required local gates passed.

| Gate | Result |
| --- | --- |
| `npm.cmd run typecheck` | Passed |
| `npm.cmd run lint` | Passed |
| `npm.cmd run test` | Passed, 11 files and 42 tests |
| `npm.cmd run build` | Passed |
| `git diff --check` | Passed |
| `npm.cmd audit --omit=dev --audit-level=high` | Passed, 0 vulnerabilities |
| `dist/_redirects` after build | Present |

Build note:

- Vite/Rolldown printed a plugin timing warning.
- This is informational and not a launch blocker.
- No functional build error was produced.

## Cloudflare Pages Audit

Cloudflare Pages project:

```text
budgetbuddy
```

Findings:

- Git source is connected to `M0neyM1tch/BudgetBuddyLIVE`.
- Production branch is `main`.
- Production deployments are enabled.
- Preview deployments are enabled for all branches.
- Custom domain `budg.ca` is active.
- Production deployment for `main` is successful at commit `8b2e1cb1252bf8fe6f4ae0493fb164a02ac5ea88`.
- Preview deployment for `free-launch-readiness` is successful at the same commit.

Production URL:

```text
https://budg.ca
```

Preview URL:

```text
https://free-launch-readiness.budgetbuddy-960.pages.dev
```

Production HTTP checks:

- `https://budg.ca/` returns `200`.
- `https://budg.ca/dashboard` returns `200`, confirming the SPA fallback is working.
- Security headers are present:
  - `Content-Security-Policy`
  - `Permissions-Policy`
  - `Referrer-Policy`
  - `X-Content-Type-Options`
  - `X-Frame-Options`
- Cloudflare Pages Analytics is injected into production HTML.

## Supabase Audit

Project:

```text
cebykmbauxbucvforwzj
```

Migration findings:

- Live migration history contains only the expected BudgetBuddy migrations through:

```text
20260702195005_goal_pack_fk_indexes
```

- The accidental marketing migration rows are absent:

```text
20260711002137 marketing_funnel_tracking
20260711002252 marketing_events_grant_hardening
20260711174141 remove_marketing_funnel_tracking
```

Edge Function findings:

- `process-recurring` is active.
- Current version is `6`.
- `verify_jwt` is enabled.
- Edge Function logs returned no recent errors.

Database/RLS findings:

- App tables checked:
  - `profiles`
  - `user_preferences`
  - `goals`
  - `debts`
  - `transactions`
  - `recurring_rules`
  - `financial_priorities`
  - `goal_plan_snapshots`
  - `goal_actions`
- RLS is enabled on every checked app table.
- `anon` has no table `select` grants on checked app tables.
- `authenticated` has expected table privileges.
- Each checked app table has RLS policies present.
- Required Goal Pack and recurring RPCs exist:
  - `create_goal_pack_onboarding_setup`
  - `create_goal_pack_onboarding_setup_v2`
  - `process_due_recurring_rules`
  - `apply_goal_plan_recalculation`
  - `complete_goal_action_with_plan`

## Browser Console Investigation

User screenshot showed:

```text
MaxListenersExceededWarning: Possible EventEmitter memory leak detected
ObjectMultiplex - orphaned data for stream "app-init-liveness"
ObjectMultiplex - orphaned data for stream "background-liveness"
source: contentscript.js:14083
```

Findings:

- The source shown in the screenshot is `contentscript.js`, not a BudgetBuddy source or deployed app bundle file.
- The warning strings do not exist anywhere in the BudgetBuddy repository.
- The warning strings do not exist in the deployed `index` bundle.
- The warning strings do not exist in the deployed Supabase vendor bundle.

Conclusion:

- These console messages are almost certainly from a browser extension content script, not BudgetBuddy application code.
- `ObjectMultiplex` and `contentscript.js` are common signals of extension-injected scripts.
- This is not a BudgetBuddy launch blocker unless the messages are paired with visible app breakage.

Recommended user-side validation:

1. Open `https://budg.ca` in an incognito/private window with extensions disabled.
2. Recheck the console.
3. If the warnings disappear, the cause is confirmed as an extension.
4. If warnings remain, capture the full console entry including source URL and stack.

Tooling note:

- In-app Browser automation could initialize and create tabs, but navigation was repeatedly interrupted before live console capture completed.
- The console conclusion above is based on the attached screenshot, repository search, deployed asset search, and platform checks.

## PWA Note

The production manifest is still the current pre-PWA manifest:

- one JPEG icon
- no root service worker
- no push reminder flow

That is expected for this branch. PWA/Plan Pulse work should stay in a future dedicated branch.

## Merge Recommendation

Merge `free-launch-readiness` to `main`.

This branch does not introduce application code changes. It records the final free-launch readiness audit and confirms the current production app state is launch-ready for continued free-version testing before Phase 9 monetization work.
