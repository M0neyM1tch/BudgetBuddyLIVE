# Codex Task Prompt — Product/UX Follow-Ups 2 Remediation

Copy everything below this line into a new Codex task opened at the repository root.

---

You are working locally in this repository:

`C:\Users\Mitch\Documents\Codex\2026-06-24\i-am-working-on-a-budget\BudgetBuddyLIVE-export\repo`

This is the remediation and database-validation-preparation task for the existing, uncommitted `Product/UX-Follow-Ups-2` implementation.

The owner uses hosted Supabase on the **Free plan** and has intentionally **not used Docker at any point in this project**. Supabase Branching, automatic backups, Point-in-Time Recovery, and the managed "Restore to a New Project" flow are not available on this plan. Do not install, start, troubleshoot, require, or recommend Docker. Do not describe Docker as a blocker.

This task is deliberately separated from database execution. First freeze a strengthened, audited migration and prepare verification and recovery materials. A later, separately authorized task must create a manual logical backup of production and prove that the backup can be restored before either `20260721` migration may be applied to production. A backup file that has not passed integrity checks and a restore rehearsal is not an accepted recovery point.

## Immediate objective

Remain on the existing local branch `Product/UX-Follow-Ups-2` and:

1. Correct the three actionable review findings described below.
2. Add focused frontend tests for those fixes.
3. Strengthen and statically audit the unapplied migration's database invariants, and prepare transactional SQL verification scripts for later execution against a separately authorized ordinary Free-plan Supabase project.
4. Re-run all local application gates.
5. Produce a no-Docker, Free-plan backup/restore-rehearsal runbook and a second-task handoff prompt. Do not take the backup in this task.
6. Update the implementation documentation so it accurately reflects the owner's hosted-Supabase, Free-plan, no-Docker workflow.
7. Produce a detailed remediation report for the next task.

Do not create or mutate a Supabase branch/project in this task. Do not take or restore a production backup. Do not apply migrations anywhere. Stop after the code, migration files, test scripts, recovery runbook, and documentation are ready for the separately authorized backup-and-restore-rehearsal task.

## Required reading

Read these files in full before taking action:

- `AGENTS.md`
- `src/AGENTS.md`
- `supabase/AGENTS.md`
- `docs/Codex-Task-Prompt-Product-UX-Follow-Ups-2-2026-07-21.md`
- `docs/Product-UX-Follow-Ups-2-Implementation-Report-2026-07-21.md`
- both `20260721...product_ux_follow_ups_2...sql` migration files
- all modified Transactions, Goal Pack, onboarding, goal, debt, calculator, analytics, and shared disclosure files shown by Git

Use current official Supabase documentation and the Supabase plugin for version-sensitive facts. Inspect the Supabase changelog for relevant breaking changes. Do not rely on memory for Free-plan limits, logical backup/restore behavior, native PostgreSQL client compatibility, migration history, RLS, function grants, or type generation.

## Git and working-tree safety

This task continues existing uncommitted work. It must not start over.

1. Run `git status --short --branch` and verify the current branch is exactly `Product/UX-Follow-Ups-2`.
2. Record the current HEAD and merge base with `main`.
3. Expect numerous modified and untracked implementation files. Preserve all of them.
4. Do not switch branches, pull, merge, rebase, reset, restore, checkout files, stash, clean, or discard anything.
5. Do not commit, push, open a pull request, merge, or deploy.
6. Inspect the complete diff before editing so remediation is integrated with the existing implementation rather than layered blindly on top.
7. If the current branch is different or files appear to have been replaced since the implementation report, stop and report the discrepancy.

## Authorization boundaries

Authorized in this task:

- local read-only Git inspection;
- local edits to the existing implementation, tests, migration files, and documentation;
- local TypeScript, lint, unit/component tests, build, audit, and diff validation;
- read-only inspection of the hosted Supabase project through the Supabase plugin, including project metadata, migrations, tables, function definitions, grants, advisors, and aggregate/non-sensitive verification queries;
- reading current official Supabase documentation;
- preparing SQL verification scripts that are not executed in this task;
- preparing a no-Docker backup/restore-rehearsal runbook and a follow-up task prompt without accessing credentials or creating backup artifacts.

Not authorized in this task:

