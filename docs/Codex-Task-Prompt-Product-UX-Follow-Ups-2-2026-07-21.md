# Codex Task Prompt — Product/UX Follow-Ups 2

Copy everything below this line into a new Codex task opened at the repository root.

---

You are working locally in this repository:

`C:\Users\Mitch\Documents\Codex\2026-06-24\i-am-working-on-a-budget\BudgetBuddyLIVE-export\repo`

The product is BudgBeacon, formerly BudgetBuddy. This is an implementation task, not merely a review. Complete the scoped work locally, test it, and provide a detailed handoff. Use sub-agents exactly as directed below.

## Objective

Create a local branch named `Product/UX-Follow-Ups-2` from the safely updated local `main`, then implement the Phase 1 stabilization work before the Phase 2 UX simplification work described below.

This is a preliminary follow-up within the broader **Phase 12 — Mobile UX Simplification Implementation** roadmap. Do not start the future feature set yet.

The implementation must:

1. Fix active debt-priority progress so that debt contributions agree everywhere.
2. Remove or redesign low-value Goal Pack UI without destructively dropping supporting database fields.
3. Clarify projections with concise, collapsed contextual disclosures.
4. Simplify the Transactions experience on desktop and mobile.
5. Add an editable `$100` active-priority quick-add action that uses the same authoritative transaction/allocation paths as the rest of the app.

## Read First

Before editing, read these files in full and follow the closest applicable instructions:

- `AGENTS.md`
- `src/AGENTS.md`
- `supabase/AGENTS.md`
- `docs/BudgBeacon-Updated-Product-PWA-Monetization-Roadmap-2026-07-20.md`
- `docs/goal-packs-architecture.md`
- `docs/goal-packs-implementation-sequence.md`

The user also supplied this external reference roadmap, if it is accessible:

`C:\Users\Mitch\Desktop\$MitchBotImportant$\V2BudgetBuddy\BudgBeacon-Updated-Roadmap-2026-07-20.md`

Treat the user instructions in this prompt as authoritative where they refine or narrow the roadmap.

## Safety and Authorization Boundaries

The user authorizes:

- read-only inspection of local code, GitHub, and Supabase;
- fetching the Git remote;
- fast-forwarding local `main` only when safe;
- creating the local branch `Product/UX-Follow-Ups-2`;
- editing local application, test, documentation, and migration files;
- creating and testing new local Supabase migrations;
- running local validation commands.

The user does **not** authorize:

- resetting, rebasing, dropping, or overwriting existing local work;
- applying migrations to any hosted Supabase database;
- mutating hosted data, Auth, RLS, functions, secrets, or configuration;
- deploying to Cloudflare or any other environment;
- testing against or altering the production site at `budg.ca`;
- committing, pushing, opening a pull request, or merging;
- adding marketing analytics, marketing events, trackers, or third-party cookies;
- reading or exposing `.env`, `.env.local`, secrets, tokens, or credentials.

If an action would cross one of these boundaries, stop and report what approval is needed. Do not infer permission.

## Step 1 — Safely Create the Branch

Do this before implementation and report every result.

1. Run `git status --short --branch` and inspect recent history.
2. Confirm the working tree is clean except that this prompt file itself may be present as an untracked documentation file. Preserve this file and carry it onto the new branch. If any other change exists, stop and report the exact files; do not stash, discard, or overwrite them.
3. Run `git fetch origin --prune`.
4. Switch to `main` without forcing anything.
5. Inspect the relationship among `main`, `origin/main`, and their merge base before pulling.
6. Preserve every existing local commit. At the time this prompt was prepared, local `main` was expected to be clean and one commit ahead of `origin/main`:
   - local `main`: `5a7f61a` — `updated roadmap added`
   - `origin/main`: `4e99770` — `Rebrand/budgbeacon (#3)`
7. Run `git pull --ff-only origin main` only if it can safely fast-forward while preserving local history. If Git reports divergence or requires a rebase, merge, reset, or force, stop and report the state instead of choosing a destructive strategy.
8. Confirm that the roadmap commit and any newer upstream commits are present in the branch base.
9. If `Product/UX-Follow-Ups-2` already exists, do not delete or overwrite it. Stop and report its commit and working-tree state.
10. Otherwise create and switch to the exact local branch name:

   `Product/UX-Follow-Ups-2`

