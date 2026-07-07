alter table public.recurring_rules
  add column if not exists debt_id uuid references public.debts(id) on delete set null;

create index if not exists recurring_rules_debt_id_idx
  on public.recurring_rules (debt_id)
  where debt_id is not null;

drop policy if exists recurring_rules_insert_own on public.recurring_rules;
drop policy if exists recurring_rules_update_own on public.recurring_rules;

create policy recurring_rules_insert_own on public.recurring_rules
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and (
      debt_id is null
      or exists (
        select 1
        from public.debts
        where debts.id = recurring_rules.debt_id
          and debts.user_id = (select auth.uid())
      )
    )
  );

create policy recurring_rules_update_own on public.recurring_rules
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and (
      debt_id is null
      or exists (
        select 1
        from public.debts
        where debts.id = recurring_rules.debt_id
          and debts.user_id = (select auth.uid())
      )
    )
  );

drop policy if exists transactions_insert_own on public.transactions;
drop policy if exists transactions_update_own on public.transactions;

create policy transactions_insert_own on public.transactions
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and (
      goal_id is null
      or exists (
        select 1
        from public.goals
        where goals.id = transactions.goal_id
          and goals.user_id = (select auth.uid())
      )
    )
    and (
      debt_id is null
      or exists (
        select 1
        from public.debts
        where debts.id = transactions.debt_id
          and debts.user_id = (select auth.uid())
      )
    )
  );

create policy transactions_update_own on public.transactions
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and (
      goal_id is null
      or exists (
        select 1
        from public.goals
        where goals.id = transactions.goal_id
          and goals.user_id = (select auth.uid())
      )
    )
    and (
      debt_id is null
      or exists (
        select 1
        from public.debts
        where debts.id = transactions.debt_id
          and debts.user_id = (select auth.uid())
      )
    )
  );

create or replace function public.allocate_debt_payment(
  p_debt_id uuid,
  p_amount_cents integer,
  p_transaction_date date default current_date,
  p_description text default '',
  p_notes text default null,
  p_source public.transaction_source default 'manual',
  p_recurring_rule_id uuid default null
)
returns public.transactions
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_debt public.debts%rowtype;
  v_transaction public.transactions%rowtype;
  v_description text;
begin
  if v_user_id is null then
    raise exception 'Authentication is required to allocate debt payments.'
      using errcode = '28000';
  end if;

  if p_amount_cents is null or p_amount_cents <= 0 then
    raise exception 'Debt payment amount must be greater than zero.'
      using errcode = '22023';
  end if;

  if p_source not in ('manual', 'recurring') then
    raise exception 'Debt payments can only be manual or recurring transactions.'
      using errcode = '22023';
  end if;

  select *
  into v_debt
  from public.debts
  where id = p_debt_id
    and user_id = v_user_id
    and is_archived = false
  for update;

  if not found then
    raise exception 'Debt was not found or is archived.'
      using errcode = 'P0002';
  end if;

  if p_recurring_rule_id is not null and not exists (
    select 1
    from public.recurring_rules
    where id = p_recurring_rule_id
      and user_id = v_user_id
      and debt_id = v_debt.id
  ) then
    raise exception 'Recurring rule was not found for this debt.'
      using errcode = 'P0002';
  end if;

  v_description := coalesce(
    nullif(btrim(p_description), ''),
    'Debt payment: ' || v_debt.name
  );

  insert into public.transactions (
    user_id,
    amount_cents,
    kind,
    category,
    transaction_date,
    description,
    notes,
    source,
    debt_id,
    recurring_rule_id
  )
  values (
    v_user_id,
    p_amount_cents,
    'transfer',
    'debt_payment',
    p_transaction_date,
    v_description,
    nullif(btrim(p_notes), ''),
    p_source,
    v_debt.id,
    p_recurring_rule_id
  )
  on conflict (recurring_rule_id, transaction_date)
  where recurring_rule_id is not null
  do nothing
  returning * into v_transaction;

  if not found then
    select *
    into v_transaction
    from public.transactions
    where recurring_rule_id = p_recurring_rule_id
      and transaction_date = p_transaction_date
      and user_id = v_user_id
      and debt_id = v_debt.id;

    if not found then
      raise exception 'Debt payment already exists but could not be loaded.'
        using errcode = 'P0002';
    end if;

    return v_transaction;
  end if;

  update public.debts
  set current_balance_cents = greatest(0, current_balance_cents - p_amount_cents),
      updated_at = now()
  where id = v_debt.id
    and user_id = v_user_id;

  return v_transaction;
end;
$$;

revoke all on function public.allocate_debt_payment(uuid, integer, date, text, text, public.transaction_source, uuid) from public;
revoke all on function public.allocate_debt_payment(uuid, integer, date, text, text, public.transaction_source, uuid) from anon;
grant execute on function public.allocate_debt_payment(uuid, integer, date, text, text, public.transaction_source, uuid) to authenticated;

comment on function public.allocate_debt_payment(uuid, integer, date, text, text, public.transaction_source, uuid)
  is 'Atomically creates a debt-linked transfer transaction and decrements the authenticated user''s debt balance.';

