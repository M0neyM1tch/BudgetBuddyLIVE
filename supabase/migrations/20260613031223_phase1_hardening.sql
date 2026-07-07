revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

create index if not exists transactions_debt_id_idx
  on public.transactions (debt_id)
  where debt_id is not null;

create index if not exists transactions_goal_id_idx
  on public.transactions (goal_id)
  where goal_id is not null;

create index if not exists transactions_recurring_rule_id_idx
  on public.transactions (recurring_rule_id)
  where recurring_rule_id is not null;
