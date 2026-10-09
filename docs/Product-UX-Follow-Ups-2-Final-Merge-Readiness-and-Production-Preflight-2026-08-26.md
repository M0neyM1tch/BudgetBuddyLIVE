# Product/UX Follow-Ups 2 — Final Merge Readiness and Production Preflight

Date: 2026-08-26

Scope: final release-candidate review and read-only production preflight

Disposition: **BLOCKED — MIGRATION LEDGER RECONCILIATION REQUIRED**

No production migration, data mutation, migration-ledger repair, Edge Function deployment, frontend deployment, merge, push, restore, or rollback occurred.

## Release candidate

- Branch: `Product/UX-Follow-Ups-2`.
- Starting HEAD and upstream: `525d28a55ebe854927caac8a28669896198d6cf8`.
- Intended target: `origin/main`; merge base `4e9977006c5dfe4987902f25fd11d28795b86b6e`; divergence at inspection `0 behind / 14 ahead`.
- Starting tree: clean and synchronized.
- Complete branch diff against `origin/main`: 73 files, 10,353 insertions, 584 deletions. It contains 14 coherent commits; frontend changes across analytics, calculator, debts, Goal Packs, goals, onboarding, transactions, shared projected-result UI, generated database types, three migrations, two rollback-only SQL verification suites, tests, and nine release/rehearsal documents. There is no branch-diff change to Edge Function source, GitHub Actions, `package.json`, `package-lock.json`, environment configuration, or Cloudflare configuration. No unrelated or unexplained file was found.

## Deferred LOW issue

Final browser matrix: **16 PASS / 1 deferred LOW / 0 BLOCKED**.

`LOW — transaction search punctuation — deferred`

The limitation and required later coordinated application/additive-migration remediation are recorded in the rehearsal report. **No search-remediation migration is included in this release.**

## Automated and remote gates

| Gate | Result |
| --- | --- |
| `npm run typecheck` | PASS, Node 22.13.0 |
| `npm run lint` | PASS |
| `npm test` | PASS, 22 files / 84 tests |
| `npm run build` | PASS, Vite 8.0.16, 2,660 modules transformed |
| `git diff --check` | PASS |
| Tracked-file credential/privacy/scope review | PASS; matches were expected role names and authorized project references in documentation/SQL tests, not credentials |
| `npm audit --omit=dev --audit-level=high` | **FAIL**: 1 high and 1 moderate React Router advisory affect the installed `react-router-dom` 7.17.0 dependency tree; dependency repair is outside this docs-only task |
| GitHub Actions for upstream `525d28a` | No Actions run exists because the workflow runs on PRs and pushes to `main`/`develop`; the commit has a successful Cloudflare Pages preview check only |
| Latest `main` CI (`4e99770`) | PASS, GitHub Actions `verify` |

`.github/workflows/ci.yml` is CI-only: checkout, Node 22.13.0, `npm ci`, typecheck, lint, tests, and build on pull requests and pushes to `main`/`develop`. It contains no deployment step. Any unpushed documentation commit is covered only by local validation, never claimed as remote CI evidence.

## Candidate migration inventory and rehearsal parity

| Version | Filename | SHA-256 | Rehearsal | Production ledger | Expected execution now |
| --- | --- | --- | --- | --- | --- |
| `20260721194230` | `20260721194230_product_ux_follow_ups_2_debt_goal_sync.sql` | `678834847D83DB8F3607B13AD49D9DFA51935143C54D268F6658692F9B964B40` | PASS, exact hash | absent | would execute after unresolved `20260707193257` |
| `20260721194320` | `20260721194320_product_ux_follow_ups_2_onboarding_json_parent_fix.sql` | `99ECE84EA43F03D6E2F7414D81FE457E448D5FA3C9004AE235A497FA0CCC6CE8` | PASS, exact hash | absent | would execute second among release migrations |
| `20260721194410` | `20260721194410_product_ux_follow_ups_2_transaction_summary_and_retarget.sql` | `D7C24CE992FC6D9593E1D8DC5CECC14425CFE0666D07BE50F7B677A9B579F82D` | PASS, exact hash | absent | would execute third among release migrations |

