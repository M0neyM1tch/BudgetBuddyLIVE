# Codex Task Prompt — Product/UX Follow-Ups 2 Rehearsal Continuation

Copy everything below the divider into a new Codex task opened at this repository root:

`C:\Users\Mitch\Documents\Codex\2026-06-24\i-am-working-on-a-budget\BudgetBuddyLIVE-export\repo`

---

You are continuing the **Product/UX-Follow-Ups-2 backup/restore rehearsal** for BudgBeacon. This is a continuation of an already active, carefully gated recovery task. Do not restart the implementation, redo completed discovery merely for appearance, or widen the scope. Read the existing evidence first, independently verify the small set of facts that can drift, and then resume at the exact current blocker: the sanitized, read-only Supabase Dashboard settings inventory.

## Primary objective

Complete, in controlled stages and only with the owner’s separate approvals at each write or credential boundary:

1. the remaining sanitized production project-settings inventory;
2. creation of a fresh isolated Supabase Free rehearsal project named `BudgBeacon-Rehearsal` in `us-east-2`;
3. a user-controlled encrypted logical backup of the current production database using the approved native PostgreSQL 17 tools and no Docker;
4. a restore rehearsal into that new isolated project;
5. a source-to-target recovery-equivalence proof;
6. rehearsal-only reconciliation of migration version `20260707193257` after proving its effects already exist;
7. rehearsal-only application of the two frozen Product/UX candidate migrations in order;
8. execution of the two frozen rollback-only SQL verification suites on the rehearsal project;
9. post-migration advisors, hosted type generation from the verified rehearsal schema, and local application gates;
10. comprehensive documentation of evidence, approvals, results, residual risks, cleanup options, and the later production decision.

Stop before any production migration, production migration-history repair, deployment, commit, push, PR, or merge. The end product of this task is evidence and a production go/no-go recommendation, not a production change.

## Mandatory first actions

Before taking task actions:

1. Read `AGENTS.md` completely.
2. Read `supabase/AGENTS.md` completely before touching anything under `supabase/`.
3. Read `src/AGENTS.md` completely before touching anything under `src/`.
4. Load and follow the Supabase skill for every Supabase action.
5. Load the in-app Browser control skill before using the existing browser session.
6. If current PostgreSQL or Supabase behavior matters, verify it against current primary documentation. Follow the Supabase skill’s changelog-first requirement and use Supabase/PostgreSQL primary sources. Do not substitute memory for version-sensitive behavior.
7. Spawn the read-only Architect first and wait for its plan, as required by `AGENTS.md`. Use the agent workflow specified below; do not give write ownership to multiple agents concurrently.

## Repository and branch state that must be preserved

- Repository root: `C:\Users\Mitch\Documents\Codex\2026-06-24\i-am-working-on-a-budget\BudgetBuddyLIVE-export\repo`
- Required branch: `Product/UX-Follow-Ups-2`
- Recorded HEAD: `5a7f61a3131b127dfc1f265ebfeb3583d8298d7c`
- Recorded merge base with `main`: `5a7f61a3131b127dfc1f265ebfeb3583d8298d7c`
- The branch contains a substantial dirty worktree with intentional modified and untracked implementation, documentation, migration, and SQL-test files.
- These changes belong to the owner. Preserve all of them.
- Do not switch branches, pull, merge, rebase, reset, restore, checkout files, stash, clean, or otherwise normalize the worktree.
- Do not commit, push, open a PR, deploy, or change dependencies.
- Do not claim the entire dirty worktree is hash-frozen. Only the four SQL artifacts listed below are currently frozen.

At the beginning, verify branch, HEAD, merge base, concise status, and the four frozen SHA-256 hashes read-only. If the branch, HEAD, merge base, or any frozen hash differs, stop before any remote write and report the exact discrepancy. Do not “fix” it automatically.

## Authoritative documents to read in full

Treat the documents as an evidence chain, not interchangeable summaries. Read them in this order:

1. `docs/BudgBeacon-Updated-Product-PWA-Monetization-Roadmap-2026-07-20.md`
   - This supplies the broader product sequence.
   - The current work is the Product/UX follow-up and database-safety gate associated with Phase 12.
   - Do not begin Money Calendar, Mobile Today, Goal Arc, Plan Pulse, push notifications, monetization, or additional rebrand work in this task.
