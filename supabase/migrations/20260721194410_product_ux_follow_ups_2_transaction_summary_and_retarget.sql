alter table public.recurring_rules
  add constraint recurring_rules_id_user_id_key unique (id, user_id);

-- Ambiguous or cross-owner legacy relationships cannot be corrected without
-- guessing. Abort the migration before changing any row if one exists.
do $$
begin
  if exists (
    select 1
    from public.transactions
    where goal_id is not null
      and debt_id is not null
  ) then
    raise exception
      'Cannot enforce transaction allocation integrity: a dual-target transaction exists.'
      using errcode = '23514';
  end if;

  if exists (
    select 1
    from public.transactions t
    left join public.goals g
      on g.id = t.goal_id
      and g.user_id = t.user_id
    where t.goal_id is not null
      and g.id is null
  ) then
    raise exception
      'Cannot enforce transaction allocation integrity: a missing or cross-owner goal target exists.'
      using errcode = '23503';
  end if;

  if exists (
    select 1
    from public.transactions t
    left join public.debts d
      on d.id = t.debt_id
      and d.user_id = t.user_id
    where t.debt_id is not null
      and d.id is null
  ) then
    raise exception
      'Cannot enforce transaction allocation integrity: a missing or cross-owner debt target exists.'
      using errcode = '23503';
  end if;

  if exists (
    select 1
    from public.recurring_rules r
    left join public.debts d
      on d.id = r.debt_id
      and d.user_id = r.user_id
    where r.debt_id is not null
      and d.id is null
  ) then
    raise exception
      'Cannot enforce recurring debt integrity: a missing or cross-owner debt target exists.'
      using errcode = '23503';
  end if;

  if exists (
    select 1
    from public.recurring_rules
    where debt_id is null
      and kind = 'transfer'
      and is_active
  ) then
    raise exception
      'Cannot enforce recurring transaction integrity: an active targetless transfer rule exists.'
      using errcode = '23514';
  end if;

  if exists (
    select 1
    from public.transactions t
    left join public.recurring_rules r
      on r.id = t.recurring_rule_id
      and r.user_id = t.user_id
    where t.recurring_rule_id is not null
      and (
        r.id is null
        or r.debt_id is distinct from t.debt_id
        or t.goal_id is not null
      )
  ) then
    raise exception
      'Cannot enforce recurring transaction integrity: a missing, cross-owner, or mismatched rule relationship exists.'
      using errcode = '23503';
  end if;
end;
$$;

-- Normalize only the semantics implied by one unambiguous target. Amount,
-- date, description, source, ownership, targets, and every other field remain
-- unchanged.
update public.transactions
set kind = 'transfer',
    category = 'savings'
where goal_id is not null
  and debt_id is null
  and (kind is distinct from 'transfer' or category is distinct from 'savings');

update public.transactions
set kind = 'transfer',
    category = 'debt_payment'
where debt_id is not null
  and goal_id is null
  and (kind is distinct from 'transfer' or category is distinct from 'debt_payment');

-- Debt-targeted rules produce debt allocation transactions. Normalize their
-- persisted contract while leaving every non-debt recurring rule unchanged.
update public.recurring_rules
set kind = 'transfer',
    category = 'debt_payment'
where debt_id is not null
  and (kind is distinct from 'transfer' or category is distinct from 'debt_payment');

alter table public.recurring_rules
  add constraint recurring_rules_debt_target_semantics_check
    check (
      (debt_id is not null and kind = 'transfer' and category = 'debt_payment')
      or (debt_id is null and (kind <> 'transfer' or not is_active))
    );

alter table public.transactions
  add column allocation_applied_cents integer not null default 0,
  add column client_operation_id uuid,
  add constraint transactions_single_allocation_target_check
    check (num_nonnulls(goal_id, debt_id) <= 1),
  add constraint transactions_allocation_applied_cents_check
    check (allocation_applied_cents >= 0),
  add constraint transactions_allocation_target_semantics_check
    check (
      (goal_id is not null and debt_id is null
        and kind = 'transfer' and category = 'savings')
      or (debt_id is not null and goal_id is null
        and kind = 'transfer' and category = 'debt_payment')
      or (goal_id is null and debt_id is null)
    ),
  add constraint transactions_goal_owner_fkey
    foreign key (goal_id, user_id)
    references public.goals (id, user_id)
    on delete set null (goal_id),
  add constraint transactions_debt_owner_fkey
    foreign key (debt_id, user_id)
    references public.debts (id, user_id)
    on delete set null (debt_id),
  add constraint transactions_recurring_rule_owner_fkey
    foreign key (recurring_rule_id, user_id)
    references public.recurring_rules (id, user_id)
    on delete set null (recurring_rule_id);

