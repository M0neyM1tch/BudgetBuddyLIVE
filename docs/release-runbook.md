# BudgBeacon release runbook

Updated: 2026-10-08. Execution state: **not released by this audit**. See [project status](project-status.md) for current blockers.

This procedure promotes the existing Product/UX Follow-Ups 2 candidate after its prerequisites are proved. The October audit identified non-atomic clean-slate resets, silently truncated financial histories, and future-function/table default-privilege gaps. Local history safeguards now reject incomplete same-response inputs; verify those against rehearsal, and apply the rehearsed reset and future-default corrections before declaring the free MVP stable. The frozen three-candidate delta below is no longer the full release. Historical reports provide evidence and context; verify live platform state before executing changes. Keep credentials, user records, backup contents, and private preview addresses out of release records.

## Frozen migration manifest

These SHA-256 values were checked against repository files on 2026-10-08 and match the August 26 preflight. Migration files live under `supabase/migrations/`.

| Version and file | SHA-256 | Role |
| --- | --- | --- |
| `20260707193257_phase3_live_permission_hardening.sql` | `D5EE4A6743B85C46E337BD6B1F87ACC58CAE0ADEC5E9872ACEA90A91173FA30B` | Missing from the current production ledger. Inspected existing grants are restricted; its schema-level revoke does not remove the global future-function default. |
| `20260721194230_product_ux_follow_ups_2_debt_goal_sync.sql` | `678834847D83DB8F3607B13AD49D9DFA51935143C54D268F6658692F9B964B40` | Candidate 1: linked debt/goal synchronization and onboarding contract. |
| `20260721194320_product_ux_follow_ups_2_onboarding_json_parent_fix.sql` | `99ECE84EA43F03D6E2F7414D81FE457E448D5FA3C9004AE235A497FA0CCC6CE8` | Candidate 2: onboarding JSON parent correction. |
| `20260721194410_product_ux_follow_ups_2_transaction_summary_and_retarget.sql` | `D7C24CE992FC6D9593E1D8DC5CECC14425CFE0666D07BE50F7B677A9B579F82D` | Candidate 3: transaction allocation, retargeting, summaries, and recurring consistency. |

The cumulative rehearsal report sometimes calls the final transaction migration "candidate 2" because the onboarding correction was inserted during that work. Use version identifiers, not those historical labels. The old transaction hash beginning `E7CF5834` predates its parser correction and is obsolete.

Do not edit a migration already applied in rehearsal or production. If a correction is necessary, create an additive migration through the established Supabase CLI workflow, rehearse it, and update this manifest and release scope explicitly.

### Additive repairs prepared locally

| Version and file | SHA-256 | Current evidence |
| --- | --- | --- |
| `20261009005910_atomic_onboarding_workspace_reset.sql` | `9ABA44ECB770E6BBBD40361BCC7BAE2A9C94049407C35A8B271BCE23877805B6` | CLI-generated and unapplied. Owner-isolation, preference-preservation, and late-failure rollback suite passed with independent cleanup confirmation. |
| `20261009010714_future_function_default_privileges.sql` | `D412D13FA09F981FB3C758ED6F3D64DECCBF48DCDE73CA21E952AB1C649CDE7E` | CLI-generated and unapplied. Its global revoke passed the rollback-only grant rehearsal described below. |
| `20261009011841_future_table_default_privileges.sql` | `A7463E7844FED94605C0340B0B919D2A6A39D462037FCD099A8786307FA6E6CC` | CLI-generated and unapplied. Its public-schema table-default revoke passed rollback rehearsal; existing relation ACLs remained unchanged. |

The expanded frontend passed typecheck, lint, 37 test files / 150 tests, and build on Node 22.13.0. All three additive SQL contracts passed rollback rehearsal. Separate-session concurrency checks, persistent migration application, rebuilt-preview QA, and commit-specific hosted CI remain pending.

## 1. Establish the release identity and data scope

