-- Tighten the live Data API surface after the Goal Packs pivot.
--
-- Supabase's Data API now treats grants and RLS as separate layers. Keep RLS as
-- row protection and use grants to avoid exposing app tables/functions to anon.

revoke all privileges on table
  public.profiles,
  public.user_roles,
  public.user_preferences,
  public.goals,
  public.debts,
  public.recurring_rules,
  public.transactions,
  public.financial_priorities,
  public.goal_plan_snapshots,
  public.goal_actions
from anon;

revoke all privileges on table
  public.profiles,
  public.user_roles,
  public.user_preferences,
  public.goals,
  public.debts,
  public.recurring_rules,
  public.transactions,
  public.financial_priorities,
  public.goal_plan_snapshots,
  public.goal_actions
from public;

grant select, insert, update, delete on table public.profiles to authenticated;
grant select on table public.user_roles to authenticated;
grant select, insert, update, delete on table public.user_preferences to authenticated;
grant select, insert, update, delete on table public.goals to authenticated;
grant select, insert, update, delete on table public.debts to authenticated;
grant select, insert, update, delete on table public.recurring_rules to authenticated;
grant select, insert, update, delete on table public.transactions to authenticated;
grant select, insert, update, delete on table public.financial_priorities to authenticated;
grant select, insert, update, delete on table public.goal_plan_snapshots to authenticated;
grant select, insert, update, delete on table public.goal_actions to authenticated;

revoke execute on all functions in schema public from public;
revoke execute on all functions in schema public from anon;
revoke execute on all functions in schema public from authenticated;

grant execute on function public.allocate_goal_contribution(
  uuid,
  integer,
  date,
  text,
  text
) to authenticated;

grant execute on function public.update_goal_contribution_transaction(
  uuid,
  integer,
  date,
  text,
  text
) to authenticated;

grant execute on function public.delete_transaction_and_rebalance_goal(uuid) to authenticated;

grant execute on function public.allocate_debt_payment(
  uuid,
  integer,
  date,
  text,
  text,
  public.transaction_source,
  uuid
) to authenticated;

grant execute on function public.update_debt_payment_transaction(
  uuid,
  integer,
  date,
  text,
  text
) to authenticated;

grant execute on function public.delete_goal_permanently(uuid) to authenticated;
grant execute on function public.delete_debt_permanently(uuid) to authenticated;

grant execute on function public.create_goal_pack_onboarding_setup(
  text,
  text,
  text,
  integer,
  integer,
  date,
  text,
  integer,
  integer,
  integer,
  text,
  jsonb,
  text,
  text,
  text,
  text,
  text,
  integer,
  integer,
  text,
  text,
  text,
  text,
  jsonb,
  text,
  timestamptz
) to authenticated;

grant execute on function public.create_goal_pack_onboarding_setup_v2(
  text,
  text,
  text,
  integer,
  integer,
  date,
  text,
  integer,
  integer,
  integer,
  text,
  jsonb,
  text,
  text,
  text,
  text,
  text,
  integer,
  integer,
  text,
  text,
  text,
  text,
  jsonb,
  text,
  timestamptz,
  text,
  public.debt_type,
  integer,
  integer,
  integer,
  integer,
  public.payment_frequency,
  text,
  text,
  date
) to authenticated;

grant execute on function public.apply_goal_plan_recalculation(
  uuid,
  text,
  integer,
  integer,
  integer,
  text,
  jsonb,
  timestamptz,
  text,
  numeric,
  date,
  integer,
  integer,
  integer,
  jsonb,
  jsonb,
  text,
  text,
  text,
  text,
  jsonb,
  text,
  timestamptz
) to authenticated;

grant execute on function public.complete_goal_action_with_plan(
  uuid,
  timestamptz,
  text,
  integer,
  integer,
  integer,
  text,
  jsonb,
  timestamptz,
  numeric,
  date,
  integer,
  integer,
  integer,
  jsonb,
  jsonb
) to authenticated;

grant execute on function public.process_due_recurring_rules(uuid, date) to service_role;

alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke usage, select on sequences from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated, service_role;
