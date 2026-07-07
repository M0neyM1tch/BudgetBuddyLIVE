# BudgetBuddy V2 Phase 2 Transactions Polish - 2026-06-16

## Branch

- `phase-2/transactions`

## Summary

This pass tightens the Transactions tab before moving on to the next feature. It fixes optional descriptions, adds real recurring-rule creation from the transaction modal, introduces explicit client-side recurring processing, makes quick-add cards customizable one-click actions, and applies the required Supabase schema migration to BudgetBuddy-V2.

## Frontend Changes

- Made transaction, recurring-rule, and quick-add descriptions optional in Zod schemas.
- Added recurring fields to `TransactionModal`: frequency, rule start date, and rule notes.
- When a new transaction is marked recurring, `TransactionsPage` now creates a corresponding `recurring_rules` row and links the first transaction via `recurring_rule_id`.
- Added rollback cleanup if rule creation succeeds but the first transaction insert fails.
- Added explicit `Process due` recurring-rule processing:
  - bounded to 100 generated transactions per run;
  - skips existing rule/date transactions;
  - advances each processed rule's `next_run_date`;
  - avoids hidden page-load write effects.
- Added `placeholderData: keepPreviousData` to `useTransactions` to prevent list flicker/disappearance during URL-filter query-key changes.
- Slimmed transaction categories to Pay, Rent/housing, Food, Savings, Investment, Subscriptions, and Transportation.
- Changed quick-add cards to one-click transaction creation.
- Added `QuickAddChipModal` so users can add, edit, and delete quick-add cards.
- Added `DeleteRecurringRuleModal` and removed native `window.confirm()` from recurring rule deletes.
- Added empty-description display fallbacks to category labels in rows and delete modals.
- Fixed recurring-rule action button wrapping with non-wrapping action layout and clearer side-card structure.

## Supabase Changes

Applied migration `20260616014633_phase2_transactions_polish` to project `BudgetBuddy-V2` (`cebykmbauxbucvforwzj`):

- Relaxed `transactions.description` and `recurring_rules.description` checks to allow blank strings up to 120 chars.
- Added `recurring_rules.notes text`.
- Added `recurring_rules_notes_check` with a 500-character cap.
- Added unique partial index `transactions_recurring_rule_date_key` on `(recurring_rule_id, transaction_date)` where `recurring_rule_id is not null` to support idempotent recurring backfills.
- Updated `src/types/database.types.ts` for `recurring_rules.notes`.

## Verification

- `npm.cmd run typecheck` passed.
- `npm.cmd run lint` passed.
- `npm.cmd run build` passed.
- Browser smoke:
  - `/dashboard/transactions` redirects to `/login` when unauthenticated.
  - Sign-in form shows email/password only.
  - 375px mobile login route has no horizontal overflow.
- Supabase migration history confirms `20260616014633_phase2_transactions_polish`.
- Supabase schema metadata confirms:
  - `recurring_rules.notes` exists;
  - `transactions_description_check` exists;
  - `recurring_rules_notes_check` exists;
  - `transactions_recurring_rule_date_key` exists.
- Supabase advisors:
  - Security: only warning is leaked-password protection disabled.
  - Performance: unused-index info notices only, expected for a new/low-traffic V2 DB.

## Remaining Notes

- Client-side recurring processing is a pragmatic Phase 2 bridge, not the final launch-grade recurring engine. A server-side RPC or Edge Function should still replace it before public scale so generation and rule advancement can be fully transactional.
- Auth leaked-password protection should be enabled in Supabase Auth before production launch.
- Full transaction CRUD browser testing was not performed because the browser session was unauthenticated and I did not create real test users or data in Supabase without explicit approval.
