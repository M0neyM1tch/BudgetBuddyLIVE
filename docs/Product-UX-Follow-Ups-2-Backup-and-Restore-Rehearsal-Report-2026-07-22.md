# Product/UX Follow-Ups 2 — Backup and Restore Rehearsal Report

Date: 2026-07-22
Updated: 2026-08-02
Branch: `Product/UX-Follow-Ups-2`
Result: **RELEASE CANDIDATE CHECKPOINT, REHEARSAL SECURITY PREREQUISITE, AND CLEAN PRE-CANDIDATE REPOSITORY BASELINE COMPLETE; production-derived backup/restore execution remains deferred**

## Executive result

The complete Product/UX Follow-Ups 2 release candidate is committed and pushed on `Product/UX-Follow-Ups-2` at `e97ddb5b7d67582d9db29d5249cb4acc5c0860d7` with message `feat: complete Product UX Follow-Ups 2 release candidate`. The working tree was clean at that checkpoint and the upstream is `origin/Product/UX-Follow-Ups-2`.

The production-derived backup/restore rehearsal is deferred, not cancelled. `BudgBeacon-Rehearsal` is temporarily designated as a disposable synthetic-only development and migration-testing target. On 2026-07-31, a separately authorized security prerequisite changed only future `postgres`-owned object defaults in `public`; it did not create an application object, apply a migration, create Auth data, restore schema/data, or access a production credential, backup, or row.

On 2026-08-02, the clean repository baseline through `20260707193257` was reconstructed on `BudgBeacon-Rehearsal` from 23 unchanged tracked migration files. The two Product/UX Follow-Ups 2 candidate migrations remain unapplied. No Auth user, identity, synthetic application row, production row, backup, or restore was created or accessed.

The owner explicitly authorized creation of exactly one ordinary project named `BudgBeacon-Rehearsal` in `us-east-2` in the `BudgetBuddy` organization at the confirmed cost of `$0/month`. The project was created once and became healthy. The inactive legacy project remained untouched. The sanitized source and target inventories are complete, the target future-object security prerequisite is complete, and the clean pre-candidate repository baseline is complete. Production credential access, backup, restore, migration repair, candidate migrations, synthetic seeding, verification suites, cleanup, and production action remain separately gated.

## Authorization record

The owner authorized this bounded local backup/restore-rehearsal task and read-only source discovery, separately authorized the EDB-certified PostgreSQL 17.10 Windows x86-64 Command Line Tools installation at `C:\Program Files\PostgreSQL\17`, and then explicitly authorized creation of exactly one ordinary Free project named `BudgBeacon-Rehearsal` in `us-east-2` in the `BudgetBuddy` organization at `$0/month`.

On 2026-07-31, the owner separately authorized only disabling automatic Data API exposure for future application objects, correcting the corresponding future-object default privileges, and recording the verified result locally. That authorization did not include any of the following:

- production database credential access;
- application-table/function creation, schema/data restore, extension enablement, `ANALYZE`, or any other target write;
- migration-history repair;
- either candidate migration;
- either rollback-only SQL verification suite;
- Auth test-user creation;
- restore-target cleanup, pause, deletion, or final disposition.

No existing project was treated as disposable. The inactive legacy project was not resumed, paused, inspected for data, cleared, repurposed, or changed. Destructive reuse is not proposed.

## SQL artifact freeze

- Release-candidate HEAD: `e97ddb5b7d67582d9db29d5249cb4acc5c0860d7`
- Merge base with `main`: `5a7f61a3131b127dfc1f265ebfeb3583d8298d7c`
- Candidate `20260721194230_product_ux_follow_ups_2_debt_goal_sync.sql`: `678834847D83DB8F3607B13AD49D9DFA51935143C54D268F6658692F9B964B40`
- Candidate `20260721194410_product_ux_follow_ups_2_transaction_summary_and_retarget.sql`: `E7CF5834475DA1904E196895B056823773494DFB3C00811D9D6E89FFC8650A75`
- Rollback-only schema/security suite: `1B4EBB016BF2B0E7A7836B8444C878859D5CCE73F0D994A73A7FF1A15CE4497D`
- Rollback-only allocation-behavior suite: `DC4951408CD88716FB5F5533B8C4BA96913972BDEFE391DBB29297CAB6B9CFFE`

The two candidate hashes match the frozen runbook. Any later edit to either candidate invalidates restored-copy evidence and requires a new owner-confirmed freeze plus repeated verification.

