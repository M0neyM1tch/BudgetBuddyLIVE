create or replace function public.allocate_goal_contribution(
  p_goal_id uuid,
  p_amount_cents integer,
  p_transaction_date date default current_date,
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
  v_goal public.goals%rowtype;
  v_transaction public.transactions%rowtype;
  v_description text;
begin
  if v_user_id is null then
    raise exception 'Authentication is required to allocate goal contributions.'
      using errcode = '28000';
  end if;

  if p_amount_cents is null or p_amount_cents <= 0 then
    raise exception 'Goal contribution amount must be greater than zero.'
      using errcode = '22023';
  end if;

  select *
  into v_goal
  from public.goals
  where id = p_goal_id
    and user_id = v_user_id
    and is_archived = false
  for update;

  if not found then
    raise exception 'Goal was not found or is archived.'
      using errcode = 'P0002';
  end if;

  v_description := coalesce(
    nullif(btrim(p_description), ''),
    'Goal contribution: ' || v_goal.name
  );

  update public.goals
  set current_amount_cents = current_amount_cents + p_amount_cents,
      updated_at = now()
  where id = v_goal.id
    and user_id = v_user_id;

  insert into public.transactions (
    user_id,
    amount_cents,
    kind,
    category,
    transaction_date,
    description,
    notes,
    source,
    goal_id
  )
  values (
    v_user_id,
    p_amount_cents,
    'transfer',
    'savings',
    p_transaction_date,
    v_description,
    nullif(btrim(p_notes), ''),
    'manual',
    v_goal.id
  )
  returning * into v_transaction;

  return v_transaction;
end;
$$;

revoke all on function public.allocate_goal_contribution(uuid, integer, date, text, text) from public;
revoke all on function public.allocate_goal_contribution(uuid, integer, date, text, text) from anon;
grant execute on function public.allocate_goal_contribution(uuid, integer, date, text, text) to authenticated;

comment on function public.allocate_goal_contribution(uuid, integer, date, text, text)
  is 'Atomically creates a goal-linked transfer transaction and increments the authenticated user''s goal progress.';

create or replace function public.delete_transaction_and_rebalance_goal(
  p_transaction_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_transaction public.transactions%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication is required to delete transactions.'
      using errcode = '28000';
  end if;

  select *
  into v_transaction
  from public.transactions
  where id = p_transaction_id
    and user_id = v_user_id
  for update;

  if not found then
    raise exception 'Transaction was not found.'
      using errcode = 'P0002';
  end if;

  if v_transaction.goal_id is not null then
    update public.goals
    set current_amount_cents = greatest(0, current_amount_cents - abs(v_transaction.amount_cents)),
        updated_at = now()
    where id = v_transaction.goal_id
      and user_id = v_user_id;
  end if;

  delete from public.transactions
  where id = v_transaction.id
    and user_id = v_user_id;

  return v_transaction.id;
end;
$$;

revoke all on function public.delete_transaction_and_rebalance_goal(uuid) from public;
revoke all on function public.delete_transaction_and_rebalance_goal(uuid) from anon;
grant execute on function public.delete_transaction_and_rebalance_goal(uuid) to authenticated;

comment on function public.delete_transaction_and_rebalance_goal(uuid)
  is 'Deletes an authenticated user''s transaction and subtracts goal-linked contributions from the goal balance atomically.';