There is no candidate drift and no later punctuation-search migration.

### Bounded migration impact

`20260721194230` is additive with a bounded data backfill. It adds composite same-owner unique keys to debts/goals, nullable `goals.linked_debt_id`, same-owner FK/check/index, synchronization trigger functions/triggers, normalizes eligible existing debt-payoff links, and replaces the onboarding-v2 RPC while preserving grants/security. Table-level `ALTER TABLE`, constraint validation, index creation, and the targeted goal update require ordinary DDL/row locks; existing eligible goal rows may be rewritten. Rollback is not a Git revert: prefer a forward fix; dropping the link/constraints/triggers would first require proving no deployed client depends on them.

`20260721194320` only replaces `create_goal_pack_onboarding_setup_v2(...)` to repair the JSON parent path while preserving signature, result, ownership, validation, relational writes, security-invoker/search-path properties, and authenticated grant. It is non-destructive and does not rewrite existing rows. Rollback is a forward replacement with the previously verified body.

`20260721194410` is additive but operationally substantial. It adds the recurring same-owner key and semantic constraint; normalizes bounded target columns in existing transaction/rule rows; adds `transactions.allocation_applied_cents` with default/backfill and nullable `client_operation_id`; adds allocation/ownership constraints and three same-owner FKs; creates a unique operation-ID index; installs ordered-lock/allocation triggers; and creates or replaces quick-add, retarget, summary, allocation, update, delete, recurring processor, and permanent-debt-delete functions with explicit grants. Existing transaction rows are updated/backfilled. `ALTER TABLE`, constraint validation, unique-index build, trigger installation, and backfill updates require DDL/row locks. Its fail-fast preflight must remain zero before execution. Database rollback is forward-fix or recovery-point restore, not branch rollback.

## Rehearsal final checkpoint

Read-only platform metadata on 2026-08-26 confirmed `BudgBeacon-Rehearsal / gwloyvfkrxzgqnlnlcor`, healthy in `us-east-2`, PostgreSQL 17.6.1, with the exact 26-entry ledger and all three frozen candidate versions, ten RLS-enabled public application tables with zero rows, and active `process-recurring` version 1 with `verify_jwt=true`. The final established QA checkpoint records two Auth users, two identities, two profiles and two preferences, both onboarding-incomplete; goals, debts, transactions, recurring rules, priorities, goal actions, and snapshots zero; cron/history `0/0`; and only the intended Edge Function. QA-B's explicit-exit behavior was validated before the final reset. The completed evidence covers migrations, 10-table RLS/37 policies, financial-flow/allocation matrices, linked debt/goal sync, retargeting, deletion reversal, recurring processing, reset persistence, two-user isolation, failure→Retry, failure→Continue, and the deferred LOW punctuation limitation. The full browser matrix was not rerun.

## Production identity and reproducible baseline

Read-only inspection was restricted to `BudgetBuddy-V2 / cebykmbauxbucvforwzj`; legacy was not queried. The project is healthy in `us-east-2`, PostgreSQL `17.6.1.127` / engine 17.