The complete tracked and untracked Product/UX Follow-Ups 2 candidate was reviewed for scope and secrets, validated, committed, and pushed as the release-candidate checkpoint above. No merge, rebase, force-push, pull request, deployment, or Supabase action occurred during that Git checkpoint.

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
- Data API is enabled for `graphql_public` and `public`. At the initial baseline, future `postgres`-owned objects received broad automatic API-role defaults. On 2026-07-31, the Supabase-supported future-object default-privilege revokes were applied and verified; grants and RLS remain separate controls.
- Realtime service is enabled with public channels allowed at platform defaults, but its sole publication has 0 members and no application data exists.
- Edge Functions: 0 deployed functions. The secrets page shows 1 target-generated/custom-row entry and 10 platform-default entries; no name, value, or digest was inspected, and no production secret was imported.
- Storage: 0 buckets and 0 objects. Vault: 0 secrets. Database webhooks: 0. Cron/`pg_net`/queues: not installed and no application job or outbound behavior exists.
- Managed-role baseline: 8 expected managed roles present, 0 nonstandard roles. Public table-grant fingerprint is the empty-set MD5 `d41d8cd98f00b204e9800998ecf8427e`. The earlier compact default-privilege baseline was 24 catalog entries (`e33629c89d50d7b87f12dfd7c1055948`); the later canonical ACL expansion is 96 privilege rows (`61e7853a5d07dbca3edf75b38ac61b96`).
- Project integrations: no GitHub repository, Vercel project, AWS private connection, Auth hook, or custom domain is configured. Cloudflare and `budg.ca` are not connected.
- Initial security and performance advisor counts: 0 / 0.

This proves initial target isolation as `PASS`. A later authorization covered only the future-object Data API/default-privilege prerequisite described below; it did not authorize changes to Realtime defaults, extensions, managed roles/objects, Auth settings, application objects, schema, or data.

### 2026-07-31 synthetic-development security prerequisite

- Target identity: `BudgBeacon-Rehearsal`, project reference `gwloyvfkrxzgqnlnlcor`, `us-east-2`, `ACTIVE_HEALTHY`, created 2026-07-22. The same organization separately lists production `BudgetBuddy-V2` as `cebykmbauxbucvforwzj` and inactive legacy `BudgetBuddy` as `yvsizxnfqkkazqnwbgnc`; neither non-target reference was used for a write.
- Before-state isolation: 0 public application tables, functions, RLS policies, or triggers; 0 Auth users or identities; 0 migration-ledger rows; 0 Storage buckets or objects; 0 Vault secrets; 0 Edge Functions; 0 Realtime publication members; no `pg_cron` or `pg_net` installation, no database webhook trigger, no Data API pre-request hook, and no application outbound behavior.
- Before-state schema ACL: `PUBLIC`, `anon`, `authenticated`, `authenticator`, `postgres`, and `service_role` had `USAGE` on `public`; only `postgres` among the application/API roles had `CREATE`. `supabase_admin` also had managed `CREATE` capability and was deliberately excluded from the change.
- Before-state `postgres` defaults: `anon`, `authenticated`, and `service_role` received table ACL `arwdDxtm`, sequence ACL `rwU`, and function `EXECUTE`; future functions did not need an additional explicit `PUBLIC` grant because the existing explicit ACL already replaced the built-in default.
- Supported method: the current Supabase “Securing your API” guidance prescribes four `ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public` revokes—table `SELECT/INSERT/UPDATE/DELETE`, function `EXECUTE` from `anon/authenticated/service_role`, sequence `USAGE/SELECT`, and function `EXECUTE` from `PUBLIC`.
- Change performed: exactly those four statements were executed in one transaction against project reference `gwloyvfkrxzgqnlnlcor`. No migration mechanism was used, so no migration-ledger row was created.
- After-state `postgres` defaults: future functions grant `EXECUTE` only to `postgres`; future tables no longer grant Data API CRUD to `anon`, `authenticated`, or `service_role`; future sequences no longer grant `USAGE` or `SELECT` to those roles. PostgreSQL's residual non-Data-API defaults (`Dxtm` on tables and `UPDATE` on sequences) were not broadened or altered beyond the exact Supabase-supported opt-in method.
- Managed-platform preservation: the fingerprint of all default ACLs outside `postgres`/`public` remained `a5bd6f4b602ec50c79fb35972bb30ace`; all `supabase_admin` defaults and all schema-usage grants remained unchanged. Existing managed schemas and objects were not altered.
- After-state isolation remained identical: all application/Auth/Storage/Vault/Realtime counts stayed 0; public tables, migration ledger, and Edge Function lists remained empty; `pg_cron` and `pg_net` remained absent; the target security advisor returned 0 findings.

