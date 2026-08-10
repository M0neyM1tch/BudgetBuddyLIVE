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

## 2026-08-02 hosted onboarding remediation verification and fixture correction

The authenticated Supabase CLI successfully applied only `20260721194320_product_ux_follow_ups_2_onboarding_json_parent_fix.sql` to `BudgBeacon-Rehearsal` (`gwloyvfkrxzgqnlnlcor`). The applied migration retains SHA-256 `99ECE84EA43F03D6E2F7414D81FE457E448D5FA3C9004AE235A497FA0CCC6CE8`; the ledger contains exactly 25 entries, with candidate migration 1 and the remediation each present once and candidate migration 2 absent.

Hosted definition verification confirmed that `public.create_goal_pack_onboarding_setup_v2(...)` matches the remediation migration: its signature, defaults, JSONB return type, `postgres` ownership, `SECURITY INVOKER`, `search_path=public, pg_temp`, comment, and execution grants are unchanged. The function now performs one top-level `{onboarding}` object merge and writes all four authoritative debt metadata fields without relying on a nested write whose intermediate parent may be absent.

The initial hosted regression attempt exposed a test-fixture defect, not another function or migration defect. The committed onboarding calls omitted `p_debt_icon`, so the temporary debt insert failed on the unrelated `debts.icon` `NOT NULL` constraint before reaching the JSON assertions. That transaction rolled back completely. The same rollback-only behavior suite passed when the RPC calls supplied valid presentation inputs `p_debt_color='#00ffaa'` and `p_debt_icon='credit-card'`.

With those valid inputs, hosted checks passed empty and null planning rules; missing `onboarding`; top-level and onboarding sibling preservation; stale metadata replacement; scalar and array onboarding normalization; relational/JSON debt-ID equality; interest-rate, minimum-payment, and debt-type metadata; derived progress; retry reuse without duplicate debt creation; updated retry data; change away from debt payoff; unauthenticated rejection; cross-owner injection resistance; bidirectional RLS isolation; and anonymous denial. Focused migration-1 synchronization and ownership smoke tests also passed.

All rollback residue checks returned zero. Permanent counts returned to 2 Auth users, 2 identities, 8 goals, 3 debts, 5 transactions, 2 recurring rules, and 3 linked goals, with application-data fingerprint `94ec1975972b1af73a16ad09429936db`. Candidate migration 2 and its unique objects remain absent; its three normalization fixtures remain present and all six fail-fast integrity counts remain zero. Production `BudgetBuddy-V2` and legacy `BudgetBuddy` remained untouched.

The local SQL fixture now supplies `p_debt_color => '#00ffaa'` and `p_debt_icon => 'credit-card'` to every debt-payoff onboarding call, including the unauthenticated isolation case, and explicitly exercises both scalar and array `onboarding` inputs. The test remains enclosed by its original top-level transaction and final rollback, and candidate-2-only assertions remain behind their existing conditional gate.

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

## 2026-08-03 committed remediation-compatible rollback verification

The corrected SQL fixture checkpoint is Git commit `723191ee34dc6fa792f48b2c8a19bf10326d5b1e` on `Product/UX-Follow-Ups-2`. Local `HEAD` and `origin/Product/UX-Follow-Ups-2` matched with zero divergence and a clean starting tree. The committed and worktree blobs for `supabase/tests/product_ux_follow_ups_2_schema_security.sql` were identical (`62af7260fb03e7fc68a9a8ef7612168b10cc0205`), and the test file SHA-256 was `84AD21166880F1B5E7FEF7080FBC974FA2BCFD3CA244CEC8C791F33DABD0D450`. Candidate 1, the remediation, and candidate 2 retained their frozen SHA-256 values `678834847D83DB8F3607B13AD49D9DFA51935143C54D268F6658692F9B964B40`, `99ECE84EA43F03D6E2F7414D81FE457E448D5FA3C9004AE235A497FA0CCC6CE8`, and `E7CF5834475DA1904E196895B056823773494DFB3C00811D9D6E89FFC8650A75` respectively.

Read-only preflight proved that the target was the healthy `BudgBeacon-Rehearsal` project (`gwloyvfkrxzgqnlnlcor`, `us-east-2`, PostgreSQL 17.6), distinct from production and legacy. Its ledger contained exactly 25 entries, with `20260721194230` and `20260721194320` each present once and `20260721194410` absent. Permanent counts were 2 Auth users, 2 identities, 8 goals, 3 debts, 5 transactions, 2 recurring rules, and 3 linked goals. The application-data fingerprint was `94ec1975972b1af73a16ad09429936db`; candidate-2 normalization fixtures were `1/1/1`; all six candidate-2 fail-fast counts were zero; active cron jobs/history were `0/0`; Edge Functions and Realtime publication members were zero; and `pg_net` was absent.

The committed test blob was the sole test source and was not edited or substituted. All four debt-payoff calls supplied `p_debt_color => '#00ffaa'` and `p_debt_icon => 'credit-card'`. Because the linked Management API executes SQL but not psql meta-commands, the file's existing `\gset` and false `\if :candidate_two_applied` gate were interpreted client-side exactly as psql would: `\gset` terminated the predicate query and the candidate-2-only block was skipped. The assertion SQL itself remained byte-for-byte from the committed blob, with its single top-level `BEGIN`, no `COMMIT`, and final `ROLLBACK`.

