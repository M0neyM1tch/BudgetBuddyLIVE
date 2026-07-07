# BudgetBuddy V2 Phase 2 Recurring Engine - 2026-06-16

## Branch

- `phase-2/transactions`

## Source Review

- Pulled latest remote branch commit `d6155b6 quick-add-card-edit`.
- The user QoL changes were limited to quick-add/CSS polish and were preserved.
- Reviewed `Phase2-EdgeFunction.pdf`; accepted the RPC + Edge Function direction, but changed the cron design to avoid storing service-role secrets in migration SQL.

## Architecture Decision

The recurring transaction engine now has one database-owned processor:

- Manual user action: browser calls Supabase Edge Function `process-recurring`.
- Edge Function validates the signed-in user JWT and calls the RPC for that user only.
- Automatic daily run: `pg_cron` calls the RPC directly inside Postgres.

This avoids client-side backfilling, avoids non-atomic client insert/update loops, and avoids committing or storing an HTTP service-role key inside a migration.

## Database Changes

Applied migration `20260617014754_phase2_recurring_engine` to BudgetBuddy-V2:

- Enabled `pg_cron`.
- Added `public.process_due_recurring_rules(p_user_id uuid default null, p_through date default current_date)`.
- RPC behavior:
  - processes due active rules;
  - inserts recurring transactions idempotently using `(recurring_rule_id, transaction_date)`;
  - advances `next_run_date`;
  - caps each run at 100 occurrences;
  - returns created count, advanced rule count, paused rule count/names, limit flag, and through date.
- RPC security:
  - `SECURITY INVOKER`, not `SECURITY DEFINER`;
  - `authenticated` and `anon` cannot execute it directly;
  - `service_role` can execute it.
- Added trigger `trg_recurring_rules_next_run` so new recurring rules always start with `next_run_date = start_date`.
- Scheduled `process-recurring-daily` at `0 4 * * *` to run the RPC directly.

## Edge Function

Added and deployed `supabase/functions/process-recurring/index.ts`:

- Deployed to Supabase as `process-recurring`.
- `verify_jwt` is enabled.
- Validates the bearer token with Supabase Auth.
- Calls the RPC with the authenticated user's id only.
- Supports optional `through_date` in `YYYY-MM-DD` format.
- Returns a normalized JSON summary.
- Rejects unauthenticated requests.

## Frontend Changes

- Removed client-side recurring occurrence generation from `transactions.api.ts`.
- Replaced it with `supabase.functions.invoke('process-recurring')`.
- Updated React Query mutation to stop passing local recurring rule arrays.
- Extended `RecurringProcessResult` with paused-rule fields.
- Updated process result messaging to show generated, advanced, paused, and limited states.
- Simplified new recurring rule creation so `next_run_date` starts at `start_date`.
- Hid `Next due` for new recurring rules; it remains editable for existing rules.
- Added the RPC to `database.types.ts`.

## Verification

- Supabase migration applied successfully.
- Live DB verification confirmed:
  - RPC exists;
  - trigger exists;
  - cron job exists;
  - `authenticated` and `anon` cannot execute the RPC;
  - `service_role` can execute the RPC.
- SQL smoke: `select public.process_due_recurring_rules(null, current_date)` returned a valid zero-work result.
- Edge Function deployed successfully with `verify_jwt: true`.
- Unauthenticated POST to the Edge Function returned `401 Unauthorized`.
- Supabase advisors:
  - Security: leaked password protection remains disabled.
  - Performance: only expected unused-index notices on the new V2 DB.
- Local checks:
  - `npm.cmd run typecheck` passed.
  - `npm.cmd run lint` passed.
  - `npm.cmd run build` passed.

## Follow-Up

- Enable Supabase Auth leaked-password protection before launch.
- Full browser CRUD testing still needs an authenticated test user/session.
- After real recurring rules exist, run one manual UI process and inspect the resulting transactions/next due dates.