The intended automatic Data API exposure for future `postgres`-owned public application tables and functions is removed. This is not a substitute for RLS: every future exposed table still requires deliberate grants, RLS enablement, and reviewed policies in the same migration.

### Read-only backup-scope refinement

Post-creation catalog checks refined the exact source/target treatment without inspecting private rows:

- Source Auth aggregates are 3 users and 3 email identities. Every user has an identity, there are 0 orphan identities, and the source and target `auth.users`/`auth.identities` compatibility contracts match exactly: columns `fa191cc0f72038cd58cc33bd7c20069c`, 6 constraints `c7385b453077059d647cc1eede7e2327`, 19 indexes `5752bf95965e4c62bf7a021c42b8e82d`, and no non-custom user triggers on either side.
- Source session-scoped Auth state is nonzero: 7 sessions, 16 refresh tokens, 7 MFA AMR claims attached to those 7 sessions, and 1 one-time token. These are excluded from the recovery contract so restored users must reauthenticate. MFA factors/challenges, SSO/SAML, OAuth, WebAuthn, custom OAuth providers, flow state, instances, and Auth audit rows are zero.
- The exact public application-table allow-list is `debts`, `financial_priorities`, `goal_actions`, `goal_plan_snapshots`, `goals`, `profiles`, `recurring_rules`, `transactions`, `user_preferences`, and `user_roles`.
- The exact app-owned private-function allow-list is only `private.handle_new_user()`. The only modified Auth-schema object is `on_auth_user_created` calling that function. The exact public function/signature allow-list remains frozen in the external object manifest and must match the 15-function catalog inventory.
- The source's only nonstandard login role is `cli_login_postgres`. It owns no schema, relation, or function and has no explicit table, function, or default-privilege grant; treat it as an ephemeral operational login and exclude it from restore. Map the target's Supabase-managed roles instead of recreating any managed role or password.
- Source and target managed membership sets differ because the fresh target includes current managed Realtime memberships. This is an expected platform baseline difference: preserve the target-managed memberships, restore no source managed-role membership wholesale, and compare only the reviewed app privilege contract.
- Canonical source object grants are frozen as 30 grouped table ACL rows (`effed6368c1c73a40d4d78fae7769205`) and 38 grouped function ACL rows (`25edf70b9f4a71f1517af9abc6425c26`). `authenticated` has CRUD on 9 tables and SELECT-only on `user_roles`; `service_role` has full table privileges except CRUD is intentionally absent on `profiles` and `user_roles`. Function execution is signature-specific; `anon` and `PUBLIC` have no application-object grants. There are 0 column-specific ACLs and 0 app sequences.
- Canonical source schema ACL is 9 rows (`eded11b98a2e6564fa7a856a22b8c814`), and canonical source default privileges are 72 expanded rows (`b48c23e9e959620e189a5de6d9dcb29b`). The fresh target initially granted future `postgres`-owned public tables/functions broad API-role access. The 2026-07-31 prerequisite removed table CRUD and function execution exposure through the documented Supabase method while preserving target-managed `supabase_admin` defaults. Any future application migration must still add minimum explicit grants, enable RLS, and add reviewed policies deliberately.
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
2. **Completed 2026-07-31:** under a target-configuration-only approval, remove automatic Data API grants for future `postgres`-owned public tables/functions and verify the result. Production redirects, SMTP, Edge Functions/secrets, cron, webhooks, Realtime publication members, and every external integration remain withheld.
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

## 2026-08-02 clean pre-candidate repository baseline

The baseline was built only on `BudgBeacon-Rehearsal` (`gwloyvfkrxzgqnlnlcor`, `us-east-2`, PostgreSQL 17.6). Immediately before each write, the isolated CLI work directory remained linked to that project. Production `BudgetBuddy-V2` (`cebykmbauxbucvforwzj`) and legacy `BudgetBuddy` (`yvsizxnfqkkazqnwbgnc`) remained distinct and received no write. Git remained on `Product/UX-Follow-Ups-2` at `ac64e92dbc16b7a93aa91a6830df746147085425` with a clean, upstream-synchronized starting tree.

