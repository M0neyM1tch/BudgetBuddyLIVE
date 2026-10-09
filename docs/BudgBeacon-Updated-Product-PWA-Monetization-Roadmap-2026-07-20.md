# BudgBeacon Updated Product, PWA, and Monetization Roadmap

Prepared: 2026-07-20  
Repository: `M0neyM1tch/BudgetBuddyLIVE`  
Production: `https://budg.ca`  
Supabase project: `BudgetBuddy-V2` (`cebykmbauxbucvforwzj`)

## Executive Decision

BudgBeacon has not lost the original Goal Packs direction. The product has completed the free Goal Packs MVP, production hardening, public deployment, post-launch UX work, onboarding improvements, and the BudgBeacon rebrand. The next phase in the old roadmap was monetization readiness, not immediate Plaid production work.

The recommended order from the current state is:

1. Close the current production baseline and documentation gaps.
2. Plan and implement the simpler mobile experience.
3. Run the refreshed PWA architecture audit against that stabilized mobile experience.
4. Release a bounded installable PWA and in-app Plan Pulse milestone.
5. Define and validate premium packaging with real usage evidence.
6. Run a provider and Plaid Sandbox/Trial spike before committing to production bank sync costs.
7. Add Stripe billing and additive entitlements.
8. Productionize provider-neutral bank sync as a paid convenience layer.
9. Add premium reports, advanced planning, true push, household, and professional channels only after the core loop proves retention.

The mobile UX work should therefore be planned and applied before PWA implementation. A read-only PWA audit can run while the mobile UX is being designed, but the service worker, install UI, Plan Pulse destination, and notification experience should not be finalized until mobile navigation and information hierarchy are stable.

The wording in the request is interpreted as "now planning to convert the website into a PWA," because the attached plan and sequencing question both describe an intended PWA implementation.

## Ruthless Product Conclusions

- A PWA is a retention and distribution wrapper. It is not a monetization strategy by itself.
- Plaid removes manual work, but bank sync is expensive table stakes rather than BudgBeacon's differentiator.
- BudgBeacon's differentiator is the loop: choose a priority, see the monthly gap, take one action, and feel the date or confidence improve.
- Mobile should expose that loop first and hide advanced analysis behind progressive disclosure.
- Desktop and mobile should share one data model and calculation engine. They may use different composition and navigation, but should not become separate applications.
- The current landing-page long-term wealth calculator is off-strategy. It replaced the previously selected Monthly Needed calculator and should be corrected deliberately.
- Full offline financial functionality should not be part of the first PWA release. Do not cache Supabase responses, auth responses, financial payloads, or tokenized URLs.
- A consumer-facing AI adviser or open-ended finance agent should not be built now. It adds cost, privacy risk, hallucination risk, and advice/compliance exposure before the deterministic Goal Packs loop is proven.
- Basic manual tracking, one active priority, one useful next action, and account/legal access should remain free.
- Ads, financial-data resale, and pay-to-rank product recommendations would undermine the trust required for this category and should not be part of the model.

## Source-of-Truth Audit

### GitHub And Local Repository

Status: COMPLETE AND HEALTHY

- Remote `main` is at `4e9977006c5dfe4987902f25fd11d28795b86b6e`.
- Commit subject: `Rebrand/budgbeacon (#3)`.
- PR #3 merged `rebrand/budgbeacon` into `main` on 2026-07-20.
- The local checkout was fast-forwarded to the same commit and is now on `main`.
- The repository is still intentionally named `BudgetBuddyLIVE`; changing stable operational identifiers is not required for the product rebrand.
- The package identifier remains `budgetbuddy-v2`, the license remains proprietary/`UNLICENSED`, and no dependency or lockfile change was introduced by the rebrand.
- The local `.agents`, `.codex`, and `AGENTS.md` setup is development tooling. It is not a shipped consumer agent feature and should not be counted as product functionality.

Verification on current `main`:

| Gate | Result |
| --- | --- |
| Node | `v22.13.0` |
| npm | `10.9.2` |
| Typecheck | Pass |
| Lint | Pass |
| Tests | 11 files, 42 tests passed |
| Production build | Pass |
| Production dependency audit | 0 vulnerabilities at high threshold |
| `git diff --check` | Pass |

The largest lazy route remains Analytics at approximately 416.55 kB raw / 118.83 kB gzip. This is not a release blocker, but it should be measured on lower-end mobile devices before adding more charting or AI code.

### Supabase

Status: HEALTHY PRE-MONETIZATION BASELINE

- Project status is `ACTIVE_HEALTHY`.
- Postgres is `17.6` on the GA channel.
- Live migration history contains the expected 22 migrations through `20260702195005_goal_pack_fk_indexes`.
- The repository contains `20260707193257_phase3_live_permission_hardening.sql`, but that version is not recorded in the live migration history. Its intended grants and policies are present in the live database and were independently verified. Reconcile this migration-history mismatch before the next schema change so future environments have one unambiguous baseline.
- The database has 10 public application tables and 37 public RLS policies.
- Every public application table has RLS enabled.
- `anon` has no table access.
- `authenticated` has only the intended CRUD grants, with `user_roles` limited to `SELECT`.
- Public RPC execution is denied to `anon` and explicitly limited for authenticated users where required.
- The internal recurring processor is `SECURITY DEFINER`, but neither `anon` nor `authenticated` can execute it directly.
- The `process-recurring` Edge Function is active at version 6 with JWT verification enabled.
- The recurring cron job is active daily at `0 4 * * *`.
- Edge Function logs showed no recent errors during this audit.
- Generated live TypeScript database types exactly match `src/types/database.types.ts`.
- No marketing, funnel, or UTM database objects remain from the previously reverted migrations.
- No `plaid_items`, `bank_connections`, subscription, entitlement, push-subscription, or product-event tables exist yet.