- Migration ledger: 22 entries through `20260702195005`; fingerprint `0981df5a2bc56451e5df2c8fa04a64ab`.
- Aggregate counts only: Auth users 3, identities 3, profiles 3, user preferences 3, goals 3, debts 3, recurring rules 8, transactions 218, financial priorities 3, goal plan snapshots 6, goal actions 7, user roles 0.
- RLS: all 10 application tables enabled; fingerprint `d8043707c05d7b3dbd3cd7a45984db35`.
- Policies: 37; fingerprint `28bd5327ae357ca298b4dc7914437c8c`.
- Table grants: anon DML 0, PUBLIC DML 0, authenticated intended DML rows 37; fingerprint `f000fa1b6e440000ebf3096d7593743d`.
- Relevant functions: 12 current pre-release signatures; all use fixed `search_path=public, pg_temp`; only `process_due_recurring_rules(uuid,date)` is `SECURITY DEFINER`; function fingerprint `cda5cdb462abe727e8bd4dbdb0f7006c`. PUBLIC/anon application function execution is zero; authenticated execution is restricted to intended client RPCs.
- Indexes: 33; fingerprint `372efb8e09078720018f963c78e7f9a3`. Application triggers: 9; fingerprint `ca4d00aff564363b6c7fc8bcfae16757`.
- Extensions relevant here: `pg_cron 1.6.4`, `pg_stat_statements 1.11`, `pgcrypto 1.3`, `supabase_vault 0.3.1`, `uuid-ossp 1.1`. `pg_net` is not installed.
- Cron: one active `process-recurring-daily` job at `0 4 * * *`; 71 historical run rows. No history rows or customer data were extracted.
- Edge Functions: `process-recurring` exists, ACTIVE, version 6, `verify_jwt=true`, platform bundle identifier `48034592f2a35f257d0447bd5468c0031461a85f11103ff85987e5195ca3a726`. Branch Edge source is unchanged; checked-in source hashes remain `39BA8B...B8A` and shared CORS `F947E7...B8E`.

## Recovery checkpoint

**PRODUCTION EXECUTION BLOCKED — RECOVERY POINT MUST BE ESTABLISHED.**

No current backup/PITR listing or timestamp could be proven read-only: the available Management connector did not expose backup metadata, the Cloudflare browser session was unrelated, and the local Supabase CLI has no authenticated access token. The organization was previously recorded as Free; current Supabase documentation provides automated daily platform backups for Pro/Team/Enterprise and recommends user-managed exports for Free projects. Rehearsal data is not a production recovery point.

Before execution, an authorized human must open Supabase Dashboard → `BudgetBuddy-V2` → Database → Backups and record either the latest successful backup or PITR earliest/latest restore window that covers the deployment. If none exists, separately authorize and complete the project runbook's encrypted logical production backup, checksum/integrity validation, secure custody, and executable restore plan. Do not begin migration execution until the recovery point and restore path are recorded.

## `20260707193257` reconciliation and exact delta

Result: **LEDGER ABSENT / EFFECTS PRESENT** — provisional pending a same-day default-ACL refresh.

The production ledger has no `20260707193257` row. Fresh semantic inspection found all ten tables RLS-enabled, 37 expected owner policies, zero anon/PUBLIC application-table DML, the intended authenticated grants, zero PUBLIC/anon application-function execution, fixed relevant function search paths, and the service-role-only security-definer recurring processor. The earlier production semantic comparison also proved the migration's `postgres` default table DML, sequence, and function privileges revoked. Together these cover the hardening effects of the repository file (SHA-256 `D5EE4A6743B85C46E337BD6B1F87ACC58CAE0ADEC5E9872ACEA90A91173FA30B`). However, current default ACLs could not be refreshed after the database connector became unavailable, so the classification is not sufficient authorization for repair; the execution task must re-query default ACLs immediately before any repair. Ledger presence and the last fully proven semantic state diverge.

The CLI's supported `db push --dry-run` could not be run without creating/changing project-link metadata or obtaining a database credential, both outside this task. The actual repository set, actual production ledger, current semantic state, and CLI 2.90 help nevertheless establish that a normal push does not mark semantically present SQL as applied: the missing version remains pending ahead of the three candidates. Production execution is therefore not deterministic for the authorized set until the ledger is reconciled.

| Version | Filename | Production ledger | Semantic prerequisite | Would execute before repair | Expected effect |
| --- | --- | --- | --- | --- | --- |
| `20260707193257` | `phase3_live_permission_hardening.sql` | absent | last fully proven present; current default-ACL refresh required | **yes / pending** | re-run grants/default-privilege SQL and add ledger row; unauthorized delta |
| `20260721194230` | debt/goal sync | absent | pre-release schema present | yes, after `07193257` | debt/goal relational synchronization |
| `20260721194320` | onboarding JSON parent fix | absent | `194230` present | yes | replace onboarding RPC |
| `20260721194410` | summary/retarget/allocation | absent | previous two present; fail-fast counts zero | yes | transaction and recurring contract |