An initial harness attempt omitted the query terminator implied by `\gset` and was rejected by PostgreSQL with syntax error `42601` at the final `ROLLBACK`; it did not reach the assertions or commit any state. Immediate verification showed zero ephemeral users/goals/debts, unchanged permanent counts, three linked goals, and the exact permanent fingerprint. The corrected psql-compatible gate interpretation then completed successfully with `candidate_two_applied=false` and the final rollback.

The unchanged remediation-compatible assertions passed for empty and null planning rules; missing `onboarding`; preservation of unrelated top-level and onboarding siblings; replacement of stale debt metadata; scalar and array onboarding normalization; relational/JSON debt-ID equality; authoritative interest-rate, minimum-payment, and debt-type metadata; derived progress; retry reuse without duplicate debt creation; updated debt values on retry; change away from debt payoff; unauthenticated rejection; cross-owner debt-ID injection resistance; bidirectional authenticated RLS isolation; and the function's `postgres` owner, `SECURITY INVOKER` mode, `search_path=public, pg_temp`, and authenticated-only execution contract. A separate live anonymous read of `public.goals` was denied with PostgreSQL `42501`.

A focused rollback-only migration-1 smoke block separately passed cross-owner relational-link rejection, non-debt goal-link rejection, archived-debt rejection, synchronization of multiple linked goals after a debt change, lower and upper progress clamps, correction of a direct progress overwrite, progress recalculation after a target change, and clearing relational links when the debt is deleted. The block ended in `ROLLBACK`.

Post-test residue was zero for the reserved ephemeral Auth users and identities and for profiles, roles, preferences, goals, debts, transactions, recurring rules, priorities, snapshots, and actions. Permanent counts returned exactly to 2 Auth users, 2 identities, 8 goals, 3 debts, 5 transactions, 2 recurring rules, and 3 linked goals, with fingerprint `94ec1975972b1af73a16ad09429936db`. Candidate migration 2 remains absent from the ledger; `allocation_applied_cents`, `client_operation_id`, and `get_transaction_summary(...)` remain absent; its `1/1/1` normalization fixtures remain present; and all six fail-fast counts remain zero.

Security and outbound verification remained unchanged: all 10 application tables have RLS enabled, all 37 policies remain present, `anon` has zero application-table DML grants, `PUBLIC` and `anon` have zero public-function execution grants, and the four hardened `postgres` future-object exposure counts remain zero. Active cron jobs/history remain `0/0`; the recurring processor was not invoked; Edge Functions and Realtime publication members remain zero; `pg_net` remains absent; and no outbound behavior occurred.

The security advisor returned the existing project-level warning that leaked-password protection is disabled. The performance advisor returned the existing informational unindexed composite foreign key `goals_linked_debt_owner_fkey` and ten informational unused-index notices; no index or Auth setting was modified. No migration was applied, migration history was not changed, candidate migration 2 was not applied, and production `BudgetBuddy-V2` plus legacy `BudgetBuddy` remained untouched.

Recommendation: **ready for separately authorized candidate migration 2 application and validation**.

## 2026-08-03 candidate-2 parser failure and correction

The authenticated candidate-2 attempt used the isolated workspace `C:\Users\Mitch\AppData\Local\Temp\codex-budgbeacon-candidate2-861567409fa147f99033234f719ee56d`, linked only to the healthy `BudgBeacon-Rehearsal` project (`gwloyvfkrxzgqnlnlcor`, `us-east-2`). Its authenticated dry run proposed only `20260721194410_product_ux_follow_ups_2_transaction_summary_and_retarget.sql`. The real CLI attempt reached that migration and failed at statement 9 with SQLSTATE `42601` while PostgreSQL parsed `public.sync_transaction_allocation()`.

The defect was two unparenthesized `CASE` expressions used as right-hand operands of `IS DISTINCT FROM` inside a PL/pgSQL `IF` condition: the recurring-rule comparisons for `new.kind` and `new.category`. Both expressions are now explicitly parenthesized. The recurring-rule semantic contract and every other migration operation remain unchanged. A complete review of all 13 function bodies found no other conditional `CASE` parsing defect; the remaining standalone assignment, aggregate, and `VALUES` expressions are valid SQL and were not mechanically altered.

The failed CLI migration transaction rolled back. Candidate 2 was never recorded, so the unapplied migration was corrected in place without a follow-up migration. No reset, migration repair, or history manipulation was performed or required. Candidate 1 and the onboarding remediation remain byte-identical at SHA-256 `678834847D83DB8F3607B13AD49D9DFA51935143C54D268F6658692F9B964B40` and `99ECE84EA43F03D6E2F7414D81FE457E448D5FA3C9004AE235A497FA0CCC6CE8`. Candidate 2 changed from its prior frozen SHA-256 `E7CF5834475DA1904E196895B056823773494DFB3C00811D9D6E89FFC8650A75` to corrected SHA-256 `D7C24CE992FC6D9593E1D8DC5CECC14425CFE0666D07BE50F7B677A9B579F82D`.