Advisor state:

- Security: one known warning for leaked-password protection being disabled. This remains an accepted plan limitation because the feature is unavailable on the current Supabase plan.
- Performance: six `unused_index` information notices. These indexes support young Goal Pack and debt relationships and should not be removed until meaningful production query traffic exists.

### Cloudflare

Status: PRODUCTION HEALTHY; DUPLICATE PROJECT CLEANUP REMAINS

- Active production project: `budgetbuddy`.
- Custom domain: `budg.ca`, active with HTTPS.
- Pages domain: `budgetbuddy-960.pages.dev`.
- Git source: `M0neyM1tch/BudgetBuddyLIVE`.
- Production branch: `main`.
- Automatic production and preview deployments are enabled.
- Current production deployment: `83fa5fc7-5d6c-49cc-b5e2-03fb928379f2`.
- Current production commit: `4e9977006c5dfe4987902f25fd11d28795b86b6e`.
- Deployment status: success.
- Web Analytics is enabled and disclosed in the current privacy copy.

The older `budgetbuddy-v2` Pages project is also connected to the same repository and builds the same `main` branch. It creates duplicate production and preview builds and should be disconnected or retired after one final comparison. Do not delete it casually; first record its settings and confirm that no domain, environment, or rollback dependency still points to it.

### Live Product And Browser Audit

Status: FUNCTIONAL; MOBILE SIMPLIFICATION AND LANDING CORRECTIONS RECOMMENDED

Verified against the production deployment and `budg.ca`:

- BudgBeacon branding is live on public, auth, legal, and authenticated surfaces.
- Public Goal Packs positioning is live.
- Authenticated dashboard, Transactions, Analytics, Goals, Debts, Calculator, and Preferences routes render.
- The complete active-priority dashboard and real recurring/backdated transaction data render from Supabase.
- At a 390 px mobile viewport, tested routes did not create page-level horizontal overflow.
- The mobile product still presents desktop-level density and terminology.

Observed mobile UX issues to address before PWA work:

- Six primary destinations compete in a narrow navigation row.
- Header brand and right-side actions have very little room and can appear visually clipped.
- The dashboard stacks many large panels before the user reaches a single action.
- Transactions exposes summary cards, all filters, a long list, Quick Add, and recurring-rule management in one continuous page.
- Calculator exposes five planner modes immediately.
- Analytics contains at least one clipped heading/tooltip treatment at the audited width.
- Goals contains a select control whose intrinsic content is wider than its visible container.
- First-use tips can cover core content instead of supporting it.
- The public cookie/analytics notice covers much of the first mobile viewport.

### Landing Calculator Drift

Status: REQUIRES A PRODUCT DECISION, WITH A RECOMMENDED ANSWER

Commit history shows:

- `d2f0005` implemented the selected Monthly Needed landing calculator with a pure helper and 91 lines of tests.
- `f0142ff` then removed that helper/test file and replaced the experience with the current long-term wealth projection.
- The current production landing page asks for age, income, savings, expenses, and a growth assumption even though the brand promise is about the user's active priority, monthly gap, and next action.

Recommendation: restore a simplified Monthly Needed preview during the mobile UX implementation. It should ask for target, saved so far, target date, and planned monthly contribution, then show monthly needed, gap/surplus, estimated finish state, and a `Build this plan` CTA. Do not use an investment-return assumption on the primary landing experience.

### Current PWA State

Status: NOT IMPLEMENTED

- `public/site.webmanifest` exists and uses BudgBeacon branding.
- It currently has only one 512 x 512 `purpose: any` icon.
- No 192 x 192 icon contract is present.
- No maskable icon is present.
- No service worker exists.
- No service-worker registration exists.
- No `beforeinstallprompt` or `appinstalled` handling exists.
- No Push API, notification, Cache Storage, or Plan Pulse implementation exists.

The attached PWA plan is therefore planning material, not completed product state.

## Completed Chronological Roadmap

### Phase -1 - Pre-Pivot Launch Hardening

Status: COMPLETE

Completed work includes:

- Node pinning and GitHub Actions CI.
- Vitest and focused release tests.
- Cloudflare SPA redirects and security headers.
- Public metadata, robots, and initial manifest.
- Terms/Privacy acceptance and legal routes.
- Confirm-email, forgot-password, and reset-password flows.
- Least-privilege grants and RPC hardening.
- Transaction pagination and amount filters.
- Calculator correctness fixes.
- Proprietary license protection.

### Phase 0 - Goal Packs Strategy Baseline

Status: COMPLETE

- Universal Goal Packs strategy established.
- Canadian first-home-only pivot rejected.
- Four MVP packs defined: Emergency Fund, Debt Payoff, Major Purchase/Home Fund, and Custom Goal.
- Feature flag, registry, type vocabulary, architecture, and implementation sequence created.

### Phase 1 - Goal Pack Schema Foundation

Status: COMPLETE AND LIVE

- Planning columns added to goals.
- `financial_priorities`, `goal_plan_snapshots`, and `goal_actions` added.
- RLS, grants, foreign keys, API wrappers, schemas, hooks, and generated types added.