-- A targetless transfer remains valid only as preserved history after the
-- existing permanent-delete/FK SET NULL workflow removes its former target.
-- The allocation trigger and quick-add/RPC creation paths reject fresh
-- unallocated transfers; targeted rows are always constrained above.

-- Historical allocation RPCs applied the full goal amount and recorded debt
-- payments without retaining their clamped delta. Preserve that historical
-- reversal behavior; all allocations after this migration store the exact
-- applied delta so future edits/deletes are lossless.
update public.transactions
set allocation_applied_cents = abs(amount_cents)
where goal_id is not null or debt_id is not null;

create unique index transactions_user_client_operation_id_key
  on public.transactions (user_id, client_operation_id)
  where client_operation_id is not null;

-- Allocation effects belong to the transaction row itself. This trigger keeps
-- direct RLS-authorized writes, legacy RPCs, and new retargeting behavior on the
-- same atomic accounting path.
create or replace function public.sync_transaction_allocation()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_goal public.goals%rowtype;
  v_debt public.debts%rowtype;
  v_rule public.recurring_rules%rowtype;
  v_applied_cents integer := 0;
begin
  if tg_op = 'UPDATE'
    and old.client_operation_id is not null
    and old.client_operation_id is distinct from new.client_operation_id then
    raise exception 'A quick-add operation id cannot be changed.' using errcode = '22023';
  end if;

  if tg_op = 'INSERT'
    and new.goal_id is null
    and new.debt_id is null
    and new.kind = 'transfer' then
    raise exception 'A new transaction cannot be an unallocated transfer.'
      using errcode = '22023';
  end if;

  if tg_op = 'UPDATE'
    and new.goal_id is null
    and new.debt_id is null
    and new.kind = 'transfer'
    and old.goal_id is null
    and old.debt_id is null
    and old.kind is distinct from 'transfer' then
    raise exception 'An ordinary transaction cannot be converted to an unallocated transfer.'
      using errcode = '22023';
  end if;

  if tg_op = 'INSERT'
    and new.client_operation_id is not null
    and exists (
      select 1
      from public.transactions
      where user_id = new.user_id
        and client_operation_id = new.client_operation_id
    ) then
    return null;
  end if;

  if tg_op = 'INSERT' and new.recurring_rule_id is not null then
    select *
    into v_rule
    from public.recurring_rules
    where id = new.recurring_rule_id
      and user_id = new.user_id
    for update;

    if not found
      or v_rule.debt_id is distinct from new.debt_id
      or new.goal_id is not null then
      raise exception 'Recurring rule was not found for this transaction target.'
        using errcode = '23503';
    end if;

    -- Protect the unique (rule, date) occurrence slot from a same-owner direct
    -- insert whose financial meaning differs from the rule. Initial UI notes
    -- may intentionally differ from recurring-rule notes, so notes are not
    -- compared. A nonblank rule description is stable across the current UI
    -- and scheduler and is therefore required to match; blank debt-rule
    -- descriptions may legitimately receive the debt RPC's fallback text.
    if new.source is distinct from 'recurring'::public.transaction_source
      or new.amount_cents is distinct from v_rule.amount_cents
      or new.kind is distinct from (
        case
          when v_rule.debt_id is not null
            then 'transfer'::public.transaction_kind
          else v_rule.kind
        end
      )
      or new.category is distinct from (
        case
          when v_rule.debt_id is not null
            then 'debt_payment'
          else v_rule.category
        end
      )
      or (
        nullif(btrim(v_rule.description), '') is not null
        and new.description is distinct from v_rule.description
      ) then
      raise exception 'Recurring transaction does not match its rule occurrence semantics.'
        using errcode = '22023';
    end if;

    if tg_op = 'INSERT' and exists (
      select 1
      from public.transactions
      where recurring_rule_id = new.recurring_rule_id
        and transaction_date = new.transaction_date
        and user_id = new.user_id
    ) then
      return null;
    end if;
  elsif tg_op = 'UPDATE' then
    -- A direct update may retain, clear, or replace the recurring relationship.
    -- Lock both identities in UUID order before any debt/goal target lock.
    perform 1
    from public.recurring_rules
    where id in (old.recurring_rule_id, new.recurring_rule_id)
      and user_id = old.user_id
    order by id
    for update;

    if new.recurring_rule_id is not null then
      select *
      into v_rule
      from public.recurring_rules
      where id = new.recurring_rule_id
        and user_id = new.user_id;

      if not found
        or v_rule.debt_id is distinct from new.debt_id
        or new.goal_id is not null then
        raise exception 'Recurring rule was not found for this transaction target.'
          using errcode = '23503';
      end if;
    end if;
  elsif tg_op = 'DELETE' and old.recurring_rule_id is not null then
    select *
    into v_rule
    from public.recurring_rules
    where id = old.recurring_rule_id
      and user_id = old.user_id
    for update;

    if not found then
      raise exception 'Recurring rule was not found for this transaction target.'
        using errcode = '23503';
    end if;
  end if;

  if tg_op = 'UPDATE'
    and old.amount_cents is not distinct from new.amount_cents
    and old.goal_id is not distinct from new.goal_id
    and old.debt_id is not distinct from new.debt_id then
    new.allocation_applied_cents := old.allocation_applied_cents;
    return new;
  end if;

  -- Global allocation lock order is recurring rule, debt, then goal (including
  -- goals implicitly linked through a debt). Direct debt edits inherently lock
  -- the debt first, so every RPC and trigger follows that same order.
  if tg_op = 'INSERT' then
    perform 1
    from public.debts
    where id = new.debt_id
      and user_id = new.user_id
    order by id
    for update;

    perform 1
    from public.goals
    where user_id = new.user_id
      and (id = new.goal_id or linked_debt_id = new.debt_id)
    order by id
    for update;
  elsif tg_op = 'UPDATE' then
    perform 1
    from public.debts
    where id in (old.debt_id, new.debt_id)
      and user_id = old.user_id
    order by id
    for update;

    perform 1
    from public.goals
    where user_id = old.user_id
      and (
        id in (old.goal_id, new.goal_id)
        or linked_debt_id in (old.debt_id, new.debt_id)
      )
    order by id
    for update;
  else
    perform 1
    from public.debts
    where id = old.debt_id
      and user_id = old.user_id
    order by id
    for update;

    perform 1
    from public.goals
    where user_id = old.user_id
      and (id = old.goal_id or linked_debt_id = old.debt_id)
    order by id
    for update;
  end if;

  if tg_op <> 'INSERT' and old.goal_id is not null then
    update public.goals
    set current_amount_cents = greatest(0, current_amount_cents - old.allocation_applied_cents),
        updated_at = now()
    where id = old.goal_id
      and user_id = old.user_id;
  end if;

  if tg_op <> 'INSERT' and old.debt_id is not null then
    update public.debts
    set current_balance_cents = current_balance_cents + old.allocation_applied_cents,
        updated_at = now()
    where id = old.debt_id
      and user_id = old.user_id;
  end if;

  if tg_op <> 'DELETE' and new.goal_id is not null then
    select *
    into v_goal
    from public.goals
    where id = new.goal_id
      and user_id = new.user_id
    for update;

    if not found or v_goal.is_archived then
      raise exception 'Goal was not found or is archived.'
        using errcode = 'P0002';
    end if;

    if v_goal.linked_debt_id is not null then
      raise exception 'Debt-payoff goal contributions must target the linked debt.'
        using errcode = '22023';
    end if;

    v_applied_cents := least(
      abs(new.amount_cents),
      greatest(0, v_goal.target_amount_cents - v_goal.current_amount_cents)
    );

    if tg_op <> 'INSERT' then
      update public.goals
      set current_amount_cents = least(
            target_amount_cents,
            current_amount_cents + v_applied_cents
          ),
          updated_at = now()
      where id = new.goal_id
        and user_id = new.user_id;
    end if;
  end if;

  if tg_op <> 'DELETE' and new.debt_id is not null then
    select *
    into v_debt
    from public.debts
    where id = new.debt_id
      and user_id = new.user_id
    for update;

    if not found or v_debt.is_archived then
      raise exception 'Debt was not found or is archived.'
        using errcode = 'P0002';
    end if;

    v_applied_cents := least(abs(new.amount_cents), v_debt.current_balance_cents);

    if tg_op <> 'INSERT' then
      update public.debts
      set current_balance_cents = greatest(0, current_balance_cents - v_applied_cents),
          updated_at = now()
      where id = new.debt_id
        and user_id = new.user_id;
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  new.allocation_applied_cents := v_applied_cents;
  return new;