11. Record the exact base commit SHA in the final handoff.

Do not commit or push the implementation.

## Required Agent Workflow

Use sub-agents because this spans architecture, Supabase, React, and verification. Follow the repository's agent sequencing rules.

### Wave 1 — Architect, read-only

Spawn one Architect first and wait for its report before assigning implementation. It must:

- trace the active-priority, goal, debt, transaction, recurring-rule, dashboard, onboarding, and quick-add data flows;
- identify all write paths that can affect a linked debt or goal, including create, edit, delete, recurring processing, direct debt editing, pay-to-zero, and onboarding;
- identify query keys and invalidation gaps;
- propose exact file ownership boundaries for the implementation agents;
- confirm how the existing orange/yellow `FieldTooltip` looks and behaves, and recommend a reusable accessible disclosure primitive;
- confirm whether transaction summaries should be implemented with a database aggregate/RPC rather than downloading every row;
- identify existing tests that must be extended;
- produce a concise implementation contract for the parent task.

The Architect must not edit files.

### Wave 2 — Implementation agents

After reviewing the Architect's contract, spawn the following agents with explicit, non-overlapping file ownership. Keep shared-file edits under the parent task if ownership cannot be made exclusive.

#### Supabase Engineer

Own only:

- new files under `supabase/migrations/` created for this task;
- Supabase SQL tests or database test fixtures, if this repo has an established location;
- generated database types, but only after the frontend agents have stopped editing any overlapping type files.

Responsibilities:

- implement the additive relational link and authoritative debt/goal synchronization described in Phase 1A;
- implement a secure, server-side aggregate for the Transactions summary if the Architect confirms that is the correct approach;
- preserve and test RLS, grants, ownership checks, idempotency, and rollback-safe migration behavior;
- create migrations with the installed Supabase CLI after checking current CLI help; do not invent migration timestamps manually;
- use current official Supabase documentation or the Supabase connector when behavior is uncertain;
- never apply migrations to the hosted project;
- never weaken RLS or accept a browser-supplied user ID as authorization;
- never create marketing tables or marketing event storage.

#### Frontend Engineer — Goal Packs and Onboarding

Own only the files assigned for:

- Goal Pack dashboard/model and its tests;
- Goal Pack action presentation;
- onboarding labels and mappings;
- the new shared projected-result disclosure component, if the parent assigns that component here.

Responsibilities:

- implement Phase 1B through Phase 1E;
- preserve computation fields required by existing RPCs and snapshots even when removing their UI;
- add focused unit/component tests.

#### Frontend Engineer — Transactions

Own only the files assigned for:

- Transactions page, filters, pagination, summary API/hooks, quick-add UI/schema, responsive CSS, and their tests;
- transaction mutation cache invalidation if the parent assigns it here.

Responsibilities:

- implement all Phase 2 requirements;
- use feature API and hook boundaries; React components must not call Supabase directly;
- add focused unit/component/integration tests.

### Parent task responsibilities

The parent task must:

- resolve the Architect's findings before implementation begins;
- define exact file ownership in each agent prompt;
- keep agents from editing the same files concurrently;
- own any shared public exports, cross-feature contracts, and integration edits;
- inspect every agent diff before accepting it;
- integrate the work and run the full validation suite;
- fix integration issues instead of delegating overlapping edits blindly.

### Wave 3 — Reviewer, read-only

After integration and tests, spawn a Reviewer. It must inspect the complete diff for:

- correctness and missed write paths;
- cross-user data isolation and RLS safety;
- debt/goal/transaction consistency;
- pagination and aggregate correctness;
- stale-cache behavior;
- mobile and desktop regressions;
- accessibility and keyboard interaction;
- accidental scope expansion;
- destructive schema changes;
- untracked production or marketing behavior;
- insufficient tests.

The Reviewer must not edit files. The parent task must address every actionable finding or explicitly document why it is not applicable.

Do not use a Browser QA agent against production. Only use Browser QA if a dynamically supplied non-production Cloudflare preview URL is available. Otherwise complete local automated and responsive checks and report preview/device QA as pending. Physical iPhone and Android testing remains a release gate, not something to fabricate.

## Phase 1 — Stabilize and Simplify Existing Goal-Pack Behavior

Complete this phase before the Transactions changes.

### Phase 1A — Fix active debt-priority synchronization (P0)

Observed defect:

- a debt-payment transaction reduces `public.debts.current_balance_cents`;
- the active-priority dashboard derives progress from `public.goals.current_amount_cents`;
- the current live schema has no relational foreign key connecting the debt-payoff goal to its debt;
- the link appears to exist only in onboarding JSON, such as `goals.planning_rules.onboarding.debtId`;
- transaction hooks invalidate common goal/dashboard queries but may not invalidate the Goal Pack query family.

This is an integrity problem, not merely a rendering problem. Fix the authoritative model and cache behavior.

Required implementation shape:

1. Add a nullable relational link such as `public.goals.linked_debt_id uuid` referencing `public.debts(id)` with an appropriate delete policy.
2. Enforce that a goal can link only to a debt owned by the same user. A bare foreign key is insufficient; enforce ownership in every trusted write path and use a database constraint/trigger or equivalent robust database protection where appropriate.
3. Backfill valid debt-payoff goal links from the existing onboarding JSON only when the referenced debt exists and belongs to the same user. Do not guess ambiguous links. Preserve the JSON during this phase for backward compatibility.
4. Update debt-priority onboarding/setup RPCs so new debt-payoff goals receive the relational link atomically.
5. Define one authoritative relationship for progress:
   - remaining debt comes from `debts.current_balance_cents`;
   - paid progress exposed through the linked goal is clamped to `0..target_amount_cents`, normally `target_amount_cents - current_balance_cents`;
   - dashboard, debt tab, goal tab, and transaction effects must agree immediately after a successful mutation.
6. Cover every mutation path:
   - manual debt contribution creation;
   - recurring debt contribution creation/processing;
   - transaction edit, including changing amount or moving into/out of a debt allocation;
   - transaction deletion;
   - direct debt balance edit;
   - pay-to-zero;
   - onboarding creation and retry/idempotency;
   - archival/deletion behavior.
7. Prefer atomic RPC/database logic over a second browser-side write. Do not create a partial-success state where a transaction succeeds but goal progress fails, or vice versa.
8. Correct all affected React Query invalidations through public feature boundaries. Do not import another feature's internal module merely to access a query key.
9. Regenerate `src/types/database.types.ts` after the local schema is updated, using the repository's approved workflow.
10. Add tests for duplicate/retry behavior, edit/delete reversal, recurring payments, clamping, cross-user denial, and cache refresh.

Acceptance criteria:

- A `$100` payment to the active debt changes the debt balance, linked goal progress, dashboard Goal Pack, Debts page, Goals page, and Transactions page consistently.
- Editing that payment from `$100` to `$60` reverses exactly `$40` of progress everywhere.
- Deleting it reverses the remaining `$60` everywhere.
- Replaying the same idempotent operation does not double-count.
- One user cannot link to or mutate another user's debt or goal.
- Existing non-debt goals continue to work unchanged.

### Phase 1B — Remove the Confidence metric from the product UI

Remove the user-facing Confidence score/metric wherever it is presented as a Goal Pack value, including the dashboard card and related analytics presentation if applicable.

Do **not** drop `confidence_score` columns, RPC parameters, snapshot fields, or calculations in this phase. They are currently part of database/RPC contracts and may support historical data. Treat schema removal as a future, separately reviewed migration after usage is audited.

Adjust layout and tests so the remaining high-value metrics do not leave an empty gap. Do not replace Confidence with another invented score.

Acceptance criteria:

- Users no longer see a Confidence percentage or label.
- Goal calculations, snapshots, onboarding RPCs, and existing records remain compatible.
- No database column is dropped.

### Phase 1C — Contextual projected-result disclosures

Do not rely solely on the Terms of Service for projections that could reasonably be mistaken for a guarantee. Retain a concise contextual disclosure at the point of use, but keep it collapsed by default.

Requirements:

- Reuse the visual language of the existing orange/yellow `FieldTooltip` button instead of inventing an unrelated control.
- Implement this as an accessible click/tap disclosure, not a hover-only tooltip:
  - button has a clear accessible label;
  - `aria-expanded` and `aria-controls` are correct;
  - the panel can be opened and closed with keyboard and touch;
  - it does not trap focus;
  - default state is collapsed on every fresh render unless an established product preference intentionally says otherwise.
- Keep copy short and specific. Preferred baseline:
  - `Projection based on the amounts and timing currently in your plan. It is an estimate, not a guarantee.`