### Phase 2 - Priority Onboarding

Status: COMPLETE AND LIVE

- Priority discovery onboarding implemented.
- Pack-specific questions implemented.
- Starter goal, active priority, action, and optional debt creation implemented atomically.
- Optional recurring income/expense setup added.
- Recurring categories were later expanded and clarified.
- Backdated recurring occurrences are created as real transactions.
- Onboarding review, reset, and clean-slate controls added.

### Phase 3 - Planning Engine MVP

Status: COMPLETE AND LIVE

- Deterministic planning engine implemented.
- Progress, remaining gap, required monthly amount, projected date, confidence, drivers, prompts, and next action implemented.
- Recalculation persists plan state and snapshots.

### Phase 4 - Dynamic Dashboard Renderer

Status: COMPLETE AND LIVE

- Active-priority dashboard renderer implemented.
- Priority-specific labels, progress, dates, monthly amounts, confidence, drivers, and actions implemented.
- Existing cash-flow, goals, debts, and transaction context retained.

### Phase 5 - Goal-Aware Analytics

Status: COMPLETE AND LIVE

- Plan coverage, monthly gap, plan movement, category changes, and snapshot comparisons implemented.
- Analytics explains what changed without prescribing financial products or automatic actions.

### Phase 6 - Dynamic Goal Simulators

Status: COMPLETE AND LIVE

- Goal Plan simulator added beside existing calculators.
- Contribution, one-time boost, target/date, category-cut, surplus, and debt-method scenarios implemented.
- Scenarios remain local and non-mutating.

### Phase 7 - Momentum Loop

Status: COMPLETE AND LIVE

- Next actions can be completed or dismissed.
- Completion refreshes the plan and creates an action-completed snapshot.
- Practical reward copy closes the first trigger-action-reward-investment loop.

### Phase 8 - Legal And Safety Hardening

Status: COMPLETE IN CODE; FINAL PROFESSIONAL REVIEW STILL RECOMMENDED

- Goal Packs, estimates, scenarios, planning inputs, and next actions added to Terms/Privacy.
- Advice-sensitive copy tightened across dashboards, analytics, calculators, debts, goals, onboarding, and landing pages.
- Cloudflare Web Analytics disclosure added during the rebrand.

### Phase 9 - Free Release Hardening And Production Cutover

Status: COMPLETE

- Live Supabase schema, RLS, Data API grants, RPCs, cron, and Edge Function verified.
- Resend SMTP and email confirmation tested.
- Site URL and redirect configuration completed for production flows.
- Cloudflare Pages, custom domain, DNS, and HTTPS deployed.
- `BudgetBuddyLIVE` clean deployment repository created and connected.
- Free Goal Packs MVP released publicly at `budg.ca`.
- Leaked-password warning recorded as an accepted plan limitation.

### Post-Launch UX Follow-Ups

Status: COMPLETE, WITH THE LANDING-CALCULATOR DRIFT NOTED ABOVE

- Mobile horizontal overflow and navigation fit corrected.
- Landing page repositioned around Goal Packs.
- Calculator empty states clarified.
- Onboarding recurring setup, categories, review, and reset controls improved.
- Accidental marketing-funnel migrations were reversed and removed from live migration history.
- Free-launch readiness was audited and recorded.

### BudgBeacon Rebrand And Developer Agent Setup

Status: COMPLETE

- Public brand changed from BudgetBuddy to BudgBeacon.
- Logo, compact icon, favicon, social image, metadata, manifest, auth, legal, and in-app copy updated.
- Stable routes, storage keys, database names, migrations, and operational project identifiers preserved.
- Supabase email templates manually updated.
- Local multi-agent development setup created and excluded from Git.
- Rebrand merged to `main` and deployed successfully to production.

## Updated Remaining Roadmap

## Phase 10 - Current Baseline Closure

Suggested branch: `product/current-baseline-closure`  
Cut from: current `main`

Goal: create a clean, documented BudgBeacon baseline before another feature workstream begins.

### Work

- Run one final real production signup, confirmation, login, reset-password, logout, and account-deletion smoke test with a synthetic account.
- Verify every Supabase email template substitutes variables and contains no BudgetBuddy branding.
- Record leaked-password protection as an accepted risk until the plan changes.
- Complete an external legal review before taking payments or adding bank data.
- Reconcile `20260707193257_phase3_live_permission_hardening.sql` with the live Supabase migration history without reapplying grants blindly; document whether it was applied manually, repaired in migration history, or replaced by a new idempotent reconciliation migration.
- Compare the `budgetbuddy` and `budgetbuddy-v2` Cloudflare projects.
- Export or record the duplicate project's settings, then disconnect or retire it if it has no remaining purpose.
- Update active operational docs from BudgetBuddy language to BudgBeacon while preserving clearly historical records.
- Record the landing calculator drift as an explicit UX decision.
- Re-run all local release gates and production smoke checks.

### Definition Of Done

- One authoritative Cloudflare production project remains.
- Production auth and email flows pass.
- Local migration files and the live migration ledger have a documented, reproducible baseline.
- Current docs describe BudgBeacon and identify historical BudgetBuddy records correctly.
- Legal and accepted-risk items are recorded.
- `main` is clean and tagged as the pre-mobile/PWA baseline.

## Phase 11 - Mobile UX Architecture