- any hosted Supabase DDL or DML;
- applying a migration to any hosted Supabase environment;
- creating, resetting, rebasing, merging, or deleting a Supabase branch;
- creating, restoring, pausing, or changing a Supabase project;
- repairing hosted migration history;
- changing hosted Auth, RLS, grants, functions, secrets, configuration, data, or users;
- creating synthetic users in any hosted environment;
- creating, downloading, inspecting, restoring, or uploading a production backup;
- Docker installation or use;
- environment-file inspection;
- production or `budg.ca` browser testing;
- Cloudflare deployment or configuration changes;
- commit, push, PR, or merge;
- new dependencies;
- unrelated refactoring or new product features.

If a necessary action crosses a boundary, stop and request explicit authorization. Never use the production database as a test environment.

## Required agent workflow

Use sub-agents with exact, non-overlapping ownership.

### Wave 1 — Architect, read-only

Spawn one Architect first and wait for its report. It must:

- inspect the full current diff and implementation report;
- confirm the three findings against current code;
- trace all direct Data API and RPC transaction write paths;
- determine the narrowest safe database invariant for goal/debt allocation semantics;
- determine whether debt-targeted recurring rules also require a matching invariant or normalization;
- design the React Router prefill-consumption fix;
- design filter draft/URL behavior that preserves unrelated valid filters during an invalid amount range;
- identify exact test cases and files;
- define non-overlapping file ownership for the implementation agents;
- identify whether either new `20260721` migration has been recorded on any discoverable hosted environment using read-only Supabase inspection;
- confirm that editing the existing migration is safe. If any environment has already applied it, require a new follow-up migration instead;
- recommend the structure of a rollback-only transactional SQL verification script for the later isolated-project task;
- threat-model the migration and recovery sequence, including destructive or non-idempotent statements, lock duration, partial-failure behavior, post-migration writes, and the point at which a full snapshot restore would lose newer production data;
- define the minimum evidence required before the owner may authorize a production migration: frozen SQL hash, static review, logical-backup integrity checks, successful restore rehearsal, schema/data/grant comparison, SQL verification pass, and a timed maintenance/cutover plan.

The Architect must not edit files.

### Wave 2 — Docs Researcher, required and read-only

Use a Docs Researcher for current Supabase facts. It must use primary Supabase documentation to verify:

- the exact Free-plan limitations for automatic backups, PITR, Branching, and managed restore-to-new-project;
- the current two-active-Free-project allowance and that an ordinary second Free project is not the Branching feature;
- a no-Docker manual logical backup/restore method using supported native PostgreSQL client tools, including client/server version compatibility and the correct session-pooler or direct connection mode;
- what the logical database backup does and does not preserve, including application schemas/data, `auth` users, roles/grants, migration history, extensions, Vault/encryption considerations, Storage metadata versus Storage objects, Edge Functions, Auth settings, API keys, Realtime settings, and external integrations;
- how to checksum and test a backup without disclosing or committing production data or credentials;
- safe `psql` restore flags, single-transaction/error-stop behavior where supported, and how to compare source and restored targets using schema facts and aggregate counts only;
- migration-history repair semantics;
- generating TypeScript types from a hosted project;
- explicit function grants and Data API behavior;
- safe transactional test execution through SQL.

It must not edit files or create/mutate any remote resource. It must not assume that a raw, unrestricted `pg_dump` of every Supabase-managed schema is safely restorable; it must ground the exact dump scope and restore sequence in current official Supabase guidance and identify any unsupported or unverified gap.

### Wave 3 — Implementation agents

After reviewing the Architect's report, assign exact, non-overlapping files.

#### Supabase Engineer

Own only:

- `supabase/migrations/20260721194230_product_ux_follow_ups_2_debt_goal_sync.sql`, if needed;
- `supabase/migrations/20260721194410_product_ux_follow_ups_2_transaction_summary_and_retarget.sql`;
- new SQL verification files under an architect-approved `supabase/tests/` location;
- database-focused portions of documentation explicitly assigned by the parent.

The Supabase Engineer must not touch React or TypeScript application files in this task.

#### Frontend Engineer

Own only:

- `src/features/transactions/pages/TransactionsPage.tsx`;
- `src/features/transactions/hooks/useTransactionFilters.ts`;
- closely related Transactions schema/component files only if the Architect proves they are required;
- focused existing or new frontend tests for URL-prefill and invalid-filter behavior.

The Frontend Engineer must not touch migrations or Supabase test SQL.

#### Parent task

The parent owns:

- shared/public exports if required;
- resolving integration conflicts;
- writing the backup/restore runbook and second-task handoff prompt from the Architect and Docs Researcher evidence;
- updating implementation documentation and the remediation report;
- running all local gates;
- checking the final diff and accepting/rejecting agent changes.