end;
$$;

revoke all on function public.sync_transaction_allocation() from public, anon, authenticated;

-- Row-level BEFORE triggers run after PostgreSQL has selected/locked their
-- transaction tuple. Take all authenticated-user recurring-rule locks at
-- statement scope first so direct UPDATE/DELETE paths cannot invert the global
-- recurring-rule -> transaction -> debt -> goal order.
create or replace function public.lock_transaction_rules_before_mutation()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is not null then
    perform 1
    from public.recurring_rules
    where user_id = v_user_id
    order by id
    for update;
  end if;

  return null;
end;
$$;

revoke all on function public.lock_transaction_rules_before_mutation()
  from public, anon, authenticated;

create trigger transactions_lock_rules_before_mutation
  before update or delete on public.transactions
  for each statement
  execute function public.lock_transaction_rules_before_mutation();

create trigger recurring_rules_lock_rules_before_delete
  before delete on public.recurring_rules
  for each statement
  execute function public.lock_transaction_rules_before_mutation();

create trigger transactions_sync_allocation
  before insert or update or delete
  on public.transactions
  for each row
  execute function public.sync_transaction_allocation();

-- INSERT conflict resolution happens after BEFORE triggers. Apply balances in
-- an AFTER trigger so ON CONFLICT retries that insert no row have no financial
-- side effects. The BEFORE trigger already validated/locked the target and
-- stored the exact clamped delta on the row that was actually inserted.
create or replace function public.apply_inserted_transaction_allocation()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  if new.debt_id is not null then
    update public.debts
    set current_balance_cents = greatest(
          0,
          current_balance_cents - new.allocation_applied_cents
        ),
        updated_at = now()
    where id = new.debt_id
      and user_id = new.user_id;
  elsif new.goal_id is not null then
    update public.goals
    set current_amount_cents = least(
          target_amount_cents,
          current_amount_cents + new.allocation_applied_cents
        ),
        updated_at = now()
    where id = new.goal_id
      and user_id = new.user_id;
  end if;

  return new;
