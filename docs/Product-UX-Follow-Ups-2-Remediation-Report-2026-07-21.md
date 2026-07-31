# Product/UX Follow-Ups 2 — Remediation Report

Date: 2026-07-21
Branch: `Product/UX-Follow-Ups-2`
HEAD inspected: `5a7f61a3131b127dfc1f265ebfeb3583d8298d7c`
Merge base with `main`: `5a7f61a3131b127dfc1f265ebfeb3583d8298d7c`
Result: local remediation and static review complete; recovery rehearsal and all database execution remain blocked/pending

## Executive result

The three requested review findings and the final review's follow-up blockers are corrected locally. Focused and full frontend gates pass, the two unapplied migrations now contain the strengthened invariants, and two rollback-only SQL verification suites are prepared but have not been executed. A Free-plan, no-Docker recovery runbook and a separately bounded backup/restore-rehearsal prompt are ready.

This is **not** authorization to migrate production. Neither a backup nor a restore rehearsal has occurred. No candidate migration, migration-history repair, verification SQL, DDL, or DML was applied to any Supabase environment.

## Agent workflow and assignments

| Wave/agent | Ownership | Result |
| --- | --- | --- |
| Architect, read-only | Complete diff/data-flow audit, invariant and test contracts, ownership, threat model | Confirmed all three findings, traced direct Data API/RPC/recurring write paths, defined fail-fast SQL and router/filter designs. No edits. |
| Docs Researcher, read-only | Current official Supabase Free-plan, backup/restore, connection, migration-ledger, type-generation, grants/RLS guidance | Established the native PostgreSQL 17 no-Docker path and its managed-schema/platform-service limits. No edits. |
| Supabase Engineer | Two `20260721` migrations and two new `supabase/tests/` files only | Added preflights, normalization, constraints/FKs, 120-character validation, and rollback-only security/behavior suites. No remote execution. |
| Frontend Engineer | Transactions page/filter hook/filter component and focused tests only | Added router-native one-time prefill consumption, field-level URL parsing, raw amount drafts, accessible errors, and tests. |
| Parent | Integration, documentation, read-only production discovery, full gates | Corrected full-pair amount commits, wrote recovery/handoff/remediation docs, ran local gates, and resolved three medium findings from the first final-review pass before targeted approval. |

No file ownership overlapped concurrently.

## Findings fixed

### 1. PostgreSQL allocation semantics

Before, RLS-scoped direct Data API writes could target a goal or debt while persisting an income/expense kind or unrelated category. The new durable constraints require:

- goal target: debt target null, `kind = 'transfer'`, `category = 'savings'`;
- debt target: goal target null, `kind = 'transfer'`, `category = 'debt_payment'`;
- at most one target;
- debt-targeted recurring rule: `kind = 'transfer'`, `category = 'debt_payment'`.

The migration now:

- fails before mutation if any dual target, missing/cross-owner goal/debt, missing/cross-owner recurring rule, or mismatched recurring relationship exists;
- deterministically normalizes only the kind/category implied by an unambiguous existing target;
- preserves user, amount, date, description, notes, source, recurring identity, and target;
- adds same-owner composite goal, debt, and recurring-rule foreign keys;
- keeps RPC normalization as defense in depth;
- aligns both RPC description checks with the existing table limit of 120 characters;
- rejects fresh targetless-transfer inserts and conversion of ordinary rows through direct authenticated writes while preserving targeted-to-unlinked and already-unlinked historical edits required by permanent deletion/FK `SET NULL`;
- permits a targetless transfer recurring rule only while inactive, so debt deletion can pause/unlink it but it cannot be reactivated without a valid debt target;
- requires a recurring occurrence insert to match the owned rule's source, amount, target, kind/category, and nonblank description, preventing a mismatched same-owner row from occupying the rule/date idempotency slot. Notes remain intentionally independent because the UI supports separate initial-transaction and recurring-rule notes.

No RLS policy or table/function grant was loosened.

### 2. React Router prefill consumption

