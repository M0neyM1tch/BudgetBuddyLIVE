# Product/UX Follow-Ups 2 — Implementation Report

Date: 2026-07-21
Repository: BudgBeacon (formerly BudgetBuddy)
Branch: `Product/UX-Follow-Ups-2`
Exact base commit: `5a7f61a3131b127dfc1f265ebfeb3583d8298d7c` (`updated roadmap added`)

## Result and verification boundary

The requested Phase 1 stabilization and Phase 2 Transactions UX work is implemented locally. After the bounded remediation pass, the React application typechecks, lints, passes all 69 automated tests, and produces a production build. The final remediation review found no remaining high- or medium-severity findings; the complete current verdict and recovery boundary are recorded in the remediation report.

Database execution is not yet verified. The earlier implementation task attempted to use Docker and its engine did not start; that is retained here only as historical context. The owner does not use Docker for this project, and Docker is neither required nor part of the workflow going forward. Database verification is deliberately deferred to a separately authorized, no-Docker restore rehearsal on an ordinary Free-plan Supabase project after a native PostgreSQL logical backup has passed integrity checks. The migrations were not executed, database assertions were not run, and generated database types were intentionally not changed. These are release blockers, not claimed passes.

No commit, push, pull request, merge, deployment, hosted migration, hosted data change, or production-site test occurred.

## Git preparation

Initial state:

- Local `main`: `5a7f61a3131b127dfc1f265ebfeb3583d8298d7c`.
- `origin/main`: `4e99770` (`Rebrand/budgbeacon (#3)`).
- Merge base: `4e99770`.
- Left/right count: local `main` was one commit ahead and zero behind.
- The only working-tree item was the permitted untracked task prompt, `docs/Codex-Task-Prompt-Product-UX-Follow-Ups-2-2026-07-21.md`; it was preserved without being rewritten.

Actions and results:

1. Inspected `git status --short --branch` and recent history.
2. Ran `git fetch origin --prune` successfully.
3. Switched to `main` without force.
4. Inspected `main`, `origin/main`, and their merge base before pulling.
5. Ran `git pull --ff-only origin main`; Git reported that local `main` was already up to date, preserving its local roadmap commit.
6. Confirmed the requested branch did not already exist.
7. Created and switched to the exact local branch `Product/UX-Follow-Ups-2` at `5a7f61a3131b127dfc1f265ebfeb3583d8298d7c`.

The external roadmap was read when available and was SHA-256-identical to the repository roadmap.

## Agent workflow and ownership

| Agent | Scope and ownership | Result |
| --- | --- | --- |
| Architect, read-only | Traced goal, debt, priority, onboarding, transaction, recurring, quick-add, dashboard, and cache flows; defined migration and file contracts. | Confirmed the issue required relational database synchronization and a server aggregate; identified invalidation gaps and non-overlapping ownership. No edits. |
| Docs Researcher, read-only | Current Supabase CLI, RLS, function grants, composite ownership constraints, testing, and type-generation guidance. | Confirmed invoker-first RPCs, `auth.uid()` ownership, exact grants, composite FKs, local reset/typegen workflow, and no hosted reset. No edits. |
| Supabase Engineer | Only the two CLI-created migrations; generated types only after a successful local reset. | Implemented relational debt/goal synchronization, exact-once allocation machinery, aggregates, retargeting, quick-add idempotency, compatibility RPCs, and lock ordering. Types were not changed because Docker reset was blocked. |
| Frontend Engineer — Goal Packs/Onboarding | Assigned Goal Pack dashboard/model/tests, analytics presentation, onboarding mapping, projected disclosure, and projected calculator/goal/debt surfaces. | Completed Phase 1B–1E and focused tests without changing database contracts. |
| Frontend Engineer — Transactions | Assigned Transactions API/hooks/types/schema/components/page/CSS/tests/utilities. | Completed Phase 2 aggregate, pagination, filters, quick-add, retarget, active-priority context, responsive ordering, and tests. |
| Parent integration | Public query boundaries, goal/debt invalidations, cross-layer integration, final checks, and this report. | Integrated non-overlapping work and ran final gates. |
| Reviewer, read-only | Complete static diff with emphasis on SQL correctness, RLS, idempotency, lock ordering, cleanup, frontend behavior, accessibility, and scope. | Actionable findings were corrected and re-reviewed. Final verdict: no remaining high/medium static findings. No edits. |

