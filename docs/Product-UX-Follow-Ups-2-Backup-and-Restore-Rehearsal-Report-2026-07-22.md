# Product/UX Follow-Ups 2 — Backup and Restore Rehearsal Report

Date: 2026-07-22
Branch: `Product/UX-Follow-Ups-2`
Result: **BLOCKED pending owner approval of the frozen scope, artifact custody, target configuration, and credential/export phases — rehearsal target created, no backup or restore action started**

## Executive result

The four SQL artifacts used by this rehearsal were hash-frozen and the available read-only hosted inventory was refreshed. The two candidate migration hashes still match the approved runbook. The active source remains healthy on the Free plan in `us-east-2` and runs PostgreSQL 17.6. The broader dirty worktree is not claimed as a fully hash-frozen release candidate.

The recovery rehearsal advanced through the separately authorized creation of one isolated ordinary Free rehearsal project and a read-only initial target inventory. It did not advance to production credential access, backup creation, target configuration/preparation, restore, ledger repair, candidate migration application, SQL verification, type generation, or application release gates. The database/catalog portion of Phase A is refreshed and passes its aggregate-only checks. EDB-certified PostgreSQL 17.10 command-line tools are installed side-by-side with PostgreSQL 16.10 and pass the native-client compatibility gate.

The owner explicitly authorized creation of exactly one ordinary project named `BudgBeacon-Rehearsal` in `us-east-2` in the `BudgetBuddy` organization at the confirmed cost of `$0/month`. The project was created once and became healthy. The inactive legacy project remained untouched. The sanitized, read-only source and initial-target settings inventories are complete. Credential access, backup, target preparation/configuration, restore, migration repair, candidate migrations, verification suites, cleanup, and production action remain separately gated.

## Authorization record

The owner authorized this bounded local backup/restore-rehearsal task and read-only source discovery, separately authorized the EDB-certified PostgreSQL 17.10 Windows x86-64 Command Line Tools installation at `C:\Program Files\PostgreSQL\17`, and then explicitly authorized creation of exactly one ordinary Free project named `BudgBeacon-Rehearsal` in `us-east-2` in the `BudgetBuddy` organization at `$0/month`. The creation authorization covered no credential, backup, restore, configuration, migration, test, production, deployment, or cleanup action. No approval was requested or obtained for any of the following later mutation or credential boundaries:

- production database credential access;
- target preparation, restore, extension/configuration changes, `ANALYZE`, or any other remote write;
- migration-history repair;
- either candidate migration;
- either rollback-only SQL verification suite;
- Auth test-user creation;
- restore-target cleanup, pause, deletion, or repurposing.

No existing project was treated as disposable. The inactive legacy project was not resumed, paused, inspected for data, cleared, repurposed, or changed. Destructive reuse is not proposed.

## SQL artifact freeze

- HEAD: `5a7f61a3131b127dfc1f265ebfeb3583d8298d7c`
- Merge base with `main`: `5a7f61a3131b127dfc1f265ebfeb3583d8298d7c`
- Candidate `20260721194230_product_ux_follow_ups_2_debt_goal_sync.sql`: `678834847D83DB8F3607B13AD49D9DFA51935143C54D268F6658692F9B964B40`
- Candidate `20260721194410_product_ux_follow_ups_2_transaction_summary_and_retarget.sql`: `E7CF5834475DA1904E196895B056823773494DFB3C00811D9D6E89FFC8650A75`
- Rollback-only schema/security suite: `1B4EBB016BF2B0E7A7836B8444C878859D5CCE73F0D994A73A7FF1A15CE4497D`
- Rollback-only allocation-behavior suite: `DC4951408CD88716FB5F5533B8C4BA96913972BDEFE391DBB29297CAB6B9CFFE`

The two candidate hashes match the frozen runbook. Any later edit to either candidate invalidates restored-copy evidence and requires a new owner-confirmed freeze plus repeated verification.