2. `docs/Product-UX-Follow-Ups-2-Implementation-Report-2026-07-21.md`
   - Complete Phase 1/2 implementation inventory and behavioral intent.
3. `docs/Product-UX-Follow-Ups-2-Remediation-Report-2026-07-21.md`
   - Strengthened database invariants, frontend corrections, review findings, local gates, and known residual risk.
4. `docs/Product-UX-Follow-Ups-2-Free-Plan-Backup-and-Restore-Runbook-2026-07-21.md`
   - Governing Free-plan, no-Docker backup and restore procedure.
5. `docs/Product-UX-Follow-Ups-2-Backup-and-Restore-Rehearsal-Report-2026-07-22.md`
   - Current execution record and the most recent source inventory. This is the main live report to update.
6. `docs/Codex-Task-Prompt-Product-UX-Follow-Ups-2-Backup-Restore-Rehearsal-2026-07-21.md`
   - Original rehearsal authorization model and recovery scope.
7. `docs/Codex-Task-Prompt-Product-UX-Follow-Ups-2-Remediation-2026-07-21.md`
8. `docs/Codex-Task-Prompt-Product-UX-Follow-Ups-2-2026-07-21.md`
9. `docs/pre-phase-9-deployment-runbook.md`
10. `docs/BudgetBuddyLIVE-Launch-Audit-2026-07-07.md`
11. `docs/security.md`

Also read the relevant SQL completely before planning execution:

- `supabase/migrations/20260707193257_phase3_live_permission_hardening.sql`
- `supabase/migrations/20260721194230_product_ux_follow_ups_2_debt_goal_sync.sql`
- `supabase/migrations/20260721194410_product_ux_follow_ups_2_transaction_summary_and_retarget.sql`
- `supabase/tests/product_ux_follow_ups_2_schema_security.sql`
- `supabase/tests/product_ux_follow_ups_2_allocation_behavior.sql`

## Frozen SQL artifact identities

Verify these before continuing:

- `20260721194230_product_ux_follow_ups_2_debt_goal_sync.sql`
  - SHA-256: `678834847D83DB8F3607B13AD49D9DFA51935143C54D268F6658692F9B964B40`
- `20260721194410_product_ux_follow_ups_2_transaction_summary_and_retarget.sql`
  - SHA-256: `E7CF5834475DA1904E196895B056823773494DFB3C00811D9D6E89FFC8650A75`
- `product_ux_follow_ups_2_schema_security.sql`
  - SHA-256: `1B4EBB016BF2B0E7A7836B8444C878859D5CCE73F0D994A73A7FF1A15CE4497D`
- `product_ux_follow_ups_2_allocation_behavior.sql`
  - SHA-256: `DC4951408CD88716FB5F5533B8C4BA96913972BDEFE391DBB29297CAB6B9CFFE`

If either candidate migration changes after restored-copy validation, all restored-copy evidence for it is invalid. Obtain a new owner-confirmed freeze, record new hashes, and repeat the affected database verification. Never edit an already-applied historical migration in an environment where its version exists.

## Current completed state — do not repeat as unfinished work

### Local implementation and review

- Local Phase 1/2 implementation and remediation are complete.
- Final static review found no remaining high- or medium-severity issues.
- One documented low-severity defense-in-depth opportunity remains around an owner pre-inserting an exact future recurring occurrence; it is not part of this task.
- Previously completed application gates:
  - typecheck: PASS;
  - lint: PASS;
  - full tests: PASS — 20 files / 69 tests;
  - build: PASS;
  - production-dependency high-severity audit: PASS;
  - full dependency audit: still reports the pre-existing development-only `brace-expansion` advisory;
  - diff check, credential scan, and SQL static checks: PASS.
- Do not describe these historical gates as newly run. Run the required gates again only after verified hosted types or task-local changes make a rerun meaningful.

### Native PostgreSQL client gate

The approved EDB-certified PostgreSQL 17.10 Windows x86-64 Command Line Tools are installed side-by-side at:

- `C:\Program Files\PostgreSQL\17\bin\pg_dump.exe`
- `C:\Program Files\PostgreSQL\17\bin\pg_restore.exe`
- `C:\Program Files\PostgreSQL\17\bin\psql.exe`