No Browser QA agent was used because no dynamically supplied non-production Cloudflare preview was available. Production was not opened or tested.

## Implemented behavior

### Phase 1A — authoritative debt-priority progress

Before:

- A debt payment changed `debts.current_balance_cents` while Goal Pack progress was read from `goals.current_amount_cents`.
- The debt relationship existed only in onboarding JSON.
- Mutation invalidations did not consistently reach the Goal Pack query family.

After:

- A same-owner relational `goals.linked_debt_id` connects a debt-payoff goal to its debt.
- Linked goal progress is derived and clamped as `target - remaining debt`, within `0..target`.
- Debt allocation, recurring allocation, edit/retarget, delete, direct debt balance change, pay-to-zero, onboarding retry, and permanent-debt cleanup use the database synchronization contract.
- Every transaction insert stores its exact clamped `allocation_applied_cents`, so later edits/deletes reverse the amount actually applied rather than the nominal transaction amount.
- Quick-add and recurring conflict retries apply balance effects only after an insert survives conflict resolution.
- Transaction, debt, goal, dashboard, Goal Pack, analytics, calculator, recurring-rule, and summary invalidations now reach their actual public query-key families.
- Archived targets cannot receive new allocations; permanent debt deletion preserves historical rows and the goal's last derived progress while unlinking the deleted debt.

### Phase 1B — Confidence removed from product presentation

- Removed the visible Confidence metric from Goal Pack dashboard and goal-aware analytics presentation.
- Removed remaining user-facing landing copy that promoted Confidence.
- Preserved `confidence_score`, calculation paths, planning fields, snapshot compatibility, onboarding arguments, and historical data.
- No Confidence column or action table was dropped.

### Phase 1C — contextual projected-result disclosures

- Added a shared, collapsed-by-default `ProjectedResultDisclosure` using the existing orange/yellow information-control language.
- The control uses a specific accessible label, `useId()` panel ID, `aria-expanded`, `aria-controls`, native keyboard/touch behavior, and an inline `role="note"` panel without focus trapping.
- Baseline copy: “Projection based on the amounts and timing currently in your plan. It is an estimate, not a guarantee.”
- Applied beside projected dates, required monthly values, payoff/interest/total-paid outputs, projected balances, and the extra-payment scenario.
- Removed repeated long-form assumption clutter without changing Terms or Privacy content.

### Phase 1D — meaningful recommended next move

- Renamed the module to `Recommended next move`.
- Removed Complete, Dismiss, checkbox, fake reward, and ornamental completion behavior.
- Routes contribution actions to validated transaction-prefill URLs; debt review to Debts; plan/target refinement to Goals.
- Unmapped actions render useful guidance without a fake CTA.
- Historical `goal_actions` rows and schema remain intact.

### Phase 1E — copy and onboarding hierarchy

- Renamed `Why the date moved` to `What shapes your target date` and default-opened its accessible details panel.
- Split debt onboarding into:
  - `Planned monthly payment` → goal `monthly_commitment_cents`.
  - `Required minimum payment` → debt `minimum_payment_cents`.
- Added explanatory copy and retained the database meaning of the minimum-payment field.

### Phase 2A–2C — scalable summaries, pagination, and filters

- Income, Expenses, Net, and result count come from an authenticated server aggregate over every matching transaction, independent of current page/page size.
- List and aggregate share search, kind, category, date, amount, and debt-filter semantics.
- Transfers contribute zero to Income, Expenses, and Net.
- Summary loading/error states do not display stale totals.
- Added `Transactions per page` with 10, 25, 50, and 100 choices; default 25; changes reset to page one and invalid pages clamp after data changes.
- Search and filters is an accessible disclosure: collapsed initially with no filters, initially open when filters are active, with the active count always visible.

### Phase 2D — active-priority quick add