The complete tracked diff and all untracked implementation, documentation, migration, and SQL-test files were inspected. Existing uncommitted work was preserved. Only the two candidate migrations and two rollback-only SQL suites were hash-frozen in this run; no full-worktree manifest is claimed. No branch switch, pull, merge, rebase, reset, restore, checkout, stash, clean, commit, push, PR, or deployment occurred.

## Tool and platform versions

| Item | Result |
| --- | --- |
| Source PostgreSQL | 17.6 — read-only connector fact |
| Approved absolute `pg_dump` | 17.10 — **PASS** |
| Approved absolute `pg_restore` | 17.10 — **PASS** |
| Approved absolute `psql` | 17.10 — **PASS** |
| Pre-existing unqualified client tools | 16.10 — unchanged and still selected by PATH |
| Supabase CLI | 2.90.0; a newer release was advertised but not installed |

The EDB installer had a valid EnterpriseDB Corporation Authenticode signature and SHA-256 `C0728FACCC95CED5A280EFDC32413FE35764B2302670EEC72569B0FD41AC3513`. Its installation summary identifies only the Command Line Tools component. Machine and user PATH values were unchanged, PostgreSQL 16.10 remained installed and is still the unqualified toolset, no PostgreSQL 17 data directory or service was created, and no PostgreSQL service was started by this task. pgAdmin and Stack Builder were absent. The shared command-line-tools payload contains `postgres.exe`, but no server component, database cluster, or PostgreSQL 17 service was installed. All rehearsal commands must use the approved PostgreSQL 17 absolute binary paths. Docker was not installed, started, used, troubleshot, required, or recommended.

## Sanitized source inventory

The following facts were refreshed through the Supabase connector without inspecting raw rows:

- project: healthy, active, Free plan, `us-east-2`, PostgreSQL 17.6;
- migration ledger: 22 entries through `20260702195005`; `20260707193257`, `20260721194230`, and `20260721194410` are absent;
- installed extensions: `pg_cron`, `pg_stat_statements`, `pgcrypto`, `plpgsql`, `supabase_vault`, and `uuid-ossp`; `pg_net` was not listed as installed;
- application schema: ten public application tables, all reported with RLS enabled;
- public RLS policies: 37 across the ten application tables;
- aggregate application rows: profiles 3, user roles 0, user preferences 3, goals 3, debts 2, recurring rules 20, transactions 234, financial priorities 3, goal-plan snapshots 10, and goal actions 7;
- Auth: 3 users and 3 email identities with no orphan on either side; the `on_auth_user_created` trigger calls `private.handle_new_user()`; the durable restore allow-list is exactly `auth.users` plus `auth.identities`, and their source/target column contracts match;
- Storage: 0 buckets and 0 objects;
- Vault: 0 secrets and 0 application-function references to Vault;
- scheduling/outbound database features: 1 cron job and it is active; 0 database webhook triggers; `pg_net` and `pgmq` are not installed;
- Realtime: the publication exists with 0 members;
- semantic preflight: all nine transaction/recurring integrity and normalization-candidate counts are 0;
- latest refreshed opaque catalog evidence: schema fingerprint `5d30a2e99f0b354d4bec78aacde0b6f8` and policy fingerprint `28bd5327ae357ca298b4dc7914437c8c`; the earlier app-schema fingerprint `b29186358d98d67f3aff185518604c9d` is superseded; canonical privilege fingerprints are recorded in the scope-refinement section below, so older differently normalized grant/default-privilege fingerprints are historical only;
- Edge Functions: one active JWT-verified recurring-processing function;
- advisors: one security warning for leaked-password protection disabled and five informational unused-index notices. The previous baseline recorded six performance notices; one notice is no longer present, so the current advisor set is not described as unchanged.

### Sanitized project-settings inventory

The signed-in in-app Dashboard was inspected read-only on 2026-07-22. No Save, Enable, Disable, Reveal, Copy, Rotate, Generate, Delete, Create, Restore, or similar control was used. No key, secret value, endpoint, email address, template body, sender, hostname, client identifier, cookie, project reference, or redirect value was copied into this report.