1. Refresh GitHub references without discarding local work. Record the release branch, exact commit, clean/expected diff, local-only commits, and target branch. Reconcile the local `main` and candidate histories before merging.
2. Run `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm audit --omit=dev`, and `git diff --check`. Review any advisory by installed version and actual exposure; remediate blocking findings. Record checks actually run against the final dependency lockfile and source.
3. Obtain final static review and green GitHub Actions for that commit. Preview deployment success alone does not run the CI gate.
4. Independently identify production and rehearsal in Supabase. Compare migration ledgers, schema, function signatures/security, grants/default privileges, RLS/policies, aggregate data counts, indexes, triggers, cron, and relevant platform settings. Query metadata and aggregate facts rather than user rows.
5. Record the current user decision: the three production accounts and 232 transactions are disposable test records, and the user wants no local backup or drive encryption. Recovery is not a prerequisite for this bounded test-data release. This is not an instruction to erase rows: preserve existing records except for reviewed migration effects. Before real-user data or a materially expanded scope is included, establish appropriate recovery using the [backup/restore runbook](Product-UX-Follow-Ups-2-Free-Plan-Backup-and-Restore-Runbook-2026-07-21.md) and current supported provider guidance.

Current checkpoint: production is healthy on PostgreSQL 17.6. Its Free-plan backup UI provides no accessible managed backup or PITR point. The latest explicit test-data decision supersedes the earlier manual-backup plan; no recovery point is claimed. The rehearsal project was resumed and is online on PostgreSQL 17.6; its current ledger and candidate schema metadata are verified below, while semantic comparison and QA remain pending. Production checks so far were read-only metadata and aggregates, not migration or fixture execution.

The PostgreSQL 17.11 client package was obtained from the official source, its signature verified, and client tools extracted into the task workspace. All three client version preflights passed; no server/service was installed and database connections were not attempted. The tools remain unused, no backup exists from this audit, and no restore target was selected. An earlier Windows C: encryption-status read was denied; backup/encryption work is no longer being pursued under the current decision. Current rehearsal has two existing accounts, which were preserved; an empty financial dataset does not authorize overwriting those accounts.

The platform inventory includes the enabled `on_auth_user_created` trigger and `private.handle_new_user`, the enabled `ensure_rls` event trigger, and one active cron schedule `0 4 * * *` with seven successful runs in the last seven days. Storage/Vault and the audited durable MFA/recovery, OAuth, custom-provider, SCIM, and WebAuthn categories currently have zero rows. Preserve this inventory for current scope verification and future recovery planning. Rehearsal remains isolated from production scheduling and outbound behavior.

## 2. Resolve migration history and prove the delta

The current production ledger contains 22 entries through `20260702195005`; all four manifest versions are absent. Candidate RPCs and new columns are also absent. All ten application tables have RLS enabled, inspected policies are authenticated-only, current application functions deny public/anonymous execution, and all six candidate fail-fast counts are zero. Finish the semantic audit and refresh these observations before applying changes.

Rehearsal has 26 ledger entries through `20260721194410`, including all four frozen versions. All three new columns and the quick-add, retarget, summary, and recurring RPCs are present; the atomic-reset RPC is absent. Its ten application tables have RLS enabled, with 37 policies, and its inspected table grants and future-default results match production. These read-only observations do not constitute a rerun of the historical migration or browser tests.

The rehearsal baseline contains two each of Auth users, identities, profiles, and preferences, with zero rows in audited financial tables and user roles. All six candidate fail-fast counts are zero. Its 23 application functions deny public/anonymous execution, audited invalid indexes/constraints and Realtime memberships number zero, and cron jobs/run history are empty. Preserve existing accounts and scheduling isolation during further rehearsal work.

Future-function defaults need a separate correction. Production has no global default-ACL override for `postgres`, so its future functions inherit `PUBLIC EXECUTE`. A per-schema revoke cannot subtract a global default grant; this is PostgreSQL's documented [default-privilege behavior](https://www.postgresql.org/docs/17/sql-alterdefaultprivileges.html). Rerunning the historical schema-level revoke will not close this gap. Future public-table defaults also retain `TRUNCATE`, `REFERENCES`, `TRIGGER`, and `MAINTAIN` for the three API roles because the old table revoke addressed only CRUD. Existing public tables have no inspected extra privileges for `anon` or `authenticated`; the correction affects future tables only.