No two agents may edit the same file concurrently. If ownership must expand, stop that agent and reassign explicitly.

### Wave 4 — Reviewer, read-only

After integration and local tests, spawn a Reviewer to inspect the complete diff. It must specifically evaluate:

- database target-semantic integrity;
- RLS and Data API behavior;
- SQL validity visible through static analysis;
- compatibility with existing transactions and recurring rules;
- React Router state synchronization;
- filter URL and draft-state edge cases;
- test sufficiency;
- migration edit safety;
- whether the runbook overstates recoverability or omits Auth, Storage, platform configuration, credential handling, checksum validation, restore rehearsal, write-freeze, or post-snapshot data-loss risks;
- accidental production writes, secrets, dependencies, marketing code, PWA work, or scope expansion.

The Reviewer edits nothing. Resolve all actionable findings or document why they do not apply.

## Finding 1 — Enforce coherent allocation semantics in PostgreSQL

Current problem:

- `transactions_single_allocation_target_check` prevents both `goal_id` and `debt_id` from being set simultaneously.
- It does not require a targeted transaction to have the correct `kind` and `category`.
- Authenticated users have direct Data API insert/update access under RLS.
- A direct write can therefore allocate financial progress while being counted incorrectly by Income/Expenses/Net.

Required behavior:

1. Add database-level protection so every persisted allocation is coherent:
   - when `goal_id` is non-null, `debt_id` is null, `kind = 'transfer'`, and `category = 'savings'`;
   - when `debt_id` is non-null, `goal_id` is null, `kind = 'transfer'`, and `category = 'debt_payment'`;
   - when both allocation targets are null, existing ordinary income/expense behavior remains valid;
   - unallocated transfers remain prohibited where the current product contract already prohibits them, or explicitly document why an existing workflow requires them.
2. Prefer explicit check constraints for durable invariants. Trigger normalization may supplement but must not silently hide invalid external writes unless the Architect justifies that behavior.
3. Inspect all pre-constraint cleanup/backfill statements. If an older targeted row could violate the new invariant, normalize only the target semantics deterministically while preserving amount, date, description, source, ownership, and allocation target.
4. Confirm the current hosted production database has no target rows requiring normalization using only aggregate/read-only queries. Do not expose user financial values or identifiers in the report.
5. Inspect `recurring_rules`:
   - if `debt_id` is set, decide whether the rule must also persist `kind = 'transfer'` and `category = 'debt_payment'`;
   - add equivalent database protection if required by the authoritative processing contract;
   - do not break ordinary non-debt recurring income/expense rules.
6. Keep the existing RPC normalization as defense in depth.
7. Align SQL validation with the table's existing description limit of 120 characters instead of accepting 200 and failing later at the table constraint.
8. Do not loosen grants or RLS.
9. Do not add a new migration if read-only inspection confirms the two `20260721` migrations have never been applied anywhere in scope. Edit the unapplied migration directly. If any environment has applied it, stop and require a CLI-created follow-up migration.

Required SQL verification cases to prepare:

- valid ordinary income succeeds;
- valid ordinary expense succeeds;
- valid goal transfer succeeds and updates the goal once;
- valid debt transfer succeeds and updates debt/linked-goal progress once;
- goal target with income/expense kind is rejected;
- goal target with a non-savings category is rejected;
- debt target with income/expense kind is rejected;
- debt target with a non-debt-payment category is rejected;
- dual target is rejected;
- foreign goal/debt target is rejected;
- attempted owner reassignment is rejected;
- anonymous access is rejected;
- quick-add identical retry is exactly once;
- quick-add operation-ID reuse with different input is rejected;
- edit/retarget/delete applies and reverses only the stored applied delta;
- recurring debt processing applies once;
- archived targets are rejected.

## Finding 2 — Consume transaction-prefill parameters through React Router

Current problem:

`TransactionsPage` consumes `new`, `goal_id`, and `debt_id`, then clears them with `window.history.replaceState`. This bypasses React Router's `useSearchParams` state. A later query refresh can leave the effect observing stale parameters and reopen the modal.

Required behavior:

1. Clear consumed prefill parameters through React Router, using `setSearchParams(..., { replace: true })` or an equivalent router-native API.
2. Preserve unrelated transaction filter parameters.
3. Consume a valid prefill exactly once.
4. Consume an invalid/stale prefill exactly once and display the current error without repeatedly reopening or re-emitting it.
5. Never trust a URL target merely because it is syntactically a UUID; it must be present in the RLS-loaded active goals/debts before prefill.
6. Preserve direct navigation and browser back/forward behavior.
7. Avoid `window.history` mutation for router-owned state.