`TransactionsPage` now consumes `new`, `goal_id`, and `debt_id` through `setSearchParams(next, { replace: true })`. It preserves unrelated filters, waits for both RLS-scoped target queries to succeed, validates against the loaded active goal/debt collections, consumes valid or invalid requests once, shows one unavailable-target error, and no longer mutates `window.history` for router-owned state. A transient query failure leaves the prefill intact for a successful refetch; closing or rerendering after consumption does not reopen the modal.

### 3. Invalid amount-range drafts

The filter hook parses URL fields independently, ignoring only malformed/conflicting fields while preserving valid search, date, kind, category, and debt filters. It commits only a fully valid filter object.

`TransactionFilters` keeps raw min/max drafts locally, associates visible errors with both controls, suppresses invalid commits, and commits the complete valid min/max pair once corrected. Clear resets both drafts and committed filter keys. Active counts reflect committed filters, including valid zero values.

## Exact remediation files

Database:

- `supabase/migrations/20260721194230_product_ux_follow_ups_2_debt_goal_sync.sql` — added the goal same-owner key required by transaction ownership FKs.
- `supabase/migrations/20260721194410_product_ux_follow_ups_2_transaction_summary_and_retarget.sql` — added preflight failures, targeted normalization, transaction/recurring semantic constraints, ownership FKs, historical-unlink compatibility comment, and 120-character validation.
- `supabase/tests/product_ux_follow_ups_2_schema_security.sql` — rollback-only grants/RLS/ownership/semantic/anonymous/archived/foreign-target verification.
- `supabase/tests/product_ux_follow_ups_2_allocation_behavior.sql` — rollback-only ordinary/allocation/clamp/idempotency/retarget/delete/recurring/summary verification.

Frontend:

- `src/features/transactions/pages/TransactionsPage.tsx` — router-native one-time prefill consumption.
- `src/features/transactions/hooks/useTransactionFilters.ts` — field-level URL sanitization and valid-only commits/counts.
- `src/features/transactions/components/TransactionFilters.tsx` — raw amount drafts, accessible errors, full-pair valid commit, and draft clear.
- `src/features/transactions/components/__tests__/TransactionFilters.test.tsx` — invalid draft/correction/clear/count coverage.
- `src/features/transactions/hooks/useTransactionFilters.test.tsx` — malformed-field isolation, valid/invalid URL commit, unrelated-parameter preservation.
- `src/features/transactions/pages/__tests__/TransactionsPage.test.tsx` — valid goal/debt, preserved filters, one-time close/rerender, and invalid target coverage.

Documentation:

- `docs/Product-UX-Follow-Ups-2-Implementation-Report-2026-07-21.md` — corrected the historical Docker wording and replaced it with the hosted Free-plan, no-Docker verification sequence.
- `docs/Product-UX-Follow-Ups-2-Free-Plan-Backup-and-Restore-Runbook-2026-07-21.md` — gated native-client recovery and cutover design.
- `docs/Codex-Task-Prompt-Product-UX-Follow-Ups-2-Backup-Restore-Rehearsal-2026-07-21.md` — separately bounded next-task prompt with explicit approval pauses.
- `docs/Product-UX-Follow-Ups-2-Remediation-Report-2026-07-21.md` — this report.

The complete earlier implementation inventory remains in the implementation report; no unrelated implementation file was refactored during remediation.

## Frozen candidate hashes

- `20260721194230...debt_goal_sync.sql`: `678834847D83DB8F3607B13AD49D9DFA51935143C54D268F6658692F9B964B40`
- `20260721194410...transaction_summary_and_retarget.sql`: `E7CF5834475DA1904E196895B056823773494DFB3C00811D9D6E89FFC8650A75`

Any later SQL edit invalidates restored-copy verification and requires new hashes plus repeated database checks.

## Read-only hosted Supabase findings

Active production was identified as `BudgetBuddy-V2`, healthy in `us-east-2`, PostgreSQL 17.6, under a Free organization. Its project reference is intentionally omitted from repository documentation and belongs only in access-restricted operational evidence. The other visible project, `BudgetBuddy`, is inactive and was not resumed, altered, or treated as disposable.

