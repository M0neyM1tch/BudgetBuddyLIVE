# Goal Packs Implementation Sequence

Prepared: 2026-06-30

## Branching Note

Git cannot have both a branch named `goal-packs` and nested branches named `goal-packs/phase-*`. Use `goal-packs-integration` as the integration branch and `goal-packs/phase-*` for implementation branches.

Recommended sequence:

```text
develop
  -> goal-packs-integration
       -> goal-packs/phase-0-strategy-baseline
       -> goal-packs/phase-1-schema-foundation
       -> goal-packs/phase-2-priority-onboarding
       -> goal-packs/phase-3-planning-engine
       -> goal-packs/phase-4-dynamic-dashboard
       -> goal-packs/phase-5-goal-aware-analytics
       -> goal-packs/phase-6-dynamic-simulators
       -> goal-packs/phase-7-momentum-loop
       -> goal-packs/phase-8-legal-safety-copy
```

## Phase 0

Goal: establish strategy, architecture, feature flag, and typed registry.

Done when:

- Goal Pack docs exist.
- `VITE_GOAL_PACKS_ENABLED` exists and defaults off.
- Goal Pack registry and type vocabulary compile.
- Existing app behavior is unchanged with the flag off.

## Phase 1

Goal: add durable schema and API wrappers for active priority, plan snapshots, and next actions.

Done when:

- Additive migration exists.
- Generated database types are updated.
- RLS policies exist for new tables.
- Feature-owned API wrappers and schemas exist.
- Tests cover registry/type guards/schema validation.

## Phase 2

Goal: replace the generic first-run walkthrough with feature-flagged priority discovery that creates the user's first active Goal Pack plan.

Done when:

- `VITE_GOAL_PACKS_ENABLED=true` shows the priority onboarding wizard.
- The legacy onboarding wizard remains available when the feature flag is off.
- The flow asks for baseline context, then the top priority, then only priority-specific details.
- Submitting creates a starter goal, active financial priority, goal planning metadata, and first next action.
- Tests cover the onboarding plan builder.

## Phase 3

Goal: calculate and persist the first reusable Goal Packs planning engine outputs.

Done when:

- A deterministic planning engine calculates progress, remaining gap, required monthly contribution, projected completion date, confidence score, drivers, recommendations, and next action.
- Recalculation writes goal plan fields, a `goal_plan_snapshots` row, and one open `goal_actions` row when needed.
- Priority onboarding uses the planner after creating the starter goal and active priority.
- Tests cover the planning math and recommendation behavior.

## Phase 4

Goal: render the active Goal Pack plan on the authenticated dashboard while preserving the original dashboard when the feature flag is off.

Done when:

- `VITE_GOAL_PACKS_ENABLED=true` shows an active-priority dashboard panel.
- The panel renders active goal, progress, confidence, remaining gap, projected date, required monthly amount, next action, drivers, and recommendations.
- The panel supports an empty state when no active priority exists.
- Users can refresh the stored plan from the dashboard.
- The default V2 dashboard remains unchanged when the flag is off.

## Phase 5

Goal: make Analytics explain how current cash flow and spending patterns affect the active Goal Pack plan.

Done when:

- `VITE_GOAL_PACKS_ENABLED=true` adds a goal-aware analytics panel to the Analytics route.
- The panel renders active goal status, plan coverage, monthly gap, projected date, confidence, plan-change insights, and spending-lever scenarios.
- The panel compares current transactions with the prior period and, when available, compares the latest two plan snapshots.
- Category scenarios can focus the existing top-categories analytics view without creating advice or moving money automatically.
- The default Analytics route remains unchanged when the feature flag is off.
- No new Supabase migration is required; Phase 5 uses existing Goal Packs tables and authenticated RLS-protected queries.

## Phase 6

Goal: turn Calculator into a Goal Pack-aware simulator surface without removing the existing V2 calculators.

Done when:

- `VITE_GOAL_PACKS_ENABLED=true` adds a Goal Plan simulator tab to the Calculator route.
- The simulator reads the active Goal Pack, goal, financial priority, recent transaction history, and active debts when needed.
- The simulator adapts controls to the active pack's registry calculators: contribution change, date change, target change, category cut impact, surplus allocation, and debt payoff comparison.
- Scenario outputs include projected date, date movement, monthly funding, required monthly amount, remaining gap, category/surplus lift, and debt method comparisons when applicable.
- Scenarios remain local and educational; they do not mutate goals, debts, transactions, or next actions.
- The default V2 calculator route remains unchanged when the feature flag is off.
- No new Supabase migration is required; Phase 6 uses existing Goal Packs and Debts read paths.

## Phase 7

Goal: close the first active-priority momentum loop by making next actions completable from the dashboard.

Done when:

- `VITE_GOAL_PACKS_ENABLED=true` lets users complete or dismiss persisted open Goal Actions from the dashboard.
- Completing an action updates `goal_actions.status`, sets `completed_at`, refreshes goal plan fields, and writes an `action_completed` goal-plan snapshot.
- Dismissing an action updates `goal_actions.status` and `dismissed_at` without creating a progress snapshot.
- The dashboard shows a practical reward after completion, using action-specific impact copy.
- Completed/dismissed actions invalidate dashboard, goals, analytics, and calculator surfaces through existing React Query keys.
- Fallback recommendations are shown without completion buttons when no persisted open action exists.
- No new Supabase migration is required; Phase 7 uses the existing `goal_actions` and `goal_plan_snapshots` schema.

## Phase 8

Goal: make Goal Packs safe enough for a free public release by tightening legal language,
assumption copy, and strategy-sensitive UI copy.

Done when:

- Terms and Privacy mention Goal Packs, projections, estimates, user-entered data limits,
  debt payoff scenarios, and non-advice boundaries.
- Dashboard, onboarding, analytics, simulators, and debt payoff comparisons show inline
  assumption or scenario notes where outputs could be mistaken for advice.
- Debt payoff methods are framed as common scenarios, not recommendations.
- Home Fund and major-purchase copy avoids mortgage, tax, legal, account-product, and
  investment-readiness claims.
- Landing and auth copy avoid outcome promises such as guaranteed wealth, early
  retirement, tax optimization, or financial-advisor positioning.
- No new Supabase migration is required; Phase 8 changes product/legal copy only.

## Later Phases

- Phase 9: Free release hardening

## Analytics Bundle Watch Item

The current Analytics route chunk is large because charting code is bundled into the lazy route. Do not interrupt Phase 0 or Phase 1 for this, but track it before free release.

Likely follow-ups:

- Split heavy chart components behind nested lazy imports.
- Consider a separate vendor chunk for `recharts`.
- Keep Analytics lazy-loaded so the dashboard and onboarding path do not pay the route cost.
- Measure after Goal Packs analytics work, because Phase 5 may change the shape of this chunk anyway.