- Auth URL configuration: Site URL is configured as a custom HTTPS production URL. The redirect allow-list contains 7 entries: 6 HTTPS production/preview entries and 1 local-development HTTP entry; no wildcard entry is present.
- Auth sign-in policy: new-user signup is enabled; manual identity linking and anonymous sign-ins are disabled; email confirmation is enabled.
- Auth providers: Email is enabled. Phone, SAML 2.0, Web3 Wallet, Apple, Azure, Bitbucket, Discord, Facebook, Figma, GitHub, GitLab, Google, Kakao, Keycloak, LinkedIn OIDC, Notion, Twitch, both Twitter variants, both Slack variants, Spotify, WorkOS, and Zoom are disabled.
- Auth email: custom SMTP is enabled and its visible configuration fields are populated; no SMTP value was inspected or recorded. Thirteen Auth email/notification template categories are present: six authentication-flow templates and seven security-notification templates. Template bodies and private addressing values were not inspected.
- Auth sessions/security: compromised-refresh-token detection is enabled with a 10-second reuse interval. Free-plan session time-box, inactivity-timeout, and single-session controls are unavailable and remain at their disabled/default values. TOTP MFA is enabled with a 10-factor per-user limit; SMS MFA is unavailable on Free; enhanced MFA security is enabled. CAPTCHA and leaked-password protection are disabled. No Auth hooks are configured.
- Auth rate limits: the visible project rate-limit configuration was inventoried without sensitive values: email 30/hour; token refresh 150 per 5 minutes per IP; token verification 30 per 5 minutes per IP; OTP/sign-in 30 per 5 minutes per IP; the disabled/unavailable SMS, anonymous, and Web3 controls each show 30 in their documented interval.
- Data API: service is enabled. Exposed schemas are `graphql_public` and `public`; `private` is not exposed. Automatic exposure of new tables is disabled, so new object access requires explicit grants. The Dashboard reported 0 of 10 tables and 0 of 16 functions selected in its granular exposure controls; catalog grants, object-level API exposure, and RLS remain separate controls and must be compared independently.
- Realtime: service is enabled and public channels are allowed. Database authorization pool size is 2; current visible plan limits are 200 concurrent users, 100 events/second, 20 presence events/second, and 256 KB payloads. The database publication still has zero members from the catalog inventory.
- Edge Functions: one active function remains configured with legacy-JWT verification enabled. It has 2 custom secret entries and 10 platform-default secret entries; names, values, and digests were not inspected or recorded. The function must remain undeployed and uninvoked on the rehearsal target.
- Platform integrations: only Cron, Data API, and Vault are installed at the platform integration layer. Project-level GitHub and Vercel connections are not configured, no AWS private connection is present, Auth has no custom hooks, and no custom domain is available on this Free project.

This completes the non-database Phase A settings inventory as `PASS`. Later read-only catalog work below proves the Auth-data allow-list, role mapping, and canonical privilege comparisons; artifact creation, restore execution, and platform reconfiguration remain `NOT TESTED` and unauthorized.

## Rehearsal-project creation and initial target baseline

Immediately before creation, the Supabase connector rechecked the `BudgetBuddy` organization, confirmed one healthy active project and one inactive legacy project, confirmed the target did not already exist, and quoted exactly **$0/month** for one ordinary project. The formal zero-cost acknowledgement completed. The owner then authorized exactly one creation with the approved organization, name, region, type, and cost. The connector created `BudgBeacon-Rehearsal` once and reported it `ACTIVE_HEALTHY` in `us-east-2` on the Free plan. A post-creation project listing positively distinguished production `BudgetBuddy-V2`, inactive legacy `BudgetBuddy`, and the new rehearsal target. No duplicate project was created.

The initial target inventory was read-only and sanitized:

