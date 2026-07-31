# Codex Task Prompt — Product/UX Follow-Ups 2 Backup and Restore Rehearsal

Copy everything below this line into a new Codex task opened at the repository root.

---

You are working locally in:

`C:\Users\Mitch\Documents\Codex\2026-06-24\i-am-working-on-a-budget\BudgetBuddyLIVE-export\repo`

This is the separately authorized **backup creation, integrity validation, restore rehearsal, and restored-copy migration verification** task for `Product/UX-Follow-Ups-2`. It is not a production-migration task.

## Stop conditions and authorization prompts

Before doing anything except read-only inspection, confirm the branch is exactly `Product/UX-Follow-Ups-2`, preserve all uncommitted work, and read in full:

- `AGENTS.md`, `src/AGENTS.md`, and `supabase/AGENTS.md`;
- `docs/Product-UX-Follow-Ups-2-Remediation-Report-2026-07-21.md`;
- `docs/Product-UX-Follow-Ups-2-Free-Plan-Backup-and-Restore-Runbook-2026-07-21.md`;
- both `20260721...product_ux_follow_ups_2...sql` migrations;
- both `supabase/tests/product_ux_follow_ups_2_*.sql` verification scripts.

You must separately ask for explicit owner authorization at each boundary:

1. Before creating an ordinary Free Supabase project or reusing/clearing any existing project. If reuse is proposed, identify the project and require explicit confirmation that its current contents may be destroyed. Never assume the inactive `BudgetBuddy` project is disposable.
2. Before accessing or temporarily using a production database connection credential for the manual logical backup.
3. Before every remote write, including project creation, target preparation, extension/configuration changes, restore, migration-history repair, restored-copy migration application, Auth test-user creation, or cleanup.
4. Before installing or upgrading native PostgreSQL client tools if compatible tools are not already installed.

Do not bundle these approvals. Explain the exact next action and target before requesting each one.

## Non-negotiable boundaries

- Do not apply any migration, migration-history repair, DDL, DML, or configuration change to production.
- Do not use production as a test environment.
- Do not deploy the frontend or Edge Functions, point Cloudflare or `budg.ca` at the restore target, or change production Auth redirects/environment variables.
- Do not install, start, troubleshoot, require, or recommend Docker.
- Do not inspect environment files.
- Do not put credentials, passwords, connection strings, tokens, API keys, cookies, Auth sessions, complete endpoints, private financial rows, emails, UUIDs, or backup contents in Git, reports, prompts, screenshots, logs, or task messages.
- Do not create backup artifacts inside the repository.
- Do not commit, push, open a PR, merge, or deploy.
- Do not add dependencies or perform unrelated code/product work.
- Do not pause, resume, delete, repurpose, or alter an existing project without its own explicit approval.
- Stop if the candidate migration hashes differ from the runbook until the owner confirms the new frozen candidate and verification is restarted.

## Objective

Using compatible native PostgreSQL 17+ clients and the approved ordinary Free restore project:

1. Refresh the sanitized read-only production inventory and candidate hashes.
2. Prove the exact backup scope before calling it recoverable.
3. Create manual logical backup artifacts outside Git.
4. Verify non-empty/readable artifacts, SHA-256 checksums, encryption at rest, and a sanitized manifest.
5. Restore into the explicitly approved ordinary Free project with outbound effects disabled/withheld.
6. Prove source/restore equivalence using schema/configuration facts and aggregate counts only.
7. Rehearse the `20260707193257` ledger repair on the restore target only after proving all SQL effects are present.
8. Apply `20260721194230`, then `20260721194410`, to the restored project only.
9. Execute both rollback-only SQL verification scripts, run advisors, generate types from the verified restore project, integrate them locally, and rerun application gates.
10. Stop. Do not perform production migration or deployment.

## Required workflow

### Phase A — read-only freeze and planning

- Run `git status --short --branch`; record HEAD and merge base with `main`.
- Inspect the complete diff and preserve all local changes.
- Compute SHA-256 hashes of both candidate migrations and compare them with the runbook.
- Use current official Supabase documentation and changelog for version-sensitive behavior.
- Through the Supabase connector, refresh only schema/grant/configuration facts and aggregate counts: project status/plan/region/PostgreSQL version, migration ledger, extensions, app schema objects, custom `auth`/`storage` objects, Storage bucket/object counts, Vault/encryption usage, cron/webhooks/net, Edge Functions, Realtime publications, Auth-user count, and per-app-table counts.
- Re-run transaction and recurring semantic preflight counts. Do not inspect raw rows.
- Define a sanitized included/excluded-scope manifest before requesting credentials.

