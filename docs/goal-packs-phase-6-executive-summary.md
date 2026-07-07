# Goal Packs Phase 6 Executive Summary

Prepared: 2026-07-01

## Scope

Phase 6 adds dynamic Goal Pack simulators to the existing Calculator route. The work keeps the pre-pivot calculators intact when `VITE_GOAL_PACKS_ENABLED=false` and adds a Goal Plan tab when Goal Packs are enabled.

## Implemented

- Added a pure Goal Plan simulator engine for local scenario modeling.
- Added a feature-flagged Goal Plan tab to Calculator.
- Added controls that adapt to the active Goal Pack registry:
  - monthly contribution changes
  - one-time boost scenarios
  - target amount changes
  - target date changes
  - category cut impact
  - surplus allocation
  - avalanche vs snowball debt payoff comparison
- Added scenario outputs for projected date, date movement, monthly funding, required monthly amount, remaining gap, category lift, surplus lift, and debt method comparison.
- Added tests covering projected date movement, category cut impact, and debt payoff comparison behavior.

## Supabase Notes

- No new migration was required.
- Phase 6 reuses existing Goal Packs dashboard data and existing Debts read paths.
- The simulator does not write to Supabase. It does not mutate goals, debts, transactions, snapshots, or actions.

## Product Notes

- The simulator uses scenario language and keeps assumptions visible.
- The Goal Plan tab is local and educational. Applying scenarios to saved plans remains a later product decision.
- Existing calculators remain available: Freedom Number, Budget Health, Compound Growth, and Recurring Costs.

## Follow-Ups

- Momentum-loop actions and applying selected scenarios remain Phase 7.
- Legal/copy hardening remains Phase 8.
- Free-release hardening remains Phase 9.