- Place it next to projected dates, required monthly amounts, payoff scenarios, or similar outputs that can be mistaken for a guaranteed result.
- Remove redundant paragraphs or repeated legal-style notes that add clutter without adding context.
- Do not weaken the Terms of Service or Privacy Policy and do not make legal claims.

If the existing calculator `FieldTooltip` is feature-private, either promote a well-tested generic component to the shared UI boundary or create a separate shared disclosure component using the same design tokens. Do not import calculator internals into unrelated features.

Acceptance criteria:

- Projection disclosures are visually consistent, concise, collapsed by default, and accessible.
- Non-projected factual values do not gain unnecessary warning controls.
- Mobile users can reveal and collapse the disclosure without hover.

### Phase 1D — Replace the ineffective Next Action completion interaction

The current `Complete` interaction appears to change an action into a low-value checked module without advancing the user's financial state. Remove that product behavior.

Required behavior:

- Present the section as `Recommended next move`.
- Use a real, contextual CTA that opens or pre-fills the action capable of changing the plan, for example:
  - add a contribution;
  - add/edit a recurring contribution;
  - adjust the monthly plan;
  - review the linked debt.
- Do not award points, badges, streaks, or progress for checking a box.
- Remove the dead-end completed-checkbox module from the default flow.
- Keep the `goal_actions` table and historical rows for now; do not drop schema in this phase.
- If an action cannot be mapped safely to a real CTA, render useful guidance without a fake completion button.

Acceptance criteria:

- Every interactive next-move CTA leads to a meaningful, prefilled workflow or clearly actionable destination.
- Clicking it does not merely toggle an ornamental status.
- Existing historical action data does not break page rendering.

### Phase 1E — Copy and information hierarchy refinements

1. Rename `Why the date moved` to `What shapes your target date`.
2. Show that panel expanded by default. It may remain collapsible if the interaction is accessible.
3. In debt-priority onboarding:
   - use `Planned monthly payment` for the amount the user intends to direct to the debt each month;
   - retain a separate `Required minimum payment` field when the debt model needs the contractual minimum;
   - map the planned amount to the goal's monthly commitment and the required minimum to the debt's minimum-payment field;
   - include helper copy so the distinction is unmistakable.
4. Do not solve this by renaming the database's `minimum_payment_cents` field to mean something different.

Acceptance criteria:

- The two debt-payment concepts are not conflated.
- Existing debt payment calculations still receive the correct minimum-payment value.
- The drivers section has the new name and is visible without an initial expansion click.

## Phase 2 — Transactions UX and Active-Priority Quick Add

### Phase 2A — Correct Income, Expenses, and Net summaries

The three summary cards at the top must not summarize only the currently visible page.

Requirements:

- Summaries represent **all transactions matching the currently applied search/filter set**, independent of the selected page and page size.
- With no filters, they represent all of the signed-in user's transactions.
- Changing pages or page size must not change the totals.
- Changing a filter must update both the result list and aggregate to the same filtered universe.
- Use an efficient server-side aggregate/RPC or another scalable database approach; do not fetch every transaction into the browser solely to sum it.
- The aggregate must derive the user from `auth.uid()`/RLS, mirror list-filter semantics, return integer cents, and use least-privilege grants.
- Loading, empty, and error states must not show stale or misleading totals.
- Include transfer handling consistent with the existing product definition of Income/Expenses/Net. Document and test the chosen behavior rather than silently changing it.

Acceptance criteria:

- With more than one page of results, the cards equal the aggregate across all matching rows.
- The values remain identical while paging through the same filtered result set.
- Cross-user rows cannot contribute to a user's aggregate.
- Search, kind, category, date, and amount filters have matching list and aggregate semantics.

### Phase 2B — Add a page-size selector at the bottom

Add an accessible control near the bottom pagination controls labeled `Transactions per page`.

Requirements:

- Allowed values: `10`, `25`, `50`, and `100`.
- Default: `25`.
- Changing the value updates the query limit and query key and resets to the first page.
- Pagination count and previous/next states recompute correctly.
- If a deletion or filter change makes the current page invalid, clamp or return to a valid page.
- The control must be usable on narrow mobile screens and by keyboard.

### Phase 2C — Collapse Search and Filters by default

Replace the always-open search/filter block with a disclosure titled `Search and filters`.