The active migration ledger has 22 versions through `20260702195005`. It does not contain:

- `20260707193257`;
- `20260721194230`;
- `20260721194410`.

The inactive project's ledger query timed out because it is inactive. Editing the untracked `20260721` candidates is therefore confirmed safe for active production, but not proven for the inaccessible legacy project. If either version is later found there, use a CLI-created follow-up migration for that environment rather than edited historical SQL.

### `20260707193257` ledger mismatch

The local hardening version is absent from active production history, but all its material effects were compared:

- all ten target tables have the intended authenticated DML/read surface;
- `anon` and `PUBLIC` have no target-table DML/read grants;
- the authenticated function execute allow-list matches;
- `anon`/`PUBLIC` function execution remains revoked;
- `process_due_recurring_rules(uuid,date)` remains service-role-only;
- relevant default table DML, sequence, and function privileges are revoked.

Conclusion: the SQL effects are present while the ledger record is absent. The later rehearsal should test `supabase migration repair --status applied` on the restore target, then a separate authorization may repair production history. Migration repair changes only the ledger; it must not be used as a substitute for effect comparison. No repair occurred in this task.

### Production semantic preflight

Aggregate-only queries found zero goal-targeted transactions, debt-targeted transactions, debt-targeted recurring rules, dual targets, unallocated transfers, semantic mismatches, foreign/missing targets, or archived targets. No private financial values, emails, descriptions, or user identifiers were inspected or recorded.

### Recovery inventory

- Storage: zero buckets and zero objects at inspection time. Object-byte backup is currently unnecessary, but usage must be rechecked at backup/cutover time; database backup never substitutes for Storage bytes.
- Vault: extension installed, zero stored secrets. Vault/encryption treatment remains a rehearsal gate; no key material was accessed.
- Installed extensions: `pg_cron`, `pg_stat_statements`, `pgcrypto`, `plpgsql`, `supabase_vault`, `uuid-ossp`.
- Cron: one active job. It must be withheld/neutralized on the restore target before data restoration/testing.
- Database webhooks: none found. `pg_net` is not installed.
- Realtime: publication exists with zero tables.
- Edge Functions: one active JWT-verified `process-recurring` function; deployment/configuration is outside a logical database dump.
- Auth/platform: Auth users and app data exist. Auth provider settings, redirects/templates, API keys, Edge Function configuration, and other platform settings require separate sanitized inventory/reconfiguration.
- Custom recovery contract: the Auth user trigger and `private.handle_new_user` must be preserved and compared.

Pre-existing advisors: one security warning for leaked-password protection disabled and six informational unused-index notices. Neither is caused by the unapplied branch migrations.

## Free-plan recovery conclusion

Official Supabase guidance supports manual logical backup with native `pg_dump`, but its CLI dump is container-backed and excludes managed schemas/data/roles by default. This repository's no-Docker workflow therefore uses native PostgreSQL 17+ clients through a direct connection or, for IPv4-only access, the shared session pooler on port 5432—not transaction pooling on 6543.

The exact database/Auth/roles/managed-schema artifact sequence is not yet proven. Native logical backup is viable for database scope, but a dump cannot be called a complete Supabase-project recovery point until the separate rehearsal proves Auth, roles/grants, migration history, modified managed-schema objects, Vault/encryption treatment, and every excluded platform service. The current recovery gate is **BLOCKED**.

See:

- [Free-plan backup and restore runbook](Product-UX-Follow-Ups-2-Free-Plan-Backup-and-Restore-Runbook-2026-07-21.md)
- [Backup/restore rehearsal task prompt](Codex-Task-Prompt-Product-UX-Follow-Ups-2-Backup-Restore-Rehearsal-2026-07-21.md)

## Validation actually run