No-persistent-change parser validation reproduced SQLSTATE `42601` with the known minimal unparenthesized form. The equivalent parenthesized probe parsed successfully inside an explicit transaction ending in `ROLLBACK`, with no probe function left behind. The complete corrected 1,323-line migration then executed successfully against the rehearsal schema inside one explicit transaction ending in `ROLLBACK`; no migration-ledger entry was created. An initial whole-file validation transport was rejected after its SQL text was truncated by the validation harness; it made no persistent change. Lossless chunk reassembly was used for the successful full-file rollback-only execution.

Post-validation verification again found exactly 25 ledger entries and zero `20260721194410` entries. `allocation_applied_cents`, `client_operation_id`, and `get_transaction_summary(...)` remain absent. Permanent counts remain 2 Auth users, 2 identities, 8 goals, 3 debts, 5 transactions, 2 recurring rules, and 3 linked goals. The established application-data fingerprint remains `94ec1975972b1af73a16ad09429936db`; the three candidate-2 normalization fixtures remain `1/1/1`; and all six fail-fast integrity counts remain zero.

Static validation passed migration ordering and timestamp-collision checks, balanced dollar-quote/delimiter checks, all 13 function-definition parses through the full rollback-only execution, trigger and function signature review, grant/revoke signature review, the existing client-side candidate-2 test gate review, secret-pattern scanning, and `git diff --check`. TypeScript compilation, ESLint, all 20 Vitest files and 69 tests, and the Vite production build passed without installing or updating dependencies. The first local TypeScript command was blocked by the managed PowerShell/filesystem environment; the unchanged command passed when run with the required local execution permission.

No candidate-2 fixture assertion was run against persistent hosted state, no real migration application was retried, and no cron, Realtime, Edge Function, Auth, SMTP, webhook, network, or other outbound behavior was invoked or changed. Production `BudgetBuddy-V2` (`cebykmbauxbucvforwzj`) and legacy `BudgetBuddy` (`yvsizxnfqkkazqnwbgnc`) remained untouched.

Recommendation: **ready for manual push and a rebuilt isolated candidate-2 dry run**.

## 2026-08-03 corrected candidate-2 application and hosted validation

Git `HEAD` and `origin/Product/UX-Follow-Ups-2` were synchronized at `d0bf59d48df50e14979b80bf0f577228b5601b7f` with a clean starting tree. The authenticated Supabase CLI used only the fresh verified workspace `C:\Users\Mitch\AppData\Local\Temp\codex-budgbeacon-candidate2-corrected-b309478864d14665b93bcc0f8d8ae474`. It proposed and applied only `20260721194410_product_ux_follow_ups_2_transaction_summary_and_retarget.sql`, then reported `Finished supabase db push.` The target was the healthy `BudgBeacon-Rehearsal` project (`gwloyvfkrxzgqnlnlcor`, `us-east-2`, PostgreSQL 17.6). Production `BudgetBuddy-V2` and legacy `BudgetBuddy` were not accessed.

Candidate 1, the onboarding remediation, and corrected candidate 2 matched SHA-256 `678834847D83DB8F3607B13AD49D9DFA51935143C54D268F6658692F9B964B40`, `99ECE84EA43F03D6E2F7414D81FE457E448D5FA3C9004AE235A497FA0CCC6CE8`, and `D7C24CE992FC6D9593E1D8DC5CECC14425CFE0666D07BE50F7B677A9B579F82D`. The post-application ledger contains exactly 26 distinct versions, with `20260721194230`, `20260721194320`, and `20260721194410` each present once. No duplicate, repair, reset, or additional migration entry exists.

### Permanent migration effects

Exactly the prepared semantic fixtures were normalized:

| Object | Identifier | Permanent semantic result | Preserved contract |
|---|---|---|---|
| Goal-target transaction | `30000000-0000-0000-0000-000000000902` | `kind=transfer`, `category=savings` | Owner, 1,500-cent amount, 2099-01-11 date, description, notes, manual source, goal `10000000-0000-0000-0000-000000000905`, null debt/rule/bank/Plaid fields, and creation timestamp preserved; `updated_at` changed through the migration update path. |
| Debt-target transaction | `30000000-0000-0000-0000-000000000903` | `kind=transfer`, `category=debt_payment` | Owner, 2,000-cent amount, 2099-01-12 date, description, notes, manual source, debt `20000000-0000-0000-0000-000000000901`, null goal/rule/bank/Plaid fields, and creation timestamp preserved; `updated_at` changed through the migration update path. |
| Debt-target recurring rule | `50000000-0000-0000-0000-000000000901` | `kind=transfer`, `category=debt_payment` | Owner, 2,500-cent amount, monthly frequency, day 1, 2099 dates, inactive state, description, notes, debt ID, and creation timestamp preserved; `updated_at` changed through the migration update path. |

All remaining targeted transactions and debt-target rules have valid semantics. No additional row was unexpectedly semantically normalized. The already-correct second-user debt transaction remained `transfer/debt_payment`; its `updated_at` changed only because the historical allocation-backfill statement intentionally updated every targeted transaction.

Historical allocation state for the five permanent transactions is:

| Transaction | Amount | Goal | Debt | Applied allocation | Operation ID |
|---|---:|---|---|---:|---|
| `30000000-0000-0000-0000-000000000901` | 10,000 | null | null | 0 | null |
| `30000000-0000-0000-0000-000000000902` | 1,500 | `10000000-0000-0000-0000-000000000905` | null | 1,500 | null |
| `30000000-0000-0000-0000-000000000903` | 2,000 | null | `20000000-0000-0000-0000-000000000901` | 2,000 | null |
| `30000000-0000-0000-0000-000000000904` | 1,200 | null | null | 0 | null |
| `30000000-0000-0000-0000-000000000905` | 1,000 | null | `20000000-0000-0000-0000-000000000903` | 1,000 | null |

Every targeted row equals `abs(amount_cents)`, every untargeted row equals zero, and all five pre-existing operation IDs are null.

### Schema, RLS, and grants

Catalog verification passed for the unique `(id,user_id)` recurring-rule constraint; the recurring debt semantic constraint; both transaction columns; the single-target, nonnegative-allocation, and target-semantic checks; all three composite same-owner foreign keys; and the valid partial unique `(user_id,client_operation_id)` index. `allocation_applied_cents` is `integer NOT NULL DEFAULT 0`; `client_operation_id` is nullable `uuid`. The four enabled/origin triggers point to the expected allocation and lock helpers with the intended timing and events.

All 13 candidate-2-created or replaced function signatures exist with owner `postgres` and fixed `search_path=public, pg_temp`. The trigger helpers and client RPCs are `SECURITY INVOKER`. `process_due_recurring_rules(uuid,date)` retains its intended `SECURITY DEFINER`, service-role-only contract; it is not executable by `PUBLIC`, `anon`, or `authenticated`. Internal helpers have no execution for those three roles. Authenticated execution is present only for the intended client RPCs, while the recurring processor is executable only by `service_role`.

All ten application tables retain RLS and all 37 policies remain present. `anon` has zero application-table DML grants and no new function execution. Authenticated table grants remain the established per-table contract. Hardened `postgres`/`public` future defaults remain intact: client table CRUD, client function execution, client sequence `USAGE`/`SELECT`, and `PUBLIC` function execution counts are all zero.

### Committed and supplemental rollback suites

The committed files were byte-identical to Git: `product_ux_follow_ups_2_schema_security.sql` SHA-256 `84AD21166880F1B5E7FEF7080FBC974FA2BCFD3CA244CEC8C791F33DABD0D450`, and `product_ux_follow_ups_2_allocation_behavior.sql` SHA-256 `DC4951408CD88716FB5F5533B8C4BA96913972BDEFE391DBB29297CAB6B9CFFE`. The 965-line schema/security suite ran with its psql `\gset`/`\if` gate interpreted client-side as true; its SQL statements were unchanged. The 496-line allocation suite contained no client directives and ran unchanged. Both used their committed top-level `BEGIN` and final `ROLLBACK` and passed without an assertion failure.

Allocation checks passed exact goal and debt deltas, linked-goal synchronization, goal and debt overpayment clamps, same-target updates, goal-to-debt and debt-to-goal retargeting, target removal, deletion reversal by recorded delta, and direct insert/update/delete parity. A linked debt-payoff goal rejected direct targeting. Constraint and ownership checks rejected dual targets, cross-owner and archived targets, cross-owner recurring relationships, negative stored allocation, incorrect goal/debt semantics, active targetless rules, fresh targetless transfers, ordinary-to-unallocated-transfer conversion, and mismatched recurring semantics. Historical targetless transfers produced by target deletion remained valid and editable.

Quick-add checks passed one-row/one-allocation creation, identical retry identity, unchanged balance on retry, changed-input rejection, operation-ID immutability, per-user reuse of the same UUID, cross-owner target rejection, and unauthenticated rejection.

Recurring checks passed normalized debt-rule semantics, same-owner rule/target relationships, compatible updates, exact duplicate occurrence idempotency, semantically different duplicate rejection, and exact deletion reversal. The committed allocation suite invokes `process_due_recurring_rules()` twice for its reserved ephemeral user to prove exactly-once behavior; both calls occurred only inside its transaction and were rolled back. No separate call, permanent-user call, scheduled invocation, or persistent recurring effect occurred.

Transaction-summary checks passed unfiltered integer-cent totals and count, transfer exclusion from monetary totals, date/category/debt/kind/minimum/maximum filters, description/category/notes search, punctuation and repeated-whitespace sanitization, empty-result zeros, invalid date and amount rejection, category/search length limits, unauthenticated rejection, bidirectional owner isolation, and exact parity with the corresponding owner-visible list aggregate.

Candidate-1 and onboarding regression assertions also passed: three permanent linked goals; cross-owner and archived-debt cases remaining unlinked; debt-change synchronization; empty/null planning rules; missing, scalar, and array onboarding parents; sibling preservation; authoritative relational/JSON debt IDs and metadata; and retry without duplicate debt creation.

### Rollback proof, fingerprints, and advisors