Requirements:

- Default collapsed when no filter is active.
- If the page loads with active filters, open it initially so a filtered/empty state is not mysterious.
- The collapsed trigger shows an active-filter count or equivalent concise indicator.
- Preserve Clear functionality and URL/filter behavior.
- Use an accessible disclosure with `aria-expanded` and `aria-controls`.
- Do not hide the fact that filters remain active after the user closes the disclosure.

### Phase 2D — Add an editable `$100` active-priority quick-add

Replace one built-in default quick-add chip—the current `Coffee` default is the preferred one—with a dynamic active-priority contribution chip.

Default behavior:

- Amount: `$100.00 CAD` / `10000` cents.
- Suggested label: `Add to {active priority name}`; fall back to `Active priority` where space is limited.
- The chip targets the user's current `financial_priorities.active_goal_id`.
- If the active goal is a debt-payoff goal, route the contribution through its validated `linked_debt_id` and the authoritative debt-payment allocation path.
- If it is a savings/other goal, route through the existing goal-contribution allocation path.
- The resulting transaction must carry the correct `goal_id` or `debt_id` and must synchronize the dashboard, Transactions, Goals, and/or Debts views.
- Do not implement it as a generic expense with only a text category.

Editing and persistence:

- The user can edit the chip's name, amount, transaction date behavior if supported, and target/category using the existing quick-add editing flow.
- Add a dynamic target option such as `Active priority — {name}` to the quick-add category/target control.
- Keep ordinary income/expense categories available.
- Extend the quick-add schema with a typed optional target reference or equivalent safe structure; reject malformed persisted JSON.
- Enforce at most one allocation target and validate that the referenced goal/debt is owned by the signed-in user before execution. RLS/RPC ownership remains the final authority.
- Avoid persisting a stale cross-user or deleted object reference. Resolve the special `active priority` target at execution time where practical.
- Existing user-customized quick-add chips must not be silently overwritten. The new chip replaces the built-in default only for users with no valid saved custom configuration and when the user explicitly chooses Reset.
- Reset restores the dynamic active-priority chip plus the remaining approved defaults.

No-priority and stale-target behavior:

- If no active priority exists, do not create an unlinked transfer.
- Show a clear disabled state or CTA such as `Choose a priority` that leads to the appropriate existing setup flow.
- If a saved explicit target has been deleted or archived, block execution, explain the issue, and let the user edit the chip.
- Prevent double submission and preserve existing success/error feedback.

Acceptance criteria:

- For an active savings goal, the `$100` chip creates one contribution and updates progress everywhere once.
- For an active debt-payoff goal, it creates one debt payment and updates debt balance and active-goal/dashboard progress everywhere once.
- Editing the chip to `$125` uses `$125` thereafter.
- Editing the label does not break its target.
- Switching the active priority causes the special active-priority target to resolve to the new priority rather than silently funding the old one.
- A malformed, deleted, archived, or foreign target cannot be executed.
- Existing customized chips remain intact until Reset is chosen.

### Phase 2E — Mobile layout and desktop context

On mobile only:

- place the Quick add module directly below the primary `+ Add Transaction` button;
- keep it above summary cards, filters, and the transaction list so the fastest action is immediately reachable;
- ensure controls meet touch-target and horizontal-overflow requirements;
- avoid duplicating the module in the accessibility tree when changing visual order.

On desktop:

- keep the layout useful for power users;
- keep Search and filters collapsed by default;
- move a compact active-priority context close to transaction activity, using existing goal/debt data rather than introducing a new feature dashboard;
- avoid a wholesale desktop redesign.

The active-priority context should answer, concisely:

- what is the current priority;
- current progress or remaining balance;
- what a contribution recorded here affects.

Do not implement Goal Arc in this phase.

## Explicitly Out of Scope

Do not implement any of the following in this task:

- Money Calendar;
- Mobile Today screen;
- Goal Arc or what-if interaction;
- Plan Pulse;
- weekly/monthly reports;
- PWA conversion, service worker, install prompt, or push notifications;
- mobile `Today / Activity / Plan / More` navigation overhaul;
- premium pricing or billing;
- marketing tracking or marketing database fields;
- bank aggregation;
- a full desktop redesign;
- dropping Confidence or `goal_actions` database fields/tables;
- production deployment or hosted migration application.

