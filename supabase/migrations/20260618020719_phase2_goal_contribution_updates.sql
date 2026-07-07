create or replace function public.update_goal_contribution_transaction(
  p_transaction_id uuid,
  p_amount_cents integer,
  p_transaction_date date,
  p_description text default '',
  p_notes text default null
)
returns public.transactions
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_transaction public.transactions%rowtype;
  v_updated public.transactions%rowtype;
  v_delta integer;
begin
  if v_user_id is null then
    raise exception 'Authentication is required to update transactions.'
      using errcode = '28000';
  end if;

  if p_amount_cents is null or p_amount_cents <= 0 then
    raise exception 'Goal contribution amount must be greater than zero.'
      using errcode = '22023';
  end if;

  select *
  into v_transaction
  from public.transactions
  where id = p_transaction_id
    and user_id = v_user_id
    and goal_id is not null
  for update;

  if not found then
    raise exception 'Goal contribution transaction was not found.'
      using errcode = 'P0002';
  end if;

  v_delta := p_amount_cents - abs(v_transaction.amount_cents);

  update public.goals
  set current_amount_cents = greatest(0, current_amount_cents + v_delta),
      updated_at = now()
  where id = v_transaction.goal_id
    and user_id = v_user_id;

  update public.transactions
  set amount_cents = p_amount_cents,
      kind = 'transfer',
      category = 'savings',
      transaction_date = p_transaction_date,
      description = coalesce(nullif(btrim(p_description), ''), description),
      notes = nullif(btrim(p_notes), ''),
      source = 'manual',
      updated_at = now()
  where id = v_transaction.id
    and user_id = v_user_id
  returning * into v_updated;

  return v_updated;
end;
$$;

revoke all on function public.update_goal_contribution_transaction(uuid, integer, date, text, text) from public;
revoke all on function public.update_goal_contribution_transaction(uuid, integer, date, text, text) from anon;
grant execute on function public.update_goal_contribution_transaction(uuid, integer, date, text, text) to authenticated;

comment on function public.update_goal_contribution_transaction(uuid, integer, date, text, text)
  is 'Updates a goal-linked transaction and applies the amount delta to goal progress atomically.';