Suggested branch: `ux/mobile-simplification-plan`  
Nature: product/design plan before implementation

Goal: make the mobile product feel like a focused financial companion rather than a compressed desktop dashboard.

### Recommended Mobile Information Architecture

Use four primary destinations:

1. `Today` - active priority, progress, next action, monthly gap, and one quick update.
2. `Activity` - recent transactions, add transaction, and a simple search/filter entry point.
3. `Plan` - active Goal Pack, goals, debts, and the primary simulator.
4. `More` - Insights/Analytics, all calculators, recurring rules, Preferences, legal, and sign out.

Alternative labels should be usability-tested, but the destination count should remain four or fewer. Do not place six equal-priority destinations in the first mobile navigation layer.

### Mobile Surface Rules

- Show one primary action per screen section.
- Move advanced filters into a bottom sheet or disclosure panel.
- Show three high-signal metrics before secondary context.
- Default Calculator to the active Goal Plan; place other tools under `All tools`.
- Put recurring-rule management under `Activity > Recurring` or `More`, not below every transaction list.
- Keep goal and debt editing available, but lead with the active plan rather than CRUD management.
- Replace first-use callouts that cover content with compact inline coaching or a dismissible checklist.
- Keep desktop navigation and advanced density intact where it helps power users.
- Share all data hooks, calculations, permissions, and mutations across breakpoints.

### Landing Decisions In This Phase

- Restore/simplify Monthly Needed as the primary public calculator.
- Reduce the mobile cookie notice to a compact bottom treatment that does not cover the brand, headline, and first CTA simultaneously.
- Keep the brand and literal value proposition visible in the first viewport.
- Ensure the landing experience leads naturally into the first onboarding questions.

### Research And Validation

- Test first-time users completing: signup, first Goal Pack, recurring setup, dashboard review, and first next action.
- Ask users to explain in their own words what recurring rules do before and after the flow.
- Measure time to first useful dashboard and time to first completed action.
- Test at 375, 390, 420, 640, 980, and 1440 px.
- Include reduced-motion, keyboard, screen-reader, and large-text checks.

### Definition Of Done

- Signed-off mobile navigation map.
- Screen-level content priorities and advanced disclosures documented.
- Landing calculator decision confirmed.
- No database changes are required for the layout plan.
- Implementation acceptance tests are written before UI work begins.

## Phase 12 - Mobile UX Simplification Implementation

Suggested branch: `ux/mobile-simplification`  
Cut from: post-Phase-10 `main`

Goal: implement the approved mobile hierarchy without weakening desktop functionality.

### Work

- Refactor the mobile shell and navigation.
- Add the `Today`, `Activity`, `Plan`, and `More` composition.
- Reduce dashboard first-view density.
- Collapse Transactions advanced filters.
- Separate recent transactions from recurring-rule management.
- Make Goal Plan the default mobile planning tool.
- Move secondary calculators behind `All tools`.
- Fix Analytics heading/tooltip clipping and Goals select sizing.
- Tighten brand/action layout in the mobile header.
- Replace content-covering tips with inline or checklist guidance.
- Restore the simplified Monthly Needed public calculator and its pure unit tests.
- Improve the mobile cookie notice.
- Preserve direct URLs and desktop behavior.

### Verification

- No page-level horizontal overflow.
- No clipped labels, select values, tooltips, or action buttons.
- All existing mutations still work.
- Auth, onboarding, dashboard, transactions, recurring rules, goals, debts, analytics, calculator, preferences, and legal routes pass mobile smoke.
- Desktop regression suite passes.
- Bundle size is measured before and after.

### Definition Of Done

- First-time mobile users can find the active priority and next action in under 10 seconds.
- Adding a transaction is reachable in one primary action.
- Recurring setup is understandable without a developer explanation.
- Advanced tools remain accessible but are not presented as first-run requirements.
- All release gates and preview Browser QA pass.

## Phase 13 - Refreshed PWA Readiness Audit

Suggested integration branch: `pwa-plan-pulse`  
Suggested audit branch: `pwa/phase-0-readiness-audit`

Goal: re-audit the merged BudgBeacon/mobile baseline before adding any service-worker behavior.

### Audit

- Confirm current `main`, clean worktree, Node version, dependencies, and build output.
- Re-audit manifest, icons, favicon, Apple metadata, and social metadata.
- Re-audit auth redirects, protected routes, reset/confirmation URLs, and Supabase network calls.
- Map Plan Pulse to existing Goal Pack selectors and planning utilities.
- Define service-worker update and rollback behavior.
- Define a hard denylist for Supabase, auth, tokenized URLs, API responses, and financial payloads.
- Decide whether a no-fetch service worker is sufficient for targeted installability.
- Add no dependency unless the dependency/license review proves it is necessary.

### Required Decision

Return `GO`, `CONDITIONAL GO`, or `NO-GO` with an exact file list, cache contract, test plan, and rollback plan.

### Definition Of Done

- No hidden schema requirement.
- No auth or privacy conflict.
- No uncontrolled caching scope.
- Mobile destination for installed launches and Plan Pulse is final.

## Phase 14 - PWA Foundation And Install Experience

Suggested branch: `pwa/phase-1-installability`

Goal: make BudgBeacon safely installable without pretending the financial product works offline.

### Work