All report version 17.10 when invoked by absolute path. PostgreSQL 16.10 remains installed and unchanged. The machine and user PATH are unchanged, so unqualified PostgreSQL commands still resolve to 16.10. No PostgreSQL 17 server, data directory, service, pgAdmin, or Stack Builder was installed, and no service was started.

Rules:

- Always use the absolute PostgreSQL 17 paths above.
- Never use unqualified `pg_dump`, `pg_restore`, or `psql` in this rehearsal.
- Do not install or use Docker. Docker has not been used in this project and is not required.
- Do not install another PostgreSQL server or start a local PostgreSQL service.

### Latest sanitized production database/catalog inventory

The active source is the healthy Free project `BudgetBuddy-V2` in `us-east-2`, running PostgreSQL 17.6. Keep its project reference and all sensitive identifiers out of repository documentation and chat.

Latest read-only facts:

- Auth users: 3.
- Storage buckets/objects: 0 / 0.
- Vault secrets: 0; application functions referencing Vault: 0.
- Cron jobs: 1 active.
- Database webhooks: 0.
- `pg_net`: not installed.
- `pgmq`: not installed; queues: 0.
- Realtime publication: 1; publication members: 0.
- Public application tables: 10; all have RLS enabled.
- Public RLS policies: 37.
- Public functions: 15.
- Public user triggers: 9.
- Private functions: 1.
- Auth trigger: `on_auth_user_created` invokes `private.handle_new_user()` and is enabled.
- `private.handle_new_user()` is `SECURITY DEFINER`; its definition, search path, grants, owner, and trigger relationship are recovery-critical and must be compared, not casually recreated.
- Edge Function: `process-recurring`, version 6, active, `verify_jwt = true`.
- Current advisors: one security warning for leaked-password protection being disabled and five informational unused-index notices. Five, not six, is the current comparison baseline.
- Public views: 0.
- Public sequences: 0.
- Constraints: 77.
- Indexes: 33.
- Current refreshed schema fingerprint: `5d30a2e99f0b354d4bec78aacde0b6f8`.
- Current refreshed policy fingerprint: `28bd5327ae357ca298b4dc7914437c8c`.
- The rehearsal report may also contain earlier opaque fingerprints. Treat the explicitly labeled latest refreshed values above as the current source baseline, explain any superseded values, and refresh them immediately before backup rather than silently mixing baselines.

Latest semantic preflight counts are all zero:

- dual targets;
- missing or cross-owner goal targets;
- missing or cross-owner debt targets;
- missing or cross-owner recurring-rule relationships;
- recurring debt targets;
- active targetless transfer rules;
- recurring relationship mismatches;
- goal/debt transaction semantic mismatches;
- debt-rule semantic mismatches;
- unallocated transfer transactions;
- archived targets;
- targeted transactions;
- debt-targeted recurring rules.

Do not inspect or record raw financial rows, emails, descriptions, notes, user IDs, or private values. Use schemas, catalogs, definitions, hashes, counts, and booleans only.

### Migration ledger state

- Production contains 22 migration versions through `20260702195005`.
- Production does not contain:
  - `20260707193257`;
  - `20260721194230`;
  - `20260721194410`.
- All material intended effects of `20260707193257_phase3_live_permission_hardening.sql` were previously found live even though its ledger row is absent.
- Preferred later reconciliation: after restoring and proving those effects on the rehearsal project, rehearse `supabase migration repair 20260707193257 --status applied` against the rehearsal project only. Migration repair changes the ledger; it must never replace an exact effect comparison and must not re-run the SQL.
- Any production migration-history repair is out of scope and requires a future separate authorization.

### Project selection and browser handoff

- The owner chose a **fresh ordinary Supabase Free project** named `BudgBeacon-Rehearsal` in `us-east-2`.
- The inactive legacy `BudgetBuddy` project must remain untouched. Do not resume, inspect for data, repurpose, clear, pause, delete, or modify it.
- This target selection is recorded intent, not authorization to create the project.
- A signed-in Supabase Dashboard session is currently available in the in-app Browser on the organization’s Projects page. The user has confirmed it is ready.
- Claim and use that existing tab read-only for the pending settings inventory. If the new task cannot access it or the session has expired, ask the user to reopen/sign in. Do not attempt an authentication bypass.
- Never reveal, copy, inspect, log, screenshot, or store API keys, database passwords, access tokens, cookies, complete endpoints, email addresses, template bodies, redirect URLs, or other secrets/private values.