- Replaced the built-in Coffee default with a 10,000-cent active-priority chip.
- Existing valid customized quick-add JSON is preserved; Reset explicitly restores the new dynamic default set.
- Strict target variants support active priority, explicit owned goal, or explicit owned debt; malformed, stale, archived, deleted, foreign, or unloaded targets cannot execute.
- Active priority resolves at execution time, so switching priorities does not silently fund the old target.
- Savings priorities use goal allocation; debt-payoff priorities use the validated relational debt link and debt allocation.
- No priority produces a disabled choose-priority path rather than an unallocated transfer.
- Label and amount remain editable without losing the target.
- Quick add uses a client operation UUID, an immediate in-memory submission guard, and retry-stable operation identity after ambiguous failure. The server returns an existing identical operation and rejects operation-ID reuse with different input.
- Allocated transaction edits can atomically move into, out of, or between valid targets.

### Phase 2E — responsive layout and context

- There is one Quick Add DOM instance.
- Source order places it immediately after Add Transaction and before summaries, filters, and activity on narrow mobile layouts.
- Desktop retains a compact active-priority context using existing Goal Pack/debt data and explains what the recorded contribution affects.
- The disclosure panel and transaction controls include narrow-screen overflow/touch accommodations.

## Migrations and database behavior

Both files were created by Supabase CLI 2.106.0 with `supabase migration new`. They are local files only and have not been applied to any local or hosted database.

### `20260721194230_product_ux_follow_ups_2_debt_goal_sync.sql`

Adds or changes:

- `debts_id_user_id_key` unique constraint.
- `goals.linked_debt_id`.
- `goals_linked_debt_only_for_debt_payoff_check`.
- Same-owner composite `goals_linked_debt_owner_fkey`, with `ON DELETE SET NULL (linked_debt_id)`.
- Partial `goals_linked_debt_id_idx`.
- `sync_debt_payoff_goal_progress()` and `goals_sync_debt_payoff_progress`.
- `sync_linked_goals_after_debt_change()` and `debts_sync_linked_goal_progress`.
- Replaced `create_goal_pack_onboarding_setup_v2(...)` under the existing public signature.

Backfill and compatibility:

- Backfills only debt-payoff goals containing a syntactically valid UUID in legacy onboarding JSON where the debt exists, is unarchived, and has the same owner.
- Does not guess by debt name, amount, or other ambiguous data.
- Preserves legacy JSON and writes both relational link and compatibility JSON for new/retried onboarding.
- Existing active relational links are preferred on retry.

### `20260721194410_product_ux_follow_ups_2_transaction_summary_and_retarget.sql`

Adds or changes:

- `recurring_rules_id_user_id_key`.
- `transactions.allocation_applied_cents` and non-negative check.
- `transactions.client_operation_id` and partial unique `(user_id, client_operation_id)` index.
- At-most-one-target transaction constraint.
- Same-owner composite recurring-rule FK with `ON DELETE SET NULL (recurring_rule_id)`.
- `sync_transaction_allocation()` BEFORE row trigger for validation, rule/debt/goal locking, exact UPDATE/DELETE reversal, and applied-delta calculation.
- `apply_inserted_transaction_allocation()` AFTER INSERT trigger so conflict-skipped rows cannot mutate balances.
- `lock_transaction_rules_before_mutation()` and statement triggers on transaction UPDATE/DELETE and recurring-rule DELETE to establish deterministic rule-before-transaction lock ordering.
- `update_transaction_and_retarget(...)` for authenticated atomic edits and allocation retargeting.
- `create_quick_add_transaction(...)` for authenticated client-operation idempotency.
- `get_transaction_summary(...)` for owner-scoped whole-cent filtered totals.
- Replaced existing goal/debt allocate, edit, delete, recurring-processing, and permanent-debt-delete RPC implementations under their established signatures so the central trigger applies effects once.

Cleanup and historical compatibility:

- Legacy rows with both `goal_id` and `debt_id` are conservatively unlinked from both targets instead of guessing which was authoritative; their transaction row and current balances are preserved.
- Invalid same-owner/target recurring references are set to null before adding the composite FK.
- Historical targeted rows receive `allocation_applied_cents = abs(amount_cents)`, matching the reversal information the old schema retained. Historical overpayments may have been clamped without recording the clamp, so exact historical applied deltas cannot be reconstructed; this is documented as a residual migration risk.
- New rows retain the exact clamped delta and are lossless for future edits/deletes.
- Permanent debt deletion pauses and unlinks rules, freezes linked-goal progress, clears historical debt targets, and then deletes the authenticated user's debt.

