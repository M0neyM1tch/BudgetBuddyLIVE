create or replace function public.delete_goal_permanently(
  p_goal_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Authentication is required to delete goals.'
      using errcode = '28000';
  end if;

  if not exists (
    select 1
    from public.goals
    where id = p_goal_id
      and user_id = v_user_id
  ) then
    raise exception 'Goal was not found.'
      using errcode = 'P0002';
  end if;

  update public.transactions
  set goal_id = null,
      updated_at = now()
  where goal_id = p_goal_id
    and user_id = v_user_id;

  delete from public.goals
  where id = p_goal_id
    and user_id = v_user_id;

  return p_goal_id;
end;
$$;

revoke all on function public.delete_goal_permanently(uuid) from public;
revoke all on function public.delete_goal_permanently(uuid) from anon;
grant execute on function public.delete_goal_permanently(uuid) to authenticated;

comment on function public.delete_goal_permanently(uuid)
  is 'Permanently deletes an authenticated user''s goal while preserving and unlinking historical transactions.';

create or replace function public.delete_debt_permanently(
  p_debt_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Authentication is required to delete debts.'
      using errcode = '28000';
  end if;

  if not exists (
    select 1
    from public.debts
    where id = p_debt_id
      and user_id = v_user_id
  ) then
    raise exception 'Debt was not found.'
      using errcode = 'P0002';
  end if;

  update public.recurring_rules
  set debt_id = null,
      is_active = false,
      updated_at = now()
  where debt_id = p_debt_id
    and user_id = v_user_id;

  update public.transactions
  set debt_id = null,
      updated_at = now()
  where debt_id = p_debt_id
    and user_id = v_user_id;

  delete from public.debts
  where id = p_debt_id
    and user_id = v_user_id;

  return p_debt_id;
end;
$$;

revoke all on function public.delete_debt_permanently(uuid) from public;
revoke all on function public.delete_debt_permanently(uuid) from anon;
grant execute on function public.delete_debt_permanently(uuid) to authenticated;

comment on function public.delete_debt_permanently(uuid)
  is 'Permanently deletes an authenticated user''s debt while preserving and unlinking historical transactions and pausing linked recurring rules.';