### Environmental bootstrap prerequisite

The repository migration chain is not independently self-contained: `20260613031223_phase1_hardening.sql` depends on `public.rls_auto_enable()` and the `ensure_rls` event trigger, but no tracked historical migration creates them. A read-only production catalog query independently recaptured `pg_get_functiondef()`, owner, security mode, fixed search path, complete ACL, and event-trigger metadata. Those results matched the owner-supplied production contract materially and semantically.

An exact production-equivalent function and event trigger were therefore installed on rehearsal only, outside `supabase_migrations.schema_migrations`. The function is `postgres`-owned, `SECURITY DEFINER`, has exactly `search_path=pg_catalog`, and has ACL `{postgres=X/postgres}`. `ensure_rls` is enabled for origin (`O`), fires at `ddl_command_end`, has exactly the tags `CREATE TABLE`, `CREATE TABLE AS`, and `SELECT INTO`, and targets `public.rls_auto_enable()`. The bootstrap installation left the ledger at its single existing `20260612000000` row. No historical migration was edited, and `20260612000000` was neither rerun nor manually rerecorded.

### Baseline migration manifest and execution

Each migration was introduced alone into a temporary isolated CLI work directory, checked with `supabase db push --dry-run`, and then applied with `supabase db push --yes`. Every dry run named exactly one intended file. Every apply completed and its legitimate ledger row was checked before continuing. The tracked repository migration files were not renamed, moved, or modified.

| Order | Migration | Result |
| ---: | --- | --- |
| 1 | `20260612000000_core_v2_schema.sql` | PASS; previously applied normally and retained |
| 2 | `20260613031223_phase1_hardening.sql` | PASS unchanged; revoke succeeded and three expected partial indexes were present |
| 3 | `20260616014633_phase2_transactions_polish.sql` | PASS |
| 4 | `20260617014754_phase2_recurring_engine.sql` | PASS; expected missing-trigger notice only |
| 5 | `20260617223117_phase2_recurring_rpc_security.sql` | PASS |
| 6 | `20260618020337_phase2_goal_contributions.sql` | PASS |
| 7 | `20260618020719_phase2_goal_contribution_updates.sql` | PASS |
| 8 | `20260618135018_phase2_goal_icons.sql` | PASS; expected missing-constraint notice only |
| 9 | `20260618155000_phase2_goal_icon_expand.sql` | PASS |
| 10 | `20260618165305_phase2_debt_customization.sql` | PASS; two expected missing-constraint notices only |
| 11 | `20260618190429_phase2_debt_payment_sync.sql` | PASS |
| 12 | `20260618230624_phase2_hard_delete_goals_debts.sql` | PASS |
| 13 | `20260622203214_phase3_onboarding_preferences.sql` | PASS |
| 14 | `20260624165646_phase3_legal_acceptance.sql` | PASS |
| 15 | `20260624165659_phase3_least_privilege_grants.sql` | PASS |
| 16 | `20260630155214_goal_packs_schema_foundation.sql` | PASS; all newly created public tables were automatically RLS-enabled by `ensure_rls` and received their explicit policies/grants |
| 17 | `20260702150000_goal_pack_onboarding_setup_rpc.sql` | PASS |
| 18 | `20260702172748_goal_pack_debt_onboarding_setup.sql` | PASS |
| 19 | `20260702182026_goal_pack_debt_onboarding_idempotency_fix.sql` | PASS |
| 20 | `20260702190850_goal_actions_open_action_dedupe.sql` | PASS |
| 21 | `20260702194112_goal_pack_plan_rpc_writes.sql` | PASS |
| 22 | `20260702195005_goal_pack_fk_indexes.sql` | PASS |
| 23 | `20260707193257_phase3_live_permission_hardening.sql` | PASS normally; legitimate rehearsal ledger row present |

The cron-bearing migration executed unchanged under the explicit exception. It installed `pg_cron` 1.6.4 and created `process-recurring-daily`; that job was immediately unscheduled before any later migration. Final verification shows zero active cron jobs and zero cron run-history rows. The recurring processor was never manually invoked. `pg_net` remains uninstalled, there are zero Realtime publication members and zero Edge Functions, and no outbound application behavior was configured.

### Final baseline verification

