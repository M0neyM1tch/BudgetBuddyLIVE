revoke all privileges on table
  public.profiles,
  public.user_preferences,
  public.user_roles,
  public.goals,
  public.debts,
  public.recurring_rules,
  public.transactions
from anon;

revoke all privileges on table
  public.profiles,
  public.user_preferences,
  public.user_roles,
  public.goals,
  public.debts,
  public.recurring_rules,
  public.transactions
from authenticated;

grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.user_preferences to authenticated;
grant select on table public.user_roles to authenticated;
grant select, insert, update, delete on table public.goals to authenticated;
grant select, insert, update, delete on table public.debts to authenticated;
grant select, insert, update, delete on table public.recurring_rules to authenticated;
grant select, insert, update, delete on table public.transactions to authenticated;

revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.recurring_rules_set_next_run() from public, anon, authenticated;