- Complete manifest fields, including `scope`, stable `id`, and approved start URL.
- Add tested 192 x 192 and 512 x 512 icons.
- Create a maskable icon only after checking safe-zone rendering.
- Add Apple touch metadata only where it is useful and verified.
- Add a minimal service worker and registration module.
- Initially avoid fetch interception and runtime data caching.
- If browser installability requires a fetch handler, keep it network-only and independently audited.
- If static precaching is later added, cache only immutable, versioned app assets and never cache authenticated responses or tokenized navigation URLs.
- Add install availability and installed-state controls in Preferences or `More`.
- Show iOS Add to Home Screen guidance only on relevant devices.
- Never prompt for installation on first page load.
- Never block web use when install is declined or unsupported.

Cloudflare already caches Pages static assets and warns that custom caching can cause stale deployments. The first PWA milestone should not duplicate Cloudflare caching without a measured need.

### Definition Of Done

- BudgBeacon installs in supported Chromium environments.
- iOS guidance is accurate and contextual.
- The app works normally without service-worker support.
- Login, confirmation, recovery, logout, and route protection are unchanged.
- No Supabase or financial response appears in Cache Storage.
- Service-worker updates do not trap users on stale releases.

## Phase 15 - Plan Pulse V1

Suggested branch: `pwa/phase-2-plan-pulse`

Goal: make the installed or browser experience useful between full budgeting sessions.

### V1 Scope

- In-app Plan Pulse card on `Today`.
- Current active priority.
- Current progress and plan confidence.
- One next action.
- Monthly check-in status.
- `Review plan` action.
- Local, non-sensitive preference for enabled state and reminder day.
- No guaranteed background delivery.
- No new financial formulas; reuse the existing Goal Pack engine.

### Optional Local Notification

- Ask for permission only after the user explicitly enables reminders.
- Explain email/in-app alternatives before the browser permission prompt.
- Use generic text such as `Your BudgBeacon Plan Pulse is ready.`
- Do not include balances, goal names, debt names, or amounts in notification content.
- Treat denial as a supported state.

### Definition Of Done

- Plan Pulse works with and without installation.
- It derives from the same source as the dashboard.
- It does not create duplicate planning logic.
- Unsupported notifications degrade to in-app reminders.
- Users can disable the feature.

## Phase 16 - PWA Release Candidate, Security Review, And Rollout

Suggested branch: continue `pwa-plan-pulse`

Goal: release the bounded PWA only after preview validation.

### QA Matrix

- Desktop Chrome, Edge, Firefox, and available Safari.
- Android Chrome and iPhone Safari.
- 1440, 980, 640, 420, 390, and 375 px.
- Install, launch, update, uninstall/reinstall, and unsupported states.
- Online auth and protected routes.
- Service-worker scope and update lifecycle.
- Cache Storage inspection.
- Plan Pulse enabled, disabled, denied, and unsupported states.
- Cloudflare preview before production.

### Rollback Triggers

- Login or recovery regression.
- Stale service worker blocks a deployment.
- Reload loop.
- Private data cached.
- Broken asset scope.
- Installed mode cannot reach the primary mobile workflow.

### Definition Of Done

- Preview QA passes.
- Security and privacy review passes.
- PWA integration branch merges to `main`.
- Production deployment succeeds.
- First 24-hour and seven-day monitoring checks are recorded.

## Phase 17 - Monetization Readiness And Product Measurement

Suggested integration branch: `monetization-integration`  
Suggested branch: `monetization/phase-10-readiness`

Goal: validate what users will pay for before building billing or expensive data connectivity.

This is the old roadmap phase that was next before the rebrand and PWA detour. It has not been completed.

### Work

- Define the activation event: onboarding completed, starter plan created, and first plan action reviewed or completed.
- Define retention around meaningful money moments rather than generic daily use.
- Interview activated users about willingness to pay for automation, advanced planning, and reports.
- Document free, Plus, and Connected packaging.
- Create an entitlement matrix before writing Stripe code.
- Create a privacy-reviewed product measurement plan.
- Do not reintroduce the removed marketing-funnel schema casually.
- If first-party product events are approved, use an allowlist and never store amounts, descriptions, categories, goal names, debt names, auth URLs, or bank identifiers in event properties.
- Keep Cloudflare Web Analytics for aggregate traffic/performance; do not mistake it for activation or retention analytics.

### Recommended Packaging To Test

#### Free

- One active Goal Pack.
- Manual transactions, recurring rules, goals, and debts.
- Basic personalized dashboard and next action.
- Basic Goal Plan simulator.
- Basic Plan Pulse.
- Limited plan history.
- CSV export of the user's own data should remain available for trust and portability.

#### Plus

- Multiple active/later priorities.
- Advanced plan history and `what changed` insights.
- Scenario comparison and saved scenarios.
- Monthly progress report.
- First Home Plan or Goal Plan PDF.
- Advanced recurring action rules.
- Expanded Goal Pack library.
- Household sharing later, after its security model is complete.

#### Connected

- Everything in Plus.
- Bank and credit-card sync.
- Automatic transaction enrichment and review queue.
- Recurring income/bill detection.
- Connection health and sync controls.

### Price Tests, Not Final Prices

- Plus: test approximately CAD $6.99 monthly or CAD $59-$69 annually before bank sync.
- Connected: test approximately CAD $9.99-$11.99 monthly or CAD $89-$109 annually after reliable bank sync.
- One-time Goal Plan PDF: test CAD $19-$39.
- Founding annual plan: use a time-limited early adopter price, not a permanent lifetime entitlement.

