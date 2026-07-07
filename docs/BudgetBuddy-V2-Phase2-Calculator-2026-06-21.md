# BudgetBuddy V2 Phase 2 Calculator Branch Summary

Date: 2026-06-21  
Branch: `phase-2/calculator`  
Base: `origin/develop` at `1714ef7 feat: build analytics overview (#6)`

## Purpose

Build the signed-in Calculator tab as a launch-quality planning workspace while keeping the current data model unchanged. This branch does not introduce new Supabase tables, migrations, writes, saved scenarios, or Edge Functions.

## Implemented

### Calculator Tab

- Replaced the placeholder calculator route with a four-tab planning workspace:
  - Freedom Number
  - Budget Health
  - Compound Growth
  - Recurring Costs
- Added calculator-specific API reads for:
  - Recent transactions
  - Active recurring rules
  - Active goals
- Added React Query hooks and typed query keys under `src/features/calculator/hooks`.
- Added pure TypeScript calculation utilities for each calculator area.
- Added reusable calculator UI components:
  - Tabs
  - Stat cards
  - Slider fields
  - Empty states
  - Scenario panels
  - Recurring cost analysis table
- Added responsive calculator styling in `CalculatorPage.css`.

### Goals Integration

- Moved the Goal Timeline Projector concept into the Goals feature, not the Calculator feature.
- Added a goals-local projector component that estimates:
  - Remaining amount
  - Estimated finish date
  - Required monthly contribution
  - Time saved from an extra monthly contribution scenario
- The projector reads existing goal and transaction data only. It does not write or create saved scenarios.

### Debts Integration

- Moved the Debt Payoff Planner concept into the Debts feature, not the Calculator feature.
- Added a debts-local payoff planner with:
  - Avalanche strategy
  - Snowball strategy
  - Extra monthly payment scenario
  - Estimated debt-free date
  - Total interest estimate
  - 12-month payoff preview
- The planner reads existing debt data only. It does not mutate balances or generate payment transactions.

### Cache Invalidation

- Added calculator cache invalidation after transaction, recurring rule, goal, and debt mutations.
- This keeps calculator projections fresh after related app data changes without adding new cross-feature writes.

### Shared Utility Cleanup

- Added generic `addMonths` to `src/shared/utils/dates.ts`.
- Kept Goals and Debts from importing feature-owned Calculator utilities.

## Files Added

- `src/features/calculator/components/*`
- `src/features/calculator/pages/CalculatorPage.css`
- `src/features/calculator/utils/*`
- `src/features/debts/components/DebtPayoffPlanner.tsx`
- `src/features/debts/utils/debt-payoff.utils.ts`
- `src/features/goals/components/GoalTimelineProjector.tsx`
- `src/features/goals/utils/goal-projection.utils.ts`
- `docs/BudgetBuddy-V2-Phase2-Calculator-2026-06-21.md`

## Files Updated

- `src/features/calculator/api/calculator.api.ts`
- `src/features/calculator/hooks/useCalculator.ts`
- `src/features/calculator/index.ts`
- `src/features/calculator/pages/CalculatorPage.tsx`
- `src/features/calculator/types/calculator.types.ts`
- `src/features/debts/hooks/useDebts.ts`
- `src/features/debts/pages/DebtsPage.css`
- `src/features/debts/pages/DebtsPage.tsx`
- `src/features/goals/hooks/useGoals.ts`
- `src/features/goals/pages/GoalsPage.css`
- `src/features/goals/pages/GoalsPage.tsx`
- `src/features/transactions/hooks/useTransactions.ts`
- `src/shared/utils/dates.ts`

## Supabase Impact

- No database migration required.
- No Edge Function required for this branch.
- No new RLS policies required.
- Calculator queries are read-only and remain behind the existing authenticated app flow.
- Supabase advisor validation could not be completed in this session because the connected Supabase token returned `401 token_expired`.

## Verification

- `npm.cmd run typecheck` passed.
- `npm.cmd run lint` passed.
- `npm.cmd run build` passed.
- Production build created a lazy Calculator chunk:
  - `CalculatorPage-BcWRtRCa.js`: 32.98 kB, 11.21 kB gzip
  - `CalculatorPage-ilNKHJoG.css`: 5.46 kB, 1.20 kB gzip
- Browser smoke test:
  - `/dashboard/calculator` redirects to `/login` when unauthenticated.
  - Desktop viewport: no horizontal overflow.
  - Mobile 375px viewport: no horizontal overflow.
  - User-facing title remains `BudgetBuddy`.

## Notes And Limits

- Full authenticated calculator interaction still needs a real signed-in test account with seeded transactions, goals, debts, and recurring rules.
- Recurring cost analysis supports the frequencies currently represented in the app types: weekly, biweekly, semi-monthly, and monthly.
- Goal and debt planners are scenario estimates only. They do not create transactions, update balances, or persist saved scenarios.
- The Analytics lazy chunk remains comparatively large because of charting dependencies; this branch did not change Analytics.