- Ledger: exactly the 23 ordered manifest entries above, ending at `20260707193257`; neither `20260721194230` nor `20260721194410` is present.
- Candidate absence: the unique candidate functions `sync_debt_payoff_goal_progress()`, `sync_linked_goals_after_debt_change()`, and `get_transaction_summary(date,date,text,uuid,transaction_kind,integer,integer,text)` are absent.
- Schema: 6 public enums, 10 public application tables, 15 public ordinary functions, 77 public table constraints, 33 public indexes, 9 public user triggers, and 37 public RLS policies.
- Tables: all 10 are owned by `postgres`, have RLS enabled, and contain zero rows: `debts`, `financial_priorities`, `goal_actions`, `goal_plan_snapshots`, `goals`, `profiles`, `recurring_rules`, `transactions`, `user_preferences`, and `user_roles`.
- Grants: `anon` has no application table or function access. `authenticated` has CRUD on nine application tables, SELECT-only on `user_roles`, and EXECUTE on the 11 intended client RPCs. `service_role` alone has EXECUTE on `process_due_recurring_rules(uuid,date)`; internal helper and trigger functions are not client-executable. All 15 public functions are `postgres`-owned; only `process_due_recurring_rules` and the environmental `rls_auto_enable` are `SECURITY DEFINER`.
- Future-object defaults: the hardened pre-migration state was preserved. For `postgres` in `public`, future table CRUD grants to `anon`/`authenticated`/`service_role`, future function EXECUTE grants to those roles or `PUBLIC`, and future sequence USAGE/SELECT grants to those roles all remain zero. No reapplication was necessary, and `supabase_admin` defaults were not changed.
- Data isolation: zero Auth users, Auth identities, Storage buckets, Storage objects, Vault secrets, application rows, Realtime publication members, Edge Functions, cron jobs, or cron runs.
- Extensions/outbound state: `pg_cron` is installed as authorized; `pg_net` is absent. No SMTP, webhook, API hook, external integration, frontend, or Edge Function was configured or deployed.
- Advisors: the security advisor returned zero findings. The performance advisor returned 18 informational `unused_index` notices, expected because every application table is empty and no workload has executed; these do not justify removing baseline indexes before synthetic testing. See the [Supabase unused-index advisor guidance](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index).

This clean repository baseline is ready for a separately authorized synthetic seeding phase. It is not a production-derived restore and makes no claim about production backup/restore recoverability. Production-derived execution remains deferred, and the two Product/UX Follow-Ups 2 candidate migrations remain separately gated.

## 2026-08-02 synthetic pre-candidate fixtures

The separately authorized synthetic fixture transaction targeted only `BudgBeacon-Rehearsal` (`gwloyvfkrxzgqnlnlcor`). Preflight reconfirmed the healthy target, the exact 23-row baseline ledger through `20260707193257`, zero existing Auth/application rows, zero active cron jobs, RLS on every public table, and the absence of both candidate migrations and their unique objects. No production or legacy write occurred.

The first transaction attempt rolled back completely when the current managed `auth.identities.email` generated column correctly rejected an explicit value. A read-only catalog check confirmed zero residual rows and identified the generated expression. The corrected transaction omitted that generated column and committed atomically. No password, credential, token, connection string, or secret was created or recorded.

### Fixture manifest

| Scope | Count | Synthetic coverage |
| --- | ---: | --- |
| Auth users / email identities | 2 / 2 | Passwordless, confirmed `example.invalid` fixtures with deterministic reserved IDs |
| Profiles / user preferences | 2 / 2 | Created by the unchanged `on_auth_user_created` trigger; preference samples remain synthetic |
| User roles | 2 | Ordinary `user` roles only |
| Debts | 3 | Owner active, owner archived, and second-user active debts |
| Goals | 8 | Same-owner, cross-owner, archived-debt, malformed UUID, non-debt goal type, missing debt, archived goal, and second-user same-owner backfill cases |
| Financial priorities | 2 | One per synthetic user, pointing to that user's expected positive backfill goal |
| Goal-plan snapshots / goal actions | 2 / 2 | One same-owner record per user |
| Recurring rules | 2 | One inactive debt-target normalization fixture and one active far-future ordinary income rule |
| Transactions | 5 | Ordinary, goal-target normalization, debt-target normalization, second-user ordinary, and second-user correctly targeted rows |

All recurring dates are in 2099; the debt-target rule is inactive. The recurring processor was never called. No cron job, Edge Function, webhook, Realtime member, SMTP configuration, or other outbound integration was created or invoked.

### RLS and pre-candidate verification

