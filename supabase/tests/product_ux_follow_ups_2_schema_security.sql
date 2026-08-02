-- DO NOT RUN ON PRODUCTION.
-- Rollback-only verification for a separately authorized ordinary Free-plan
-- restore-rehearsal project after candidate 1 and its onboarding remediation.
-- Candidate-2-only assertions run conditionally when candidate 2 is present.
-- Run as the project database owner with psql ON_ERROR_STOP=1.
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

  if to_regprocedure(
    'public.get_transaction_summary(date,date,text,uuid,public.transaction_kind,integer,integer,text)'
  ) is not null then
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
  end if;

  if not exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    join pg_roles r on r.oid = p.proowner
    where n.nspname = 'public'
      and p.oid = to_regprocedure(
        'public.create_goal_pack_onboarding_setup_v2(text,text,text,integer,integer,date,text,integer,integer,integer,text,jsonb,text,text,text,text,text,integer,integer,text,text,text,text,jsonb,text,timestamptz,text,public.debt_type,integer,integer,integer,integer,public.payment_frequency,text,text,date)'
      )
      and r.rolname = 'postgres'
      and not p.prosecdef
      and p.proconfig = array['search_path=public, pg_temp']::text[]
  ) then
    raise exception 'Onboarding v2 owner, invoker security, or search path changed.';
  end if;

  if not has_function_privilege(
    'authenticated',
    'public.create_goal_pack_onboarding_setup_v2(text,text,text,integer,integer,date,text,integer,integer,integer,text,jsonb,text,text,text,text,text,integer,integer,text,text,text,text,jsonb,text,timestamptz,text,public.debt_type,integer,integer,integer,integer,public.payment_frequency,text,text,date)',
    'EXECUTE'
  ) or has_function_privilege(
    'anon',
    'public.create_goal_pack_onboarding_setup_v2(text,text,text,integer,integer,date,text,integer,integer,integer,text,jsonb,text,text,text,text,text,integer,integer,text,text,text,text,jsonb,text,timestamptz,text,public.debt_type,integer,integer,integer,integer,public.payment_frequency,text,text,date)',
    'EXECUTE'
  ) then
    raise exception 'Onboarding v2 execute grants changed.';
  end if;
end;
$$;

-- The onboarding RPC must reject an authenticated database role without an
-- authenticated JWT subject before it can create any setup rows.
set local role authenticated;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claims', '{"role":"authenticated"}', true);

do $$
declare
  v_rejected boolean := false;
begin
  begin
    perform public.create_goal_pack_onboarding_setup_v2(
      p_goal_name => 'Synthetic unauthenticated onboarding',
      p_goal_color => null,
      p_goal_icon => 'target',
      p_target_amount_cents => 10000,
      p_starting_balance_cents => 0,
      p_target_date => '2031-12-31',
      p_goal_type => 'debt_payoff',
      p_priority_rank => 1,
      p_monthly_commitment_cents => 500,
      p_confidence_score => 80,
      p_plan_status => 'active',
      p_planning_rules => '{}'::jsonb,
      p_top_priority_type => 'debt_payoff',
      p_horizon => 'medium_term',
      p_country_code => 'US',
      p_region_code => null,
      p_currency_code => 'USD',
      p_monthly_income_cents => 500000,
      p_monthly_expenses_cents => 300000,
      p_action_type => 'pay_debt',
      p_action_title => 'Synthetic first payment',
      p_debt_name => 'Synthetic unauthenticated debt',
      p_debt_principal_cents => 10000,
      p_debt_current_balance_cents => 7000,
      p_debt_interest_rate_basis_points => 1200,
      p_debt_minimum_payment_cents => 500
    );
  exception when sqlstate '28000' then
    v_rejected := true;
  end;

  if not v_rejected then
    raise exception 'Onboarding v2 accepted an unauthenticated invocation.';
  end if;
end;
$$;

reset role;

-- Exercise the JSON compatibility contract through the authenticated RPC.
-- All setup rows are synthetic and remain inside this script's rollback.
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000101', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000101","role":"authenticated"}',
  true
);