Current category anchors are materially higher in USD: YNAB lists USD $109 annually / $14.99 monthly, and Monarch lists USD $99.99 annually. BudgBeacon should not copy those prices until its automation, support, and connectivity justify them.

### Evidence Gate

Do not start full billing merely because pricing screens are designed. Proceed when:

- activated users repeatedly return to update or review a plan;
- users can name the premium problem they want solved;
- at least a small cohort has completed multiple monthly/weekly plan loops;
- interview or preorder evidence supports a price range;
- support burden and bank-sync cost assumptions are understood.

## Phase 18 - Bank Data Provider Discovery And Sandbox Spike

Suggested branch: `integrations/phase-12-bank-data-spike`

Goal: learn coverage, reliability, support burden, pricing, and data shape before production architecture is locked.

### Recommended Provider Order

1. Plaid for the first Canadian/US spike.
2. Flinks as the Canadian coverage and commercial comparison.
3. Salt Edge or another regulated aggregation provider for later European/international expansion.

Plaid is the practical first spike because its official documentation supports Transactions and Recurring Transactions in Canada, its coverage materials claim broad Canadian deposit-account coverage, and new US/Canada teams can access a Trial plan. Exact production pricing is still sales/approval dependent.

### Spike Scope

- Create a Plaid development account and confirm current Trial/Sandbox terms.
- Test top target institutions rather than relying only on aggregate coverage claims.
- Test Link, token exchange, `/transactions/sync`, webhooks, cursor recovery, deleted transactions, pending-to-posted transitions, and disconnect.
- Test recurring transaction output against BudgBeacon recurring rules.
- Measure transaction category quality and manual review burden.
- Compare Plaid and Flinks production pricing, minimums, data retention, DPA, Canadian coverage, support, and incident handling.
- Write a provider adapter contract before production tables are added.
- Keep secrets server-side and outside preview/public environment variables.
- Do not touch the production database during the technical spike.

### Definition Of Done

- Provider scorecard complete.
- Production pricing and access requirements documented.
- Top Canadian institution tests recorded.
- Provider-neutral data contract approved.
- Go/no-go decision made before billing promises bank sync.

## Phase 19 - Premium Entitlements, Stripe Billing, And Upgrade UX

Suggested branch: `monetization/phase-11-premium-billing`

Goal: add paid access without damaging the free product.

### Work

- Add provider-neutral plan and entitlement types.
- Prefer a `subscriptions`/`entitlements` model over overloading `user_roles`.
- Keep Stripe customer/subscription identifiers server-controlled.
- Add Stripe Checkout Edge Function.
- Add verified and idempotent Stripe webhook Edge Function.
- Add Stripe Billing Portal.
- Handle trialing, active, past due, canceled, and grace-period states.
- Add upgrade surfaces only at the point a user asks for an additive premium feature.
- Add price, renewal, cancellation, tax, refund, and support disclosures.
- Update Terms/Privacy before live payments.
- Use Stripe test mode through the complete lifecycle before production keys are added.

### Never Gate

- Account access and deletion.
- Legal/privacy access.
- Manual transaction entry and export.
- One active priority.
- Basic dashboard progress.
- Basic next action.
- Basic Plan Pulse.

### Definition Of Done

- Test checkout, webhook, entitlement refresh, portal, cancellation, and failed-payment flows pass.
- Webhook replay cannot create duplicate state.
- Frontend cannot grant itself premium access.
- Upgrade UX is contextual and non-hostile.
- Free users retain the complete core loop.

## Phase 20 - Provider-Neutral Bank Sync Production

Suggested branch: `integrations/phase-12-bank-sync`

Goal: productionize the winning provider without naming the permanent schema after Plaid.

### Recommended Data Model

- `bank_connections`
- `bank_accounts`
- `bank_sync_cursors`
- `bank_webhook_events`
- provider transaction identifier and provider metadata on imported transactions
- consent, last-success, error, and disconnected timestamps

The existing `bank_connection_id`, `plaid_transaction_id`, and `source='plaid'` placeholders should be migrated carefully toward provider-neutral naming if more than one provider is a real roadmap requirement. Avoid adding more Plaid-specific columns before that decision.

### Edge Functions

- Create link session/token.
- Exchange public token.
- Sync transactions.
- Receive and verify webhooks.
- Disconnect and delete provider data.
- Refresh connection status.

### Security And Reliability

- Provider secret and access tokens never enter the browser.
- Store tokens using an approved encrypted/Vault pattern.
- RLS prevents cross-user connection and account access.
- Webhook events are verified, idempotent, and replay-safe.
- Sync uses cursors and handles added, modified, and removed transactions.
- Manual and imported transactions coexist.
- Imported edits and duplicate conflicts have a review flow.
- Users can disconnect, revoke, and request deletion.
- Never initiate money movement in this phase.

### Definition Of Done

- Sandbox and production pilot pass.
- Sync, refresh, webhook, disconnect, and deletion flows pass.
- Connection errors are understandable on mobile.
- Bank sync is correctly entitled.
- Manual mode remains fully usable.

## Phase 21 - Premium Value Expansion

Suggested branch: `premium/phase-13-reports-and-planning`

Goal: ensure premium value is broader than merely paying the bank-data provider.

### Work

- Multiple priority timelines.
- Saved and compared scenarios.
- Extended snapshot history.
- Monthly progress reports via Resend.
- Exportable Goal Plan PDF.
- Recurring action rules.
- Advanced `what changed` insights.
- Connection health summary for Connected users.
- Optional Goal Pack bundles: freelancer income, relocation, education, wedding, new baby, and a Canada-specific first-home pack.

