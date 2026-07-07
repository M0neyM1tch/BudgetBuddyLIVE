# BudgetBuddy V2 Phase 2 Hard Delete for Goals and Debts

Date: 2026-06-18
Branch: `phase-2/delete-goals-debts`
Project: `BudgetBuddy-V2` Supabase project `cebykmbauxbucvforwzj`

## Summary

Added a permanent delete path for goals and debts while keeping archive as the reversible default. Historical transactions are preserved and unlinked from deleted records instead of being cascade-deleted.

## Frontend Changes

- Renamed existing archive confirmation components:
  - `DeleteGoalModal` -> `ArchiveGoalModal`
  - `DeleteDebtModal` -> `ArchiveDebtModal`
- Added new `DeleteGoalModal` and `DeleteDebtModal` components for irreversible deletion.
- Permanent delete modals require typing `delete` before the confirm button enables.
- Updated goal and debt cards to show separate Archive and Delete actions.
- Archived goals/debts now also expose a Delete action alongside Restore.
- Added API functions:
  - `deleteGoalPermanently`
  - `deleteDebtPermanently`
- Added React Query hooks:
  - `useDeleteGoalPermanently`
  - `useDeleteDebtPermanently`
- Invalidates goals/debts, transactions, recurring rules, dashboard, and analytics surfaces after hard delete.

## Supabase Changes

Migration added:

- `delete_goal_permanently(p_goal_id uuid)`
  - `SECURITY INVOKER`
  - Requires `auth.uid()`
  - Verifies ownership
  - Sets linked `transactions.goal_id` to `null`
  - Deletes the goal row
- `delete_debt_permanently(p_debt_id uuid)`
  - `SECURITY INVOKER`
  - Requires `auth.uid()`
  - Verifies ownership
  - Sets linked `transactions.debt_id` to `null`
  - Sets linked `recurring_rules.debt_id` to `null`
  - Pauses linked recurring rules so deleted debts do not keep generating orphan payments
  - Deletes the debt row

## Implementation Notes

- `recurring_rules.goal_id` does not exist in the current schema, so goal hard delete only unlinks goal-linked transactions.
- Debt recurring rules are paused on hard delete. This intentionally improves on the draft plan, because leaving those rules active after nulling `debt_id` would allow future orphan `debt_payment` transfers.
- The RPCs are `SECURITY INVOKER`, not `SECURITY DEFINER`, so caller authorization and RLS remain part of the database boundary.

## Validation

- Applied migration to `BudgetBuddy-V2`: success.
- Regenerated `src/types/database.types.ts` from the live V2 Supabase schema.
- Verified live DB:
  - `delete_goal_permanently` and `delete_debt_permanently` exist.
  - Both functions are `SECURITY INVOKER`.
  - `authenticated` has execute permission.
  - `anon` and `PUBLIC` do not have execute permission.
- Supabase security advisor checked:
  - No new RLS/function security issue from this migration.
  - Existing warning remains: leaked password protection is disabled.
- Supabase performance advisor checked:
  - Existing low-traffic unused-index notices remain for transaction/debt/goal indexes.
- `npm run typecheck`: pass.
- `npm run lint`: pass.
- `npm run build`: pass.

## Follow-Up

- Enable Supabase Auth leaked password protection before launch.
- Browser smoke testing still requires local Vite env vars in this clone.