| Command/check | Result |
| --- | --- |
| Focused Transactions tests | PASS — 3 files, 9 tests |
| `npm.cmd run typecheck` | PASS — exit 0 |
| `npm.cmd run lint` | PASS — exit 0 |
| `npm.cmd run test` | PASS — 20 files, 69 tests |
| `npm.cmd run build` | PASS — Vite 8.0.16, 2,660 modules transformed |
| `npm.cmd audit --omit=dev --audit-level=high` | PASS — 0 vulnerabilities |
| `npm.cmd audit --audit-level=high` | FAIL — pre-existing development-tree `brace-expansion` high advisory, GHSA-3jxr-9vmj-r5cp |
| `git diff --check` | PASS |
| SQL delimiter/wrapper/static coverage and credential scan | PASS |
| Migration or SQL verification execution | NOT RUN — explicitly deferred |
| Generated hosted types | NOT RUN — requires verified restore target |

The first parent focused-test attempt hit the workspace sandbox's known Node `EPERM` path-resolution restriction. The approved rerun outside that sandbox passed; this was not a source failure.

No dependency or lockfile was changed. The full-audit advisory was not auto-fixed because dependency changes are outside this task and require separate review.

## Final static reviewer findings

The first final-review pass found no high-severity issue and three medium blockers: direct creation of fresh targetless transfers, same-owner recurring occurrence-slot poisoning, and premature URL-prefill consumption after a transient target-query failure. All three were corrected in their existing non-overlapping ownership and covered by focused tests.

The targeted second pass found no remaining high- or medium-severity findings and approved the static result. It confirmed that permanent-deletion unlink behavior remains compatible, recurring notes may intentionally differ, and error-to-success refetch now consumes a valid prefill exactly once.

One low-severity defense-in-depth observation remains: an authenticated owner can pre-insert an otherwise exact recurring occurrence for an arbitrary future date. This creates the intended owner transaction and allocation early; it does not lose, double, or cross users' financial activity. A future hardening task may reserve post-initial occurrences for the service path through a dedicated RPC. It does not remove the restored-copy runtime and recovery blockers.

## Remaining gates and risks

- No production backup exists from this task.
- No backup integrity check or restore rehearsal has occurred.
- The exact Auth/roles/managed-schema/Vault recovery scope is unproved.
- The SQL migrations and verification suites have only static review; runtime PostgreSQL validation remains pending.
- The inactive legacy project's migration ledger remains inaccessible without an unauthorized state change.
- Generated types from the verified restored schema are pending.
- The development-tree `brace-expansion` advisory remains.
- Timed production maintenance/write-freeze, fresh final backup, aggregate watermark, and post-snapshot reconciliation plans remain pending.
- Physical iPhone and Android release checks remain pending from the broader implementation.

## Safety and authorization confirmation

- Docker was not installed, started, used, troubleshot, required, or recommended in this remediation task.
- No Supabase branch/project was created, resumed, paused, restored, reset, rebased, merged, deleted, or mutated.
- Production Supabase access was read-only and aggregate/schema/grant/configuration-only.
- No backup was created, downloaded, inspected, restored, or uploaded.
- No credential, connection string, environment file, API key, token, cookie, Auth session, complete endpoint, or secret was inspected or stored.
- No migration, migration-history repair, verification script, hosted type generation, live correction, or synthetic hosted user creation occurred.
- No commit, push, PR, merge, deployment, Cloudflare change, production browser test, marketing code, PWA work, dependency addition, or unrelated roadmap change occurred.

## Next-task boundary

The next task must be limited to the backup, artifact integrity check, explicitly approved restore target, restore equivalence proof, restored-copy ledger-repair rehearsal, restored-copy candidate migrations, rollback-only SQL verification, advisors, verified-project type generation, and local gates. It must stop before production migration.

Before that task proceeds, the owner must separately decide and authorize:

1. an available ordinary Free-project slot and creation of a new target, or explicit destructive reuse of a specifically identified target;
2. secure temporary use of a production database connection credential for the manual logical backup;
3. installation/use of compatible native PostgreSQL 17+ client tools if they are not already installed;
4. each later remote write as it is reached.

No migration may be applied to production yet.
