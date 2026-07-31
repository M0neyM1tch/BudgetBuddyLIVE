-- DO NOT RUN ON PRODUCTION.
-- Rollback-only verification for a separately authorized ordinary Free-plan
-- restore-rehearsal project containing the two Product/UX-Follow-Ups-2
-- migrations. Run as the project database owner with psql ON_ERROR_STOP=1.
-- This script creates only reserved synthetic users/data and always rolls back.
-- It intentionally does not embed a URL, key, token, password, or project ref.

begin;

do $$
begin
  if exists (
    select 1 from auth.users
    where id in (
      '00000000-0000-0000-0000-000000000101'::uuid,
      '00000000-0000-0000-0000-000000000102'::uuid
    )
  ) then
    raise exception 'Reserved synthetic user ids already exist; aborting.';
  end if;
end;
$$;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000101',
    'authenticated', 'authenticated', 'ux2-owner@example.invalid', '', now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(),
    '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000102',
    'authenticated', 'authenticated', 'ux2-other@example.invalid', '', now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(),
    '', '', '', ''
  );

insert into public.goals (
  id, user_id, name, target_amount_cents, starting_balance_cents,
  current_amount_cents, goal_type, is_archived
) values
  ('10000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000101',
   'Synthetic owner goal', 10000, 0, 0, 'general_savings', false),
  ('10000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000102',
   'Synthetic other goal', 10000, 0, 0, 'general_savings', false),
  ('10000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000101',
   'Synthetic archived goal', 10000, 0, 0, 'general_savings', true);

insert into public.debts (
  id, user_id, name, debt_type, principal_cents, current_balance_cents,
  interest_rate_basis_points, payment_frequency, minimum_payment_cents,
  is_archived
) values
  ('20000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000101',
   'Synthetic owner debt', 'credit_card', 10000, 8000, 1000, 'monthly', 500, false),
  ('20000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000102',
   'Synthetic other debt', 'credit_card', 10000, 8000, 1000, 'monthly', 500, false),
  ('20000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000101',
   'Synthetic archived debt', 'credit_card', 10000, 8000, 1000, 'monthly', 500, true);

-- Schema, RLS, and grants are separate assertions.
do $$
declare
  v_table text;