All reserved suite users and identities and every associated application row returned to zero. Permanent counts returned to 2 Auth users, 2 identities, 8 goals, 3 debts, 5 transactions, 2 recurring rules, and 3 linked goals. The permanent normalizations and allocation backfill above remain, with no other test mutation.

Fresh deterministic sorted-row/catalog fingerprints after candidate 2 are:

- application data: `0b999b5c0edbaaf820c452c9582ee614`;
- schema: `b8f4f1d34cfb5fbb5ca0372e88040ca5`;
- policies: `f5cb47774dd0a791064138d075d33f82`;
- table grants: `f09c8da28b8f572a2f5eb66a7dce85f6`;
- function grants: `6edd6edcda30309c86167fd1a8679f5c`;
- migration ledger: `7edd1752d3e4027753c38d1e618c1b2c`.

These refreshed values use one canonical sorted-text calculation across the complete current application rows and relevant catalog sets. Earlier fingerprints calculated over pre-candidate or differently normalized sets remain historical and are not silently compared as if their formulas were identical.

The security advisor reports only the existing project-level warning that leaked-password protection is disabled. The performance advisor still reports the pre-existing unindexed composite foreign key on `goals_linked_debt_owner_fkey` and ten pre-existing unused-index notices. Candidate 2 adds informational unindexed-composite-FK notices for `transactions_goal_owner_fkey`, `transactions_debt_owner_fkey`, and `transactions_recurring_rule_owner_fkey`; no trigger/function security finding appeared, and the new operation-ID index was not reported unused. No index, policy, Auth setting, or configuration was changed during validation.

Final outbound checks are zero active cron jobs, zero cron-history rows, zero Edge Functions, zero Realtime publication members, no `pg_net`, zero application webhook triggers, and zero outbound function references. No SMTP, webhook, network, or other external integration was configured or invoked. The ledger remains 26 with candidate 2 present exactly once; no additional migration was applied. Production and legacy remained untouched.

Recommendation: **ready for final types and application QA**.

## 2026-08-03 rehearsal-generated TypeScript types and application contract alignment

The authenticated, read-only type-generation source was `BudgBeacon-Rehearsal` (`gwloyvfkrxzgqnlnlcor`), schema `public`, after the verified 26-entry migration ledger recorded corrected candidate migration 2 exactly once. The user ran:

```powershell
supabase gen types typescript --project-id "gwloyvfkrxzgqnlnlcor" --schema public
```

The output was captured outside the repository at `C:\Users\Mitch\AppData\Local\Temp\budgbeacon-rehearsal-public.types.ts`. It was 36,548 bytes with SHA-256 `FA97D5A18674FC9331F5F0E6CBBAF57DE94AA36F77E9D8C6F8904681AEBF32A3`. Validation confirmed one complete top-level `Database` declaration, only the generator's `__InternalSupabase` metadata and requested `public` schema, balanced TypeScript syntax, and no CLI message, terminal prompt, URL, credential, token, password, or unrelated output. Its UTF-8 BOM and CRLF line endings were safely normalized to the repository's established BOM-less UTF-8 and LF convention.

Repository search identified `src/types/database.types.ts` as the single canonical generated type file. The application client in `src/shared/lib/supabase.ts` imports that `Database` type and calls `createClient<Database>`. No competing or abandoned generated type file exists. The normalized tracked file is textually identical to the normalized rehearsal output; no generated declaration was edited by hand.

### Generated contract review

The generated semantic diff is limited to the expected final migration contract:

- `goals.Row`, `goals.Insert`, and `goals.Update` now include nullable `linked_debt_id`, and the generated relationship metadata includes `goals_linked_debt_owner_fkey` over `(linked_debt_id,user_id)` to `debts(id,user_id)`.
- `transactions.Row`, `transactions.Insert`, and `transactions.Update` now include non-null/defaulted `allocation_applied_cents` and nullable `client_operation_id` as appropriate. Generated relationships include the composite same-owner goal, debt, and recurring-rule foreign keys in addition to the existing single-column relationships.
- Existing transaction-returning allocation and update RPC rows now include `allocation_applied_cents` and `client_operation_id`.
- `create_quick_add_transaction`, `update_transaction_and_retarget`, and `get_transaction_summary` are present with the hosted argument names and generated row-return contracts. The summary returns non-null numeric `income_cents`, `expense_cents`, `net_cents`, and `transaction_count` values as an array row.
- The five existing enums remain unchanged, including `transfer` in `transaction_kind`. The generated ten-table set contains no unexplained object.
- Candidate-1, onboarding-remediation, allocation, recurring, goal-pack onboarding/recalculation, action-completion, transaction-update, and hard-deletion RPC declarations remain present. Argument names, generator-represented defaults/optionality, enums, return rows, and set-return metadata match the repository migration contracts. Trigger-only internal functions remain outside the generated client RPC surface as expected.

### Application contract alignment

The refreshed types exposed two stale test fixtures that omitted the now-required `linked_debt_id`; both fixtures now specify `null`. The application now reads `linked_debt_id` directly from generated goal types in the Transactions page and goal-pack dashboard model instead of using provisional structural casts.