After this task is complete, stop so the user can review the foundation before planning those features.

## Architecture and Security Constraints

- React components must not call Supabase directly. Use feature API modules and hooks.
- Respect feature public boundaries; do not import another feature's private internals.
- Centralize money math in integer cents.
- Keep authoritative financial mutations atomic.
- RLS must remain enabled on all user-owned tables.
- Security-definer functions, if unavoidable, must use a fixed safe `search_path`, perform explicit ownership checks, validate inputs, and expose only required grants. Prefer security-invoker behavior when it is sufficient.
- New SQL functions must revoke broad/default execution and grant only the minimum required role.
- Do not add a dependency unless necessary. If one is proposed, perform the repository's license gate first and explain why existing code cannot solve the problem.
- Preserve existing user data and saved quick-add preferences.
- Migrations must be forward-only and safe to run once in normal migration order. Include comments explaining non-obvious integrity logic.
- If a precise reversal migration would be unsafe because new data may depend on the relational link, document a recovery procedure instead of creating a casually destructive down migration.

## Testing Requirements

Add or extend tests at the smallest useful layer. At minimum cover:

### Database/integration

- debt-goal link ownership;
- onboarding link creation and retry;
- manual debt contribution;
- recurring debt contribution;
- edit and delete reversals;
- direct debt edit/pay-to-zero synchronization;
- clamp at zero/target;
- cross-user denial;
- aggregate across more than one page;
- aggregate/list filter parity;
- aggregate ignores other users.

### Frontend/unit/component

- Confidence is absent from the user-facing Goal Pack;
- projected-result disclosure is collapsed, opens/closes, and exposes accessible state;
- Recommended next move opens the intended workflow;
- date-driver panel has the new title and defaults open;
- debt onboarding maps planned and required-minimum values correctly;
- page-size changes reset pagination;
- summary is independent of page size/current page;
- filters default collapsed and expose active state;
- quick-add default construction and Reset behavior;
- custom quick adds are preserved;
- active-priority target resolution for savings and debt;
- no-priority/stale/foreign target handling;
- mutation invalidates and refreshes every relevant view;
- mobile Quick add is positioned after Add Transaction without duplication.

### Manual local checks

Use seeded/demo users only in a local/non-production environment. Test at least:

- desktop width around `1440px`;
- narrow mobile around `390px`;
- keyboard-only disclosure, quick-add edit, filters, and pagination;
- a transaction dataset larger than `100` rows;
- an active savings priority;
- an active debt priority;
- no active priority.

Do not claim physical-device or preview testing unless it actually occurred.

## Validation Gates

Run the repository's documented release gates. At minimum, if the scripts exist:

- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd run test`
- `npm.cmd run build`
- `npm.cmd audit --audit-level=high`
- `git diff --check`

Also run the appropriate local Supabase migration reset/tests and type-generation verification if the local stack is configured. If Docker/Supabase cannot run, do not substitute a hosted database mutation; report the exact unverified gate.

Inspect `git status --short --branch` and the final diff. Confirm there are no secrets, environment files, build outputs, unintended roadmap edits, marketing code, or unrelated changes.

## Required Implementation Report

Create this local documentation file before finishing:

`docs/Product-UX-Follow-Ups-2-Implementation-Report-2026-07-21.md`

Include:

- branch name and exact base SHA;
- initial Git state and how `main` was updated;
- agents used, their ownership, and their findings;
- all files changed and why;
- every migration created, SQL object changed, grants/RLS behavior, and why;
- whether migrations were local-only and explicit confirmation that hosted Supabase was not mutated;
- data backfill and compatibility behavior;
- UI behavior before/after;
- all test commands and exact results;
- Reviewer findings and resolutions;
- outstanding risks or manual checks;
- deployment/migration sequence for a future authorized release;
- a practical rollback/recovery plan for both code and database, without executing it;
- explicit confirmation that no commit, push, PR, merge, deploy, or production database change occurred.

## Final Response Format

Lead with the result. Then report:

1. Branch and base SHA.
2. Implemented behavior by Phase 1 and Phase 2.
3. Migrations created but not applied remotely.
4. Validation results.
5. Reviewer findings resolved or remaining.
6. Exact file link to the implementation report.
7. Any approval required for the next step.

Do not end with a generic claim that everything works. State what was directly verified, what was not verified, and why.

---

End of prompt.
