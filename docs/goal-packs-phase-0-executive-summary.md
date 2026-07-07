# Goal Packs Phase 0 Executive Summary

Prepared: 2026-06-30
Branch: `goal-packs/phase-0-strategy-baseline`

## Outcome

Phase 0 establishes the Goal Packs pivot without changing the current V2 user experience. The app remains a universal finance product, while the new feature boundary defines how BudgetBuddy can personalize around a user's active priority.

## Decisions

- Keep the existing V2 shell, navigation, and modules.
- Build Goal Packs as an additive, feature-flagged layer.
- Use `major_purchase` as the MVP path for home savings instead of launching with Canada-specific FHSA/TFSA logic.
- Start with Emergency Fund, Debt Payoff, Major Purchase / Home Fund, and Custom Goal.
- Defer standalone Home Fund, Retirement, General Savings, and Bill Reliability packs.
- Keep guidance educational and scenario-based rather than advisory.

## Deliverables

- Product strategy doc for the universal Goal Packs wedge.
- Architecture doc for module boundaries, Supabase security expectations, and first vertical slice.
- Implementation sequence doc with branch plan and bundle-size watch item.
- `VITE_GOAL_PACKS_ENABLED` feature flag, defaulting off.
- Typed Goal Pack registry and product vocabulary under `src/features/goalPacks`.

## Risk Notes

- The feature flag must remain off until dashboard/onboarding integration is ready.
- Home-specific tax/account logic remains deferred to avoid over-narrowing the product.
- Analytics route bundle size remains a tracked follow-up before free release.