Required tests:

- valid goal prefill opens once and clears only `new`/target parameters;
- valid debt prefill opens once;
- invalid or archived target shows one error and does not open;
- unrelated filters remain in the URL;
- query-data refresh/rerender does not reopen a consumed prefill;
- closing the modal does not immediately reopen it.

Prefer a route-level Testing Library test around `TransactionsPage` or a small extracted pure helper plus an integration-level router test. Do not satisfy this solely with snapshot assertions.

## Finding 3 — Preserve filters during invalid amount-range entry

Current problem:

`readFilters` returns `{}` when the full Zod object fails refinement. Temporarily entering a minimum greater than the maximum can therefore discard every otherwise valid filter and prevent the intended inline range error from behaving consistently.

Required behavior:

1. A temporarily invalid amount range must not erase search, dates, kind, category, or debt filter state.
2. The UI must visibly explain the min/max error.
3. Do not run a list or summary request with an invalid range.
4. Preserve raw amount input long enough for users to correct it.
5. Once valid, commit the range to the URL and reset pagination as before.
6. Clearing filters resets both committed filters and raw drafts.
7. Loading a URL with individually invalid fields must ignore or sanitize only those fields, not all filters.
8. Loading a URL with a valid active filter set must still open the collapsed filter panel initially.

The Architect may choose one of these patterns:

- local raw input drafts in `TransactionFilters`, committing only valid ranges;
- field-by-field URL parsing plus a separate range-validity result;
- another simple approach that maintains a single authoritative committed filter set.

Do not remove validation or allow invalid values to reach the API merely to keep the UI visible.

Required tests:

- category/search survive an invalid range edit;
- only a malformed URL field is ignored while valid fields remain;
- min greater than max displays the error and suppresses a new committed query;
- correcting the range updates the URL and query inputs;
- Clear resets drafts and committed values;
- active-filter count reflects committed filters and does not disappear unexpectedly.

## Prepare isolated-project Supabase verification without executing it

Create a database verification script or scripts in the repository for the next task. These scripts must:

- be intended only for a separately authorized ordinary Free-plan Supabase project populated exclusively for the restore rehearsal;
- begin with prominent comments stating `DO NOT RUN ON PRODUCTION`;
- use synthetic users and synthetic financial data only;
- avoid real emails, balances, transaction descriptions, or identifiers;
- run inside a transaction and end with `rollback` wherever the test mechanism supports it;
- fail loudly on an incorrect result;
- test authenticated owner, second authenticated user, anonymous, and privileged setup contexts safely;
- verify RLS separately from grants;
- verify function execute privileges;
- verify trigger behavior, clamps, idempotency, edit/delete reversals, recurring behavior, and summary/list parity;
- leave no test records, Auth users, schema objects, functions, roles, or configuration behind;
- not embed API keys, URLs, connection strings, JWTs, access tokens, service-role material, or branch identifiers;
- be documented with exact execution prerequisites for the later remote-validation task.

If a reliable rollback-only SQL test cannot simulate a necessary API role safely, document the missing test rather than weakening RLS or embedding credentials.

Do not execute this script during the current task.

## Read-only Supabase discovery

Use the Supabase plugin only for read-only discovery in this task:

1. Confirm the active production project by name and project reference without exposing credentials.
2. List production migration history.
3. Confirm neither `20260721194230` nor `20260721194410` is recorded as applied.
4. Confirm the known mismatch: local `20260707193257_phase3_live_permission_hardening.sql` is absent from hosted migration history.
5. Compare all effects of that hardening migration against hosted schema/grants using read-only queries—not merely a sample—so the next task can choose between:
   - a migration-history repair if the SQL is already fully present; or
   - applying the migration normally if any effect is missing.
6. List all Supabase projects visible to the owner and record only project name/reference/status/region/plan facts needed to determine whether the two-active-Free-project allowance has an available slot. Do not resume, pause, delete, repurpose, or alter any project. An old or inactive project may contain valuable data and is not an authorized restore target.
7. Inventory whether production uses Supabase Storage, Vault or encrypted columns, non-default extensions, database webhooks/cron/net, Edge Functions, Realtime publications, and custom `auth`/`storage` schema objects. Use schema/configuration facts and aggregate object counts only. Do not download Storage objects or inspect secrets.
8. Inventory the database items that a recovery copy must preserve: application schemas and data, Auth users, roles/grants, migration history, extensions, custom `auth`/`storage` objects, and any other app-owned schema. Distinguish database contents from separately configured platform services.
9. Run current production security and performance advisors read-only and distinguish pre-existing notices from branch work.
10. Record only schema/grant/configuration facts and aggregate counts. Do not include private financial values, emails, UUIDs, transaction descriptions, tokens, connection strings, or secrets.