**PREFLIGHT BLOCKED — MIGRATION LEDGER RECONCILIATION REQUIRED.** The narrow next step is a separately authorized, production-targeted ledger-reconciliation task: repeat the semantic proof and recovery gate, run the already rehearsed `supabase migration repair 20260707193257 --status applied` against production, then confirm the ledger and run an authenticated `supabase db push --dry-run` proving exactly the three authorized versions. No repair was run here.

## Compatibility and deployment sequencing

| State | Safety | Evidence/condition |
| --- | --- | --- |
| old app + old DB + current Edge | SAFE | current production state |
| old app + migrated DB + current Edge | SAFE with migration preflights | migrations preserve existing columns/signatures and add/replace compatible behavior |
| old app + migrated DB + validated `process-recurring` | SAFE | same API contract; Edge source is not changed by this branch |
| new app + old DB | **UNSAFE** | new app calls `create_quick_add_transaction`, `update_transaction_and_retarget`, and `get_transaction_summary`, and reads new goal/transaction fields absent from old DB |
| new app + migrated DB + current validated Edge | SAFE | exact combination validated in rehearsal, subject to current production Edge source/config parity and smoke test |

The database must precede the frontend. No new Edge source is in this release; if current production version 6 is reconfirmed source-equivalent to the rehearsal bundle, an Edge deployment should be omitted. If parity cannot be proven, deploy the frozen checked-in bundle after DB migration and before frontend activation, with `verify_jwt=true`, then verify anonymous rejection and authenticated owner behavior.

## Cloudflare deployment trigger

`DEPLOYMENT_TRIGGER UNRESOLVED — HUMAN CLOUDFLARE CHECK REQUIRED`

Evidence proves an external Git integration: upstream `525d28a` received a successful `budgetbuddy` Pages branch preview, and the latest `main` commit `4e99770` produced successful `budgetbuddy` and `budgetbuddy-v2` Pages checks. Repository history records project `budgetbuddy`, repo `M0neyM1tch/BudgetBuddyLIVE`, production branch `main`, command `npm run build`, output `dist`, and automatic deployments enabled at that time. The available Cloudflare dashboard session is signed out, so the present automatic-production toggle cannot be verified and historical behavior is not treated as current configuration.

Human check: Cloudflare Dashboard → Workers & Pages → authoritative Pages project → Settings/Builds. Record project, connected repository, production branch, **Enable automatic production branch deployments** toggle, preview branch control, build command, root/output directory, current production deployment commit, and whether a `main` push triggers production. Also resolve why two projects (`budgetbuddy` and `budgetbuddy-v2`) produced checks for the latest `main` commit and identify the sole authoritative production project.

## Frozen production sequences

Both sequences remain frozen until recovery, ledger repair, audit remediation, current CI, Edge parity, and Cloudflare trigger checks pass.

If `main` auto-deploys: establish/verify recovery point → reconcile only ledger version `20260707193257` in its separately authorized task → authenticated `db push --dry-run` showing exactly the three Product/UX versions → apply those three migrations → verify ledger/schema/count/security fingerprints and fail-fast invariants → verify existing Edge parity or deploy/verify the frozen function if required → merge to `main` so Pages deploys → verify deployed commit → live owner-scoped smoke test and monitoring.

If merge does not auto-deploy: perform the same recovery, ledger, dry-run, migration, baseline, and Edge steps → merge to `main` while frontend remains unchanged → verify GitHub CI → explicitly deploy the reviewed frontend commit → verify deployed commit → smoke test and monitor. Independent deployment control is preferred because it separates merge from frontend activation; if auto-deploy is enabled, the DB/Edge gates must finish before merge.

