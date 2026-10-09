# BudgBeacon project status

Release record: [stabilization PR #4](https://github.com/M0neyM1tch/BudgetBuddyLIVE/pull/4). Use its checks and deployment record for the latest commit and outcome. This page describes the project structure, validated baseline, and remaining limits.

**Stabilization repairs, authenticated preview QA, and database promotion passed.** Production and rehearsal carry the reviewed 29-version database baseline. The PR records final frontend activation and domain smoke results.

## One project, separate environments

| Component | Role |
| --- | --- |
| `M0neyM1tch/BudgetBuddyLIVE` | Canonical application repository. Existing repository/package identifiers remain operational names. |
| `main` | Production source branch. Cloudflare `budgetbuddy` automatically builds it for `budg.ca`. |
| Cloudflare branch previews | Candidate QA. New preview configuration targets rehearsal; verify the deployed backend after each build. Older deployments retain their original configuration. |
| Supabase `BudgetBuddy-V2` | Production database; project `cebykmbauxbucvforwzj`. |
| Supabase `BudgBeacon-Rehearsal` | Hosted local-development and release-test database; project `gwloyvfkrxzgqnlnlcor`. Keep accounts and data separate from production. |

The legacy Supabase `BudgetBuddy` and Cloudflare `budgetbuddy-v2` projects remain retained references, not deployment targets. Verify dependencies and retention needs before removing them. Local-only roadmap work is already included in the release candidate; do not discard commits as cleanup.

## Local development

Follow the [README setup](../README.md#local-development). Use the rehearsal URL and matching browser key, with synthetic accounts. The current repository supports a local frontend against hosted rehearsal; it does not define a complete local Supabase stack. Promote migration files and code, never rehearsal rows.

Keep stabilization identifiable until PR #4 is integrated and deployed. Then branch new features from the resulting canonical `main`. Preserve historical branches until their commits and active dependencies are accounted for.

## Stabilization baseline

- Both environments have all 29 reviewed migration versions, including atomic reset and future-permission corrections. Independent checks verified canonical migration/function source, schema/security contracts, and preserved production counts. SQL suites cover ownership, allocation reversal, late-failure rollback, and concurrent reset calls.
- Budget Health uses the selected month's complete history and actual applied goal/debt allocations. Future recurring start dates, resolved quick-add labels, and modal accessible names are corrected. Incomplete financial history shows an error before calculations.
- Route-load errors have an eagerly loaded, sanitized recovery page with an explicit reload button and unsaved-change warning. The app does not automatically reload after an asset failure. Already-open documents from before this fix need a manual refresh to receive it.
- Node 22.13.0 typecheck, lint, 41 test files / 176 tests, production build, static review, and hosted checks passed for the validated candidate. The unchanged lockfile passed a full audit with zero vulnerabilities. Compatible dependency updates include React Router 7.18.4 and Vitest 4.1.11, with no new direct dependency.
- Signed-in onboarding, accounting, recurring processing, analytics, search, reset, and reload/session flows passed. Selected-month, debt-label/allocation, and modal-name regressions passed. The final `453c0a1` preview targets rehearsal and passed signed-in navigation checks. Existing Edge deployments match the reviewed source and remain compatible.

Commit-specific CI, browser results, and deployment proof belong in [PR #4](https://github.com/M0neyM1tch/BudgetBuddyLIVE/pull/4). The user accepted browser checks in place of physical iPhone/Android testing for this release. SQL and automated tests cover owner isolation and failure states; no physical-device testing or multi-page browser navigation pass is claimed.

## Release tracking

Database and signed-in preview validation are complete for this stabilization candidate. Final commit-specific CI, merge/deployment, and domain smoke results are recorded in [PR #4](https://github.com/M0neyM1tch/BudgetBuddyLIVE/pull/4). Confirm that record before starting a new feature branch or describing the frontend as deployed.

The current production accounts and transactions are disposable test data by the user's explicit decision. They opted to proceed without a local backup or drive encryption. This does not authorize erasing records. Before real-user data or a materially expanded scope is included, establish and test recovery; see the [release runbook](release-runbook.md).

## Known limits and next work

- Large financial histories are rejected when the server response is incomplete. This protects calculations but is not unlimited-history support; database aggregates or a bounded snapshot RPC are the next step. Separate dashboard reads are not a cross-table snapshot.
- Reset is atomic and owner-scoped, with a lock shared only by reset calls. Ordinary concurrent writes remain allowed; success does not promise that the workspace stays empty. Same-owner ordinary-writer concurrency was not exercised by the two-reset-session test.
- Some punctuation-containing full-string searches remain a documented low-priority follow-up requiring coordinated client/database work.

BudgBusiness is a separate discovery and feature track: a business experience and login flow, creator/manager workspaces, provider connections, and subscriptions. Define tenant boundaries, membership authorization, integration-secret storage, and tests before implementation. MVP stabilization does not include a rebrand, PWA, bank integration, or business billing.

The dated [August preflight](Product-UX-Follow-Ups-2-Final-Merge-Readiness-and-Production-Preflight-2026-08-26.md) and [rehearsal report](Product-UX-Follow-Ups-2-Backup-and-Restore-Rehearsal-Report-2026-07-22.md) remain historical evidence. Their older statuses and hashes do not override the current [release manifest](release-runbook.md#release-manifest) or verified live state.