The seed transaction impersonated `authenticated` independently for both reserved users. The owner saw exactly `1/1/1/7/2/1/3/1/1/1` rows across profiles, roles, preferences, goals, debts, recurring rules, transactions, priorities, snapshots, and actions. The second user saw exactly `1/1/1/1/1/1/2/1/1/1`. A cross-user goal insert raised the expected insufficient-privilege error; cross-user update and delete each affected zero rows. An `anon` table read raised insufficient privilege. All public tables remain RLS-enabled and `anon` retains zero application-table DML grants.

The first candidate migration is expected to link exactly three goals:

- same-owner active goal: link to its active debt and change progress from 7,000 to 35,000 cents;
- same-owner archived goal: link to the same active debt and change progress from 8,000 to 35,000 cents, because the tracked backfill intentionally does not filter archived goals;
- second-user same-owner active goal: link to its active debt and change progress from 9,000 to 30,000 cents.

The cross-owner, archived-debt, malformed-UUID, non-debt-goal, and missing-debt fixtures must remain unlinked with their existing progress values of 2,000, 3,000, 4,000, 5,000, and 6,000 cents respectively.

The second candidate migration's six fail-fast integrity counts are all zero. Its deterministic normalization set is one goal-target transaction, one debt-target transaction, and one debt-target recurring rule.

Post-seed fingerprints:

- complete deterministic fixture fingerprint: `e2f1f7923fce3d40cb4101b347e50ea3`;
- schema fingerprint: `96a71753282a5e8856209cab4b777b99` (unchanged);
- policy fingerprint: `0666f0a5b7a5fe27437715e326495b00` (unchanged);
- table-grant fingerprint: `3f7be5a25500b2b1ce553cb45a8dd3bf` (unchanged);
- function-grant fingerprint: `0150f5c0b051f02444a7b23c04e29a5e` (unchanged);
- migration-ledger fingerprint: `79d26cfb06e5c66912a529add43cccec` (unchanged).

Both candidate ledger rows and all three checked candidate functions remain absent. Active cron jobs and cron-run rows remain zero. Edge Functions, Realtime publication members, Storage buckets/objects, Vault secrets, and password-material rows remain zero; `pg_net` remains absent. The security advisor reports the project-level leaked-password-protection warning after Auth fixtures exist; the fixtures themselves contain no password material. Performance reports 12 informational unused-index notices, expected before a representative workload.

The rehearsal target is ready for separately authorized application of the first candidate migration. Production-derived backup/restore execution remains deferred.

## 2026-08-02 candidate migration 1 application and validation

The authenticated Supabase CLI applied only `20260721194230_product_ux_follow_ups_2_debt_goal_sync.sql` to `BudgBeacon-Rehearsal` (`gwloyvfkrxzgqnlnlcor`). The applied file retained frozen SHA-256 `678834847D83DB8F3607B13AD49D9DFA51935143C54D268F6658692F9B964B40`. The ledger now contains exactly 24 ordered entries and records `20260721194230` once. Candidate migration 2 remains absent.

Schema verification passed for both composite unique constraints, nullable `goals.linked_debt_id`, the debt-payoff-only check, same-owner composite foreign key with `ON DELETE SET NULL (linked_debt_id)`, partial linked-debt index, both synchronization functions, both enabled triggers, and the unchanged onboarding-v2 signature. Both synchronization functions remain `SECURITY INVOKER`, `postgres`-owned, fixed to `search_path=public, pg_temp`, and executable only by `postgres`. Onboarding v2 remains security-invoker and executable by `authenticated` and `postgres`, not `PUBLIC` or `anon`. All ten application tables retain RLS, all 37 policies remain present, `anon` has no application-table DML grant, and hardened future-table DML defaults remain zero.

The committed backfill exactly matched the predicted eight-row result: three goals linked, with progress 35,000 cents for the owner active goal, 35,000 for the archived owner goal, and 30,000 for the other-user goal. Cross-owner, archived-debt, malformed, non-debt, and missing-debt fixtures remained unlinked at 2,000, 3,000, 4,000, 5,000, and 6,000 cents. Legacy onboarding `debtId` values remained unchanged. Cross-owner and archived-debt linked-row counts are both zero.

