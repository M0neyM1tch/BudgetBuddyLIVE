# BudgetBuddy V2 Phase 2 Debt Payment Sync

Date: 2026-06-18
Branch: `phase-2/debts`
Project: `BudgetBuddy-V2` Supabase project `cebykmbauxbucvforwzj`

## Summary

Implemented debt-payment transaction automation so debt payments are first-class transaction records and debt balances stay synchronized through database-backed atomic operations.

## Frontend Changes

- Added `debt_payment` as a transaction category under a new `Debt` group.
- Added `debt_id` support to transaction filters, transaction drafts, recurring rule drafts, schemas, and types.
- Routed debt-linked transaction creates through `allocate_debt_payment`.
- Routed debt-linked transaction edits through `update_debt_payment_transaction`.
- Expanded React Query invalidation so transaction mutations refresh debts and goals when linked balances can change.
- Updated transaction rows and recurring rule cards to display linked debt names.
- Added debt selectors to `TransactionModal` and `RecurringRuleModal`.
- Preserved recurring debt payment setup from the transaction modal, including frequency and first occurrence.
- Added debt payment history to debt cards with edit/delete actions.
- Reused the styled delete transaction modal for debt payment deletion.

## Supabase Changes

Migration added:

- `recurring_rules.debt_id` foreign key to `public.debts(id)` with `on delete set null`.
- Partial index `recurring_rules_debt_id_idx`.
- Hardened `transactions_insert_own` / `transactions_update_own` policies so linked `goal_id` and `debt_id` must belong to the authenticated user.
- Hardened `recurring_rules_insert_own` / `recurring_rules_update_own` policies so linked `debt_id` must belong to the authenticated user.
- New RPC `allocate_debt_payment(...)`, security invoker.
- New RPC `update_debt_payment_transaction(...)`, security invoker.
- Updated `delete_transaction_and_rebalance_goal(...)` so deleting debt payments restores debt balance.
- Updated `process_due_recurring_rules(...)` so recurring debt rules create `transfer` / `debt_payment` transactions and decrement debt balances only when a new recurring transaction is actually inserted.
- Recurring rules linked to archived/missing debts are paused instead of continuing to generate payments.

Edge Function:

- Redeployed `process-recurring` to the V2 Supabase project.
- The Edge Function remains the authenticated user boundary and delegates to the hardened recurring RPC.

## Validation

- Applied migration to `BudgetBuddy-V2`: success.
- Regenerated `src/types/database.types.ts` from the live V2 Supabase schema.
- Verified live DB:
  - `recurring_rules.debt_id` exists.
  - `allocate_debt_payment`, `update_debt_payment_transaction`, `delete_transaction_and_rebalance_goal`, and `process_due_recurring_rules` exist.
  - Expected transaction and recurring rule policies exist.
- Supabase Edge Function logs show recent `process-recurring` requests returning `200`.
- `npm run typecheck`: pass.
- `npm run lint`: pass.
- `npm run build`: pass.

## Notes

- Local browser smoke testing was blocked in this clone because `VITE_SUPABASE_URL` was not present, causing the app to intentionally abort before rendering.
- Supabase security advisor still reports `auth_leaked_password_protection` disabled. Enable leaked password protection before launch.
- Supabase performance advisor reports unused indexes for new/low-traffic indexes, including debt/goal transaction indexes. This is expected immediately after feature work and should be reviewed after real usage.