### Phase B — target and tool approval

- Establish whether the two-active-Free-project allowance has a slot. A paused project may not count toward the active allowance, but it still contains potentially valuable data.
- Ask the owner to approve a new ordinary Free project or explicitly approve destructive reuse of a named project.
- Verify installed `pg_dump`, `pg_restore`, and `psql` are PostgreSQL 17 or newer. Ask before installation if missing.
- Use direct connection mode where reachable, or shared session pooler port 5432 for IPv4-only access. Never use transaction pooler port 6543 for dump/restore.
- Ask separately before accessing the production database credential.

### Phase C — backup and artifact integrity

- Follow the runbook and current official Supabase backup/restore guide.
- Use a password prompt or separately approved temporary native credential file outside Git with user-only permissions and verified cleanup. Do not place the password in commands, URLs, history, process arguments, environment files, logs, or messages.
- Do not assume an unrestricted all-schema dump or default Supabase CLI dump is complete. Supabase CLI dump is container-backed and excluded by the no-Docker boundary.
- Prove treatment for app schemas/data, Auth records, roles/grants, migration history, modified managed-schema objects, extensions, Vault/encryption, Storage metadata/bytes, Edge Functions, Auth/API/Realtime settings, cron/webhooks/net, and external integrations.
- If Auth, roles, managed-schema objects, Vault/encryption, or another required recovery scope cannot be captured/restored through a supported proven method, mark the gate `FAIL`, protect any artifacts already created, and stop. Do not improvise a complete-backup claim.
- Store encrypted artifacts and checksum manifest outside the repository. Verify non-empty files and use `pg_restore --list` for custom archives.

### Phase D — restore rehearsal

- Ask for remote-write approval immediately before target preparation and restore.
- Withhold Edge Functions, production email/SMS, Auth redirects, cron, webhooks, `pg_net`, and external integrations so restored data cannot cause real-world effects.
- Restore fail-fast using `pg_restore --exit-on-error --single-transaction` or `psql --single-transaction --variable ON_ERROR_STOP=1` where the proved artifact format supports it.
- Do not use parallel restore with a single transaction.
- Run `ANALYZE` after successful restore.
- Compare schemas, tables, functions, triggers, constraints, policies, grants/default privileges, extensions, ledger, Auth-user count, and app-table counts. Record only facts and aggregates. Explain every permitted discrepancy.

### Phase E — restored-copy migration verification

- Only after equivalence passes, ask for approval to repair `20260707193257` as applied on the restore target. Remember that migration repair changes the ledger only.
- Ask for approval before applying each candidate migration to the restore target.
- Confirm version/object/grant state after each.
- Execute the rollback-only scripts from `supabase/tests/`. Confirm `ROLLBACK` and no residual synthetic user, data, role, function, schema object, or configuration.
- If direct privileged SQL cannot reliably simulate an API role, mark that case `NOT TESTED` and require a separate authorized API test; never embed keys or weaken RLS.
- Run security and performance advisors and compare against the recorded pre-existing notices.
- Generate TypeScript types from the verified restore project only, review/integrate the diff, and run:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test
npm.cmd run build
npm.cmd audit --omit=dev --audit-level=high
npm.cmd audit --audit-level=high
git diff --check
```

Do not claim a gate passed unless it ran.

### Phase F — cleanup decision and handoff

- Do not delete, pause, or repurpose the restore project without separate owner approval.
- Securely remove temporary credential material and unneeded decrypted working copies; retain the encrypted recovery artifact according to the owner-approved retention policy.
- Update the runbook checklist with exact `PASS`, `FAIL`, or `NOT TESTED` statuses.
- Produce a sanitized rehearsal report. Never copy production data, identifiers, credentials, or artifact contents into it or Git.
- Stop before production migration.

## Required report

Create or update a local report that states:

- approvals obtained and exact targets/actions covered;
- branch, HEAD, migration hashes, PostgreSQL/client versions;
- included/excluded backup scopes without credential or row details;
- artifact integrity/checksum/encryption results without sensitive paths if they disclose private structure;
- restore result and sanitized equivalence evidence;
- ledger-repair rehearsal and restored-copy migration results;
- rollback-only SQL verification results and any role-simulation gaps;
- advisors, generated-type diff, and application gate results;
- retention/cleanup status;
- remaining blockers and explicit confirmation that production was not mutated.

Any `FAIL` or security-critical `NOT TESTED` means the recovery gate remains blocked. Do not recommend applying the candidate migrations to production in this task.

---

End of prompt.