## Exact current resume point

Database/catalog Phase A and the PostgreSQL 17 client gate are complete. Resume with the **read-only, sanitized non-database project-settings inventory** in the signed-in Supabase Dashboard.

Inventory facts needed, recording only sanitized enabled/disabled/count/presence results:

1. Auth Site URL and redirect allow-list configuration:
   - record whether configured and the count/category of entries;
   - do not copy or write the actual URLs.
2. Enabled Auth providers:
   - record provider names and enabled/disabled state only where not sensitive;
   - do not expose provider credentials, client IDs, secrets, or private contact information.
3. Email/SMTP/template configuration:
   - record built-in versus custom SMTP, enabled state, and template inventory/presence only;
   - do not reveal hostnames, senders, recipient data, usernames, passwords, or template bodies.
4. Data API configuration:
   - record exposed-schema names only if safe and required for reconstruction;
   - record whether new tables are automatically exposed or require explicit grants under the current project setting;
   - keep RLS and grants as separate controls in the analysis.
5. Realtime project-level settings relevant to reconstruction.
6. Edge Function project configuration/secrets:
   - record only that configuration or secret entries exist and, if safe, a count;
   - never reveal values, and avoid names if names themselves convey sensitive information.
7. Any additional project-level setting the runbook identifies as necessary to reconstruct an isolated rehearsal target.

Browser safety:

- This inventory is strictly read-only.
- Do not click Save, Update, Enable, Disable, Rotate, Reveal, Copy, Generate, Delete, Create, Restore, Resume, or similar mutation/revelation controls.
- Do not create the rehearsal project from the browser during this inventory.
- Do not take or retain screenshots containing sensitive configuration.
- If a value is masked, leave it masked.
- If viewing a setting requires revealing a secret or causes a write, mark it `NOT TESTED` and explain why.
- Update the rehearsal report/runbook only with sanitized facts.

## Required agent workflow

Use the repository’s defined agents and respect read/write ownership.

### 1. Architect — read-only, first

Have the Architect:

- read the full evidence chain and SQL;
- verify the continuation scope and non-goals;
- confirm the exact remaining gates and ordering;
- review the native no-Docker artifact design, exported-snapshot coherence requirement, Auth/roles/migration-ledger/managed-schema treatment, target isolation, and stop conditions;
- define an exact object allow-list strategy and acceptance criteria;
- identify any ambiguity between the report’s earlier and latest fingerprints;
- make no edits and no remote writes.

Wait for the Architect’s plan before delegating later work.

### 2. Browser/Platform Auditor — read-only

Assign only the sanitized Dashboard inventory described above. It must:

- load and follow the Browser skill;
- reuse the signed-in tab;
- make no platform changes;
- return only sanitized facts and `PASS` / `FAIL` / `NOT TESTED` results;
- immediately stop if the UI presents a secret-reveal or write boundary.

### 3. Supabase/Backup Engineer — bounded ownership

After the platform inventory passes and after each required owner approval, this agent may own only:

- Supabase read-only metadata/catalog refreshes;
- exact native PostgreSQL 17 backup commands and integrity checks;
- target preparation/restore steps specifically approved by the owner;
- target-only equivalence queries;
- target-only migration repair and candidate migration/test execution, each separately approved;
- generated hosted types from the verified target;
- no React presentation work, no Cloudflare work, and no production write.

It must use the Supabase skill, current docs, local CLI `--help`, and absolute PostgreSQL 17 paths. It must stop if file ownership or remote-write scope expands.

### 4. Reviewer — read-only, final

After rehearsal evidence and local gates are complete, run a final read-only review covering:

- recovery completeness and snapshot coherence;
- target isolation and absence of outbound side effects;
- schema, RLS, grants, default privileges, functions, triggers, constraints, indexes, extensions, Auth aggregates, app aggregates, and migration-ledger equivalence;
- migration-repair correctness;
- candidate migration and rollback-only suite results;
- privacy and secret-handling compliance;
- whether evidence supports a production go/no-go recommendation;
- unresolved risks and exact future approval boundaries.

Parent thread owns all user approval requests, integration, and report edits. Do not let two agents edit the same file concurrently.

## Approval model — mandatory staged pauses