begin
  foreach v_table in array array['goals', 'debts', 'recurring_rules', 'transactions']
  loop
    if not exists (
      select 1
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname = v_table
        and c.relrowsecurity
    ) then
      raise exception 'RLS is not enabled on public.%', v_table;
    end if;
  end loop;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.transactions'::regclass
      and conname = 'transactions_single_allocation_target_check'
      and contype = 'c'
  ) or not exists (
    select 1 from pg_constraint
    where conrelid = 'public.transactions'::regclass
      and conname = 'transactions_allocation_target_semantics_check'
      and contype = 'c'
  ) or not exists (
    select 1 from pg_constraint
    where conrelid = 'public.recurring_rules'::regclass
      and conname = 'recurring_rules_debt_target_semantics_check'
      and contype = 'c'
  ) then
    raise exception 'Required allocation semantic constraints are missing.';
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.transactions'::regclass
      and conname = 'transactions_goal_owner_fkey'
      and contype = 'f'
  ) or not exists (
    select 1 from pg_constraint
    where conrelid = 'public.transactions'::regclass
      and conname = 'transactions_debt_owner_fkey'
      and contype = 'f'
  ) or not exists (
    select 1 from pg_constraint
    where conrelid = 'public.transactions'::regclass
      and conname = 'transactions_recurring_rule_owner_fkey'
      and contype = 'f'
  ) then
    raise exception 'Required same-owner foreign keys are missing.';
  end if;

  if (select count(*) from pg_policies
      where schemaname = 'public'
        and tablename = 'transactions'
        and roles = array['authenticated']::name[]
        and cmd in ('SELECT', 'INSERT', 'UPDATE', 'DELETE')) <> 4
    or not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'transactions'
        and cmd = 'UPDATE'
        and qual is not null
        and with_check is not null
    ) then
    raise exception 'Transaction owner RLS policies are incomplete.';
  end if;

  if not (
    has_table_privilege('authenticated', 'public.transactions', 'SELECT')
    and has_table_privilege('authenticated', 'public.transactions', 'INSERT')
    and has_table_privilege('authenticated', 'public.transactions', 'UPDATE')
    and has_table_privilege('authenticated', 'public.transactions', 'DELETE')
  ) then
    raise exception 'Authenticated transaction table grants are incomplete.';
  end if;

  if has_table_privilege('anon', 'public.transactions', 'SELECT')
    or has_table_privilege('anon', 'public.transactions', 'INSERT')
    or has_table_privilege('anon', 'public.transactions', 'UPDATE')
    or has_table_privilege('anon', 'public.transactions', 'DELETE') then
    raise exception 'Anon unexpectedly has a transaction table privilege.';
  end if;

  if not has_function_privilege(
    'authenticated',
    'public.create_quick_add_transaction(uuid,integer,public.transaction_kind,text,date,text,text,uuid,uuid)',
    'EXECUTE'
  ) or not has_function_privilege(
    'authenticated',
    'public.update_transaction_and_retarget(uuid,integer,public.transaction_kind,text,date,text,text,uuid,uuid)',
    'EXECUTE'
  ) or not has_function_privilege(
    'authenticated',
    'public.get_transaction_summary(date,date,text,uuid,public.transaction_kind,integer,integer,text)',
    'EXECUTE'
  ) then
    raise exception 'Authenticated RPC execute grants are incomplete.';
  end if;

  if has_function_privilege(
    'anon',
    'public.create_quick_add_transaction(uuid,integer,public.transaction_kind,text,date,text,text,uuid,uuid)',
    'EXECUTE'
  ) or has_function_privilege(
    'authenticated',
    'public.process_due_recurring_rules(uuid,date)',
    'EXECUTE'
  ) or not has_function_privilege(
    'service_role',
    'public.process_due_recurring_rules(uuid,date)',
    'EXECUTE'
  ) then
    raise exception 'Privileged function grants are not least-privilege.';
  end if;
end;
$$;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000101', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000101","role":"authenticated"}',
  true
);

insert into public.transactions (
  id, user_id, transaction_date, description, amount_cents, kind, category
) values (
  '30000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000101',
  '2030-01-01', 'Synthetic owner ordinary', 1000, 'expense', 'other'
);

do $$
declare
  v_rejected boolean := false;
begin
  begin
    insert into public.transactions (
      user_id, transaction_date, description, amount_cents, kind, category
    ) values (
      '00000000-0000-0000-0000-000000000101', '2030-01-01',
      'Synthetic fresh unallocated transfer', 1000, 'transfer', 'other'
    );
  exception when invalid_parameter_value then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'Direct insert created a fresh unallocated transfer.';
  end if;

  v_rejected := false;
  begin
    update public.transactions
    set kind = 'transfer'
    where id = '30000000-0000-0000-0000-000000000101';
  exception when invalid_parameter_value then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'Direct update converted an ordinary row to an unallocated transfer.';
  end if;

  v_rejected := false;
  begin
    insert into public.transactions (
      user_id, transaction_date, description, amount_cents, kind, category
    ) values (
      '00000000-0000-0000-0000-000000000102', '2030-01-01',
      'Synthetic forged owner', 1000, 'expense', 'other'
    );
  exception when insufficient_privilege then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'Insert ownership forgery was not rejected.';
  end if;

  v_rejected := false;
  begin
    update public.transactions
    set user_id = '00000000-0000-0000-0000-000000000102'
    where id = '30000000-0000-0000-0000-000000000101';
  exception when insufficient_privilege or foreign_key_violation then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'Owner reassignment was not rejected.';
  end if;
end;
$$;