## Frozen commands for a later authorized execution task — do not run here

All commands run from the repository root unless an isolated operational work directory is explicitly approved. Never supply credentials on the command line or store them in the repository.

1. `git fetch origin --prune` then `git status --short --branch`, `git rev-parse HEAD`, and `git rev-parse @{upstream}`. Precondition: approved branch/commit and clean tree. Result: fresh Git identity. Stop on divergence or unexplained files.
2. `supabase migration list --linked`. Precondition: local link independently verified as exactly `cebykmbauxbucvforwzj`, recovery gate green, and repaired `20260707193257` ledger. Result: production ledger matches repository through that version. Stop on target ambiguity or any other discrepancy.
3. `supabase db push --dry-run`. Precondition: same verified production link. Result must list exactly `20260721194230`, `20260721194320`, and `20260721194410`, in order. Stop if `20260707193257`, any unrelated migration, or fewer than the three appears.
4. `supabase db push`. Precondition: separate production-write authorization, reviewed dry run, current recovery point, green gates/CI, and frozen maintenance window. Expected result: exactly the three migrations applied once. Immediately re-list migrations and compare counts, functions, RLS/policies/grants, triggers/indexes, cron, and financial consistency to the baseline. Stop and do not deploy frontend on any error or fingerprint anomaly.
5. `supabase functions deploy process-recurring --project-ref cebykmbauxbucvforwzj`. Run only if current source parity is not proven and separate Edge-deployment authorization is granted. JWT verification is the CLI default; do not pass `--no-verify-jwt`. Expected result: active JWT-verified frozen bundle. Verify `verify_jwt=true` in metadata, CORS preflight, anonymous 401, authenticated processing, and owner isolation. Otherwise omit this command.
6. Merge/deploy actions are platform procedures, not shell commands in this frozen plan. They require reviewed commit identity, green GitHub CI, known Cloudflare trigger behavior, successful DB/Edge verification, and separate authorization. Verify Pages' deployed commit before smoke testing.

## Rollback model

- Frontend: select/redeploy the last known-good Cloudflare Pages deployment or revert and deploy the prior commit. This changes only the app, never the database.
- Edge Function: redeploy the prior verified bundle/version with the prior `verify_jwt` and non-secret configuration. Do not change secrets during rollback.
- Database: migrations have no automatic down migration. For application-only regressions, first roll back frontend and use a reviewed forward SQL fix. For corrupt or irreconcilable data/schema effects, restore the proven pre-change recovery point with accepted downtime/data-loss window. A Git revert and migration-ledger repair do not restore database contents.

## Frozen STOP conditions

Stop if: production identity is uncertain; a usable recovery point/restore procedure is unproved; `20260707193257` remains ledger-inconsistent; dry run is unavailable or includes anything other than the three authorized versions; a candidate hash differs from rehearsal; an intended migration is skipped; migration fail-fast checks are nonzero; current dependency audit remains high; typecheck/lint/tests/build/diff/secret-scope gates fail; required pushed-commit CI is missing/red; the tree or upstream is unexpected; Cloudflare production auto-deploy remains unresolved when sequencing depends on it; the authoritative Pages project is ambiguous; Edge source/JWT/order is incompatible; production RLS/policies/grants/default privileges differ materially; `pg_net` or cron state changes unexpectedly; migration behavior is destructive beyond this analysis; target resolves to rehearsal or legacy; or rollback/recovery cannot be executed.

## Required prerequisite actions

1. Establish and prove a production recovery point.
2. Remediate/review the current React Router production audit advisories, with separately authorized dependency/lockfile changes and complete regression gates.
3. Perform separately authorized production ledger reconciliation for `20260707193257`, then prove the exact three-migration dry run.
4. Authenticate to Cloudflare and record the current production-branch deployment settings and authoritative Pages project.
5. Reconfirm production Edge source parity and obtain green GitHub CI for the final pushed release commit.

Until all five are complete, production execution remains prohibited.