The earlier broad untyped local-RPC workaround in `transactions.api.ts` was removed. A narrow adapter derived from `Database["public"]["Functions"]` now preserves each generated RPC name, required argument, enum, and return contract while widening only parameters that the SQL signatures deliberately accept as `NULL`; Supabase generation does not encode that SQL nullability for non-defaulted arguments. No generated type was altered to accommodate application code, and no `any`, `unknown as`, suppression directive, non-null assertion, disabled lint rule, empty-string substitute, or duplicated database business logic was introduced.

Static application review confirmed:

- quick add creates one UUID per submission payload, reuses it for an identical retry, calls `create_quick_add_transaction`, leaves balance allocation to the database, and never updates `client_operation_id` later;
- transaction edits call `update_transaction_and_retarget`, send mutually exclusive goal/debt targets or two null targets for removal, preserve the existing recurring relationship in the database RPC, consume generated transaction rows, and do not update balances in the frontend;
- transaction summaries call `get_transaction_summary` with the same date, category, debt, kind, integer-cent amount, and sanitized-search filters used by the list query; they use the complete server-side result rather than a paginated client page, safely produce zeroes for an empty result, and present transfers as zero monetary contribution;
- linked debt-payoff goals use `linked_debt_id`, quick-add payments target the debt rather than the linked goal, and displayed progress remains database-derived. Existing onboarding code retains relational/legacy-JSON compatibility;
- recurring debt rules use `transfer`/`debt_payment` semantics, and transaction mutations invalidate server-backed goal, debt, summary, list, recurring, dashboard, analytics, calculator, and goal-pack queries instead of manually applying generated allocations.

### Automated QA

- `npm run typecheck`: passed after classifying and correcting the two stale test fixtures and removing provisional contract casts.
- `npm run lint`: passed.
- Targeted Vitest run: 4 files and 24 tests passed for transaction RPC adapters, quick-add target resolution, goal-pack dashboard behavior, and goal planning.
- Complete `npm test`: 20 files and 69 tests passed.
- `npm run build`: passed; TypeScript project compilation and the Vite production build completed successfully.
- Standalone generated-file TypeScript syntax validation passed, and the full typecheck confirmed canonical import resolution.
- `git diff --check` and credential/secret scans passed. Added application/source lines contain no production, legacy, rehearsal-project, service-role, temporary-path, `any`, `unknown as`, TypeScript-suppression, or lint-suppression reference; documentation contains only the authorized project references and temporary generation path recorded above.
- No migration, Supabase SQL test, package manifest, lockfile, environment file, project-link metadata, CI, deployment, production, or legacy configuration changed.

### Manual rehearsal browser-QA checklist

Browser QA was **not** performed during this local type-alignment task. The following checklist remains for a later interactive rehearsal session using the two synthetic users:

1. Quick-add ordinary income.
2. Quick-add ordinary expense.
3. Quick-add goal contribution.
4. Quick-add debt payment.
5. Retry and double-click protection.
6. Edit a transaction amount.
7. Retarget a goal contribution to a debt.
8. Retarget a debt payment to a goal.
9. Remove a transaction target.
10. Delete a targeted transaction.
11. Confirm goal and debt balances refresh correctly.
12. Confirm linked debt-payoff goal progress stays synchronized.
13. Confirm transaction summary matches visible filters.
14. Exercise date, category, kind, amount, debt, and search filters.
15. Confirm the empty-summary state.
16. Confirm recurring debt-rule display and generated-transaction behavior.
17. Confirm refresh/reload persistence.
18. Smoke-test owner-to-owner isolation with the two synthetic rehearsal users.

This task used only the already-generated local file and repository checks. It did not regenerate types, apply a migration, write database or Auth data, invoke or schedule cron, deploy an Edge Function, change Realtime or project configuration, or perform any other Supabase write. Production `BudgetBuddy-V2` (`cebykmbauxbucvforwzj`) and legacy `BudgetBuddy` (`yvsizxnfqkkazqnwbgnc`) remained untouched.

Recommendation: **ready for manual push and browser QA**.

## 2026-08-08 onboarding recurring-processing remediation

The Git and target preflight began from a clean, synchronized `Product/UX-Follow-Ups-2` branch at `f24f004c4d2e6832be66058cd877a8201a3f6cb7`. Supabase independently identified the healthy target as `BudgBeacon-Rehearsal` (`gwloyvfkrxzgqnlnlcor`, `us-east-2`, PostgreSQL 17.6). Production `BudgetBuddy-V2` (`cebykmbauxbucvforwzj`) and legacy `BudgetBuddy` (`yvsizxnfqkkazqnwbgnc`) were distinct projects, were not selected for a project-scoped operation, and received no write.

Read-only preflight found exactly 26 migration-ledger entries and no history mismatch. The project contained one existing test Auth user, one identity, and one preference row, with zero goals, debts, transactions, recurring rules, Storage buckets/objects, or Vault secrets. Active cron jobs/history were `0/0`; Realtime publication members and outbound trigger/function references were zero; `pg_net` was absent. All 10 application tables retained RLS and all 37 policies. `public.process_due_recurring_rules(uuid,date)` remained owned by `postgres`, `SECURITY DEFINER`, fixed to `search_path=public, pg_temp`, executable by `postgres` and `service_role`, and not executable by `PUBLIC`, `anon`, or `authenticated`.