- PostgreSQL server: 17.6 (connector detail `17.6.1.147`, engine 17, GA channel).
- Application migration ledger: 0 entries; `supabase_migrations.schema_migrations` does not yet exist.
- Installed extensions: `plpgsql` 1.0, `uuid-ossp` 1.1, `pgcrypto` 1.3, `pg_stat_statements` 1.11, and `supabase_vault` 0.3.1. `pg_cron`, `pg_net`, and `pgmq` are not installed.
- Default database schemas include Auth, Extensions, GraphQL/GraphQL Public, Public, Realtime, Storage, and Vault plus platform/system schemas. Public contains 0 tables, 0 policies, 0 functions, 0 user triggers, and 0 table grants.
- Auth contains 0 users and 0 identities. Email is the only enabled provider; signup and email confirmation are enabled; manual linking and anonymous sign-ins are disabled. The Site URL is the platform local-development default and there are 0 redirect allow-list entries, so no production redirect was copied.
- Email delivery uses the built-in provider; custom SMTP is disabled. Phone/SMS sign-in is disabled. Thirteen default Auth email/notification template categories exist; no template body or addressing value was inspected.
- Data API is enabled for `graphql_public` and `public`. The new-project setting currently automatically exposes new tables; there are no public application tables, functions, or data yet. This default must be reviewed under a separate target-configuration approval before restore; grants and RLS remain separate controls.
- Realtime service is enabled with public channels allowed at platform defaults, but its sole publication has 0 members and no application data exists.
- Edge Functions: 0 deployed functions. The secrets page shows 1 target-generated/custom-row entry and 10 platform-default entries; no name, value, or digest was inspected, and no production secret was imported.
- Storage: 0 buckets and 0 objects. Vault: 0 secrets. Database webhooks: 0. Cron/`pg_net`/queues: not installed and no application job or outbound behavior exists.
- Managed-role baseline: 8 expected managed roles present, 0 nonstandard roles. Public table-grant fingerprint is the empty-set MD5 `d41d8cd98f00b204e9800998ecf8427e`. The earlier compact default-privilege baseline was 24 catalog entries (`e33629c89d50d7b87f12dfd7c1055948`); the later canonical ACL expansion is 96 privilege rows (`61e7853a5d07dbca3edf75b38ac61b96`).
- Project integrations: no GitHub repository, Vercel project, AWS private connection, Auth hook, or custom domain is configured. Cloudflare and `budg.ca` are not connected.
- Initial security and performance advisor counts: 0 / 0.

This proves initial target isolation as `PASS`. It does not authorize changing the Data API default, Realtime defaults, extensions, roles, grants, Auth settings, or any other target configuration.

### Read-only backup-scope refinement

Post-creation catalog checks refined the exact source/target treatment without inspecting private rows:

- Source Auth aggregates are 3 users and 3 email identities. Every user has an identity, there are 0 orphan identities, and the source and target `auth.users`/`auth.identities` compatibility contracts match exactly: columns `fa191cc0f72038cd58cc33bd7c20069c`, 6 constraints `c7385b453077059d647cc1eede7e2327`, 19 indexes `5752bf95965e4c62bf7a021c42b8e82d`, and no non-custom user triggers on either side.
- Source session-scoped Auth state is nonzero: 7 sessions, 16 refresh tokens, 7 MFA AMR claims attached to those 7 sessions, and 1 one-time token. These are excluded from the recovery contract so restored users must reauthenticate. MFA factors/challenges, SSO/SAML, OAuth, WebAuthn, custom OAuth providers, flow state, instances, and Auth audit rows are zero.
- The exact public application-table allow-list is `debts`, `financial_priorities`, `goal_actions`, `goal_plan_snapshots`, `goals`, `profiles`, `recurring_rules`, `transactions`, `user_preferences`, and `user_roles`.
- The exact app-owned private-function allow-list is only `private.handle_new_user()`. The only modified Auth-schema object is `on_auth_user_created` calling that function. The exact public function/signature allow-list remains frozen in the external object manifest and must match the 15-function catalog inventory.
- The source's only nonstandard login role is `cli_login_postgres`. It owns no schema, relation, or function and has no explicit table, function, or default-privilege grant; treat it as an ephemeral operational login and exclude it from restore. Map the target's Supabase-managed roles instead of recreating any managed role or password.
- Source and target managed membership sets differ because the fresh target includes current managed Realtime memberships. This is an expected platform baseline difference: preserve the target-managed memberships, restore no source managed-role membership wholesale, and compare only the reviewed app privilege contract.
- Canonical source object grants are frozen as 30 grouped table ACL rows (`effed6368c1c73a40d4d78fae7769205`) and 38 grouped function ACL rows (`25edf70b9f4a71f1517af9abc6425c26`). `authenticated` has CRUD on 9 tables and SELECT-only on `user_roles`; `service_role` has full table privileges except CRUD is intentionally absent on `profiles` and `user_roles`. Function execution is signature-specific; `anon` and `PUBLIC` have no application-object grants. There are 0 column-specific ACLs and 0 app sequences.
- Canonical source schema ACL is 9 rows (`eded11b98a2e6564fa7a856a22b8c814`), and canonical source default privileges are 72 expanded rows (`b48c23e9e959620e189a5de6d9dcb29b`). The fresh target differs materially: its Data API auto-exposure setting is on, its canonical default privileges are 96 expanded rows (`61e7853a5d07dbca3edf75b38ac61b96`), and new `postgres`-owned public tables/functions would receive broad API-role defaults. Auto-exposure must be turned off under a separate target-configuration approval and the resulting defaults re-verified before any app table is created.
- `public.rls_auto_enable()` is classified as an app-owned security control: `postgres`-owned, `SECURITY DEFINER`, `search_path=pg_catalog`, executable only by `postgres`. The enabled `ensure_rls` event trigger invokes it after public-table creation. Preserve the pair in a separate reviewed artifact and install it only after the curated schema/data restore, while verifying all 10 restored tables already have RLS enabled and not forced.