The rollback-only ownership/progress/RLS group passed. It proved composite-FK, goal-type, and archived-debt rejection; immediate synchronization of both linked owner goals; the exact derived-progress formula; zero and full-target clamps; direct-overwrite restoration; target-change recalculation; debt-delete unlinking without unrelated-goal damage; bidirectional authenticated-user isolation; and anonymous denial. The transaction rolled back and permanent goal/debt/link counts and progress values returned to the committed fixture state.

The onboarding-v2 rollback group found a blocker on its first creation assertion. The RPC created exactly one same-owner debt and goal, set `linked_debt_id`, and derived progress correctly, but `planning_rules.onboarding.debtId` remained absent when the supplied planning rules were `{}`. The nested `jsonb_set(..., '{onboarding,debtId}', ..., true)` call does not create the missing intermediate `onboarding` object. The diagnostic transaction rolled back completely: the ephemeral Auth user, goal, and debt counts are all zero. Retry, updated-debt, change-away, unauthenticated, and onboarding-specific cross-owner assertions were not continued after this contract failure.

Candidate-2 preservation remains intact: all six fail-fast integrity counts are zero; exactly one goal-target transaction, one debt-target transaction, and one debt-target recurring rule still require normalization; `allocation_applied_cents`, `client_operation_id`, and `get_transaction_summary(...)` remain absent; and candidate 2 is absent from the ledger. Final permanent counts remain 2 Auth users, 2 identities, 8 goals, 3 debts, 5 transactions, and 2 recurring rules. Post-migration fixture fingerprint: `94ec1975972b1af73a16ad09429936db`.

Active cron jobs and cron-run rows remain zero. Edge Functions and Realtime publication members remain zero, and `pg_net` remains absent. Security advising reports the existing leaked-password-protection warning. Performance advising reports one unindexed composite-foreign-key notice plus 11 expected unused-index notices; no index was changed. Production and legacy remained untouched.

Recommendation: **remediation required** before candidate migration 2. Candidate migration 1 must not be reapplied, and candidate migration 2 remains prohibited until the onboarding JSON contract is corrected and the complete onboarding rollback suite passes.

## 2026-08-02 local onboarding JSON remediation

The confirmed root cause is unchanged: PostgreSQL `jsonb_set(..., '{onboarding,debtId}', ..., true)` does not create a missing intermediate `onboarding` object. Local migration `20260721194320_product_ux_follow_ups_2_onboarding_json_parent_fix.sql` was added between candidate migrations 1 and 2. It replaces only `public.create_goal_pack_onboarding_setup_v2(...)` and preserves the existing signature, defaults, return contract, invoker security, fixed `search_path`, authentication and locking behavior, goal/debt reuse, relational link, progress synchronization, comment, revocations, and grant.

The replacement normalizes the current top-level `planning_rules` value to an object, replaces a missing or non-object `onboarding` value with an empty object, merges any existing onboarding-object siblings, and overwrites the four authoritative compatibility fields: `debtId`, `debtInterestRateBasisPoints`, `debtMinimumPaymentCents`, and `debtType`. Unrelated top-level and onboarding keys are preserved; no nested write depends on a pre-existing intermediate object.

Rollback-only regression assertions were added to `supabase/tests/product_ux_follow_ups_2_schema_security.sql` for empty and null planning rules, a missing onboarding object with top-level siblings, existing onboarding siblings and stale metadata, a non-object onboarding value, retry reuse and metadata updates, change away from debt payoff, unauthenticated rejection, cross-owner debt injection resistance, and bidirectional RLS isolation. The remediation assertions run after candidate 1 and this fix without requiring candidate 2; the existing candidate-2-only assertions are explicitly gated on the candidate-2 summary RPC being present. These assertions are prepared for later hosted execution and were not executed against Supabase in this local-only task.

Final local review passed migration filename ordering and collision checks, exact candidate-1 function-contract comparison, SQL dollar-quote/delimiter checks, candidate-2 and unrelated-DDL exclusion scans, cron/outbound scans, secret-pattern scanning, `git diff --check`, TypeScript compilation, ESLint, all 20 Vitest files and 69 tests, and the Vite production build. Initial Vitest and Vite attempts were environment-blocked by the managed read-only sandbox's temporary-file and module-resolution restrictions; unchanged-dependency retries with local filesystem permission passed, so no dependency was installed or updated.

Candidate migration 1 remains byte-identical at SHA-256 `678834847D83DB8F3607B13AD49D9DFA51935143C54D268F6658692F9B964B40`. Candidate migration 2 remains byte-identical at SHA-256 `E7CF5834475DA1904E196895B056823773494DFB3C00811D9D6E89FFC8650A75` and, per the verified starting state, remains unapplied. No hosted database, migration ledger, cron, Edge Function, Realtime, SMTP, webhook, or integration action occurred. Production and legacy remained untouched.