Actual rehearsal evidence: a single rollback-only transaction applied the global revoke and created two constant, security-invoker probes in existing `public` and `private` schemas. Public/API-role execution checks passed and all existing function ACLs remained unchanged. The reviewed PostgREST DDL watcher was identified by an exact definition hash; other matching DDL triggers were rejected. The inner DDL rolled back before reporting success, and the batch finished with outer `ROLLBACK`. An independent postcheck found zero probe functions, 26 ledger entries, and zero global default-ACL overrides. A separate table-default test proved effective future API-role table privileges empty with all existing relation ACLs unchanged, then rolled back; its postcheck confirmed the original twelve schema-level API grants restored. No default corrections or probes were committed by these tests.

The reset rollback suite also passed. Independent cleanup found two original Auth users, zero financial/synthetic rows and test triggers, and the reset RPC absent. The frozen allocation-behavior and schema/security suites separately passed; cleanup preserved two users/profiles/preferences, an empty financial dataset and cron inventory, and ledger 26. These are write tests inside rollback transactions, not read-only production audits.

If a refreshed ledger already contains any manifest version, compare its effects and investigate discrepancies; do not replay it. For the currently observed baseline, follow this bounded reconciliation:

1. Refresh the verified historical effects of `20260707193257`: existing grants, all 37 policies, and scoped revokes passed the current production audit. Record both future-default limitations explicitly. Ledger absence does not justify replaying the historical SQL.
2. Preserve the two separately versioned default corrections. The function correction removes the global `PUBLIC EXECUTE` default for future `postgres` functions across all schemas. The table correction revokes all future `postgres`-owned public-table privileges from `anon`, `authenticated`, and `service_role`. Both leave existing object ACLs unchanged; explicit future grants remain possible.
3. Reconcile the missing historical ledger entry only against the independently verified production target and the proved effects. Keep all six actual migration changes separate from this history repair. Do not edit the historical file or silently overwrite an existing ledger record.
4. Re-list the exact ledger and check the complete manifest before execution. The standard authenticated CLI repair/dry-run/apply workflow is preferred when available. For this session, CLI authentication is unavailable and the signed-in SQL editor is the reviewed fallback: generate the batch from exact migration bytes, parse history statement arrays with the pinned official CLI 2.120.0 parser, enforce role/ledger/schema guards, and commit the complete environment delta and its history records atomically. A missing historical version is recorded without replaying its SQL. Review this manual fallback explicitly; do not describe it as CLI execution or an authenticated dry-run. Verify the dashboard project before pasting the whole batch and independently requery the ledger and effects afterward.
5. The historical candidate sequence is `20260721194230`, `20260721194320`, then `20260721194410`. The complete release must match the newly reviewed manifest, including additive repairs, in migration order. Unexpected versions or omissions require investigation, not an automatic push.
6. Verify the transaction migration's six fail-fast categories are zero: dual targets; missing/cross-owner goal targets; missing/cross-owner debt targets; invalid recurring debt ownership; active targetless transfer rules; and missing/cross-owner/mismatched transaction-to-rule relationships. The current counts are zero; recheck immediately before applying.

The migration adds constraints and indexes, backfills allocation fields, normalizes bounded transaction/rule semantics, and replaces financial RPCs/triggers. Account for DDL/row locks and a quiet deployment window. It is not a metadata-only release.

The statically reviewed reset implementation is a single authenticated, owner-scoped security-invoker RPC, with a fixed search path and explicit execution grants. A per-owner try-lock coordinates reset calls only; no broad guards are added to ordinary writers. All reset deletes and preference updates must commit or roll back together, including trigger effects. Owner isolation, late-failure rollback, and preserved unrelated preferences passed the rollback suite. Ordinary concurrent writes remain allowed and may leave or create records, so success does not promise a continuously empty workspace. Complete separate-session overlapping-reset and concurrent-writer checks before activation.

## 3. Establish hosting and Edge Function compatibility