Do not repair the ledger or create/change a project in this task.

## Required Free-plan, no-Docker backup and validation design

Update the implementation report and create a dedicated runbook:

`docs/Product-UX-Follow-Ups-2-Free-Plan-Backup-and-Restore-Runbook-2026-07-21.md`

The runbook must use this gated sequence:

1. **Freeze and identify the release candidate.** Record Git HEAD, hashes of both candidate migration files, PostgreSQL major version, current hosted migration ledger, and the exact read-only inventory. If SQL changes after backup validation, the database verification must be repeated and the migration hashes updated.
2. **Select a restore target with explicit approval.** The Free plan permits two active projects, but that does not authorize changing either one. Prefer a newly created ordinary Free project if a slot is available. If the owner wants to reuse an existing project, require explicit confirmation that its current contents may be destroyed. Never assume the older `BudgetBuddy` project is disposable.
3. **Use native PostgreSQL client tools, not Docker.** Verify an installed or owner-approved native `pg_dump`, `pg_restore`, and `psql` version compatible with the hosted PostgreSQL server. Do not put a password in shell history, command output, a process argument when an avoidable secure mechanism exists, an environment file, Git, the runbook, or task messages. The runbook must explain a safe interactive/temporary credential method and cleanup without printing the secret.
4. **Create the manual logical backup outside the repository.** Follow current official Supabase backup/restore guidance while adapting it to native PostgreSQL tools. Capture all required application data and recovery metadata identified above. Include Auth users if the chosen supported method permits it. Explicitly identify anything not captured. Storage object bytes require a separate backup if Storage is used; database backups contain only Storage metadata. Edge Functions and project-level Auth/API/Realtime settings require separate inventory/reconfiguration.
5. **Protect and verify the artifacts.** Store them in a user-controlled, access-restricted location outside Git; encrypt at rest; generate SHA-256 checksums and a manifest containing timestamps, tool versions, source project reference, included/excluded scopes, row-count summaries, and migration ledger state—but no private row data or credentials. Check that artifacts are non-empty and readable by the appropriate native restore/listing tool.
6. **Rehearse a full restore before production migration.** Restore into the explicitly authorized ordinary Free project using fail-fast, single-transaction behavior where supported. Do not point Cloudflare, `budg.ca`, production Auth redirects, or any production environment variable at it. Disable or withhold outbound integrations such as webhooks, `pg_net`, cron, emails, and Edge Functions so restored data cannot trigger real-world side effects.
7. **Prove equivalence without exposing user data.** Compare schema objects, constraints, functions, triggers, RLS policies, grants, extensions, migration history, Auth-user aggregate counts, and application-table aggregate counts between source and restore. Record permitted discrepancies and manually reconfigured platform settings. No emails, financial values, descriptions, UUIDs, tokens, or raw records may enter reports.
8. **Validate the migration on the restored copy.** Apply the candidate migrations only to the restored project, execute the rollback-only SQL verification suite, run Supabase security/performance advisors, generate TypeScript types from that verified project, integrate them locally, and rerun all application gates.
9. **Prepare but do not execute production cutover.** Require a maintenance/read-only window or other write freeze, a fresh final pre-migration backup and checksum, a record of the last accepted transaction timestamp/counts, timestamp-ordered migration application, immediate smoke tests, and explicit go/no-go checkpoints. Because the Free plan has no PITR, restoring the snapshot would discard writes accepted after that snapshot.
10. **Define recovery tiers.** Prefer a tested forward corrective migration for a contained schema/function defect; include a fast feature-disable path such as revoking only newly exposed RPC execution where safe; reserve full logical restore for unrecoverable cases. A full restore requires downtime, owner authorization, a reconciliation plan for any post-snapshot writes, and the rehearsed restore instructions. Do not describe it as an instant one-click rollback.
11. **Retain and dispose safely.** Define backup retention, encryption-key custody, restore-target cleanup, and secure deletion. Pausing, deleting, or repurposing a project remains a separate owner-authorized action.