-- Target unlinking must preserve history, and a row already unlinked by that
-- workflow remains editable without reopening fresh-transfer creation.
insert into public.transactions (
  id, user_id, transaction_date, description, amount_cents, kind, category, goal_id
) values (
  '30000000-0000-0000-0000-000000000102',
  '00000000-0000-0000-0000-000000000101', '2030-01-01',
  'Synthetic allocation to unlink', 1000, 'transfer', 'savings',
  '10000000-0000-0000-0000-000000000101'
);

update public.transactions
set goal_id = null
where id = '30000000-0000-0000-0000-000000000102';

update public.transactions
set description = 'Synthetic preserved unlinked history'
where id = '30000000-0000-0000-0000-000000000102';

do $$
begin
  if not exists (
    select 1 from public.transactions
    where id = '30000000-0000-0000-0000-000000000102'
      and goal_id is null
      and debt_id is null
      and kind = 'transfer'
      and description = 'Synthetic preserved unlinked history'
  ) then
    raise exception 'Targeted-to-unlinked historical transfer preservation failed.';
  end if;
end;
$$;

-- Every invalid target semantic must fail even through direct Data API grants.
do $$
declare
  v_case integer;
  v_rejected boolean;
begin
  for v_case in 1..5 loop
    v_rejected := false;
    begin
      insert into public.transactions (
        user_id, transaction_date, description, amount_cents, kind, category,
        goal_id, debt_id
      ) values (
        '00000000-0000-0000-0000-000000000101', '2030-01-02',
        'Synthetic invalid semantic', 1000,
        case when v_case in (1, 3) then 'income'::public.transaction_kind else 'transfer' end,
        case
          when v_case = 1 then 'savings'
          when v_case = 2 then 'other'
          when v_case = 3 then 'debt_payment'
          when v_case = 4 then 'other'
          else 'savings'
        end,
        case
          when v_case in (1, 2, 5) then '10000000-0000-0000-0000-000000000101'::uuid
          else null
        end,
        case
          when v_case in (3, 4, 5) then '20000000-0000-0000-0000-000000000101'::uuid
          else null
        end
      );
    exception when check_violation then
      v_rejected := true;
    end;
    if not v_rejected then
      raise exception 'Invalid transaction semantic case % was not rejected.', v_case;
    end if;
  end loop;
end;
$$;

do $$
declare
  v_rejected boolean;
  v_target uuid;
begin
  foreach v_target in array array[
    '10000000-0000-0000-0000-000000000102'::uuid,
    '10000000-0000-0000-0000-000000000103'::uuid
  ] loop
    v_rejected := false;
    begin
      insert into public.transactions (
        user_id, transaction_date, description, amount_cents, kind, category, goal_id
      ) values (
        '00000000-0000-0000-0000-000000000101', '2030-01-03',
        'Synthetic forbidden goal', 1000, 'transfer', 'savings', v_target
      );
    exception when insufficient_privilege or foreign_key_violation
      or no_data_found or raise_exception then
      v_rejected := true;
    end;
    if not v_rejected then
      raise exception 'Foreign or archived goal % was not rejected.', v_target;
    end if;
  end loop;

  foreach v_target in array array[
    '20000000-0000-0000-0000-000000000102'::uuid,
    '20000000-0000-0000-0000-000000000103'::uuid
  ] loop
    v_rejected := false;
    begin
      insert into public.transactions (
        user_id, transaction_date, description, amount_cents, kind, category, debt_id
      ) values (
        '00000000-0000-0000-0000-000000000101', '2030-01-03',
        'Synthetic forbidden debt', 1000, 'transfer', 'debt_payment', v_target
      );
    exception when insufficient_privilege or foreign_key_violation
      or no_data_found or raise_exception then
      v_rejected := true;
    end;
    if not v_rejected then
      raise exception 'Foreign or archived debt % was not rejected.', v_target;
    end if;
  end loop;
end;
$$;

do $$
declare
  v_rejected boolean := false;