The owner’s selection of a project name/region and completion of earlier prerequisites does not authorize later actions. Ask only when the immediately preceding gate has passed, and clearly state the exact effect of the requested action.

### Boundary A — allowed now without another approval

- Read local repository files.
- Run read-only Git status/hash commands.
- Use the Supabase connector for read-only metadata, catalogs, advisors, migration listings, aggregates, and documentation.
- Use the already signed-in Dashboard read-only for the sanitized settings inventory.
- Verify installed tool versions by absolute path.
- Update task documentation locally with sanitized evidence using `apply_patch`.

### Boundary B — project creation

Only after the settings inventory passes:

1. Recheck current project creation cost through the Supabase connector for the correct organization, ordinary project type, and `us-east-2` region.
2. State the returned cost exactly. A previous check showed `$0/month`, but that is stale until rechecked.
3. Complete the connector’s formal cost-confirmation step if available.
4. Ask the owner for explicit authorization to create exactly one ordinary Free project named `BudgBeacon-Rehearsal` in `us-east-2`.
5. Explain that this does not authorize credential access, restore, migrations, tests, or production changes.
6. Create it only after the explicit approval.

Do not create, resume, or modify any other project. If the Free active-project slot is unavailable or cost is nonzero/unexpected, stop and report it.

### Boundary C — artifact custody choices

Before a production backup, obtain explicit owner decisions for:

- encrypted artifact location outside the Git repository and outside publicly synchronized locations;
- retention duration;
- encryption-key custodian;
- cleanup/deletion expectation after the rehearsal;
- whether the project should remain active, be paused, or be deleted after evidence is complete. Do not perform cleanup merely because a preference was recorded; remote cleanup remains a later write approval.

Do not place backups, decrypted extracts, manifests containing private values, credentials, or keys in the repository.

### Boundary D — production database credential use

Ask separately for approval immediately before using a production database credential. Never ask the user to paste it into chat. Never print it, inspect it, store it in the repository, embed it in a connection URL, place it in command-line arguments, or leave it in shell history/logs.

Approved safe mechanisms, subject to user approval:

- an interactive password prompt; or
- a temporary `PGPASSFILE` outside the repository, created/managed so only the user can read it, whose contents the agent does not read or print, and which is deleted after the operation.

Use a direct database connection if reachable or the Supabase session pooler on port 5432 when required for IPv4. Never use transaction pooling on port 6543 for the backup/restore sequence.

Credential approval authorizes only the specifically described backup connection and read-only export. It does not authorize a production write or later target writes.

### Boundary E — every rehearsal-target write

Request approval immediately before each material target mutation category, including:

- enabling/configuring extensions or otherwise preparing the target;
- restoring roles/grants, schemas, Auth records, migration history, or application data;
- running `ANALYZE` or other post-restore writes;
- migration-history repair for `20260707193257`;
- applying `20260721194230`;
- applying `20260721194410`;
- creating temporary/synthetic Auth users or test data if required;
- executing rollback-only verification suites, even though they are designed to roll back;
- removing residual test state;
- pausing or deleting the target.

Group only actions that form one clearly described, reversible atomic step. Do not turn one approval into blanket authorization for all later writes.

### Always prohibited in this task

- Any production DDL, DML, migration, migration repair, Auth mutation, configuration change, or synthetic test.
- Any production deployment or Cloudflare/budg.ca change.
- Any modification to the inactive legacy project.
- Commit, push, PR, merge, branch switch, rebase, stash, clean, reset, or destructive Git operation.
- Docker installation/use.
- Dependency installation/update or lockfile modification.
- Environment-file inspection.
- Secret/key/token/cookie/password/complete endpoint inspection or recording.
- Raw financial data inspection or inclusion in reports/screenshots/logs.
- Confidence-level cleanup, new product features, PWA, Plan Pulse, push, Money Calendar, Mobile Today, Goal Arc, monetization, marketing, or further rebrand work.

## Native backup design requirements

Do not equate one unrestricted `pg_dump` with a complete Supabase project backup. Before credential access, prove and document a version-appropriate native PostgreSQL 17 sequence that explicitly classifies every recovery scope.

Required scope classifications:

1. App-owned `public` schema objects and data.
2. Required app-owned `private` objects.
3. Auth users/identities and the custom `on_auth_user_created` trigger contract.
4. Roles, memberships, grants, function execution privileges, and default privileges.
5. `supabase_migrations` history.
6. Installed extensions and target-compatible recreation order.
7. Modified managed-schema objects.
8. Storage metadata and Storage bytes.
9. Vault/encrypted data portability.
10. Edge Functions and secrets/configuration.
11. Auth/API/Realtime/project settings.
12. Cron, database webhooks, `pg_net`, queues, and external integrations.

Known current classifications that must be rechecked immediately before backup:

- Storage: zero buckets and objects; no byte artifact currently needed.
- Vault: zero secrets/references; no Vault payload currently needed.
- Realtime publication: zero members.
- Database webhooks: zero.
- `pg_net`/`pgmq`: not installed.
- One active cron job exists and must be withheld/neutralized on the target.
- `process-recurring` must not be deployed or invoked during the database rehearsal.

If any recheck becomes nonzero, stop and expand the artifact/recovery plan before continuing. Do not silently omit the newly used service.

### Snapshot coherence

Application/Auth/migration-history data artifacts and all source aggregate counts used for equivalence must be tied to one exported `REPEATABLE READ, READ ONLY` PostgreSQL snapshot held open by a coordinator connection. Pass that snapshot to compatible `pg_dump --snapshot` operations. Preserve the coordinator transaction until every snapshot-bound artifact and comparison aggregate is complete.

If the exact sequence cannot prove that every snapshot-bound artifact used the same snapshot, mark the backup `FAIL` and do not restore or claim recoverability.

Roles and project-level platform settings cannot share the database snapshot. Capture sanitized pre/post catalog/settings fingerprints and require them to remain stable across the backup window. Any material drift, unclassified object, or ambiguous ownership is `FAIL`.

### Backup artifact controls

- Use custom/archive formats where appropriate so `pg_restore --list` can validate content.
- Check every artifact is nonempty and readable/listable.
- Calculate SHA-256 checksums.
- Produce a sanitized manifest that lists categories, versions, hashes, timestamps, inclusions/exclusions, and reconstruction treatment without paths that leak private information or any credentials/private row data.
- Encrypt at rest using the owner-approved method and location.
- Keep decrypted temporary material outside the repo, minimize its lifetime, and verify deletion after use.
- Record exact client versions and the source server version.
- Never upload artifacts to chat, GitHub, or the repository.

## Rehearsal-target isolation and restore requirements

Before restoring anything, prove the target is the newly approved `BudgBeacon-Rehearsal` project and not production or the inactive legacy project. Record only a sanitized target identity in Git evidence.

The target must remain isolated:

- no Cloudflare or `budg.ca` connection;
- no production redirect values;
- no custom SMTP, email delivery, or SMS delivery;
- no Edge Function deployment;
- no cron activation;
- no database webhooks or outbound `pg_net` behavior;
- no production API keys or secrets;
- no production Storage bytes;
- no real-user communications;
- no third-party integration activation.

Map Supabase-managed roles rather than blindly recreating their passwords or managed attributes. Restore only the explicit, reviewed allow-list in a proven order. Use fail-fast behavior and a single transaction where supported. Treat expected Supabase-managed-object conflicts explicitly; never use broad error suppression that could hide a failed security object.

Run `ANALYZE` only after a separate target-write approval. Do not “fix forward” a failed restore without first documenting the failure, determining whether the artifact or sequence is wrong, and obtaining approval for the revised write.

## Equivalence proof before migration testing

The restored target must match the source recovery contract before any migration-history repair or candidate migration is tested. Compare at least:

- schema/object inventory and definitions;
- table/column types, defaults, nullability, generated/identity behavior;
- constraints and foreign keys;
- indexes;
- RLS enabled/forced state;
- policy definitions and role targets;
- table, sequence, schema, and function grants;
- default privileges;
- function definitions, owners, volatility, security mode, search paths, and execute privileges;
- triggers, including `on_auth_user_created`;
- extension names/versions and necessary settings;
- migration-ledger versions;
- Auth user/identity aggregate counts;
- application-table aggregate counts;
- Storage/Vault/Realtime/cron/outbound classifications;
- schema, policy, grant, and default-privilege fingerprints;
- the semantic preflight aggregates.

Use counts and opaque fingerprints, never raw user or financial records. Any unexpected difference in an authorization, trigger, function, managed-schema, Auth, or migration-history object is security-critical and blocks later migration testing.