On 2026-10-08 the authenticated Cloudflare API verified `budgetbuddy` owns active `budg.ca`, deploys GitHub `M0neyM1tch/BudgetBuddyLIVE` branch `main` automatically, builds with `npm run build` to `dist`, and uses Node 22.13.0. Its canonical production commit is `4e99770`. Recheck this identity immediately before release. The retained `budgetbuddy-v2` project has no custom domain or current source integration in its response; preserve it until rollback/retention needs are resolved.

The audit initially found preview configuration and the existing candidate deployment targeting production. Verified rehearsal configuration has now been saved for future preview builds, preserving production settings. Rebuild the candidate preview and verify its deployed backend target; settings changes alone do not update existing static assets. Do not run synthetic mutation QA against the old production-backed preview. Confirm the intended Goal Packs flag. A successful frontend build does not establish the correct backend target. Keep keys and private preview addresses out of reports.

Production and rehearsal `process-recurring` ZIPs matched the reviewed repository's `process-recurring/index.ts` and `_shared/cors.ts` by normalized SHA-256, and both JWT verification toggles are enabled. Both returned anonymous POST 401 and CORS OPTIONS 200 allowing `https://budg.ca`. No redeployment is indicated by this evidence. Configuration secret values were not inspected; complete authenticated processing and owner-isolation tests in rehearsal. Retain the existing deployment when compatibility is proved; review and deploy a frozen compatible bundle after the database and before the frontend only if a concrete difference requires it.

## 4. Apply and activate in order

The required compatibility order is **database, compatible Edge Function, frontend**. Old frontend plus the rehearsed migrated database is the expected transition; new frontend plus old database is incompatible.

1. Apply only the reviewed migration delta after the test-data scope, exact-delta/preflight, invariant, and security gates pass. Use the authenticated CLI route or the explicitly reviewed atomic SQL-editor fallback above. Preserve existing rows except for reviewed migration effects; do not replace production data with rehearsal data.
2. Immediately verify the migration ledger and expected schema/functions/triggers/indexes. Compare aggregate counts and security posture with the baseline, allowing only documented backfill/normalization effects. Preserve the intended cron schedule; rehearsal must remain isolated from production scheduling and outbound behavior.
3. Verify Edge Function compatibility and deploy only if needed.
4. Finish preview QA against rehearsal and record physical iPhone/Android results for critical flows. If merging `main` triggers production automatically, complete all database/Edge gates before that merge. Otherwise keep frontend activation separate until the database and final CI are verified.
5. Deploy the reviewed frontend commit and confirm the commit actually serving the domain.
6. Record owner-scoped smoke results for login/session handling, onboarding, dashboard, ordinary transaction creation, allocations, edits/retargeting/deletion, summaries/filtering, recurring processing, refresh persistence, and logout. Use synthetic records and remove only records attributable to the test. Observe errors and scheduled processing without collecting private financial data.

The checked-in `supabase/tests/product_ux_follow_ups_2_*.sql` suites create synthetic Auth/application rows even though they finish with `ROLLBACK`. Run them in rehearsal as write tests; do not represent them as read-only production checks.

## Stop and recovery conditions

Stop activation if the target or hosting authority is ambiguous; data exceeds the accepted test-only scope; the migration ledger/manifest differs unexpectedly; the selected execution route's preflight or invariants fail; any required check fails; permissions weaken; Edge identity/JWT behavior differs; or the deployed commit is not the reviewed commit. Do not continue deploying a frontend after a database error.

- Frontend regression: restore the last verified Pages deployment or deploy a reviewed revert. This does not revert the database.
- Edge regression: restore the previous verified bundle/configuration without opportunistic secret changes.
- Database regression: stop activation and prefer a reviewed forward fix when data remains intact. No backup/restore guarantee exists for this accepted disposable-test-data release. The accepted risk does not authorize an unrequested database wipe. Git reverts and migration-ledger repairs do not restore data.

## Close the release record

Update [project status](project-status.md) with the final commit, verified environment identities, migration versions/hashes, accepted test-data scope, checks, reviewer outcome, preview/device results, deployed commit, smoke results, and remaining limitations. Only mark the free MVP stable after those results exist. Keep rehearsal available for future development, and begin BudgBusiness work on a separate branch from that verified baseline.
