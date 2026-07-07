# BudgetBuddy V2 Phase 2 Calculator Pre-Merge Fixes

Date: 2026-06-22  
Branch: `phase-2/calculator`  
Base commit before fixes: `86f5c11 feat: build calculator planning tools`

## Summary

This pass addressed the calculator pre-merge audit findings from `BudgetBuddy-V2-Calculator-PreMerge-Fix-Plan-2026-06-22.md`.

Most findings were code-level fixes and are resolved in this branch. Two findings remain external pre-merge gates because they require Supabase dashboard configuration or a real authenticated seeded test account.

## Issue Status

### 01. CalculatorField number input ghost

Status: Fixed in code.

- Reworked `CalculatorField` to keep a local string draft for the visible input value.
- Clearing a field now leaves it blank while editing instead of snapping to `0`.
- The parent calculation state only receives finite parsed numbers.
- Empty or invalid blur restores the last valid upstream value.
- Implemented without `useEffect` state syncing so React Compiler lint remains clean.

### 02. GoalTimelineProjector number input ghost

Status: Fixed in code.

- Added local `rawContrib` string state for the monthly contribution field.
- Empty edits no longer write `0` cents mid-typing.
- Blur normalizes valid values and restores inferred values for empty/invalid input.

### 03. DebtPayoffPlanner number input ghost

Status: Fixed in code.

- Added local `rawExtra` string state for the extra monthly payment field.
- Empty edits no longer write `0` cents mid-typing.
- Blur normalizes valid values and restores the last valid payment for empty/invalid input.

### 04. Budget Health score design note

Status: Fixed by product-oriented formula update.

- Updated the scoring formula so under-saving is penalized more heavily and over-saving is only lightly penalized.
- This better matches BudgetBuddy's product intent: saving more than target should not feel as bad as missing the target by the same amount.

### 05. Recurring Cost quarterly/yearly future support

Status: Fixed in code.

- Replaced implicit fallback logic with an explicit switch.
- Existing frequencies remain supported: weekly, biweekly, semi-monthly, monthly.
- Future runtime values are already handled for quarterly and yearly.
- The default branch remains an exhaustiveness guard so future enum changes surface during typecheck.

### 06. Supabase advisors

Status: Partially verified. External action required.

- Supabase advisor access worked on 2026-06-22.
- Security advisor returned one warning:
  - `auth_leaked_password_protection`
  - Title: Leaked Password Protection Disabled
  - Remediation: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
- Performance advisor returned three INFO notices for unused indexes:
  - `transactions_debt_id_idx`
  - `transactions_goal_id_idx`
  - `recurring_rules_debt_id_idx`
- These unused-index notices are not new calculator regressions and should not be removed yet because debts, goals, and recurring-rule usage are still being built out.

Required before merge:

- Enable leaked password protection in the Supabase Auth dashboard.
- Rerun the security advisor and confirm that warning is cleared.

### 07. Authenticated seeded smoke test

Status: Not completed in this environment. External action required.

- Local browser testing could only verify the unauthenticated auth boundary because no local `.env` or test credentials are available in this checkout.
- `/dashboard/calculator` correctly redirects to `/login` while unauthenticated.
- Desktop and 375px mobile auth-boundary checks had no horizontal overflow.

Required before merge:

- Sign in with a seeded test account and complete the checklist from the audit for Calculator, Goals projector, and Debts planner interactions.
- Specifically verify number fields can be cleared, typed fresh, and blurred without leading-zero ghosts.

### 08. `transaction_date` versus `date` maintenance hazard

Status: Fixed in code.

- Added a clarifying comment to `goal-projection.utils.ts`.
- Confirmed `trailingMonthlyGoalContribution` receives the raw `Transaction` type, where the date field is `transaction_date`.

### 09. GoalTimelineProjector stale input on goal switch

Status: Fixed in code.

- Goal selector changes now clear both `monthlyOverrideCents` and `rawContrib`.
- The field immediately falls back to the newly selected goal's inferred contribution value.

### 10. Cross-feature internal Transaction type imports

Status: Fixed in code.

- Updated the audited Goals projector utility to import `Transaction` through the public `transactions` feature index.
- Also cleaned related Goals/Debts type imports found during verification so they go through the public feature export instead of `transactions/types/transactions.types`.

### 11. Collapsible Goal/Debt planners

Status: Fixed in code.

- Wrapped Goal Timeline Projector and Debt Payoff Planner in native `<details open>` panels.
- Added accessible summary toggles.
- Added token-based CSS for the toggle row, marker removal, chevron rotation, reveal animation, and mobile tap target sizing.
- Both planners remain expanded by default.

## Verification Completed

- `npm.cmd run typecheck` passed.
- `npm.cmd run lint` passed.
- `npm.cmd run build` passed.
- Static scan confirmed no remaining audited `transactions/types/transactions.types` imports in Calculator/Goals/Debts.
- Static scan confirmed no remaining `Number(event.target.value)` usage in audited number-input components. Remaining usage is in `ScenarioSlider`, which is a range slider, not a free-text number input.
- Browser smoke:
  - `/dashboard/calculator` redirects to `/login` when unauthenticated.
  - Desktop auth-boundary check: no horizontal overflow.
  - 375px mobile auth-boundary check: no horizontal overflow.
- Supabase changelog was fetched on 2026-06-22. No recent breaking-change item required a code change for this frontend-only calculator fix pass.

## Immediate Pre-Merge Blockers

1. Enable Supabase leaked password protection.
2. Rerun Supabase security advisor and confirm the Auth warning is cleared.
3. Perform authenticated seeded calculator QA with a real test user.