## Migration-history reconciliation on rehearsal only

After restore equivalence passes:

1. Compare every material effect of `20260707193257_phase3_live_permission_hardening.sql` on the restored target against the SQL file:
   - intended authenticated table DML/read surface;
   - absence of unintended `anon`/`PUBLIC` table access;
   - intended authenticated function execute allow-list;
   - absence of unintended `anon`/`PUBLIC` function execution;
   - service-role-only recurring processor behavior;
   - relevant default table, sequence, and function privileges.
2. Confirm the effects exist and the ledger version is absent.
3. Inspect the installed Supabase CLI version and the exact `migration repair --help` output; do not guess flags.
4. Show the planned target-only command and request separate owner approval.
5. Run `migration repair 20260707193257 --status applied` against the rehearsal project only.
6. Verify the ledger now contains the version exactly once and that no schema/grant/function effects changed.
7. Verify the subsequent migration plan/dry-run does not attempt to reapply `20260707193257`.

If any intended effect is missing or different, do not repair the ledger. Mark the gate `FAIL` and propose an idempotent reconciliation migration for later review; do not create or apply it in this task unless the owner separately expands scope.

## Candidate migration rehearsal

Only after equivalence and ledger reconciliation pass:

1. Reverify both candidate hashes.
2. Re-run the source/target semantic preflights and require the documented zero conditions where the migration expects them.
3. Inspect CLI help and produce a dry-run/migration plan when supported.
4. Ask for separate approval to apply `20260721194230_product_ux_follow_ups_2_debt_goal_sync.sql` to the rehearsal target only.
5. Apply it, verify its ledger entry, schema contract, grants/RLS, and postconditions.
6. Stop on any unexpected warning/error/drift; do not continue to the second migration.
7. Ask separately for approval to apply `20260721194410_product_ux_follow_ups_2_transaction_summary_and_retarget.sql` to the rehearsal target only.
8. Apply it, verify its ledger entry, schema contract, constraints, ownership FKs, RPC/function security, grants/RLS, and postconditions.

No candidate migration may be applied to production in this task.

## Rollback-only SQL verification

After both candidate migrations pass, inspect both verification files again and confirm they:

- begin a transaction;
- create only isolated synthetic state;
- test owner access, cross-user denial, anonymous denial, insert ownership forgery, update reassignment, target semantics, recurring behavior, idempotency, retargeting/deletion behavior, and global summary behavior as designed;
- finish with `ROLLBACK`;
- contain no production identifiers or credentials.

Then:

1. obtain separate approval for any required synthetic Auth users/test setup;
2. obtain approval to execute the rollback-only suites on the rehearsal target;
3. use the absolute PostgreSQL 17 `psql.exe` path;
4. run schema/security first, then allocation behavior;
5. prove `ROLLBACK` occurred;
6. compare before/after aggregate counts and named synthetic-object checks to prove no residual rows, users, grants, or objects remain;
7. stop on any failure—do not edit expectations to make a failing behavior pass without investigating the underlying contract.

## Post-migration checks and local integration

If database verification passes:

1. Run Supabase security and performance advisors on the rehearsal target.
2. Compare them with the current source baseline of one leaked-password-protection warning and five unused-index notices.
3. Classify new findings separately from inherited findings.
4. Generate TypeScript database types from the verified rehearsal project.
5. Generate to a temporary location outside the repo first, compare with the tracked generated types, and integrate only the intended schema changes. Follow repository file-editing rules; do not blindly overwrite unrelated dirty-worktree changes.
6. Do not place project references, keys, or secrets in generated/tracked output.
7. Run, at minimum:
   - focused Product/UX frontend tests;
   - `npm.cmd run typecheck`;
   - `npm.cmd run lint`;
   - `npm.cmd run test`;
   - `npm.cmd run build`;
   - `npm.cmd audit --omit=dev --audit-level=high`;
   - `npm.cmd audit --audit-level=high`;
   - `git diff --check`;
   - credential/secret scan scoped so it does not print secrets;
   - final diff/status review.
8. Do not run an audit auto-fix or change dependencies. Record the known development-only `brace-expansion` advisory if it remains.

## Documentation requirements

Maintain these as the main evidence files:

- `docs/Product-UX-Follow-Ups-2-Backup-and-Restore-Rehearsal-Report-2026-07-22.md`
- `docs/Product-UX-Follow-Ups-2-Free-Plan-Backup-and-Restore-Runbook-2026-07-21.md`
- update `docs/Product-UX-Follow-Ups-2-Remediation-Report-2026-07-21.md` only if its handoff status materially changes; do not rewrite historical evidence.

Use `PASS`, `FAIL`, or `NOT TESTED` precisely. Never say a check passed unless it actually ran successfully. Record:

- branch/HEAD/merge base and frozen hashes;
- read-only platform settings inventory, sanitized;
- current docs/changelog conclusions;
- each user approval with scope, without sensitive data;
- cost and formal cost confirmation;
- target creation result and sanitized identity;
- PostgreSQL and Supabase CLI versions;
- artifact scope, snapshot ID treatment, formats, checksums, encryption/retention controls, and cleanup status without sensitive paths/values;
- source/target equivalence results and fingerprints;
- `20260707193257` effect comparison and rehearsal-only repair result;
- each candidate migration result;
- each rollback-only suite result and residual-state proof;
- advisor comparison;
- hosted type-generation result;
- local gate commands and actual outcomes;
- unresolved risks, especially any `FAIL` or security-critical `NOT TESTED`;
- explicit confirmation of everything not changed.

Never put project references, connection strings, database hosts, usernames, emails, redirect values, full URLs from private configuration, keys, tokens, cookies, passwords, private row data, complete endpoints, or dynamically supplied secret-bearing data in repository files.

## Stop conditions

Stop immediately and report rather than improvising if:

- the required branch/HEAD/merge base or frozen hashes differ;
- the signed-in browser is unavailable or a required setting cannot be inspected without revealing a secret or writing;
- project cost/plan/slot differs from expectations;
- target identity is ambiguous;
- production and target connection identity cannot be positively distinguished;
- snapshot coherence cannot be proven;
- Auth, roles/grants, migration history, managed-schema objects, Storage, Vault, or external-service treatment is unclassified;
- a recheck shows Storage objects or Vault usage and no expanded plan is approved;
- roles/settings drift during the backup window;
- restore equivalence fails;
- any material `20260707193257` effect is absent/different;
- either candidate hash changes;
- a migration or verification suite fails;
- rollback leaves residual synthetic state;
- a secret/private value is at risk of entering chat, logs, commands, screenshots, or Git;
- an action would mutate production, the legacy project, Cloudflare, or Git history;
- safe progress requires authority not explicitly granted.

Do not retry the same failed method more than two or three times. Reassess using current docs and error evidence.

## Definition of done for this continuation

This task is complete only when either:

### Successful rehearsal outcome

- the sanitized project-settings inventory is complete;
- the fresh rehearsal project was separately approved and created;
- the encrypted native backup scope and exported-snapshot coherence are proved;
- restore equivalence passes;
- `20260707193257` effects are proved and its ledger repair succeeds on rehearsal only;
- both frozen candidate migrations pass on rehearsal only;
- both rollback-only verification suites pass with no residual state;
- advisors, hosted types, and local gates are complete;
- final read-only review finds no high/medium blocker;
- reports contain a clear production go/no-go recommendation and exact future approval steps;
- production, legacy project, Cloudflare, Git history, and deployments remain unchanged.

### Controlled blocked outcome

- a concrete safety or correctness gate fails or remains security-critically `NOT TESTED`;
- all safe read-only work and alternatives are exhausted;
- reports identify the exact blocker, evidence, affected gate, and next owner decision;
- no unauthorized remote write or credential access occurred.

Do not mark the task complete merely because it reaches an approval boundary. Ask the narrow approval, wait, and continue when supplied. Provide concise commentary updates during long operations and never leave the owner without an update for more than roughly 60 seconds.

## First user-facing update for the new task

Begin by stating, concisely:

- that you have loaded the repository instructions and are continuing—not restarting—the rehearsal;
- that the dirty `Product/UX-Follow-Ups-2` worktree will be preserved;
- that PostgreSQL 17.10 and the database/catalog inventory gates are already complete;
- that you are first claiming the existing signed-in Supabase Dashboard tab for a strictly read-only, sanitized settings inventory;
- that no project creation, credential access, backup, restore, migration, production change, commit, push, or deployment will occur without the required later approval.

Then proceed with the Architect and the read-only current-state verification.