begin
  begin
    insert into public.recurring_rules (
      user_id, description, amount_cents, kind, category, frequency,
      start_date, next_run_date, debt_id
    ) values (
      '00000000-0000-0000-0000-000000000101', 'Synthetic invalid debt rule',
      1000, 'expense', 'other', 'monthly', '2030-01-01', '2030-01-01',
      '20000000-0000-0000-0000-000000000101'
    );
  exception when check_violation then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'Invalid debt recurring-rule semantics were not rejected.';
  end if;
end;
$$;

-- Debt deletion may unlink only while pausing the rule. A targetless transfer
-- rule cannot remain active or be reactivated through direct Data API writes.
insert into public.recurring_rules (
  id, user_id, description, amount_cents, kind, category, frequency,
  start_date, next_run_date, is_active, debt_id
) values (
  '50000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000101', 'Synthetic rule to unlink',
  1000, 'transfer', 'debt_payment', 'monthly', '2030-01-01', '2030-01-01',
  true, '20000000-0000-0000-0000-000000000101'
);

update public.recurring_rules
set debt_id = null, is_active = false
where id = '50000000-0000-0000-0000-000000000101';

do $$
declare
  v_rejected boolean := false;
begin
  begin
    update public.recurring_rules
    set is_active = true
    where id = '50000000-0000-0000-0000-000000000101';
  exception when check_violation then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'A targetless transfer rule was reactivated.';
  end if;

  v_rejected := false;
  begin
    insert into public.recurring_rules (
      user_id, description, amount_cents, kind, category, frequency,
      start_date, next_run_date, is_active
    ) values (
      '00000000-0000-0000-0000-000000000101', 'Synthetic active unallocated rule',
      1000, 'transfer', 'debt_payment', 'monthly', '2030-01-01', '2030-01-01', true
    );
  exception when check_violation then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'Direct insert created an active targetless transfer rule.';
  end if;
end;
$$;

do $$
declare
  v_rejected boolean := false;
begin
  begin
    perform public.create_quick_add_transaction(
      '40000000-0000-0000-0000-000000000101', 1000, 'expense', 'other',
      '2030-01-04', repeat('x', 121), null, null, null
    );
  exception when invalid_parameter_value then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'The 120-character quick-add description limit was not enforced.';
  end if;

  v_rejected := false;
  begin
    perform public.create_quick_add_transaction(
      '40000000-0000-0000-0000-000000000103', 1000, 'transfer', 'other',
      '2030-01-04', 'Synthetic unallocated transfer', null, null, null
    );
  exception when invalid_parameter_value then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'Quick add accepted a new unallocated transfer.';
  end if;

  v_rejected := false;
  begin
    perform public.update_transaction_and_retarget(
      '30000000-0000-0000-0000-000000000101', 1000, 'expense', 'other',
      '2030-01-01', repeat('x', 121), null, null, null
    );
  exception when invalid_parameter_value then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'The 120-character retarget description limit was not enforced.';
  end if;
end;
$$;

reset role;

-- Second authenticated user sees no owner rows through RLS despite table grants.
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000102', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000102","role":"authenticated"}',
  true
);

do $$
begin
  if exists (
    select 1 from public.transactions
    where id = '30000000-0000-0000-0000-000000000101'
  ) then
    raise exception 'Cross-user transaction SELECT was not denied by RLS.';
  end if;
end;
$$;

reset role;

-- Anon is denied by grants; RLS is not being mistaken for a table grant.
set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claims', '{"role":"anon"}', true);

do $$
declare
  v_rejected boolean := false;
begin
  begin
    perform 1 from public.transactions limit 1;
  exception when insufficient_privilege then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'Anon transaction table access was not denied.';
  end if;

  v_rejected := false;
  begin
    perform public.create_quick_add_transaction(
      '40000000-0000-0000-0000-000000000102', 1000, 'expense', 'other',
      '2030-01-04', 'Synthetic anon attempt', null, null, null
    );
  exception when insufficient_privilege then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'Anon quick-add execute was not denied.';
  end if;
end;
$$;

reset role;
rollback;
