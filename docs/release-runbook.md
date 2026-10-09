# BudgBeacon release runbook

Use [PR #4](https://github.com/M0neyM1tch/BudgetBuddyLIVE/pull/4) for this stabilization release's exact commit, checks, and deployment outcome. Use [project status](project-status.md) for environment identities and known limits. Promote in this order: **database, compatible Edge Function, frontend**.

## Release manifest

Migration files live in `supabase/migrations/`. These checked SHA-256 values identify the reviewed release. Never edit an already-applied migration; create an additive migration through the Supabase CLI and rehearse it.

| Migration | SHA-256 | Purpose |
| --- | --- | --- |
| `20260707193257_phase3_live_permission_hardening.sql` | `D5EE4A6743B85C46E337BD6B1F87ACC58CAE0ADEC5E9872ACEA90A91173FA30B` | Production history reconciliation only after proving existing effects; do not replay this SQL. |
| `20260721194230_product_ux_follow_ups_2_debt_goal_sync.sql` | `678834847D83DB8F3607B13AD49D9DFA51935143C54D268F6658692F9B964B40` | Debt/goal relationship and onboarding contract. |
| `20260721194320_product_ux_follow_ups_2_onboarding_json_parent_fix.sql` | `99ECE84EA43F03D6E2F7414D81FE457E448D5FA3C9004AE235A497FA0CCC6CE8` | Onboarding JSON correction. |
| `20260721194410_product_ux_follow_ups_2_transaction_summary_and_retarget.sql` | `D7C24CE992FC6D9593E1D8DC5CECC14425CFE0666D07BE50F7B677A9B579F82D` | Allocation integrity, retargeting, summaries, and recurring consistency. |
| `20261009005910_atomic_onboarding_workspace_reset.sql` | `9ABA44ECB770E6BBBD40361BCC7BAE2A9C94049407C35A8B271BCE23877805B6` | One owner-scoped transactional reset RPC. |
| `20261009010714_future_function_default_privileges.sql` | `D412D13FA09F981FB3C758ED6F3D64DECCBF48DCDE73CA21E952AB1C649CDE7E` | Remove global `PUBLIC EXECUTE` for future `postgres` functions. |
| `20261009011841_future_table_default_privileges.sql` | `A7463E7844FED94605C0340B0B919D2A6A39D462037FCD099A8786307FA6E6CC` | Remove residual API-role defaults for future `postgres` public tables. |

The transaction hash beginning `E7CF5834` in older reports is obsolete. Both default corrections leave existing object ACLs unchanged. A schema-level revoke cannot subtract a global function default; PostgreSQL documents this [default-privilege behavior](https://www.postgresql.org/docs/17/sql-alterdefaultprivileges.html).

Production and rehearsal have all 29 reviewed versions. The complete production delta passed rollback rehearsal, then committed with independent postchecks. Signed-in preview QA passed. Use PR #4 for the final frontend deployment outcome; a database or preview pass alone is not production frontend verification.

## 1. Prepare and verify the candidate

1. Record the exact source commit and target branch. Preserve local-only work and inspect the complete diff.
2. Run clean install, typecheck, lint, tests, build, dependency audit, and diff checks. Obtain static review and green commit-specific CI. A Pages preview check alone is not the CI suite.
3. Independently verify production/rehearsal project identities, exact migration ledgers, relevant schema/functions, RLS/policies, grants/defaults, triggers, indexes, cron, and aggregate invariants. Compare metadata and aggregates without collecting user records or secrets.
4. Define the accepted data and recovery scope. The current user explicitly identifies production records as disposable tests and declines local backup/encryption for this release; preserve them unless a reviewed migration requires a bounded change. Before real-user data or an expanded scope, establish and test recovery using the [backup/restore runbook](Product-UX-Follow-Ups-2-Free-Plan-Backup-and-Restore-Runbook-2026-07-21.md) and current provider capabilities.

The validated candidate passed Node 22.13.0 typecheck/lint/41 test files / 176 tests/build; the unchanged dependency lockfile has a full audit with zero vulnerabilities. Automated tests cover selected-month query bounds and loading/error behavior, incomplete-history rejection, resolved quick-add labels, unique modal names, and explicit-only route-error recovery. Exact-commit CI, Cloudflare deployment, rehearsal-backend verification, and signed-in preview QA passed for `453c0a1`. The PR preserves earlier normal-flow evidence and the checks for later fixes separately.

## 2. Rehearse the exact database delta

1. Compare each local migration version with the verified target ledger. Investigate unexpected versions or effects. Reconcile a missing ledger entry only after proving the historical SQL's actual effects; do not silently replay or overwrite history.
2. Review all additive changes and their ownership/authorization contracts. New client RPCs require authenticated server identity, explicit grants, and owner-isolation tests. Account for locks, trigger ordering, backfills, and old-client compatibility.
3. Rehearse schema/security and financial behavior against rehearsal with synthetic fixtures. Verify rollback cleanup independently. Check late-failure atomicity and concurrency where the change requires them.
4. Recheck the transaction migration's six fail-fast categories immediately before promotion: dual targets; invalid goal ownership; invalid debt ownership; invalid recurring-debt ownership; active targetless transfers; and invalid transaction/rule relationships.

For this release, both future-default corrections and reset passed rollback tests, and the schema/security and allocation suites passed. Same-owner overlapping resets returned `55P03`; an independent owner could reset while the first owner held its lock. The lock coordinates reset calls only; ordinary writes may remain or arrive after reset.

The production delta passed rollback rehearsal, then the identical reviewed transaction body committed. Independent postchecks confirmed its exact 29-version ledger, canonical source metadata, schema/security/default contracts, and preserved aggregate counts. The existing production frontend still loaded with its authenticated session after the database update.

## 3. Execute migrations with traceable history

Prefer the authenticated Supabase CLI repair, dry-run, and apply workflow against an independently verified project. Do not infer the target from an old local link. Keep credentials out of command arguments, repository files, and reports.

This stabilization session used a separately reviewed SQL-editor fallback because CLI authentication was unavailable. The deterministic batch uses exact migration files and the pinned official CLI 2.120.0 parser for history statement arrays. It requires the expected role, exact starting ledger, schema/data/security guards, and one atomic transaction for the complete delta plus ledger records. The already-effective hardening version is recorded without executing its SQL.

If this fallback is needed again, independently review the generated batch and its exact rollback counterpart. Preserve canonical UTF-8/LF statement bytes through the editor, verify decoded statements and final function/history hashes before commit, and pin deparsed metadata fingerprints to a fixed `search_path`. Browser editor line-ending conversion and context-dependent policy rendering were explicitly handled in this rehearsal. Do not call a dashboard execution a CLI dry-run.

After actual commit, independently verify exact versions, canonical statement/function parity, schema constraints and indexes, RLS/grants/defaults, aggregate invariants, and preserved scheduling. Do not advance the frontend after a database error. Never replace production rows with rehearsal rows.

## 4. Validate and activate the application

1. Confirm Cloudflare `budgetbuddy`, active `budg.ca`, GitHub `main`, build `npm run build`, output `dist`, and the current runtime. Verify the rebuilt preview actually targets rehearsal; configuration changes do not update old static deployments.
2. Compare the deployed Edge source and JWT/configuration behavior with the candidate. Retain the existing deployment when compatible. Both environments' reviewed source parity, anonymous rejection, and CORS checks passed; signed-in recurring processing passed in rehearsal. Owner isolation is covered by the passed SQL tests.
3. Finish signed-in preview checks for onboarding/reset, dashboard, transaction creation/allocation/editing/deletion, summaries/filtering, goals/debts, recurring processing, refresh/session handling, and logout. Record SQL owner-isolation and automated history/failure-state evidence alongside the browser results. Remove only fixtures attributable to the test.
4. For this release, the user explicitly waived physical iPhone/Android checks in favor of browser QA. Record the browser results and that accepted limitation; do not claim physical testing.
5. With database readiness, Edge compatibility, review, and final CI confirmed, merge/deploy the reviewed frontend. The canonical `main` branch triggers production automatically. Verify the commit actually serving `budg.ca` and record owner-scoped smoke results.

Never record credentials, session data, private financial values, or dynamically supplied preview addresses in release artifacts.

A tab opened before a deployment can still reference a removed lazy asset. The recovery page explains the update/connection possibility and offers an explicit reload, warning that unsaved changes may be discarded. It never reloads automatically. Check normal navigation after each deployment; an old document cannot acquire newly deployed error handling until it is refreshed.

## Stop and recovery

Stop activation on an unexpected target, ledger/schema delta, failed invariant or check, weaker permissions, incompatible Edge behavior, or mismatched deployed commit. Investigate and correct the cause; do not bypass a failed guard.

- Frontend regression: restore the last verified Pages deployment or deploy a reviewed revert. This does not undo database changes.
- Edge regression: restore the previous verified compatible bundle/configuration.
- Database regression: stop activation and prefer a reviewed forward fix when data remains intact. No backup/restore guarantee exists for this accepted test-data release, and its scope does not authorize an unrequested wipe. A Git revert or ledger repair cannot restore data.

Close the PR release record with the final commit, migration execution and postchecks, accepted data scope, CI/review, browser results, deployed commit, smoke results, and known limitations. Update the checkpoint in [project status](project-status.md), then start new work from canonical `main`.
