# Goal Packs Phase 2 Executive Summary

Prepared: 2026-06-30
Branch: `goal-packs/phase-2-priority-onboarding`

## Outcome

Phase 2 turns onboarding into the first Goal Packs personalization moment. When `VITE_GOAL_PACKS_ENABLED=true`, new users choose a top financial priority, provide only the details needed for that priority, and BudgetBuddy creates the first active plan.

## Deliverables

- Feature-flagged Goal Packs onboarding wizard.
- Baseline context step for location, age, income, expenses, currency, and horizon.
- Priority picker for Emergency Fund, Debt Payoff, Major Purchase / Home Fund, and Custom Goal.
- Priority-specific starter-goal questions.
- Plan builder that creates:
  - starter `goals` draft
  - `financial_priorities` draft
  - goal planning metadata
  - first `goal_actions` draft
- Existing legacy onboarding remains the fallback when the feature flag is off.
- Unit tests for the plan builder.

## Security Notes

- No new migration was added in Phase 2.
- All writes go through the existing Phase 1 Supabase API wrappers and Goals create hook.
- The frontend still uses the publishable Supabase client only; no service-role or secret path is introduced.

## Risk Notes

- The Goal Packs dashboard renderer is still Phase 4, so the created plan is stored before it becomes the primary dashboard experience.
- Debt payoff onboarding creates a focused payoff goal and action; full debt-record automation remains a later enhancement.
- The feature flag remains the rollout control until the pivot dashboard is ready.
