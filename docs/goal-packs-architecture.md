# Goal Packs Architecture

Prepared: 2026-06-30

## Purpose

Goal Packs add a personalization layer over the existing BudgetBuddy V2 modules without replacing the app shell. The first implementation should be additive, feature-flagged, and reversible.

## Feature Flag

Goal Packs are controlled by:

```text
VITE_GOAL_PACKS_ENABLED=false
```

Code reads this through `env.features.goalPacksEnabled`. The default is off so current V2 behavior stays unchanged while the pivot is built.

## Module Boundary

Goal Pack code lives under:

```text
src/features/goalPacks/
```

Initial subfolders:

- `registry/` for product definitions and pack metadata
- `types/` for shared TypeScript types
- `schemas/` for validation
- `api/` for Supabase access
- `hooks/` for React Query wrappers

The feature must not import internal files from other feature folders. Shared calculations should move to `src/shared` only when they are genuinely cross-feature.

## Existing Module Roles

| Existing Module | Goal Packs Role |
| --- | --- |
| Dashboard | Dynamic active-priority renderer |
| Goals | Target and progress source of truth |
| Debts | Debt source of truth and payoff pressure |
| Transactions | Cash-flow proof engine |
| Analytics | Plan-change explanation |
| Calculator | Scenario simulator library |
| Onboarding | Priority discovery and first plan creation |
| Preferences | Change-priority and reminder controls |

## Data Model

Phase 1 extends `goals` and adds:

- `financial_priorities`
- `goal_plan_snapshots`
- `goal_actions`

The database stores user-specific state. The code registry stores product definitions. Do not store the full registry in the database.

## Supabase Security

- New public tables must have RLS enabled.
- Policies use `TO authenticated`.
- Ownership checks use `(select auth.uid()) = user_id`.
- Update policies require both `USING` and `WITH CHECK`.
- API queries should still filter by `user_id` for performance.
- No service-role or secret keys in frontend code.
- No authorization facts in `raw_user_meta_data`.

## First Vertical Slice

Build Emergency Fund first:

1. Onboarding creates the priority and goal.
2. Planning engine estimates buffer months and target date.
3. Dashboard renders active priority, confidence, and next action.
4. Completing an action creates a stored change the next visit can use.

Then add Debt Payoff, Major Purchase / Home Fund, and Custom Goal behavior.