These checks resolve the durable Auth allow-list, Auth column compatibility, custom-role disposition, app-owned event-trigger classification, and canonical privilege comparisons. Artifact custody and the separately authorized target-configuration/credential/write phases still block any backup or restore.

## Pre-backup scope manifest

This is the sanitized planning classification only. `UNVERIFIED` and `NOT TESTED` scopes block backup creation and any recoverability claim.

| Recovery scope | Planned treatment | Current status |
| --- | --- | --- |
| App-owned schemas and data | Exact object allow-list for `public` and verified app-owned `private` objects; native logical artifacts and aggregate/object comparison from one exported snapshot | `INCLUDED`; inventory `PASS`, artifact `NOT TESTED` |
| Auth users and records | Allow-list only `auth.users` and `auth.identities`; custom Auth trigger and `private.handle_new_user` are separate schema artifacts; all session/token/MFA-AMR transient state is excluded and users must reauthenticate | scope/compatibility `PASS`; artifact/restore `NOT TESTED` |
| Roles and grants | No custom role is restorable; map target-managed roles, preserve target-managed memberships, and apply the canonical object/default-privilege contract without passwords or managed role attributes | scope/catalog `PASS`; artifact/restore `NOT TESTED` |
| Migration history | Separate `supabase_migrations` artifact/restore step and ledger comparison | `SEPARATE ARTIFACT` / `NOT TESTED` |
| Extensions | Inventory, target compatibility check, separately approved enablement, then version comparison | `RECONFIGURE`; inventory `PASS`, target `NOT TESTED` |
| Modified managed-schema objects | Explicit Auth trigger/function artifact and ordering proof; no Storage customization is currently claimed | `SEPARATE ARTIFACT`; inventory `PASS`, restore `NOT TESTED` |
| Vault and encrypted data | No Vault recovery payload at the refreshed zero-secret/zero-reference baseline; recheck immediately before backup | `NOT USED`; inventory `PASS` |
| Storage metadata | No current bucket/object metadata payload; recheck immediately before backup | `NOT USED`; inventory `PASS` |
| Storage object bytes | No current object bytes; an independent object artifact becomes mandatory if the recheck is nonzero | `NOT USED`; inventory `PASS` |
| Edge Functions | Preserve repository source/config; withhold deployment during rehearsal | source configuration/secret-count inventory `PASS`; target `WITHHOLD` / `NOT TESTED` |
| Auth/API settings, redirects, templates, keys | Sanitized inventory and isolated target reconfiguration; never copy key values into evidence | sanitized source inventory `PASS`; target `RECONFIGURE` / `NOT TESTED` |
| Realtime settings/publications | Preserve sanitized service/limit/channel settings while keeping the rehearsal target isolated; database publication has zero members | source database/platform inventory `PASS`; target `RECONFIGURE` / `NOT TESTED` |
| Cron, webhooks, `pg_net`, external integrations | One active cron job must be withheld; no database webhooks and no `pg_net`/`pgmq`; platform integrations remain pending | `RECONFIGURE`; database inventory `PASS`, target state `NOT TESTED` |

