# Product/UX Follow-Ups 2 — Free-Plan Backup and Restore Runbook

Date prepared: 2026-07-21
Workflow: hosted Supabase Free plan, native PostgreSQL clients, no Docker
Status: **NOT EXECUTED — production migration is blocked**

## Purpose and hard boundary

This runbook prepares a later, separately authorized manual logical backup, integrity check, restore rehearsal, and candidate-migration verification. It does not authorize project creation or reuse, credential access, a remote write, a backup, a restore, a migration-history repair, or a production migration.

Supabase automatically backs up Pro, Team, and Enterprise projects, while Free projects are directed to maintain manual off-site exports. PITR is a paid-plan add-on, Branching is a paid deployment feature, and managed Restore to a New Project requires a paid source with physical backups. An ordinary second Free project is independent infrastructure, not a Supabase Branch. The Free allowance is two active projects; a paused project does not authorize reuse or deletion. Sources: [Database Backups](https://supabase.com/docs/guides/platform/backups), [Branching](https://supabase.com/docs/guides/deployment/branching), [Restore to a new project](https://supabase.com/docs/guides/platform/clone-project), [Billing](https://supabase.com/docs/guides/platform/billing-on-supabase).

The Supabase CLI `db dump` path is not used: current CLI dumping is container-backed and its default scope excludes managed schemas, data, and custom roles. Native `pg_dump`, `pg_restore`, and `psql` are the no-Docker tools. A native logical dump is a database-scope artifact, not proof of a complete Supabase-project recovery. Sources: [Supabase backup/restore guide](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore), [CLI reference](https://supabase.com/docs/reference/cli/supabase-bootstrap), [PostgreSQL 17 pg_dump](https://www.postgresql.org/docs/17/app-pgdump.html).

## Frozen candidate and read-only baseline

- Git branch: `Product/UX-Follow-Ups-2`
- Git HEAD: `5a7f61a3131b127dfc1f265ebfeb3583d8298d7c`
- Merge base with `main`: `5a7f61a3131b127dfc1f265ebfeb3583d8298d7c`
- Candidate migration `20260721194230_product_ux_follow_ups_2_debt_goal_sync.sql` SHA-256: `678834847D83DB8F3607B13AD49D9DFA51935143C54D268F6658692F9B964B40`
- Candidate migration `20260721194410_product_ux_follow_ups_2_transaction_summary_and_retarget.sql` SHA-256: `E7CF5834475DA1904E196895B056823773494DFB3C00811D9D6E89FFC8650A75`
- Active hosted project: `BudgetBuddy-V2`, healthy, `us-east-2`, PostgreSQL 17.6, Free organization. The project reference belongs only in access-restricted operational evidence outside Git.
- Other visible project: `BudgetBuddy`, inactive. Its contents are unknown and it is not an authorized restore target.
- Hosted migration ledger: 22 entries through `20260702195005`; `20260707193257`, `20260721194230`, and `20260721194410` are absent.
- `20260707193257_phase3_live_permission_hardening.sql`: all intended table, function, and default-privilege effects were found, but its ledger row is absent. A separately authorized, rehearsed `migration repair --status applied` is the preferred disposition; no repair occurred here.
- Data-shape preflight at inspection time: zero targeted transactions, zero debt-targeted recurring rules, zero dual targets, zero unallocated transfers, zero foreign/archived targets, and zero semantic mismatches.
- Recovery inventory at inspection time: three Auth users; application data present; zero Storage buckets/objects; Vault installed with zero secrets; one active cron job; one JWT-verified `process-recurring` Edge Function; no database webhooks; no Realtime publication members; installed extensions `pg_cron`, `pg_stat_statements`, `pgcrypto`, `plpgsql`, `supabase_vault`, and `uuid-ossp`.
- Initial advisors: one security warning for leaked-password protection disabled; six informational unused-index notices. The 2026-07-22 refresh found the same security warning and five informational unused-index notices, so the current five-notice set is the comparison baseline for later rehearsal checks.

Re-run the full read-only baseline at backup time and again during the production write freeze. Aggregate facts may change. If either migration file changes after restored-copy validation, update its hash and repeat database verification.

### Sanitized non-database settings baseline

The signed-in Dashboard inventory completed read-only on 2026-07-22. This baseline contains reconstruction facts only; it deliberately omits project references, endpoints, URLs, email addresses, SMTP details, secret names/values/digests, template bodies, and credentials.

- Auth uses one custom HTTPS Site URL and 7 redirect entries: 6 HTTPS production/preview entries and 1 local-development HTTP entry, with no wildcard entry.
- New-user signup and email confirmation are enabled. Manual linking and anonymous sign-ins are disabled. Email is the only enabled sign-in provider.
- Custom SMTP is enabled. Thirteen Auth email/notification template categories are present. No private SMTP or template value was inspected or recorded.
- Compromised-refresh-token detection is enabled with a 10-second reuse interval. TOTP MFA and enhanced MFA security are enabled; SMS MFA is unavailable on Free. CAPTCHA, leaked-password protection, and Auth hooks are disabled/unconfigured.
- Data API is enabled for `graphql_public` and `public`; `private` is not exposed. Automatic exposure of new tables is disabled. Treat Dashboard schema/object exposure, PostgreSQL grants, and RLS as separate controls and compare each independently.
- Realtime is enabled with public channels allowed, authorization pool size 2, and visible plan limits of 200 concurrent users, 100 events/second, 20 presence events/second, and 256 KB payloads. The source publication has zero members.
- One active Edge Function uses legacy-JWT verification. Two custom and ten platform-default secret entries exist; no name, value, or digest was inspected. Withhold function deployment/invocation on the rehearsal target.
- Installed platform integrations are Cron, Data API, and Vault. Project-level GitHub/Vercel/AWS private connections, Auth hooks, and custom domains are absent.

This settings baseline is `PASS`. Later read-only catalog work froze the durable Auth allow-list, compatibility fingerprint, role mapping, app-owned event trigger, and canonical privilege comparisons described in section 4.1. No target configuration, credential access, artifact creation, or restore is implied.

## 1. Freeze and identify the release candidate

1. Confirm the branch and HEAD without switching, pulling, rebasing, resetting, stashing, or cleaning.
2. Compute SHA-256 for both migration files and record the hashes in an access-restricted manifest outside the repository.
3. Record PostgreSQL server major/minor, native-client versions, hosted migration ledger, extensions, publications, cron/webhooks, Edge Functions, Storage/Vault usage, schema-object counts, grants/RLS, Auth-user count, and application-table counts.
4. Record schema/configuration facts and aggregate counts only. Do not export row samples, emails, UUIDs, descriptions, balances, tokens, endpoints, or secrets into reports.
5. Stop if the candidate differs from this frozen record.

## 2. Select a restore target with explicit approval

1. Ask the owner to identify an available ordinary Free-project slot or explicitly approve creating a new ordinary Free project.
   - 2026-07-22 result: after the connector reported one healthy active project and one inactive legacy project, quoted one new ordinary project at exactly `$0/month`, and completed its formal zero-cost acknowledgement, the owner explicitly authorized exactly one ordinary project named `BudgBeacon-Rehearsal` in `us-east-2`. The connector created it once; it became healthy on the Free plan. The inactive legacy project was not reused or changed.
2. Creating a project is a remote write and needs explicit approval immediately before the action.
3. Reusing any existing project requires the owner to identify it and explicitly confirm that its contents may be destroyed. Never assume the inactive `BudgetBuddy` project is disposable.
4. Keep the restore project isolated. Do not connect Cloudflare, `budg.ca`, production redirects, production environment variables, production email delivery, or external integrations.
5. Do not call the restore project a Branch; it is an independent ordinary project.

## 3. Verify native PostgreSQL clients and connection mode

The source currently runs PostgreSQL 17. Use native PostgreSQL 17 or newer clients. PostgreSQL `pg_dump` can dump its own or older server major versions and refuses newer server majors. EDB-certified PostgreSQL 17.10 Command Line Tools are installed side-by-side at `C:\Program Files\PostgreSQL\17`; PostgreSQL 16.10 and PATH remain unchanged. Use the absolute PostgreSQL 17 paths for every rehearsal command and verify all three tools before requesting a database credential:

```powershell
& 'C:\Program Files\PostgreSQL\17\bin\pg_dump.exe' --version
& 'C:\Program Files\PostgreSQL\17\bin\pg_restore.exe' --version
& 'C:\Program Files\PostgreSQL\17\bin\psql.exe' --version
```

Use the direct database connection for dump/restore when reachable. If the workstation is IPv4-only and the project lacks the IPv4 add-on, use the shared **session** pooler on port 5432. Never use transaction pooling on port 6543 for dump/restore. Source: [Connect to Postgres](https://supabase.com/docs/guides/database/connecting-to-postgres).

Credential rules:

- Obtain explicit authorization before accessing the production database connection credential.
- Prefer libpq's interactive password prompt (`--password`) with a connection string that omits the password.
- Do not place a password in a command, URL, process argument, shell history, environment file, Git file, report, screenshot, or task message.
- A temporary native credential file may be used only if the owner approves it, OS permissions restrict it to the current user, its path is outside the repository, and it is securely deleted immediately after use. Never print its contents.
- Do not use `.env` files and do not inspect existing environment files.

## 4. Create a manual logical backup outside the repository

The exact artifact set is a rehearsal gate, not an assumption. Supabase's official migration guide separates roles, schema, data, migration history, modified managed-schema objects, and platform services. Before dumping, write a sanitized scope manifest that labels every item `INCLUDED`, `SEPARATE ARTIFACT`, `RECONFIGURE`, `NOT USED`, or `UNVERIFIED`.

At minimum evaluate:

| Scope | Required treatment |
| --- | --- |
| App-owned schemas/data (`public`, `private`, and any other app schema) | Native logical dump and restored-copy proof |
| Auth users/records | Separate, explicitly proven supported artifact/restore path; do not assume a default dump includes them |
| Roles and grants | Separate roles/grants artifact and catalog comparison; passwords are not recoverable from normal backups |
| `supabase_migrations.schema_migrations` | Separate ledger artifact/restore step per official guide |
| Extensions | Inventory and enable supported extensions on target before dependent objects |
| Modified `auth`/`storage` objects | Separate object definitions/restore step; preserve the custom Auth trigger and `private.handle_new_user` contract |
| Vault/column encryption | Block until key-safe restore treatment is proven; never export root-key material into Git/reports |
| Storage metadata | Database scope only |
| Storage object bytes | Separate object backup if object count becomes nonzero; current count is zero but must be rechecked |
| Edge Functions | Preserve repository source/config and redeploy separately only with approval; database dump does not include deployment |
| Auth settings, redirects, templates, API keys | Inventory/reconfigure separately; never record key values |
| Realtime settings/publications | Inventory/reconfigure separately |
| Cron, webhooks, `pg_net`, external integrations | Withhold or disable before restore to prevent side effects |

Native command skeletons use credential-free placeholders only. Final schema flags and artifact ordering must be approved from the inventory and proved on the restore target:

```powershell
# Example database-scope archive. The approved task must supply the exact
# app-owned schema include/exclude flags from its sanitized inventory.
pg_dump --password --format=custom --file "<OUTSIDE_REPO>\database-scope.dump" `
  --dbname "<SOURCE_DIRECT_OR_SESSION_POOLER_URL_WITHOUT_PASSWORD>" `
  <APPROVED_SCHEMA_AND_SCOPE_FLAGS>

pg_restore --list "<OUTSIDE_REPO>\database-scope.dump"
```

Do not use a raw unrestricted all-schema dump as a claimed complete backup. Supabase-managed schemas can require special ordering and target-specific handling. If the official guide and rehearsal cannot establish a safe Auth/roles/managed-schema sequence, mark recovery `FAIL` and stop.

### 4.1 Freeze the exact scope before any dump

Phase C must not begin from the generic command skeleton above. After the current read-only inventory is complete, create an access-restricted object manifest outside Git and freeze each of these sets:

- **App-owned database objects:** exact schemas, tables, sequences, views, functions/signatures, triggers, constraints, indexes, policies, owners, grants, and default privileges. The provisional schema allow-list is `public` plus verified app-owned objects in `private`; it is not approved until every included object is enumerated and every excluded object is classified.
- **Application table data:** the exact ten `public` application tables found by the current inventory, plus any verified app-owned table outside `public`. Record aggregate counts only in the sanitized report. The external manifest may use object names but must contain no row samples.
- **Auth:** the exact supported Auth tables required to preserve users and identities, plus the custom Auth trigger and `private.handle_new_user` contract. Do not treat all of `auth` as app-owned or restore it wholesale without the current Supabase guide and a target compatibility proof.
- **Storage:** exact metadata tables only if current usage requires them. Object bytes are a separate artifact and are never inferred from database metadata.
- **Migration ledger:** `supabase_migrations.schema_migrations` as its own artifact and restore unit.
- **Database roles:** an explicit custom-role allow-list and grant/default-privilege catalog. Supabase-managed roles such as `anon`, `authenticated`, and `service_role` must be mapped to the target's managed roles, not recreated or overwritten. Role passwords and managed role attributes are excluded.
- **Extensions and extension-owned schemas:** inventory/version facts only in the database artifact plan. Enable each supported extension on the target through a separately approved write before dependent objects; do not restore extension-owned schemas as app data unless current official guidance explicitly requires it.
- **Excluded platform/system scope:** `pg_catalog`, `information_schema`, platform-owned schemas and roles, API keys, Auth provider configuration, redirects/templates, Edge Function deployments/secrets, Realtime platform settings, cron execution, webhooks, `pg_net`, and external integrations. Each requires a `RECONFIGURE`, `WITHHOLD`, or proven `NOT USED` treatment.
- **Vault/encryption:** no raw portability assumption. Current usage, encrypted columns, and the supported destination root-key treatment must all be `PASS` before any artifact containing ciphertext can be called recoverable.

The manifest must record why every excluded object is excluded and how it is re-created, mapped, withheld, or proved unused. Any unclassified object or role is `UNVERIFIED` and blocks backup creation.

Current exact proposal, still awaiting owner approval:

- Include the six public enums, ten named public tables, fourteen ordinary public functions, `private.handle_new_user()`, 9 app table triggers, 37 policies, 77 constraints, 33 indexes, ownership, RLS flags, and exact signature/object grants. The fifteenth public function, `rls_auto_enable()`, is handled with its event trigger as the separate security artifact below. There are no app sequences or column-specific ACLs.
- Treat `public.rls_auto_enable()` and its enabled `ensure_rls` DDL event trigger as a separate app-owned security artifact. It is `postgres`-owned, `SECURITY DEFINER`, fixed to `search_path=pg_catalog`, and executable only by `postgres`; restore the pair last after verifying RLS is already enabled on all ten tables.
- Restore Auth data from exactly `auth.users` and `auth.identities`. The source has 3 users, 3 email identities, and 0 orphan identities. Source/target compatibility matches for columns (`fa191cc0f72038cd58cc33bd7c20069c`), 6 constraints (`c7385b453077059d647cc1eede7e2327`), 19 indexes (`5752bf95965e4c62bf7a021c42b8e82d`), and the absence of non-custom user triggers. Exclude sessions, refresh tokens, session-bound MFA AMR claims, one-time tokens, and every other transient Auth table; users must reauthenticate.
- Restore no role definitions or memberships. Exclude the source-only operational login `cli_login_postgres`; map `postgres`, `authenticated`, `service_role`, and other Supabase-managed roles to their existing target roles.
- Freeze canonical source comparisons: table ACL `effed6368c1c73a40d4d78fae7769205`, function ACL `25edf70b9f4a71f1517af9abc6425c26`, schema ACL `eded11b98a2e6564fa7a856a22b8c814`, and default privileges `b48c23e9e959620e189a5de6d9dcb29b`.
- Before creating any app table, separately approve turning the fresh target's Data API automatic-exposure setting off. Its current canonical default privileges (`61e7853a5d07dbca3edf75b38ac61b96`) are broader than the source because auto-exposure is on. Recheck the resulting target defaults before restore and preserve target-managed `supabase_admin` defaults.
- Create one exported snapshot and derive separate schema, durable Auth data, app data, migration-ledger, custom Auth trigger, RLS event-trigger, ACL/default-privilege, aggregate-evidence, and checksum artifacts. A roles-only dump is evidence only and must never be restored wholesale.

### 4.2 Require one coherent database snapshot

All database table-data artifacts, including separate app-data, Auth-data, Storage-metadata, and migration-ledger artifacts, must represent one PostgreSQL snapshot:

1. Open a coordinator connection and begin a `REPEATABLE READ, READ ONLY` transaction.
2. Export that transaction's snapshot and keep the coordinator transaction open.
3. Run each compatible native `pg_dump` artifact against that same exported snapshot.
4. Run source aggregate counts and schema/catalog facts that support equivalence inside the coordinator transaction or another session using the same snapshot.
5. Commit the coordinator only after every snapshot-bound artifact and aggregate completes successfully.

The snapshot identifier is ephemeral operational material and must not be written to Git or reports. Role definitions and platform settings cannot share the database snapshot; capture sanitized pre/post catalog fingerprints and fail if either changes during the backup window. If the source or connection mode cannot support the exported-snapshot sequence, or if any required artifact cannot join it, mark snapshot coherence `FAIL` and stop.

## 5. Protect and verify artifacts

1. Store all artifacts outside the repository in a user-controlled, access-restricted, encrypted-at-rest location.
2. Confirm every expected artifact exists and is non-empty.
3. For custom-format archives, require `pg_restore --list` to succeed.
4. Generate SHA-256 checksums with `Get-FileHash -Algorithm SHA256` and store the checksum manifest beside the encrypted artifacts, never in Git.
5. Record UTC timestamps, native tool versions, source project reference, included/excluded scopes, aggregate row counts, schema-object counts, and migration-ledger state. Record no raw rows or credentials.
6. Treat dump contents as trusted-sensitive production data. PostgreSQL warns that restore executes SQL selected from the source archive; inspect the archive list before restore.
7. A non-empty, readable, checksummed file is not an accepted recovery point until restore succeeds and equivalence is proved.

## 6. Rehearse a full restore

1. Obtain explicit approval immediately before every remote write and before using or clearing a restore target.
2. Withhold Edge Function deployment, email/SMS providers, Auth production redirects, webhooks, cron execution, `pg_net`, and other outbound integrations.
3. Establish required extensions and approved prerequisite roles/settings without copying production secrets.
4. Restore in the exact documented and rehearsed order. For a custom archive where supported:

```powershell
pg_restore --password --exit-on-error --single-transaction `
  --dbname "<RESTORE_TARGET_URL_WITHOUT_PASSWORD>" `
  "<OUTSIDE_REPO>\database-scope.dump"
```

For an approved plain-SQL multi-file sequence:

```powershell
psql --password --single-transaction --variable ON_ERROR_STOP=1 `
  --file "<OUTSIDE_REPO>\roles.sql" `
  --file "<OUTSIDE_REPO>\schema.sql" `
  --file "<OUTSIDE_REPO>\data.sql" `
  --dbname "<RESTORE_TARGET_URL_WITHOUT_PASSWORD>"
```

Do not combine `pg_restore --single-transaction` with parallel jobs. Stop on the first error. After a successful restore, run `ANALYZE`; dump files do not preserve planner statistics.

## 7. Prove equivalence without exposing user data

Compare source and restored target using schema facts and aggregate counts only:

- schemas, tables, views, sequences, functions/signatures, owners, constraints, indexes, triggers, and comments;
- RLS enabled state and policy definitions;
- table/sequence/function grants and default privileges;
- extensions and versions;
- migration ledger versions/count;
- Auth-user aggregate count;
- per-application-table aggregate row counts;
- modified `auth`/`storage` object inventory;
- Storage bucket/object counts;
- Vault secret count and encryption-treatment status without secret values;
- publications, cron/webhooks, and external integration status;
- separately reconfigured platform settings.

Document permitted discrepancies. Aggregate equality supports consistency but is not byte-for-byte proof. Any unexplained difference is `FAIL`.

## 8. Validate the candidate on the restored copy

Only after restore equivalence passes:

1. Rehearse the approved `20260707193257` migration-ledger repair on the restore target. `migration repair --status applied` inserts a ledger record; it does not apply SQL.
2. Apply `20260721194230`, then `20260721194410`, to the restored project only.
3. Confirm expected ledger entries and schema/grant objects after each migration.
4. Execute the rollback-only SQL suites in `supabase/tests/`; confirm they end in `ROLLBACK` and leave no users, rows, roles, objects, or configuration.
5. Run Supabase security and performance advisors and compare them with the pre-existing baseline.
6. Generate TypeScript types only from this verified project:

```powershell
supabase gen types typescript --project-id "<VERIFIED_RESTORE_PROJECT_REF>" --schema public > "<APPROVED_OUTPUT_PATH>"
```

7. Review generated types, integrate them locally, and rerun TypeScript, lint, focused/full tests, build, both audits, and `git diff --check`.

## 9. Prepare, but do not execute, production cutover

Production migration requires a separate approval after all rehearsal gates pass:

1. Schedule a maintenance/read-only window or otherwise guarantee a write freeze.
2. Re-run preflight invariants and migration ledger inspection.
3. Create a fresh final logical backup under the proved procedure, checksum it, and verify readability.
4. Record only aggregate transaction counts and the last accepted transaction timestamp as a sanitized watermark; do not record row data.
5. Apply migrations in timestamp order with explicit go/no-go after ledger/object checks for each.
6. Run immediate owner/anonymous/grant/semantic smoke checks using synthetic or aggregate-safe mechanisms.
7. Do not deploy the matching frontend until both migration versions and required RPCs are verified.

Because Free has no PITR, a snapshot restore discards every write accepted after that snapshot. A write freeze plus reconciliation plan is mandatory.

## 10. Recovery tiers

1. **Contained defect:** prefer a tested forward corrective migration that preserves additive relationship and allocation metadata.
2. **Fast feature disable:** where safe, use an authorized forward change to revoke only newly exposed RPC execution or replace a callable function with a safe failing implementation. Do not weaken RLS.
3. **Full logical restore:** reserve for unrecoverable corruption. It requires downtime, owner authorization, the rehearsed artifact sequence, reconfiguration of excluded services, and reconciliation or accepted loss of post-snapshot writes. It is not an instant one-click rollback.

Do not casually drop `linked_debt_id`, `allocation_applied_cents`, client operation IDs, constraints, or history after new writes depend on them.

## 11. Retention and disposal

- The owner must choose retention duration and encryption-key custodian before backup creation.
- Keep artifacts encrypted, access-restricted, outside Git, and separate from the restore target.
- Record access and deletion dates without recording secrets.
- Secure deletion of local credential files and unneeded backup copies must be verified.
- Pausing, deleting, or repurposing a project is a separate owner-authorized action. Never retain a production-data restore target indefinitely by accident.

## Release-blocking checklist

Mark each item exactly `PASS`, `FAIL`, or `NOT TESTED`. Any `FAIL` or security-critical `NOT TESTED` blocks production migration.

| Gate | Status | Evidence location (outside Git where sensitive) |
| --- | --- | --- |
| Branch/HEAD and final migration hashes frozen | PASS | Frozen candidate section above |
| Active production ledger and database recovery inventory refreshed | PASS | 2026-07-22 aggregate/catalog refresh: durable Auth identity allow-list and compatibility, Storage, Vault, cron, webhooks, extensions, Realtime, RLS/policies, Auth and RLS event-trigger contracts, ledger, table counts, privileges, and semantic preflights. Artifact/restore execution remains gated. |
| `20260707193257` SQL effects comparison | PASS | Remediation report; comparison only |
| `20260707193257` target ledger-repair approval and rehearsal | NOT TESTED | The approved empty target exists, but no restore, repair, migration, or test write is authorized. |
| Explicit restore-target creation/reuse approval | PASS | Owner authorized one ordinary Free project with exact organization/name/region/cost; one target was created and no existing project was reused. |
| Initial rehearsal-target provisioning and isolation baseline | PASS | Healthy PostgreSQL 17.6 target; zero public app tables/functions/policies/triggers, zero Auth users/identities, zero Storage/Vault usage, zero Edge Functions, no cron/`pg_net`/queues/webhooks, zero Realtime publication members, and no external project connection. Data API automatic exposure is currently on and must be disabled under a separate approval before app-table creation; Realtime defaults remain unchanged. |
| PostgreSQL 17+ native clients verified | PASS | Approved absolute `pg_dump`, `pg_restore`, and `psql` binaries report 17.10. PostgreSQL 16.10 and PATH are unchanged; no PostgreSQL 17 data directory or service, pgAdmin, or Stack Builder was installed. |
| Production credential access explicitly authorized | NOT TESTED | |
| Exact database/Auth/roles/managed-schema backup scope approved | NOT TESTED | |
| Storage bytes treatment confirmed from current usage | PASS | 0 buckets and 0 objects; classify `NOT USED` and recheck immediately before backup. |
| Vault/encryption recovery treatment proved | PASS | 0 Vault secrets and 0 application-function Vault references; classify `NOT USED` and recheck immediately before backup. |
| Edge Function/Auth/API/Realtime/external settings inventoried | PASS | Signed-in Dashboard read-only inventory completed on 2026-07-22 with sanitized presence/state/count evidence only. |
| Backup artifacts non-empty and listable/readable | NOT TESTED | |
| SHA-256 checksums and encrypted sanitized manifest complete | NOT TESTED | |
| Restore succeeded fail-fast on approved target | NOT TESTED | |
| Outbound behavior remained disabled/withheld | NOT TESTED | |
| Schema/function/trigger/constraint equivalence | NOT TESTED | |
| RLS/grant/default-privilege equivalence | NOT TESTED | |
| Migration-ledger and extension equivalence | NOT TESTED | |
| Auth-user and application-table aggregate equivalence | NOT TESTED | |
| Candidate migrations passed on restored copy | NOT TESTED | |
| Rollback-only SQL verification passed | NOT TESTED | |
| Post-migration advisors reviewed | NOT TESTED | |
| Hosted types generated from verified target and app gates passed | NOT TESTED | |
| Timed production write-freeze/cutover plan approved | NOT TESTED | |
| Fresh final backup/checksum and aggregate watermark | NOT TESTED | |
| Forward-disable/corrective and full-restore reconciliation plans approved | NOT TESTED | |

Current verdict: **BLOCKED**. No backup or restore rehearsal has occurred, and no production migration may be applied.