Security and grants:

- No RLS policy was removed, replaced, or weakened.
- Same-owner composite FKs provide integrity independently of browser input.
- User RPCs are `SECURITY INVOKER`, use fixed search paths, derive identity from `auth.uid()`, and rely on existing owner RLS.
- Trigger/helper function execution is revoked from `PUBLIC`, `anon`, and `authenticated`.
- New callable RPC signatures are revoked from `PUBLIC`/`anon` and granted only to `authenticated`.
- Existing allocation RPC grants remain authenticated-only.
- `process_due_recurring_rules(uuid,date)` retains its privileged scheduled design and is executable only by `service_role`.
- Rule, transaction, debt, and linked/explicit goal locks use consistent deterministic ordering. Direct supported recurring-rule deletes acquire the same ordered rule locks before FK-driven transaction updates.

## Files changed and why

Documentation:

- `docs/Codex-Task-Prompt-Product-UX-Follow-Ups-2-2026-07-21.md` — permitted untracked source prompt, preserved.
- `docs/Product-UX-Follow-Ups-2-Implementation-Report-2026-07-21.md` — this handoff.

Migrations:

- `supabase/migrations/20260721194230_product_ux_follow_ups_2_debt_goal_sync.sql` — relational link, synchronization, backfill, onboarding compatibility.
- `supabase/migrations/20260721194410_product_ux_follow_ups_2_transaction_summary_and_retarget.sql` — aggregate, exact-once allocations, retargeting, quick-add idempotency, compatibility RPCs, locking, cleanup.

Goal Pack, analytics, calculator, debts, goals, onboarding, and shared UI:

- `src/features/goalPacks/dashboard/GoalPackDashboard.tsx`, `.css`, `goalPackDashboardModel.ts`, `__tests__/goalPackDashboardModel.test.ts`, `__tests__/GoalPackDashboard.test.tsx` — Confidence removal, real next move, date-driver hierarchy, routes, and tests.
- `src/features/goalPacks/public.ts`, `index.ts` — dependency-free public Goal Pack query root/export.
- `src/features/analytics/components/GoalAwareAnalyticsPanel.tsx`, `pages/AnalyticsPage.css`, `utils/goal-aware-analytics.utils.ts`, `utils/__tests__/goal-aware-analytics.test.ts` — remove Confidence presentation and add contextual projected-output treatment while preserving calculations.
- `src/features/auth/components/LandingFeatures.tsx` — remove remaining visible Confidence product copy.
- `src/shared/components/ui/ProjectedResultDisclosure.tsx`, `.css`, `.test.tsx` — reusable accessible disclosure and focused behavior/ARIA tests.
- `src/features/calculator/components/GoalPlanSimulator.tsx`, `pages/CalculatorPage.css` — disclosures beside projected plan/scenario outputs.
- `src/features/goals/components/GoalTimelineProjector.tsx`, `pages/GoalsPage.css`, `hooks/useGoals.ts` — disclosure presentation and complete Goal Pack/recurring query invalidation.
- `src/features/debts/components/DebtPayoffPlanner.tsx`, `pages/DebtsPage.css`, `hooks/useDebts.ts` — disclosure presentation and complete goal/Goal Pack/recurring invalidation.
- `src/features/onboarding/components/GoalPackOnboardingWizard.tsx`, `utils/goalPackOnboarding.ts`, `utils/__tests__/goalPackOnboarding.test.ts` — planned-versus-required debt payment copy, mapping, and tests.

Transactions:

- `src/features/transactions/api/transactions.api.ts`, `.test.ts` — summary, idempotent quick-add, atomic retarget RPC adapters and API tests.
- `src/features/transactions/hooks/useTransactions.ts`, `useTransactionFilters.ts` — summary/mutation hooks, operation retry semantics, pagination/filter behavior, and broad invalidation.
- `src/features/transactions/types/transactions.types.ts`, `schemas/transactions.schema.ts`, `schemas/__tests__/transaction-filters.test.ts` — target types, filter/quick-add validation, and tests.
- `src/features/transactions/constants/categories.ts` — dynamic active-priority built-in default.
- `src/features/transactions/components/QuickAddCards.tsx`, `QuickAddChipModal.tsx`, `TransactionFilters.tsx`, `TransactionModal.tsx`, `TransactionSummaryBar.tsx`, `ActivePriorityContext.tsx` — executable target handling, editing, disclosure, summary states, and desktop context.
- `src/features/transactions/components/__tests__/QuickAddCards.test.tsx`, `TransactionFilters.test.tsx`, `TransactionSummaryBar.test.tsx` — focused component coverage.
- `src/features/transactions/pages/TransactionsPage.tsx`, `.css` — validated URL prefill, single mobile-first Quick Add instance, page-size control/clamp, summary/filter/list layout, and responsive behavior.
- `src/features/transactions/utils/quickAddTarget.ts`, `.test.ts`, `pagination.ts`, `.test.ts` — pure validated target resolution and page clamping with tests.
- `src/features/transactions/public.ts`, `index.ts` — dependency-free public transaction query root/export.

`src/types/database.types.ts` was deliberately not changed. The approved workflow requires generation only after a successful local reset.

## Validation evidence

### Passed

- `npx.cmd supabase --version` — passed; `2.106.0`.
- Supabase CLI help for the CLI, migration creation, reset, and type generation — passed.
- Both `supabase migration new ...` commands — passed and produced the two timestamps above.
- `npm.cmd run typecheck` — passed, exit 0.
- `npm.cmd run lint` — passed, exit 0.
- `npm.cmd run test` — passed: 18 test files, 62 tests.
- `npm.cmd run build` — passed: Vite 8.0.16, 2,660 modules transformed.
- `npm.cmd audit --omit=dev --audit-level=high` — passed: 0 vulnerabilities in the production dependency tree.
- `git diff --check` — passed after the final SQL change.
- Static SQL function-marker/delimiter and trailing-whitespace checks — passed.
- Static secret/endpoint scan of the task migrations — passed.
- Final changed/untracked file inspection found no environment file, credential file, build output, dependency/lockfile edit, marketing tracker, service worker/PWA work, or unrelated roadmap edit.

### Failed, blocked, or deliberately deferred

- `npm.cmd audit --audit-level=high` — failed on one high-severity development-tree `brace-expansion` advisory (`3.0.0–5.0.6`, GHSA-3jxr-9vmj-r5cp). No dependency was added by this task, and no unapproved `npm audit fix` or lockfile rewrite was performed.
- Historical only: the earlier task's `npx.cmd supabase status` / `supabase start` attempt failed because the Docker Desktop engine was unavailable. Docker will not be retried, installed, required, or recommended for this project.
- Local-stack reset and local migration-list commands were not rerun because the approved workflow is hosted Supabase on the Free plan with no Docker.
- Database integration assertions — deliberately not run in this task. They require the separately authorized restore-rehearsal project and the rollback-only SQL suite prepared by the remediation task.
- Hosted type generation — deliberately not run. Types may be generated only from the restore target after backup restoration and candidate migration verification pass.

The first sandboxed production-build attempt failed with a local filesystem `EPERM` while Node resolved `C:\Users\Mitch`; the same required build was rerun with approved local execution and passed. This was an execution-environment issue, not a source build failure.

## Reviewer findings and resolutions

The Reviewer identified actionable issues across iterative static passes. They were resolved before the final verdict:

- Removed a remaining visible Confidence reference outside the initial dashboard/analytics edit.
- Extended disclosures to projected payoff, total-paid/interest, projected-balance, and extra-payment outputs and improved narrow-screen clipping behavior.
- Tightened active-priority resolution, saved-preference loading, edited labels, public query boundaries, invalidations, and quick-add operation identity/double-submit behavior.
- Replaced unsafe transaction cleanup guesses with conservative unlinking.
- Added exact applied-delta metadata, direct-write trigger coverage, same-owner recurring FK protection, archived-target checks, and strict grants.
- Prevented quick-add operation-ID reuse with changed input.
- Moved INSERT balance effects to AFTER INSERT so `ON CONFLICT DO NOTHING` retries cannot change balances without creating a row.
- Removed retarget pre-lock inversions and established deterministic recurring-rule, transaction, debt, and goal lock ordering.
- Added statement-level serialization before transaction UPDATE/DELETE tuple locks and before recurring-rule DELETE tuple locks.
- Removed the historical recurring-transaction delete check that incorrectly compared old transaction targets to a rule's current target.