The runbook must contain an explicit checklist with `PASS / FAIL / NOT TESTED` fields. Any `FAIL` or security-critical `NOT TESTED` blocks production migration.

Also create a second handoff prompt:

`docs/Codex-Task-Prompt-Product-UX-Follow-Ups-2-Backup-Restore-Rehearsal-2026-07-21.md`

That prompt must execute only backup creation, integrity validation, restore rehearsal, and migration verification against the separately authorized restore target. It must not apply anything to production. It must ask for explicit authorization before any project creation/reuse, before accessing a production database connection credential, and before any remote write. It must never copy production data into reports or Git.

Do not create a backup or restore target in this task. Do not install native PostgreSQL tools in this task. If no safe supported no-Docker path can be fully established from official documentation, mark the recovery gate blocked and explain the precise gap instead of improvising.

## Documentation updates

Update:

`docs/Product-UX-Follow-Ups-2-Implementation-Report-2026-07-21.md`

Correct statements that frame Docker as part of the established project workflow. Preserve the historical fact that a previous task attempted Docker and failed, but make clear that Docker is not required or intended going forward.

Create:

`docs/Product-UX-Follow-Ups-2-Remediation-Report-2026-07-21.md`

Include:

- branch and HEAD inspected;
- agent assignments and findings;
- exact files changed and why;
- each review finding and its resolution;
- migration invariants added;
- SQL verification scripts prepared but not executed;
- read-only production migration/grant findings;
- complete evaluation of the `20260707193257` ledger mismatch;
- Free-plan recovery inventory and any unsupported backup scope;
- links to the backup/restore runbook and second-task handoff prompt;
- explicit statement that neither a backup nor a restore rehearsal has yet occurred;
- local validation commands and exact results;
- remaining remote validation gates;
- confirmation that Docker was not used;
- confirmation that no Supabase environment was created or mutated;
- confirmation that no commit, push, PR, deployment, production test, or secret inspection occurred;
- a recommended prompt boundary for the next backup/restore-rehearsal task.

## Local validation gates

Run and report, if available:

- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd run test`
- focused new transaction tests
- `npm.cmd run build`
- `npm.cmd audit --omit=dev --audit-level=high`
- `npm.cmd audit --audit-level=high`
- `git diff --check`

Do not run any Supabase local-stack or Docker command. Do not claim SQL execution or generated-type validation in this task.

Inspect final Git status and diff. Confirm there are no environment files, secrets, credentials, build outputs, dependency changes, marketing code, PWA work, unrelated roadmap edits, or production identifiers in test fixtures/reports.

## Explicitly out of scope

- applying either new migration anywhere;
- migration-history repair;
- Supabase branch/project creation, deletion, reset, rebase, or merge;
- creating or restoring any database backup;
- accessing database passwords or connection strings;
- installing native PostgreSQL tools;
- generated types from an unverified schema;
- live data correction;
- Git commit/push/PR/merge;
- Cloudflare preview or deployment;
- Browser QA;
- Money Calendar;
- Mobile Today screen;
- Goal Arc;
- Plan Pulse;
- PWA or push notifications;
- new dependencies;
- unrelated UX changes.

## Completion criteria

This task is complete only when:

- the three review findings are corrected locally;
- focused tests pass;
- database semantic invariants are represented in the unapplied migration safely;
- isolated-project SQL verification scripts are present and static-reviewed;
- the Free-plan backup/restore runbook and second-task prompt are complete and grounded in current official Supabase guidance;
- production was read-only;
- all local gates that do not require a database pass or are accurately reported;
- the remediation report is complete;
- the Reviewer has no unresolved high- or medium-severity static findings;
- the task stops before remote database execution.

## Final response

Lead with whether the remediation is ready for the separately authorized backup/restore-rehearsal task. Then provide:

1. Findings fixed.
2. Migration/test files prepared.
3. Local validation results.
4. Production read-only findings and ledger status.
5. Recovery-scope findings, including whether Storage or other non-database services need separate treatment.
6. Any unresolved risks.
7. Links to the remediation report, backup/restore runbook, and second-task prompt.
8. A clear statement that no migration may be applied to production yet.
9. A request for the owner's separate next-task decisions:
   - identify an available ordinary Free-project slot or explicitly authorize creation/reuse of a restore target;
   - authorize secure, temporary use of a production database connection credential for the manual logical backup;
   - approve installation/use of compatible native PostgreSQL client tools if they are not already present.

Do not suggest applying the migrations directly to production.

---

End of prompt.