do $$
declare
  v_case integer;
  v_rules jsonb;
  v_result jsonb;
  v_goal public.goals%rowtype;
  v_debt public.debts%rowtype;
  v_owner_goal_id uuid;
  v_owner_debt_id uuid;
  v_other_debt_id uuid;
  v_interest integer;
  v_minimum integer;
  v_legacy_rules jsonb;
begin
  for v_case in 1..5 loop
    v_rules := case v_case
      when 1 then '{}'::jsonb
      when 2 then '{"unrelatedTopLevel":"preserve-me"}'::jsonb
      when 3 then '{
        "unrelatedTopLevel":"preserve-me",
        "onboarding":{
          "unrelatedSibling":"preserve-me-too",
          "debtId":"stale-value",
          "debtInterestRateBasisPoints":1,
          "debtMinimumPaymentCents":1,
          "debtType":"other"
        }
      }'::jsonb
      when 4 then '{
        "unrelatedTopLevel":"preserve-me",
        "onboarding":["legacy-non-object"]
      }'::jsonb
      else null
    end;
    v_interest := 1200 + v_case;
    v_minimum := 500 + v_case;

    v_result := public.create_goal_pack_onboarding_setup_v2(
      p_goal_name => 'Synthetic onboarding debt goal',
      p_goal_color => null,
      p_goal_icon => 'target',
      p_target_amount_cents => 10000,
      p_starting_balance_cents => 0,
      p_target_date => '2031-12-31',
      p_goal_type => 'debt_payoff',
      p_priority_rank => 1,
      p_monthly_commitment_cents => 500,
      p_confidence_score => 80,
      p_plan_status => 'active',
      p_planning_rules => v_rules,
      p_top_priority_type => 'debt_payoff',
      p_horizon => 'medium_term',
      p_country_code => 'US',
      p_region_code => null,
      p_currency_code => 'USD',
      p_monthly_income_cents => 500000,
      p_monthly_expenses_cents => 300000,
      p_action_type => 'pay_debt',
      p_action_title => 'Synthetic first payment',
      p_debt_name => 'Synthetic onboarding debt',
      p_debt_type => 'credit_card',
      p_debt_principal_cents => 10000,
      p_debt_current_balance_cents => 7000,
      p_debt_interest_rate_basis_points => v_interest,
      p_debt_minimum_payment_cents => v_minimum,
      p_debt_payment_frequency => 'monthly'
    );

    select * into strict v_goal
    from public.goals g
    where g.id = (v_result ->> 'goal_id')::uuid;

    select * into strict v_debt
    from public.debts d
    where d.id = (v_result ->> 'debt_id')::uuid;

    if v_case = 1 then
      v_owner_goal_id := v_goal.id;
      v_owner_debt_id := v_debt.id;
    elsif v_goal.id is distinct from v_owner_goal_id
      or v_debt.id is distinct from v_owner_debt_id then
      raise exception 'Onboarding retry created an unintended goal or debt in case %.', v_case;
    end if;

    if v_debt.user_id <> '00000000-0000-0000-0000-000000000101'::uuid
      or v_goal.linked_debt_id is distinct from v_debt.id
      or v_goal.planning_rules #>> '{onboarding,debtId}' is distinct from v_debt.id::text
      or (v_goal.planning_rules #>> '{onboarding,debtInterestRateBasisPoints}')::integer
        is distinct from v_interest
      or (v_goal.planning_rules #>> '{onboarding,debtMinimumPaymentCents}')::integer
        is distinct from v_minimum
      or v_goal.planning_rules #>> '{onboarding,debtType}' is distinct from 'credit_card'
      or v_goal.current_amount_cents <> 3000 then
      raise exception 'Onboarding debt link, metadata, or derived progress failed in case %.', v_case;
    end if;

    if jsonb_typeof(v_goal.planning_rules) <> 'object'
      or jsonb_typeof(v_goal.planning_rules -> 'onboarding') <> 'object' then
      raise exception 'Onboarding JSON was not normalized to objects in case %.', v_case;
    end if;

    if v_case between 2 and 4
      and v_goal.planning_rules ->> 'unrelatedTopLevel' is distinct from 'preserve-me' then
      raise exception 'An unrelated top-level planning-rule key was lost in case %.', v_case;
    end if;

    if v_case = 3
      and v_goal.planning_rules #>> '{onboarding,unrelatedSibling}'
        is distinct from 'preserve-me-too' then
      raise exception 'An unrelated onboarding sibling was lost.';
    end if;
  end loop;

  v_result := public.create_goal_pack_onboarding_setup_v2(
    p_goal_name => 'Synthetic onboarding debt goal',
    p_goal_color => null,
    p_goal_icon => 'target',
    p_target_amount_cents => 10000,
    p_starting_balance_cents => 0,
    p_target_date => '2031-12-31',
    p_goal_type => 'debt_payoff',
    p_priority_rank => 1,
    p_monthly_commitment_cents => 650,
    p_confidence_score => 85,
    p_plan_status => 'active',
    p_planning_rules => '{
      "retryTopLevel":"preserve-on-retry",
      "onboarding":{"retrySibling":"preserve-on-retry","debtId":"stale-value"}
    }'::jsonb,
    p_top_priority_type => 'debt_payoff',
    p_horizon => 'medium_term',
    p_country_code => 'US',
    p_region_code => null,
    p_currency_code => 'USD',
    p_monthly_income_cents => 500000,
    p_monthly_expenses_cents => 300000,
    p_action_type => 'pay_debt',
    p_action_title => 'Synthetic updated payment',
    p_debt_name => 'Synthetic onboarding debt',
    p_debt_type => 'personal_loan',
    p_debt_principal_cents => 10000,
    p_debt_current_balance_cents => 6500,
    p_debt_interest_rate_basis_points => 1500,
    p_debt_minimum_payment_cents => 650,
    p_debt_payment_frequency => 'monthly'
  );

  select * into strict v_goal
  from public.goals g
  where g.id = (v_result ->> 'goal_id')::uuid;

  select * into strict v_debt
  from public.debts d
  where d.id = (v_result ->> 'debt_id')::uuid;

  if v_goal.id is distinct from v_owner_goal_id
    or v_debt.id is distinct from v_owner_debt_id
    or (select count(*) from public.debts d
        where d.user_id = '00000000-0000-0000-0000-000000000101'::uuid
          and d.name = 'Synthetic onboarding debt') <> 1
    or v_goal.linked_debt_id is distinct from v_owner_debt_id
    or v_goal.planning_rules #>> '{onboarding,debtId}' is distinct from v_owner_debt_id::text
    or v_goal.planning_rules #>> '{onboarding,debtType}' is distinct from 'personal_loan'
    or (v_goal.planning_rules #>> '{onboarding,debtInterestRateBasisPoints}')::integer <> 1500
    or (v_goal.planning_rules #>> '{onboarding,debtMinimumPaymentCents}')::integer <> 650
    or v_goal.planning_rules ->> 'retryTopLevel' is distinct from 'preserve-on-retry'
    or v_goal.planning_rules #>> '{onboarding,retrySibling}' is distinct from 'preserve-on-retry'
    or v_debt.debt_type <> 'personal_loan'
    or v_debt.interest_rate_basis_points <> 1500
    or v_debt.minimum_payment_cents <> 650
    or v_goal.current_amount_cents <> 3500 then
    raise exception 'Onboarding retry did not reuse and update the authoritative debt contract.';
  end if;

  -- Supply the owner's legacy debt id as another user's input. The RPC must
  -- create/reuse only an RLS-visible same-owner debt and overwrite that input.
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000102', true);
  perform set_config(
    'request.jwt.claims',
    '{"sub":"00000000-0000-0000-0000-000000000102","role":"authenticated"}',
    true
  );

  v_result := public.create_goal_pack_onboarding_setup_v2(
    p_goal_name => 'Synthetic isolated onboarding goal',
    p_goal_color => null,
    p_goal_icon => 'target',
    p_target_amount_cents => 20000,
    p_starting_balance_cents => 0,
    p_target_date => '2032-12-31',
    p_goal_type => 'debt_payoff',
    p_priority_rank => 1,
    p_monthly_commitment_cents => 800,
    p_confidence_score => 75,
    p_plan_status => 'active',
    p_planning_rules => jsonb_build_object(
      'unrelatedTopLevel', 'other-preserve',
      'onboarding', jsonb_build_object('debtId', v_owner_debt_id::text)
    ),
    p_top_priority_type => 'debt_payoff',
    p_horizon => 'long_term',
    p_country_code => 'US',
    p_region_code => null,
    p_currency_code => 'USD',
    p_monthly_income_cents => 600000,
    p_monthly_expenses_cents => 350000,
    p_action_type => 'pay_debt',
    p_action_title => 'Synthetic isolated payment',
    p_debt_name => 'Synthetic isolated debt',
    p_debt_type => 'car_loan',
    p_debt_principal_cents => 20000,
    p_debt_current_balance_cents => 16000,
    p_debt_interest_rate_basis_points => 900,
    p_debt_minimum_payment_cents => 800,
    p_debt_payment_frequency => 'monthly'
  );
  v_other_debt_id := (v_result ->> 'debt_id')::uuid;

  select * into strict v_goal
  from public.goals g
  where g.id = (v_result ->> 'goal_id')::uuid;

  if v_other_debt_id is null
    or v_other_debt_id = v_owner_debt_id
    or v_goal.linked_debt_id is distinct from v_other_debt_id
    or v_goal.planning_rules #>> '{onboarding,debtId}' is distinct from v_other_debt_id::text
    or v_goal.planning_rules ->> 'unrelatedTopLevel' is distinct from 'other-preserve'
    or exists (select 1 from public.debts d where d.id = v_owner_debt_id) then
    raise exception 'Cross-owner onboarding debt reuse or RLS isolation failed.';
  end if;

  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000101', true);
  perform set_config(
    'request.jwt.claims',
    '{"sub":"00000000-0000-0000-0000-000000000101","role":"authenticated"}',
    true
  );

  if exists (select 1 from public.debts d where d.id = v_other_debt_id) then
    raise exception 'Owner could read another user''s onboarding debt through RLS.';
  end if;

  select g.planning_rules into strict v_legacy_rules
  from public.goals g
  where g.id = v_owner_goal_id;

  v_result := public.create_goal_pack_onboarding_setup_v2(
    p_goal_name => 'Synthetic goal changed away from debt',
    p_goal_color => null,
    p_goal_icon => 'target',
    p_target_amount_cents => 10000,
    p_starting_balance_cents => 0,
    p_target_date => '2031-12-31',
    p_goal_type => 'general_savings',
    p_priority_rank => 1,
    p_monthly_commitment_cents => 650,
    p_confidence_score => 85,
    p_plan_status => 'active',
    p_planning_rules => v_legacy_rules,
    p_top_priority_type => 'general_savings',
    p_horizon => 'medium_term',
    p_country_code => 'US',
    p_region_code => null,
    p_currency_code => 'USD',
    p_monthly_income_cents => 500000,
    p_monthly_expenses_cents => 300000,
    p_action_type => 'save',
    p_action_title => 'Synthetic savings action'
  );

  select * into strict v_goal
  from public.goals g
  where g.id = (v_result ->> 'goal_id')::uuid;

  if v_goal.id is distinct from v_owner_goal_id
    or v_goal.linked_debt_id is not null
    or v_goal.planning_rules is distinct from v_legacy_rules
    or v_result -> 'debt_id' <> 'null'::jsonb then
    raise exception 'Changing away from debt payoff changed the legacy unlink contract.';
  end if;
end;
$$;

reset role;

select (
  to_regprocedure(
    'public.get_transaction_summary(date,date,text,uuid,public.transaction_kind,integer,integer,text)'
  ) is not null
) as candidate_two_applied
\gset

\if :candidate_two_applied

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
\endif

rollback;
