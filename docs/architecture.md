# BudgetBuddy V2 Architecture

BudgetBuddy V2 is a feature-first React, TypeScript, Supabase, and Cloudflare Pages app. V1 is a reference library, not a merge target.

## Boundaries

- `src/app` owns app composition, providers, routing, and shell-level orchestration.
- `src/features/*/api` owns feature-specific Supabase and Edge Function calls.
- `src/features/*/hooks` owns query and mutation hooks.
- `src/features/*/pages` owns route-level screens.
- `src/shared` contains reusable UI, hooks, lib clients, types, and utilities.
- `supabase/migrations` is the source of truth for database structure and RLS.
- `supabase/functions` owns privileged server-side work.

## Rules

- Components do not call Supabase directly.
- Features do not import another feature's internals.
- Cross-feature logic belongs in `src/app` or `src/shared` only when it is truly generic.
- Mutations invalidate or update TanStack Query caches intentionally.
- Financial calculations stay in pure TypeScript unless they require stored user rows, transactional integrity, or protected secrets.
- Edge Functions are used for Plaid, recommendations, billing webhooks, and other sensitive operations.

## Phase 1 Core

Build in this order:

1. Auth
2. Database types and migrations
3. Transactions
4. Goals
5. Debts
6. Dashboard
7. Analytics
8. Recurring transactions
9. Cross-feature sync