### Exact proposed artifact and restore sequence

No step below is authorized yet. The sequence is the approval basis for the next phases:

1. Select an encrypted location outside the repository and synchronization folders, a key custodian, retention period, artifact-deletion method, and rehearsal-target disposition. Create no artifact until that custody record is approved.
2. Under a target-configuration-only approval, turn target Data API automatic exposure of new tables off and recheck the target's canonical default privileges. Keep production redirects, SMTP, Edge Functions/secrets, cron, webhooks, Realtime publication members, and every external integration withheld.
3. Under a separate production-credential/read-only-export approval, use only the absolute PostgreSQL 17.10 binaries and an interactively supplied password. Connect through the direct endpoint or session pooler on port 5432, never the transaction pooler on 6543; do not place credentials in command arguments, files, logs, chat, or the repository.
4. Open one coordinator transaction as `REPEATABLE READ, READ ONLY`, export its snapshot, and keep it open. Freeze sanitized pre-export role/settings/object fingerprints.
5. From that snapshot, create: a signed scope manifest; a schema-only custom archive for the six public enums, 10 public tables, 14 ordinary public functions, `private.handle_new_user()`, constraints, indexes, 9 app table triggers, 37 policies, RLS flags, and exact ownership; an `auth.users`/`auth.identities` data artifact only; an exact 10-table app-data artifact; a `supabase_migrations.schema_migrations` ledger artifact; separate reviewed artifacts for `on_auth_user_created`, the fifteenth public function `rls_auto_enable()` plus `ensure_rls`, and ACL/default privileges; sanitized aggregate/fingerprint evidence; and SHA-256 checksums. A roles-only dump is evidence only and is never restored wholesale.
6. Close the coordinator only after every data artifact and source aggregate succeeds, then verify stable post-export role/settings fingerprints, archive TOCs, exclusions, checksums, encryption, and absence of credentials. Any drift, unclassified TOC entry, or partial artifact is `FAIL`.
7. Under a target-write/restore approval, re-prove the target identity and emptiness, confirm required extensions, and run a rollback-only capability check for the exact Auth insert method. Preserve target-managed roles/memberships and platform schemas; do not recreate `cli_login_postgres` or restore any role password.
8. Restore curated pre-data objects without the custom Auth or RLS event triggers; restore `auth.users` then `auth.identities`; restore the 10 application tables; restore the migration ledger; then restore constraints, indexes, app triggers, RLS/policies, exact grants/default privileges, the custom Auth trigger, and finally `rls_auto_enable()`/`ensure_rls`. Use one transaction where supported and stop on the first error.
9. Compare schema/policy/ownership/ACL/default-privilege fingerprints, table and Auth aggregates, ledger, extensions, trigger definitions/enabled state, RLS flags, publication membership, and zero-use Storage/Vault assumptions without exposing row data. Restored users must sign in again; no source session/token/AMR/one-time state is restored.
10. Only after restore equivalence passes, request separate approval for migrations, rollback-only SQL suites, synthetic Auth/app tests, `ANALYZE`, generated types, application checks, or any target cleanup/pause/delete action.

Before Phase C, the external manifest must enumerate every included/excluded schema object and role, classify every platform-owned object, and prove why each exclusion is recreated, mapped, withheld, or unused. Database data artifacts and comparison counts must share one exported `REPEATABLE READ, READ ONLY` snapshot held open by a coordinator connection. Roles and platform settings cannot share that snapshot, so sanitized pre/post catalog fingerprints must be stable. Any unclassified object, role, or cross-artifact time skew is `FAIL`.

