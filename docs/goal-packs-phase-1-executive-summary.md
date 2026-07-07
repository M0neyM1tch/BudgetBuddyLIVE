# Goal Packs Phase 1 Executive Summary

Prepared: 2026-06-30
Branch: `goal-packs/phase-1-schema-foundation`

## Outcome

Phase 1 creates the durable data and client-access foundation for Goal Packs. It does not render new UI yet; it prepares the database, generated types, validation schemas, API helpers, and React Query hooks that later onboarding and dashboard phases can use.

## Deliverables

- Additive Supabase migration for Goal Pack planning fields on `goals`.
- New RLS-protected tables:
  - `financial_priorities`
  - `goal_plan_snapshots`
  - `goal_actions`
- Updated generated database type definitions for the new migration shape.
- Zod schemas for priority, goal plan, snapshot, and action writes.
- Supabase API wrappers scoped by authenticated user id.
- React Query hooks and cache invalidation helpers for Goal Pack surfaces.
- Registry and schema tests for the new foundation.

## Security Notes

- New tables enable row-level security.
- Policies are scoped to `TO authenticated`.
- Ownership checks use `(select auth.uid()) = user_id`.
- Insert and update checks also verify referenced goals belong to the same user.
- No service-role key, secret key, or admin-only path is introduced.

## Risk Notes

- The migration is additive and should preserve existing V2 data.
- `database.types.ts` was updated manually because no live type generation step was run in this local branch.
- Planning calculations are intentionally out of scope for Phase 1 and remain a Phase 3 responsibility.