That was the original implementation review. The later remediation review additionally identified and resolved fresh unallocated-transfer writes, same-owner recurring-occurrence poisoning, and transient prefill-query failure handling. Its targeted second pass found no remaining high- or medium-severity findings. The no-Docker backup/restore rehearsal, generated types from the verified restore target, and database integration tests remain unverified gates.

## Outstanding risks and manual checks

Release blockers:

1. In a separately authorized task, use compatible native PostgreSQL 17 client tools to create, checksum, inspect, and restore a manual logical production backup outside the repository. Docker is not part of this workflow.
2. Prove the exact backup scope and separately handle every excluded service or managed schema. A logical dump must not be treated as a complete Supabase-project backup without evidence for Auth, roles/grants, migration history, modified `auth`/`storage` objects, Vault/encryption, and platform configuration.
3. Restore only to an explicitly approved ordinary Free project, neutralize outbound behavior, apply the candidate migrations there, and run the prepared rollback-only transactional assertions.
4. Generate and review `src/types/database.types.ts` from the verified restore target; remove the narrow frontend RPC typing workaround if generated overloads make it unnecessary.
5. Resolve the existing hosted migration-ledger mismatch for `20260707193257_phase3_live_permission_hardening.sql` through a separately authorized and rehearsed history repair before any production migration application.
6. Decide how to remediate the development-only `brace-expansion` audit finding through a separately reviewed dependency/lockfile change.

Manual/preview gates still pending:

- Desktop around 1440px.
- Narrow mobile around 390px.
- Keyboard-only disclosure, quick-add edit, filters, and pagination.
- Dataset larger than 100 transactions.
- Active savings priority, active debt priority, and no active priority.
- Dynamically supplied non-production Cloudflare branch preview QA.
- Physical iPhone and Android testing.

No manual or physical-device result is claimed.

## Future authorized release sequence

1. Complete the separately authorized native-client logical backup, integrity validation, restore rehearsal, aggregate/schema/grant equivalence checks, restored-copy candidate migration run, and rollback-only SQL verification. Do not use Docker.
2. Generate types from the verified restored project, review the generated types/diff, and rerun TypeScript, lint, full tests, build, both audits, `git diff --check`, and static review.
3. Rehearse and then separately authorize the known hosted migration-ledger repair without re-executing SQL whose effects are already fully present.
4. With separate authorization, create a commit and push a review branch; no such action is part of this task.
5. Validate a non-production preview/staging environment with appropriately migrated non-production data. Do not use production for QA.
6. Complete desktop/mobile/keyboard, >100-row, active-savings, active-debt, no-priority, and physical iPhone/Android gates.
7. With a separate explicit hosted-database approval, back up/verify recovery readiness and apply the two migrations in timestamp order.
8. With a separate deployment approval, deploy the matching frontend only after the required RPC/schema objects exist, then monitor errors, aggregates, allocation idempotency, and debt/goal consistency.

## Recovery plan (not executed)

Code recovery:

- Revert the future implementation commit through a new forward commit, or temporarily disable the new UI entry points while retaining compatible database objects.
- Do not deploy the frontend against a database missing the new summary/quick-add/retarget RPCs.

Database recovery:

- Take a verified backup before an authorized hosted application.
- Prefer a new forward recovery migration that replaces affected functions/triggers while preserving additive columns, relationship metadata, historical transaction rows, and `allocation_applied_cents`.
- Do not casually drop `linked_debt_id`, client operation IDs, allocation deltas, or constraints after new data depends on them.
- If allocation behavior must be paused, revoke the affected callable RPC grants or replace them with safe failing implementations in an authorized forward migration, then repair and re-enable after reconciliation.
- Reconcile debt balance, linked-goal progress, and transaction applied deltas with owner-scoped scripts in a controlled non-production rehearsal before any production repair.
- A destructive down migration was intentionally not created because it could discard new relational and reversal information.

## Authorization confirmation

- No commit.
- No push.
- No pull request.
- No merge.
- No Cloudflare or other deployment.
- No hosted Supabase migration, data, Auth, RLS, function, secret, or configuration mutation.
- No production `budg.ca` testing.
- No environment file or credential inspection.