Use Resend for transactional/progress email only after cadence, unsubscribe, privacy, and idempotency behavior are defined. Keep reports generic in subject lines and avoid exposing financial values in email previews.

## Phase 22 - True Web Push

Suggested branch: `pwa/phase-3-true-push`

Goal: add closed-app reminders only after in-app Plan Pulse engagement proves useful.

### Work

- Push subscription table and RLS/service rules.
- VAPID key management.
- Scheduled server job.
- Subscription rotation and unsubscribe handling.
- Generic payloads only.
- Notification click opens a safe authenticated route.
- Email/in-app fallback.
- Privacy policy and permission UX update.

Do not build this merely to claim PWA completeness. Build it when users opt into and act on Plan Pulse.

## Phase 23 - Household, Professional, And Employer Channels

Suggested branch: `growth/phase-14-shared-planning`

Goal: open higher-value revenue channels after single-user permissions and retention are mature.

### Household Plan

- Shared Goal Packs with explicit invitations.
- Granular ownership and visibility rules.
- Separate personal and shared data.
- Audit trail for shared edits.
- Premium household pricing.

### Professional/Coach Plan

- Client-sponsored access.
- Read-only or scoped collaboration by default.
- No ability to silently access client financial data.
- Explicit client revocation.
- Professional terms and stronger security review.

### Employer Financial Wellness

- Employer-sponsored subscriptions.
- Employers receive aggregate program data only, never employee financial details.
- Education and Goal Pack templates, not employer surveillance.

YNAB markets an employer wellness channel and Monarch offers a professional client model, showing that B2B2C can be a real second revenue stream after the consumer product is trustworthy.

## Phase 24 - Internationalization And Provider Expansion

Suggested branch: `growth/phase-15-international`

Goal: expand without turning regional rules into global defaults.

### Work

- Provider adapter supports Canada/US first and regional providers later.
- Locale-aware currency and date formatting.
- Multi-currency strategy before mixed-currency totals are shown.
- Regional legal/privacy review.
- Regional Goal Pack configuration.
- Salt Edge or another regulated provider evaluated for Europe/UK.
- CSV import remains the universal fallback.

Do not expose TFSA/FHSA, mortgage, or Canadian tax rules to international users unless they explicitly select a Canada-specific pack.

## Phase 25 - Wealth, Net Worth, And Advanced Goal Packs

Suggested branch: `growth/phase-16-wealth`

Goal: expand from immediate priorities only after the core loop and monetization are proven.

### Work

- Manual and connected account balances.
- Net-worth history.
- Asset/liability model.
- Long-term wealth Goal Pack.
- Optional retirement scenarios with conservative assumptions.
- Jurisdiction-specific first-home or education packs.
- Advanced infrastructure only when traffic and query data justify it.

This is the appropriate later home for the current landing page's long-term wealth projection, not the primary public onboarding hook today.

## Monetization Options Ranked

| Rank | Option | Revenue Model | Why It Fits | Recommendation |
| --- | --- | --- | --- | --- |
| 1 | Plus planning tier | Monthly/annual subscription | Monetizes BudgBeacon's differentiated planning engine without API cost | Build first after evidence gate |
| 2 | Connected tier | Higher subscription | Users pay for saved time, automatic cash-flow proof, and recurring detection | Build after provider spike |
| 3 | Goal Plan PDF | CAD $19-$39 one-time | Useful for subscription-resistant users and major decisions | Early premium candidate |
| 4 | Monthly progress reports | Plus bundle | Reinforces the momentum loop and uses existing Resend infrastructure | Strong retention feature |
| 5 | Premium Goal Pack bundles | One-time or Plus | Keeps universal core while offering specific seasonal plans | Good after pack framework matures |
| 6 | Household plan | Higher annual tier | Shared goals are valuable and sticky | Later due to permission complexity |
| 7 | Coach/professional workspace | Per sponsored client | Higher willingness to pay and lower consumer acquisition pressure | Later B2B channel |
| 8 | Employer wellness | Per employee / contract | Can subsidize access for end users | Much later; requires privacy firewall |
| 9 | AI plan explainer | Metered premium add-on | Could translate deterministic outputs into plain language | Only after privacy/advice evaluation |
| 10 | Affiliate offers | Referral revenue | Easy revenue but creates conflicts around recommendations | Avoid until trust policy is explicit |
| Reject | Ads or financial-data resale | Advertising/data brokerage | Conflicts directly with financial-product trust | Do not implement |

## API And Platform Options