Current official guidance confirms that Free projects require manual off-site logical exports; Storage object bytes and platform services are outside a database dump; Auth, managed-schema changes, roles, and migration history need explicit treatment; and Vault ciphertext is not portable to an ordinary new project without a separately controlled root-key transfer. The official logical-backup path documented by Supabase is container-backed, so this no-Docker task must prove an equivalent native PostgreSQL artifact sequence rather than claiming that an unrestricted dump is complete.

## Backup, restore, and migration verification

| Gate | Status | Result |
| --- | --- | --- |
| Compatible PostgreSQL 17+ clients | **PASS** | Absolute EDB command-line-tool binaries report 17.10; PostgreSQL 16.10 and PATH remain unchanged. |
| Current database/catalog source inventory | **PASS** | Counts, semantic preflights, trigger contract, extensions, ledger, RLS/policies, and opaque fingerprints refreshed read-only. |
| Current non-database project settings inventory | **PASS** | Signed-in Dashboard read-only inventory completed with sanitized presence/state/count evidence only. |
| Target approval/creation or reuse | **PASS** | Explicit one-project authorization recorded; one ordinary Free target created in the approved organization/name/region at `$0/month`; no existing project reused. |
| Production credential access | **NOT TESTED** | No credential accessed. |
| Backup artifacts and checksums | **NOT TESTED** | No artifacts created. |
| Encryption at rest and retention policy | **NOT TESTED** | No artifact or policy approved. |
| Restore and equivalence | **NOT TESTED** | No restore attempted. |
| `20260707193257` effect proof and target ledger repair | **NOT TESTED** | The empty target exists, but no schema/data restore or ledger repair is authorized. |
| `20260721194230` on restored copy | **NOT TESTED** | Not applied anywhere. |
| `20260721194410` on restored copy | **NOT TESTED** | Not applied anywhere. |
| Schema/security rollback-only suite | **NOT TESTED** | Not executed. |
| Allocation-behavior rollback-only suite | **NOT TESTED** | Not executed. |
| Residual synthetic-state checks | **NOT TESTED** | No synthetic state created. |
| Post-migration advisors | **NOT TESTED** | Only the source baseline was refreshed. |
| Generated TypeScript types | **NOT TESTED** | No verified restore project exists. |
| Application gates | **NOT TESTED** | Deferred until verified restored-copy types exist. |

No role-simulation result is claimed. Both SQL verification files remain restore-target-only and were not executed.

## Artifact retention and cleanup

No backup artifact, decrypted working copy, credential file, password, connection string, token, key, Auth session, or private data export was created or accessed. There is therefore no artifact or credential cleanup to perform from this partial run. No retention duration, encrypted storage location, or key custodian was selected.

The rehearsal target exists, is healthy, and remains active and empty. No cleanup, pause, deletion, or repurposing approval was given. The target must remain isolated until the owner makes a later explicit disposition decision.

## Remaining blockers

1. Select an encrypted external artifact location, retention period, encryption-key custodian, post-rehearsal cleanup expectation, and target pause/delete/retain preference.
2. Separately approve the target-configuration-only phase that disables automatic Data API exposure before any app table is created and keeps all outbound integrations withheld.
3. Approve the exact native artifact sequence above, then separately approve production credential use immediately before the read-only export; project creation did not authorize credential access or backup creation.
4. After artifact verification, separately approve target database writes/restoration. Migration/test execution and target cleanup remain later, independent approvals.

Any security-critical `NOT TESTED` or any `FAIL` keeps the recovery gate blocked. This report does not recommend applying the candidate migrations to production.

## Production safety confirmation

Production received read-only metadata, catalog, advisor, and aggregate-count queries only. The only remote write was the separately authorized creation of one ordinary empty rehearsal project. No production DDL, DML, migration, migration-history repair, configuration change, Auth-user creation, restore, or test execution occurred. The rehearsal target received no configuration change, extension enablement, schema/data restore, migration, user, function, cron job, webhook, or test. No frontend or Edge Function was deployed. Cloudflare and `budg.ca` were not changed or pointed at the rehearsal target.

**Production was not mutated.**