## Backup, restore, and migration verification

| Gate | Status | Result |
| --- | --- | --- |
| Compatible PostgreSQL 17+ clients | **PASS** | Absolute EDB command-line-tool binaries report 17.10; PostgreSQL 16.10 and PATH remain unchanged. |
| Current database/catalog source inventory | **PASS** | Counts, semantic preflights, trigger contract, extensions, ledger, RLS/policies, and opaque fingerprints refreshed read-only. |
| Current non-database project settings inventory | **PASS** | Signed-in Dashboard read-only inventory completed with sanitized presence/state/count evidence only. |
| Target approval/creation or reuse | **PASS** | Explicit one-project authorization recorded; one ordinary Free target created in the approved organization/name/region at `$0/month`; no existing project reused. |
| Target future-object Data API security prerequisite | **PASS** | Exact Supabase-supported `postgres`/`public` default-privilege revokes applied and verified; managed ACL fingerprint unchanged; no application object or migration created. |
| Production credential access | **NOT TESTED** | No credential accessed. |
| Backup artifacts and checksums | **NOT TESTED** | No artifacts created. |
| Encryption at rest and retention policy | **NOT TESTED** | No artifact or policy approved. |
| Restore and equivalence | **NOT TESTED** | No restore attempted. |
| `20260707193257` clean-baseline execution | **PASS** | Executed normally from the unchanged repository file and received its legitimate rehearsal ledger entry; no ledger repair was used. |
| `20260721194230` on restored copy | **NOT TESTED** | Not applied anywhere. |
| `20260721194410` on restored copy | **NOT TESTED** | Not applied anywhere. |
| Schema/security rollback-only suite | **NOT TESTED** | Not executed. |
| Allocation-behavior rollback-only suite | **NOT TESTED** | Not executed. |
| Residual synthetic-state checks | **PASS** | No synthetic state was created; all application and Auth row counts are zero. |
| Post-baseline advisors | **PASS** | Security: 0 findings. Performance: 18 informational unused-index notices expected on the empty target. |
| Generated TypeScript types | **NOT TESTED** | No verified restore project exists. |
| Application gates | **NOT TESTED** | Deferred until verified restored-copy types exist. |

No role-simulation result is claimed. Both SQL verification files remain restore-target-only and were not executed.

## Artifact retention and cleanup

No backup artifact, decrypted working copy, credential file, password, connection string, token, key, Auth session, or private data export was created or accessed. There is therefore no artifact or credential cleanup to perform from this partial run. No retention duration, encrypted storage location, or key custodian was selected.

The rehearsal target exists, is healthy, and remains active with the clean pre-candidate repository schema and zero Auth/application rows. No cleanup, pause, deletion, or final-disposition approval was given. The target must remain isolated from production and outbound integrations.

## Remaining blockers

1. Select an encrypted external artifact location, retention period, encryption-key custodian, post-rehearsal cleanup expectation, and target pause/delete/retain preference.
2. The target future-object Data API security prerequisite is complete; keep all outbound integrations withheld during later synthetic development and restore phases.
3. When the deferred production-derived rehearsal resumes, approve the exact native artifact sequence and separately approve production credential use immediately before the read-only export.
4. After artifact verification, separately approve target database writes/restoration. Migration/test execution and target cleanup remain later, independent approvals.

Any security-critical `NOT TESTED` or any `FAIL` keeps the recovery gate blocked. This report does not recommend applying the candidate migrations to production.

## Production safety confirmation

Production received no write. Across the 2026-07-31 prerequisite and 2026-08-02 baseline tasks, no production credential, backup, restore, production schema row, or production data was accessed or executed. Remote writes were confined to the authorized rehearsal project: its future-default-privilege prerequisite, the exact environmental RLS bootstrap pair, and the 23 unchanged baseline migrations through `20260707193257`. Rehearsal contains no Auth user, identity, or application row; the cron job created by the unchanged recurring migration was immediately unscheduled, and no processor was invoked. Neither candidate migration was applied. No SMTP, webhook, external integration, frontend, or Edge Function was configured or deployed. Cloudflare and `budg.ca` were not changed or pointed at the rehearsal target.

**Production was not mutated.**