create or replace function public.update_debt_payment_transaction(
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
    raise exception 'Debt payment amount must be greater than zero.'
      using errcode = '22023';
  end if;

  select *
  into v_transaction
  from public.transactions
  where id = p_transaction_id
    and user_id = v_user_id
    and debt_id is not null
  for update;

  if not found then
    raise exception 'Debt payment transaction was not found.'
      using errcode = 'P0002';
  end if;

  v_delta := p_amount_cents - abs(v_transaction.amount_cents);

  update public.debts
  set current_balance_cents = greatest(0, current_balance_cents - v_delta),
      updated_at = now()
  where id = v_transaction.debt_id
    and user_id = v_user_id;

  update public.transactions
  set amount_cents = p_amount_cents,
      kind = 'transfer',
      category = 'debt_payment',
      transaction_date = p_transaction_date,
      description = coalesce(nullif(btrim(p_description), ''), description),
      notes = nullif(btrim(p_notes), ''),
      updated_at = now()
  where id = v_transaction.id
    and user_id = v_user_id
  returning * into v_updated;

  return v_updated;
end;
$$;

revoke all on function public.update_debt_payment_transaction(uuid, integer, date, text, text) from public;
revoke all on function public.update_debt_payment_transaction(uuid, integer, date, text, text) from anon;
grant execute on function public.update_debt_payment_transaction(uuid, integer, date, text, text) to authenticated;

comment on function public.update_debt_payment_transaction(uuid, integer, date, text, text)
  is 'Updates a debt-linked transaction and applies the amount delta to debt balance atomically.';

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

  if v_transaction.debt_id is not null then
    update public.debts
    set current_balance_cents = current_balance_cents + abs(v_transaction.amount_cents),
        updated_at = now()
    where id = v_transaction.debt_id
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
  is 'Deletes an authenticated user''s transaction and rebalances linked goal or debt balances atomically.';

create or replace function public.process_due_recurring_rules(
  p_user_id uuid default null,
  p_through date default current_date
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_rule record;
  v_next_run date;
  v_month_start date;
  v_last_day int;
  v_desired_day int;
  v_created int := 0;
  v_rules_advanced int := 0;
  v_skipped_paused int := 0;
  v_limited boolean := false;
  v_max int := 100;
  v_processed_occurrences int := 0;
  v_inserted int := 0;
  v_paused_names text[] := '{}';
begin
  for v_rule in
    select *
    from public.recurring_rules
    where is_active = true
      and next_run_date <= p_through
      and (p_user_id is null or user_id = p_user_id)
    order by user_id, next_run_date, id
  loop
    if v_rule.debt_id is not null and not exists (
      select 1
      from public.debts
      where id = v_rule.debt_id
        and user_id = v_rule.user_id
        and is_archived = false
    ) then
      update public.recurring_rules
      set is_active = false,
          updated_at = now()
      where id = v_rule.id
        and user_id = v_rule.user_id;

      continue;
    end if;

    v_next_run := v_rule.next_run_date;

    while v_next_run <= p_through loop
      if v_processed_occurrences >= v_max then
        v_limited := true;
        exit;
      end if;

      insert into public.transactions (
        user_id,
        amount_cents,
        kind,
        category,
        transaction_date,
        description,
        notes,
        source,
        recurring_rule_id,
        debt_id
      )
      values (
        v_rule.user_id,
        v_rule.amount_cents,
        case when v_rule.debt_id is not null then 'transfer'::public.transaction_kind else v_rule.kind end,
        case when v_rule.debt_id is not null then 'debt_payment' else v_rule.category end,
        v_next_run,
        v_rule.description,
        v_rule.notes,
        'recurring',
        v_rule.id,
        v_rule.debt_id
      )
      on conflict (recurring_rule_id, transaction_date)
      where recurring_rule_id is not null
      do nothing;

      get diagnostics v_inserted = row_count;

      if v_inserted > 0 and v_rule.debt_id is not null then
        update public.debts
        set current_balance_cents = greatest(0, current_balance_cents - abs(v_rule.amount_cents)),
            updated_at = now()
        where id = v_rule.debt_id
          and user_id = v_rule.user_id;
      end if;

      v_created := v_created + v_inserted;
      v_processed_occurrences := v_processed_occurrences + 1;

      if v_rule.frequency = 'weekly' then
        v_next_run := v_next_run + interval '7 days';
      elsif v_rule.frequency = 'biweekly' then
        v_next_run := v_next_run + interval '14 days';
      elsif v_rule.frequency = 'semi_monthly' then
        v_next_run := v_next_run + interval '15 days';
      else
        v_desired_day := coalesce(v_rule.day_of_month, extract(day from v_next_run)::int);
        v_month_start := (date_trunc('month', v_next_run)::date + interval '1 month')::date;
        v_last_day := extract(day from (date_trunc('month', v_month_start)::date + interval '1 month - 1 day'))::int;
        v_next_run := make_date(
          extract(year from v_month_start)::int,
          extract(month from v_month_start)::int,
          least(v_desired_day, v_last_day)
        );
      end if;
    end loop;

    update public.recurring_rules
    set next_run_date = v_next_run,
        updated_at = now()
    where id = v_rule.id
      and user_id = v_rule.user_id;

    v_rules_advanced := v_rules_advanced + 1;

    if v_limited then
      exit;
    end if;
  end loop;

  select count(*),
         coalesce(array_agg(coalesce(nullif(description, ''), category) order by next_run_date, id), '{}')
  into v_skipped_paused, v_paused_names
  from public.recurring_rules
  where is_active = false
    and next_run_date <= p_through
    and (p_user_id is null or user_id = p_user_id);

  return jsonb_build_object(
    'created', v_created,
    'rules_advanced', v_rules_advanced,
    'skipped_paused', v_skipped_paused,
    'paused_names', v_paused_names,
    'limited', v_limited,
    'through', p_through
  );
end;
$$;

revoke all on function public.process_due_recurring_rules(uuid, date) from public;
revoke all on function public.process_due_recurring_rules(uuid, date) from anon;
revoke all on function public.process_due_recurring_rules(uuid, date) from authenticated;
grant execute on function public.process_due_recurring_rules(uuid, date) to service_role;

comment on function public.process_due_recurring_rules(uuid, date)
  is 'Processes due recurring transaction rules atomically, including debt balance sync for debt-linked rules.';