The root cause matched the browser evidence. The shared onboarding finalization path saves the starter setup and recurring rules, then invokes `process-recurring` whenever any selected rule has `start_date <= current_date`. Rehearsal had zero deployed Edge Functions, and its six recent invocation records were `OPTIONS 404` responses for `/functions/v1/process-recurring` with no function or deployment ID. The failure therefore occurred after the durable setup writes but before backdated transactions and onboarding completion, affecting every priority category through the same shared flow.

The existing checked-in deployment payload was reviewed without modification:

- `supabase/functions/process-recurring/index.ts`: 3,485 bytes, SHA-256 `39BA8BEA1814F8766D33DDD7C63546A4861420AFB48FEB3FDA12A2E40AA62B8A`;
- `supabase/functions/_shared/cors.ts`: 2,030 bytes, SHA-256 `F947E7A5141CEF2F5598D54F570CB6F86941613270962A676F1995CAD0551B8E`.

Only `process-recurring` was deployed, only to `gwloyvfkrxzgqnlnlcor`, as active version 1 with platform JWT verification enabled. Retrieval of the deployed bundle confirmed semantic equality with both checked-in files after transport newline normalization. No function source, project secret, database schema, migration, Auth setting, cron configuration, Realtime setting, webhook, SMTP setting, or external integration was changed.

A credential-free browser-preflight probe from origin `http://localhost:5173` returned HTTP 200 with the same `Access-Control-Allow-Origin`, allowed `POST, OPTIONS` methods, and the expected Supabase client headers. A credential-free anonymous POST returned HTTP 401 before processing. Edge logs associated both results with rehearsal deployment version 1. This proves that the prior 404/preflight blocker is removed and that unauthenticated invocation remains rejected. The deployed source still validates the bearer token with Supabase Auth, derives `p_user_id` only from that verified user, and invokes the service-role-only SQL processor; no browser-supplied user ID is accepted. Authenticated service-role execution and cross-owner isolation were not claimed from static review alone.

Hosted authenticated onboarding verification was not performed because the sole existing test account is not on a reserved email domain and no reserved-domain authenticated browser session was available. No credential, token, password, or private key was requested, inspected, copied, or recorded. No disposable user or application row was created, so no synthetic cleanup was necessary. Post-deployment counts remained one Auth user, one identity, one preference row, and zero goals, debts, transactions, or recurring rules; cron remained `0/0`. A later manual rehearsal session must use a reserved-domain synthetic account to confirm successful authenticated catch-up, transaction idempotency, completion, and cross-owner isolation.

The local onboarding flow now handles recurring-processing failure as a distinct partial-success state. Setup, goal recalculation, recurring-rule creation, and onboarding-completion errors remain blocking. If only catch-up fails, the UI explicitly states that the starter plan and rules were saved and that due transactions remain pending. It offers `Retry transaction processing`, which retries only the processor without recreating setup or rules, and an explicit `Continue without transactions` choice that completes onboarding and opens Transactions. The processor continues to receive only the through date; authenticated identity remains an Edge Function responsibility. The `start_date <= today` behavior was preserved because no contrary product decision was supplied: past and today dates request immediate catch-up, while future dates do not.

The debt-payment alignment change uses the compact helper copy `The amount you plan to pay each month.` and a scoped shared helper-text minimum block size for both payment fields at the two-column layout. The minimum resets at the existing single-column breakpoint, preserving natural wrapping on narrow screens. Alignment no longer depends only on the current copy length.

Local validation passed:

- focused onboarding suite: 1 file and 9 tests, covering all four priority categories, past/today/future dates, multi-batch catch-up, unavailable-function behavior, partial setup persistence, retry without duplicate setup/rule creation, explicit continuation, authenticated-user-ID non-injection, and payment helper alignment;
- complete Vitest suite: 21 files and 78 tests;
- TypeScript project compilation;
- ESLint;
- Vite production build;
- `git diff --check`, project-reference review, and credential/secret-pattern review.

Post-deployment advising introduced no Edge Function, RLS, or function-grant finding. Security still reports only the existing leaked-password-protection warning. Performance reports the four previously recorded informational unindexed composite foreign keys and six currently unused indexes; no database object was changed in response.

Authenticated browser QA remains blocked only by the absence of a reserved-domain signed-in rehearsal session. The next manual step is to sign in with such a disposable synthetic account and exercise past, today, and future dates for each category; verify OPTIONS/POST success, expected transactions, completion, retry idempotency, and cross-owner isolation; then remove only the newly attributable artifacts and confirm the pre-test counts. Production and legacy remained untouched.

Recommendation: **ready for local checkpoint and reserved-domain authenticated rehearsal QA**.

## 2026-08-09 persisted clean-slate reset repair

### Diagnosis and exact write sequence

The diagnosis began from `Product/UX-Follow-Ups-2` at `0619bb4c86cfbb243dbaa7a082086d1a03488008`, with a clean branch synchronized to its upstream. Read-only project verification identified only `BudgBeacon-Rehearsal` (`gwloyvfkrxzgqnlnlcor`, `us-east-2`). Production and legacy were not selected or written.