| Provider/Platform | Potential Use | Geographic Fit | Commercial/Technical Note | Roadmap Decision |
| --- | --- | --- | --- | --- |
| Plaid Transactions | Bank/credit transaction sync | Canada and US first | Subscription pricing; Recurring Transactions is an add-on; Trial available to qualifying new US/Canada teams | First sandbox/trial spike |
| Plaid Recurring Transactions | Detect income and bill streams | Canada, US, UK | Could improve onboarding recurring rules and subscription insights | Evaluate during Plaid spike |
| Flinks | Canadian account aggregation and enrichment | Canada/US focus | Strong Canadian comparison; commercial terms require direct evaluation | Compare before production lock-in |
| Salt Edge | Account aggregation and enrichment | Europe/UK and broader international coverage | Regulated/open-banking considerations vary by market | Later international option |
| Stripe Billing | Subscriptions, Checkout, portal, webhooks | Strong Canada/global fit | Current Canadian pay-as-you-go Billing fee is percentage-based plus payment processing | Preferred billing platform |
| Resend | Auth and progress emails | Global | Already used for auth SMTP; transactional pricing scales by email volume | Reuse for premium reports |
| Native Web Push | Plan Pulse reminders | Browser/device dependent | No vendor required, but backend subscriptions and scheduling are required for true push | Defer until Plan Pulse proves value |
| Cloudflare Web Analytics | Aggregate traffic/performance | Global | Already enabled; does not replace product funnel/retention measurement | Keep for disclosed aggregate analytics |
| CSV import/export | Universal fallback | Global | No aggregator cost and protects portability | Keep free and reliable |

## API Architecture Rules

- Use provider-neutral domain names for new tables and application interfaces.
- Keep all API secrets and provider tokens server-side.
- Add one adapter boundary for transaction providers.
- Treat webhooks as untrusted, verified, idempotent input.
- Preserve manual entry and CSV fallback.
- Do not add money movement to a read-only aggregation milestone.
- Do not send financial payloads to analytics, email subjects, push payloads, or AI providers by default.
- Complete DPA, retention, deletion, consent, and breach-response review before production bank data.
- Re-run Supabase security/performance advisors after every migration.

## Recommended Branch Sequence

```text
main @ BudgBeacon production baseline
  -> product/current-baseline-closure
  -> ux/mobile-simplification-plan
  -> ux/mobile-simplification
  -> pwa-plan-pulse
       -> pwa/phase-0-readiness-audit
       -> pwa/phase-1-installability
       -> pwa/phase-2-plan-pulse
  -> monetization-integration
       -> monetization/phase-10-readiness
       -> integrations/phase-12-bank-data-spike
       -> monetization/phase-11-premium-billing
       -> integrations/phase-12-bank-sync
       -> premium/phase-13-reports-and-planning
  -> pwa/phase-3-true-push
  -> growth/phase-14-shared-planning
  -> growth/phase-15-international
  -> growth/phase-16-wealth
```

Each implementation branch should be cut from the latest merged `main`, or from a clearly named integration branch when several sequential commits form one release candidate. Avoid a branch named `pwa` or `monetization` if nested `pwa/*` or `monetization/*` refs will be used.

## Global Release Gates

Every implementation phase must pass:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test
npm.cmd run build
npm.cmd audit --omit=dev --audit-level=high
git diff --check
```

For schema or integration phases also require:

- Supabase migration and generated-type reconciliation.
- RLS and grants review.
- Security and performance advisors.
- Cross-user access tests.
- Edge Function JWT/secret review.
- Webhook signature and replay tests.
- Data deletion and disconnect tests.

For UX/PWA phases also require:

- Cloudflare branch preview.
- Browser QA at the defined desktop/mobile matrix.
- No page-level horizontal overflow.
- No clipped text/actions.
- Auth route regression tests.
- Accessibility checks.
- Console/network inspection.
- Service-worker/cache inspection when applicable.

## Research Basis

Primary/current sources consulted for this roadmap:

- Plaid Transactions and recurring transactions: https://plaid.com/docs/transactions/
- Plaid billing models: https://plaid.com/docs/account/billing/
- Plaid US/Canada institution coverage: https://plaid.com/docs/institutions/
- Plaid Trial/pricing overview: https://support.plaid.com/hc/en-us/articles/16110502116887-What-are-Plaid-s-prices-and-pricing-plans-and-how-do-they-differ
- Flinks API documentation: https://docs.flinks.com/api-home
- Flinks Canadian connectivity terms: https://www.flinks.com/service-schedule-connectivity-canada
- Salt Edge Account Information: https://www.saltedge.com/products/account_information
- Stripe Billing pricing for Canada: https://stripe.com/en-ca/billing/pricing
- Resend pricing: https://resend.com/docs/knowledge-base/what-is-resend-pricing
- Cloudflare Pages caching guidance: https://developers.cloudflare.com/pages/configuration/serving-pages/
- Web permission best practices: https://web.dev/articles/permissions-best-practices
- PWA installation overview: https://web.dev/learn/pwa/installation
- Canada consumer-driven banking framework: https://www.canada.ca/en/department-finance/programs/financial-sector-policy/open-banking-implementation/budget-2025-canadas-framework-for-consumer-driven-banking.html
- Canada consumer-driven banking regulations update: https://www.canada.ca/en/department-finance/news/2026/06/government-pre-publishes-regulations-to-prevent-fraud-and-facilitate-the-next-phase-of-consumer-driven-banking.html
- YNAB pricing and packaging: https://www.ynab.com/pricing/
- Monarch consumer pricing: https://partners.monarchmoney.com/pricing
- Monarch professional channel: https://www.monarchmoney.com/solutions/advisors

## Immediate Next Action

Do not cut the PWA implementation branch yet.

First cut `product/current-baseline-closure` from current `main`, finish the small production/documentation cleanup, and create the mobile UX architecture artifact. Once the mobile information architecture and landing calculator are approved, implement `ux/mobile-simplification`, merge it, and run the refreshed PWA Phase 0 audit against that exact commit.

## North Star

BudgBeacon turns the financial priority that matters now into a clear plan, a realistic monthly path, and one useful next action - then makes progress visible every time the user's money changes.