end;
$$;

revoke all on function public.apply_inserted_transaction_allocation()
  from public, anon, authenticated;

create trigger transactions_apply_inserted_allocation
  after insert on public.transactions
  for each row
  execute function public.apply_inserted_transaction_allocation();

create or replace function public.update_transaction_and_retarget(
  p_transaction_id uuid,
  p_amount_cents integer,
  p_kind public.transaction_kind,
  p_category text,
  p_transaction_date date,
  p_description text,
  p_notes text,
  p_goal_id uuid,
  p_debt_id uuid
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
  v_goal public.goals%rowtype;
  v_debt public.debts%rowtype;
  v_rule public.recurring_rules%rowtype;
  v_kind public.transaction_kind;
  v_category text;
begin
  if v_user_id is null then
    raise exception 'Authentication is required to update transactions.'
      using errcode = '28000';
  end if;
  if p_amount_cents is null or p_amount_cents <= 0 then
    raise exception 'Transaction amount must be greater than zero.'
      using errcode = '22023';
  end if;
  if p_transaction_date is null then
    raise exception 'Transaction date is required.' using errcode = '22023';
  end if;
  if p_kind is null then
    raise exception 'Transaction kind is required.' using errcode = '22023';
  end if;
  if p_goal_id is not null and p_debt_id is not null then
    raise exception 'A transaction can have at most one allocation target.'
      using errcode = '22023';
  end if;
  if char_length(coalesce(nullif(btrim(p_description), ''), 'x')) > 120
    or char_length(coalesce(nullif(btrim(p_category), ''), '')) not between 1 and 50
    or (p_notes is not null and char_length(p_notes) > 500) then
    raise exception 'Transaction text fields are invalid.' using errcode = '22023';
  end if;

  -- This RPC explicitly locks the transaction before issuing its UPDATE, so it
  -- must take the same statement-level rule locks first rather than relying on
  -- the UPDATE statement trigger after the transaction row is already held.
  perform 1
  from public.recurring_rules
  where user_id = v_user_id
  order by id
  for update;

  select *
  into v_transaction
  from public.transactions
  where id = p_transaction_id
    and user_id = v_user_id
  for update;

  if not found then
    raise exception 'Transaction was not found.' using errcode = 'P0002';
  end if;

  -- Preserve recurring identity and take its row lock before any target lock.
  if v_transaction.recurring_rule_id is not null then
    select * into v_rule
    from public.recurring_rules
    where id = v_transaction.recurring_rule_id and user_id = v_user_id
    for update;
    if not found or v_rule.debt_id is distinct from p_debt_id or p_goal_id is not null then
      raise exception 'A recurring transaction must retain its rule allocation target.'
        using errcode = '22023';
    end if;
  end if;

  if p_goal_id is not null then
    select * into v_goal
    from public.goals
    where id = p_goal_id and user_id = v_user_id and is_archived = false;
    if not found then
      raise exception 'Goal was not found or is archived.' using errcode = 'P0002';
    end if;
    if v_goal.linked_debt_id is not null then
      raise exception 'Debt-payoff goal contributions must target the linked debt.'
        using errcode = '22023';
    end if;
  end if;

  if p_debt_id is not null then
    select * into v_debt
    from public.debts
    where id = p_debt_id and user_id = v_user_id and is_archived = false;
    if not found then
      raise exception 'Debt was not found or is archived.' using errcode = 'P0002';
    end if;
  end if;

  v_kind := case when p_goal_id is not null or p_debt_id is not null
    then 'transfer'::public.transaction_kind else p_kind end;
  v_category := case
    when p_goal_id is not null then 'savings'
    when p_debt_id is not null then 'debt_payment'
    else btrim(p_category)
  end;

  update public.transactions
  set amount_cents = p_amount_cents,
      kind = v_kind,
      category = v_category,
      transaction_date = p_transaction_date,
      description = coalesce(nullif(btrim(p_description), ''), description),
      notes = nullif(btrim(p_notes), ''),
      goal_id = p_goal_id,
      debt_id = p_debt_id,
      updated_at = now()
  where id = v_transaction.id
    and user_id = v_user_id
  returning * into v_updated;

  return v_updated;
end;
$$;

revoke all on function public.update_transaction_and_retarget(
  uuid, integer, public.transaction_kind, text, date, text, text, uuid, uuid
) from public, anon;
grant execute on function public.update_transaction_and_retarget(
  uuid, integer, public.transaction_kind, text, date, text, text, uuid, uuid
) to authenticated;

comment on function public.update_transaction_and_retarget(
  uuid, integer, public.transaction_kind, text, date, text, text, uuid, uuid
) is 'Atomically updates an authenticated user transaction and moves it into, out of, or between one owned active allocation target without changing its source or recurring relationship.';

create or replace function public.create_quick_add_transaction(
  p_client_operation_id uuid,
  p_amount_cents integer,
  p_kind public.transaction_kind,
  p_category text,
  p_transaction_date date,
  p_description text,
  p_notes text,
  p_goal_id uuid,
  p_debt_id uuid
)
returns public.transactions
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_transaction public.transactions%rowtype;
  v_kind public.transaction_kind;
  v_category text;
  v_description text;
begin
  if v_user_id is null then
    raise exception 'Authentication is required to use quick add.' using errcode = '28000';
  end if;
  if p_client_operation_id is null then
    raise exception 'A quick-add operation id is required.' using errcode = '22023';
  end if;
  if p_amount_cents is null or p_amount_cents <= 0 then
    raise exception 'Quick-add amount must be greater than zero.' using errcode = '22023';
  end if;
  if p_transaction_date is null or p_kind is null then
    raise exception 'Quick-add kind and date are required.' using errcode = '22023';
  end if;
  if p_goal_id is not null and p_debt_id is not null then
    raise exception 'A quick add can have at most one allocation target.' using errcode = '22023';
  end if;
  if p_goal_id is null and p_debt_id is null and p_kind = 'transfer' then
    raise exception 'An unallocated quick add cannot be a transfer.' using errcode = '22023';
  end if;

  v_kind := case when p_goal_id is not null or p_debt_id is not null
    then 'transfer'::public.transaction_kind else p_kind end;
  v_category := case
    when p_goal_id is not null then 'savings'
    when p_debt_id is not null then 'debt_payment'
    else btrim(p_category)
  end;
  v_description := coalesce(nullif(btrim(p_description), ''), 'Quick add');

  if char_length(v_category) not between 1 and 50
    or char_length(v_description) > 120
    or (p_notes is not null and char_length(p_notes) > 500) then
    raise exception 'Quick-add text fields are invalid.' using errcode = '22023';
  end if;

  insert into public.transactions (
    user_id, amount_cents, kind, category, transaction_date, description,
    notes, source, goal_id, debt_id, client_operation_id
  ) values (
    v_user_id, p_amount_cents, v_kind, v_category, p_transaction_date,
    v_description, nullif(btrim(p_notes), ''), 'manual', p_goal_id,
    p_debt_id, p_client_operation_id
  )
  on conflict (user_id, client_operation_id)
  where client_operation_id is not null
  do nothing
  returning * into v_transaction;

  if not found then
    select *
    into v_transaction
    from public.transactions
    where user_id = v_user_id
      and client_operation_id = p_client_operation_id
    for update;

    if not found then
      raise exception 'Quick-add operation could not be loaded.' using errcode = 'P0002';
    end if;

    if v_transaction.amount_cents is distinct from p_amount_cents
      or v_transaction.kind is distinct from v_kind
      or v_transaction.category is distinct from v_category
      or v_transaction.transaction_date is distinct from p_transaction_date
      or v_transaction.description is distinct from v_description
      or v_transaction.notes is distinct from nullif(btrim(p_notes), '')
      or v_transaction.goal_id is distinct from p_goal_id
      or v_transaction.debt_id is distinct from p_debt_id then
      raise exception 'Quick-add operation id was already used for different input.'
        using errcode = '22023';
    end if;
  end if;

  return v_transaction;
end;
$$;

revoke all on function public.create_quick_add_transaction(
  uuid, integer, public.transaction_kind, text, date, text, text, uuid, uuid
) from public, anon;
grant execute on function public.create_quick_add_transaction(
  uuid, integer, public.transaction_kind, text, date, text, text, uuid, uuid
) to authenticated;

comment on function public.create_quick_add_transaction(
  uuid, integer, public.transaction_kind, text, date, text, text, uuid, uuid
) is 'Creates one authenticated quick-add transaction per client operation id and returns the existing row on an identical retry.';

create or replace function public.get_transaction_summary(
  p_from date default null,
  p_to date default null,
  p_category text default null,
  p_debt_id uuid default null,
  p_kind public.transaction_kind default null,
  p_amount_min_cents integer default null,
  p_amount_max_cents integer default null,
  p_search text default null
)
returns table (
  income_cents bigint,
  expense_cents bigint,
  net_cents bigint,
  transaction_count bigint
)
language plpgsql
stable
security invoker
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_search text;
begin
  if v_user_id is null then
    raise exception 'Authentication is required to summarize transactions.'
      using errcode = '28000';
  end if;
  if p_from is not null and p_to is not null and p_from > p_to then
    raise exception 'Start date must be before end date.' using errcode = '22023';
  end if;
  if p_amount_min_cents is not null and p_amount_min_cents < 0
    or p_amount_max_cents is not null and p_amount_max_cents < 0
    or p_amount_min_cents is not null and p_amount_max_cents is not null
      and p_amount_min_cents > p_amount_max_cents then
    raise exception 'Amount filters are invalid.' using errcode = '22023';
  end if;
  if p_category is not null and char_length(p_category) > 50 then
    raise exception 'Category filter is invalid.' using errcode = '22023';
  end if;
  if p_search is not null and char_length(p_search) > 80 then
    raise exception 'Search filter is invalid.' using errcode = '22023';
  end if;

  -- Match the list query sanitizer: %, commas, and parentheses become spaces;
  -- repeated whitespace collapses; matching is case-insensitive across the
  -- description, category, and nullable notes fields.
  v_search := nullif(
    btrim(regexp_replace(regexp_replace(coalesce(p_search, ''), '[%,()]', ' ', 'g'), '\s+', ' ', 'g')),
    ''
  );

  return query
  select
    coalesce(sum(abs(t.amount_cents::bigint)) filter (where t.kind = 'income'), 0)::bigint,
    coalesce(sum(abs(t.amount_cents::bigint)) filter (where t.kind = 'expense'), 0)::bigint,
    coalesce(sum(
      case
        when t.kind = 'income' then abs(t.amount_cents::bigint)
        when t.kind = 'expense' then -abs(t.amount_cents::bigint)
        else 0
      end
    ), 0)::bigint,
    count(*)::bigint
  from public.transactions t
  where t.user_id = v_user_id
    and (p_from is null or t.transaction_date >= p_from)
    and (p_to is null or t.transaction_date <= p_to)
    and (p_category is null or t.category = p_category)
    and (p_debt_id is null or t.debt_id = p_debt_id)
    and (p_kind is null or t.kind = p_kind)
    -- Amount bounds intentionally compare stored cents, exactly like the list;
    -- only displayed totals use magnitude via abs().
    and (p_amount_min_cents is null or t.amount_cents >= p_amount_min_cents)
    and (p_amount_max_cents is null or t.amount_cents <= p_amount_max_cents)
    and (
      v_search is null
      or t.description ilike '%' || v_search || '%'
      or t.category ilike '%' || v_search || '%'
      or t.notes ilike '%' || v_search || '%'
    );
end;
$$;

revoke all on function public.get_transaction_summary(
  date, date, text, uuid, public.transaction_kind, integer, integer, text
) from public, anon;
grant execute on function public.get_transaction_summary(
  date, date, text, uuid, public.transaction_kind, integer, integer, text
) to authenticated;

comment on function public.get_transaction_summary(
  date, date, text, uuid, public.transaction_kind, integer, integer, text
) is 'Returns integer-cent income, expense, net, and count across all authenticated-user transactions matching the same filters as the paginated list; transfers contribute zero to all monetary totals.';

-- Keep the established RPC signatures while delegating allocation math to the
-- transaction trigger, so each inserted/updated/deleted row is applied once.
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
begin
  if v_user_id is null then
    raise exception 'Authentication is required to allocate goal contributions.' using errcode = '28000';
  end if;
  if p_amount_cents is null or p_amount_cents <= 0 then
    raise exception 'Goal contribution amount must be greater than zero.' using errcode = '22023';
  end if;

  select * into v_goal
  from public.goals
  where id = p_goal_id and user_id = v_user_id and is_archived = false
  for update;
  if not found then
    raise exception 'Goal was not found or is archived.' using errcode = 'P0002';
  end if;
  if v_goal.linked_debt_id is not null then
    raise exception 'Debt-payoff goal contributions must target the linked debt.' using errcode = '22023';
  end if;

  insert into public.transactions (
    user_id, amount_cents, kind, category, transaction_date, description,
    notes, source, goal_id
  ) values (
    v_user_id, p_amount_cents, 'transfer', 'savings', p_transaction_date,
    coalesce(nullif(btrim(p_description), ''), 'Goal contribution: ' || v_goal.name),
    nullif(btrim(p_notes), ''), 'manual', v_goal.id
  ) returning * into v_transaction;

  return v_transaction;
end;
$$;

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
  v_rule public.recurring_rules%rowtype;
  v_transaction public.transactions%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication is required to allocate debt payments.' using errcode = '28000';
  end if;
  if p_amount_cents is null or p_amount_cents <= 0 then
    raise exception 'Debt payment amount must be greater than zero.' using errcode = '22023';
  end if;
  if p_source not in ('manual', 'recurring') then
    raise exception 'Debt payments can only be manual or recurring transactions.' using errcode = '22023';
  end if;

  if p_recurring_rule_id is not null then
    select * into v_rule
    from public.recurring_rules
    where id = p_recurring_rule_id
      and user_id = v_user_id
      and debt_id = p_debt_id
    for update;
    if not found then
      raise exception 'Recurring rule was not found for this debt.' using errcode = 'P0002';
    end if;
  end if;

  select * into v_debt
  from public.debts
  where id = p_debt_id and user_id = v_user_id and is_archived = false
  for update;
  if not found then
    raise exception 'Debt was not found or is archived.' using errcode = 'P0002';
  end if;

  insert into public.transactions (
    user_id, amount_cents, kind, category, transaction_date, description,
    notes, source, debt_id, recurring_rule_id
  ) values (
    v_user_id, p_amount_cents, 'transfer', 'debt_payment', p_transaction_date,
    coalesce(nullif(btrim(p_description), ''), 'Debt payment: ' || v_debt.name),
    nullif(btrim(p_notes), ''), p_source, v_debt.id, p_recurring_rule_id
  )
  on conflict (recurring_rule_id, transaction_date)
  where recurring_rule_id is not null
  do nothing
  returning * into v_transaction;

  if not found then
    select * into v_transaction
    from public.transactions
    where recurring_rule_id = p_recurring_rule_id
      and transaction_date = p_transaction_date
      and user_id = v_user_id
      and debt_id = v_debt.id;
    if not found then
      raise exception 'Debt payment already exists but could not be loaded.' using errcode = 'P0002';
    end if;
  end if;

  return v_transaction;
end;
$$;

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
  v_updated public.transactions%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication is required to update transactions.' using errcode = '28000';
  end if;
  if p_amount_cents is null or p_amount_cents <= 0 then
    raise exception 'Goal contribution amount must be greater than zero.' using errcode = '22023';
  end if;

  update public.transactions
  set amount_cents = p_amount_cents,
      kind = 'transfer',
      category = 'savings',
      transaction_date = p_transaction_date,
      description = coalesce(nullif(btrim(p_description), ''), description),
      notes = nullif(btrim(p_notes), ''),
      updated_at = now()
  where id = p_transaction_id and user_id = v_user_id and goal_id is not null
  returning * into v_updated;

  if not found then
    raise exception 'Goal contribution transaction was not found.' using errcode = 'P0002';
  end if;
  return v_updated;
end;
$$;

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
  v_updated public.transactions%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication is required to update transactions.' using errcode = '28000';
  end if;
  if p_amount_cents is null or p_amount_cents <= 0 then
    raise exception 'Debt payment amount must be greater than zero.' using errcode = '22023';
  end if;

  update public.transactions
  set amount_cents = p_amount_cents,
      kind = 'transfer',
      category = 'debt_payment',
      transaction_date = p_transaction_date,
      description = coalesce(nullif(btrim(p_description), ''), description),
      notes = nullif(btrim(p_notes), ''),
      updated_at = now()
  where id = p_transaction_id and user_id = v_user_id and debt_id is not null
  returning * into v_updated;

  if not found then
    raise exception 'Debt payment transaction was not found.' using errcode = 'P0002';
  end if;
  return v_updated;
end;
$$;

create or replace function public.delete_transaction_and_rebalance_goal(p_transaction_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_deleted_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication is required to delete transactions.' using errcode = '28000';
  end if;

  delete from public.transactions
  where id = p_transaction_id and user_id = v_user_id
  returning id into v_deleted_id;
  if not found then
    raise exception 'Transaction was not found.' using errcode = 'P0002';
  end if;
  return v_deleted_id;
end;
$$;

-- Existing public RPC grants are restated explicitly because CREATE OR REPLACE
-- preserves privileges but the migration must remain least-privilege on its own.
revoke all on function public.allocate_goal_contribution(uuid, integer, date, text, text) from public, anon;
revoke all on function public.allocate_debt_payment(uuid, integer, date, text, text, public.transaction_source, uuid) from public, anon;
revoke all on function public.update_goal_contribution_transaction(uuid, integer, date, text, text) from public, anon;
revoke all on function public.update_debt_payment_transaction(uuid, integer, date, text, text) from public, anon;
revoke all on function public.delete_transaction_and_rebalance_goal(uuid) from public, anon;
grant execute on function public.allocate_goal_contribution(uuid, integer, date, text, text) to authenticated;
grant execute on function public.allocate_debt_payment(uuid, integer, date, text, text, public.transaction_source, uuid) to authenticated;
grant execute on function public.update_goal_contribution_transaction(uuid, integer, date, text, text) to authenticated;
grant execute on function public.update_debt_payment_transaction(uuid, integer, date, text, text) to authenticated;
grant execute on function public.delete_transaction_and_rebalance_goal(uuid) to authenticated;

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
  -- Acquire all due rule locks in one stable global order before any debt or
  -- linked-goal work. The processing order below may still prioritize dates.
  perform 1
  from public.recurring_rules
  where is_active = true
    and next_run_date <= p_through
    and (p_user_id is null or user_id = p_user_id)
  order by user_id, id
  for update;

  for v_rule in
    select *
    from public.recurring_rules
    where is_active = true
      and next_run_date <= p_through
      and (p_user_id is null or user_id = p_user_id)
    order by user_id, next_run_date, id
  loop
    if v_rule.debt_id is not null and not exists (
      select 1 from public.debts
      where id = v_rule.debt_id
        and user_id = v_rule.user_id
        and is_archived = false
    ) then
      update public.recurring_rules
      set is_active = false, updated_at = now()
      where id = v_rule.id and user_id = v_rule.user_id;
      continue;
    end if;

    v_next_run := v_rule.next_run_date;
    while v_next_run <= p_through loop
      if v_processed_occurrences >= v_max then
        v_limited := true;
        exit;
      end if;

      insert into public.transactions (
        user_id, amount_cents, kind, category, transaction_date, description,
        notes, source, recurring_rule_id, debt_id
      ) values (
        v_rule.user_id,
        v_rule.amount_cents,
        case when v_rule.debt_id is not null then 'transfer'::public.transaction_kind else v_rule.kind end,
        case when v_rule.debt_id is not null then 'debt_payment' else v_rule.category end,
        v_next_run, v_rule.description, v_rule.notes, 'recurring', v_rule.id,
        v_rule.debt_id
      )
      on conflict (recurring_rule_id, transaction_date)
      where recurring_rule_id is not null
      do nothing;

      get diagnostics v_inserted = row_count;
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
        v_last_day := extract(day from (
          date_trunc('month', v_month_start)::date + interval '1 month - 1 day'
        ))::int;
        v_next_run := make_date(
          extract(year from v_month_start)::int,
          extract(month from v_month_start)::int,
          least(v_desired_day, v_last_day)
        );
      end if;
    end loop;

    update public.recurring_rules
    set next_run_date = v_next_run, updated_at = now()
    where id = v_rule.id and user_id = v_rule.user_id;
    v_rules_advanced := v_rules_advanced + 1;

    if v_limited then exit; end if;
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

revoke all on function public.process_due_recurring_rules(uuid, date) from public, anon, authenticated;
grant execute on function public.process_due_recurring_rules(uuid, date) to service_role;

comment on function public.process_due_recurring_rules(uuid, date)
  is 'Processes due recurring transaction rules idempotently; the transaction allocation trigger applies each newly inserted debt payment exactly once.';

create or replace function public.delete_debt_permanently(p_debt_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Authentication is required to delete debts.' using errcode = '28000';
  end if;
  perform 1
  from public.recurring_rules
  where user_id = v_user_id
  order by id
  for update;

  update public.recurring_rules
  set debt_id = null, is_active = false, updated_at = now()
  where debt_id = p_debt_id and user_id = v_user_id;

  perform 1
  from public.debts
  where id = p_debt_id and user_id = v_user_id
  for update;
  if not found then
    raise exception 'Debt was not found.' using errcode = 'P0002';
  end if;

  -- Freeze the linked goal at its last derived progress before historical
  -- transaction unlinking reverses allocations on the soon-to-be-deleted debt.
  update public.goals
  set linked_debt_id = null, updated_at = now()
  where linked_debt_id = p_debt_id and user_id = v_user_id;

  update public.transactions
  set debt_id = null, updated_at = now()
  where debt_id = p_debt_id and user_id = v_user_id;

  delete from public.debts
  where id = p_debt_id and user_id = v_user_id;

  return p_debt_id;
end;
$$;

revoke all on function public.delete_debt_permanently(uuid) from public, anon;
grant execute on function public.delete_debt_permanently(uuid) to authenticated;

comment on function public.delete_debt_permanently(uuid)
  is 'Permanently deletes an authenticated user debt while preserving linked-goal progress, unlinking historical transactions, and pausing linked recurring rules.';