The reset API already sent the intended contract. Both `resetOnboardingPreferences()` and `resetOnboardingWithCleanSlate()` upsert `onboarding_completed_at: null`; the clean-slate variant also resets dismissed tips and quick-add chips after deleting only the authenticated owner's application rows. `useResetOnboardingWithCleanSlate()` puts the returned preference object into the React Query cache and invalidates workspace queries. `OnboardingRoot` opens the wizard only when the cached or fetched `onboarding_completed_at` is `null`.

The competing write was in the wizard close lifecycle, not in PostgREST null handling. `GoalPackOnboardingWizard` passed an `onClose` callback to the shared `Modal`; with no pending recurring catch-up, that callback called `completeWithoutPlan()`, which upserted a fresh completion timestamp. The shared `Modal` invokes that callback from its header close button and from the native dialog `onCancel`/`onClose` events. After the first completion succeeds, the preference cache becomes non-null, `isOpen` becomes false, and `Modal` calls `dialog.close()`. That native close event invoked the same completion callback a second time. Thus a clean-slate reset could briefly return/open with `NULL`, then a user closing the newly opened wizard restored the old completed state (and often produced two timestamp upserts).

The rehearsal API log sequence, sanitized to method/status/operation, matched that explanation: a reset `POST 200` followed by a `GET 200`, then two near-consecutive `POST 200` preference upserts after the wizard was closed. API logs do not include request or response bodies, so they were not used to expose IDs or timestamps. The immediate wizard opening is independently proof that the reset result placed `NULL` in the cache, and the source path identifies the later timestamp writer.

### Narrow repair

`GoalPackOnboardingWizard.tsx` and the legacy `OnboardingWizard.tsx` now route every completion path through one session-scoped `requestCompletion()` latch. They ignore the duplicate native close callback after a successful completion, reset the latch when a newly opened wizard represents a new onboarding session, and release the latch if the completion request fails so the user can retry. Setup, recurring processing, retry/continue behavior, navigation, RLS, and the database schema are unchanged. No migration, Auth setting, Edge Function, grant, policy, or direct database write was introduced.

### Regression coverage and static validation

- Added `src/features/onboarding/api/onboarding.api.test.ts`: clean-slate and standard resets send explicit `NULL`, returned preferences preserve `NULL`, repeated resets are idempotent, and normal completion still persists a supplied timestamp.
- Extended `GoalPackOnboardingWizard.test.tsx` with controlled `isOpen` transitions for both onboarding components; each fires the native close event after completion and proves only one completion mutation is sent. Existing recurring catch-up, retry, continuation, date, category, and payment-alignment tests remain green.
- Focused Vitest: 2 files and 15 tests passed.
- Complete Vitest: 22 files and 84 tests passed.
- `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check`, and the credential/secret-pattern review passed. No dependency, lockfile, environment, migration, generated-type, or project-link file changed.

### Authenticated rehearsal proof (QA-A)

The existing synthetic QA-A browser session began with zero goals, debts, transactions, recurring rules, priorities, actions, or snapshots and a completed preference timestamp. A normal clean-slate reset opened the wizard immediately; read-only aggregate checks showed one `NULL` preference and one completed preference across the two synthetic accounts, with all application-row counts at zero. The same counts remained after settling, and a hard reload continued to show the wizard, proving that cache and persisted state now agree.

QA-A was then re-onboarded with a future first occurrence (so no catch-up was requested). The wizard completed and navigated to Dashboard; read-only state showed one goal, two recurring rules, one priority, two actions, and one snapshot, with no debt or transaction rows. The completion timestamp was non-null and a hard reload kept the wizard closed. A second normal clean-slate reset removed those rows, returned the wizard, and again left one `NULL` preference across the two accounts after settling and after hard reload.

The post-fix rehearsal API log for that completion contained one preference `POST 200` followed by its `GET 200`; the duplicate timestamp POST seen before the repair did not recur.

QA-B manual verification completed the second-account contract check. Test A used the normal clean-slate reset, observed `onboarding_completed_at = NULL`, and then hard refreshed without closing, skipping, or completing onboarding; the wizard reappeared and the value remained `NULL`. Test B intentionally closed/exited the wizard and hard refreshed; the wizard stayed closed and the completion timestamp became non-NULL, which is the intended explicit-exit behavior. Test C performed a final clean-slate reset; the timestamp returned to `NULL` and the fresh onboarding state was restored.

The final read-only rehearsal check found two Auth users, two identities, two profiles, and two preference rows. Both preference rows had `onboarding_completed_at IS NULL`. Goals, debts, transactions, recurring rules, financial priorities, goal actions, and goal plan snapshots were all zero. Active cron jobs and cron-history rows remained `0 / 0`. The only deployed Edge Function remained `process-recurring`, active with JWT verification enabled.

No Retry/Continue-without-transactions failure-path QA was claimed here; that remains a separate follow-up from the recurring-processing remediation. Production `BudgetBuddy-V2` (`cebykmbauxbucvforwzj`) and legacy `BudgetBuddy` (`yvsizxnfqkkazqnwbgnc`) remained untouched.

Recommendation: **ready to resume recurring failure-path QA**.
