-- ISOLATED REHEARSAL ONLY. Every fixture and test helper is rolled back.
-- Browser SQL Editor compatible: execute the entire batch as database owner.
-- The additive atomic reset migration must be present (it may be in this same
-- outer transaction). No real rows or function bodies are returned.
-- This tests atomicity and ownership, not multi-session concurrency.
begin;
set local statement_timeout = '15s';
set local lock_timeout = '2s';

-- Apply the additive reset migration before this rollback-only test.

do $$
begin
  if exists (select 1 from auth.users where id in (
    'a1000000-0000-0000-0000-000000000001'::uuid,
    'a1000000-0000-0000-0000-000000000002'::uuid
  )) then
    raise exception 'Reserved synthetic users already exist; aborting.';
  end if;
  if has_function_privilege('anon', 'public.reset_onboarding_with_clean_slate()', 'EXECUTE')
    or has_function_privilege('service_role', 'public.reset_onboarding_with_clean_slate()', 'EXECUTE')
    or not has_function_privilege('authenticated', 'public.reset_onboarding_with_clean_slate()', 'EXECUTE') then
    raise exception 'Reset/guard function grants are incorrect.';
  end if;
  if exists (
    select 1 from pg_proc
    where oid = 'public.reset_onboarding_with_clean_slate()'::regprocedure
      and (prosecdef or not ('search_path=public, pg_temp' = any(proconfig)))
  ) then
    raise exception 'Invoker or fixed-search-path contract is incorrect.';
  end if;
end;
$$;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values
  ('00000000-0000-0000-0000-000000000000', 'a1000000-0000-0000-0000-000000000001',
   'authenticated', 'authenticated', 'reset-owner@example.invalid', '', now(),
   '{"provider":"email","providers":["email"]}',
   '{"display_name":"Synthetic reset owner","accepted_terms_accepted":true,"accepted_terms_version":"synthetic-test"}',
   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a1000000-0000-0000-0000-000000000002',
   'authenticated', 'authenticated', 'reset-other@example.invalid', '', now(),
   '{"provider":"email","providers":["email"]}',
   '{"display_name":"Synthetic other owner"}', now(), now(), '', '', '', '');

insert into public.user_roles (user_id, role) values
  ('a1000000-0000-0000-0000-000000000001', 'user'),
  ('a1000000-0000-0000-0000-000000000002', 'user');

update public.user_preferences set
  onboarding_completed_at = '2026-01-01T00:00:00Z',
  dismissed_tooltips = array['synthetic-tooltip'],
  quick_add_chips = '[{"synthetic":true}]'::jsonb,
  currency_code = 'USD'
where user_id in ('a1000000-0000-0000-0000-000000000001',
                  'a1000000-0000-0000-0000-000000000002');

insert into public.debts (id, user_id, name, principal_cents, current_balance_cents) values
  ('a3000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001',
   'Synthetic reset debt', 10000, 9000),
  ('a3000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002',
   'Synthetic other debt', 20000, 15000);

insert into public.goals (
  id, user_id, name, target_amount_cents, starting_balance_cents,
  current_amount_cents, goal_type, linked_debt_id
) values
  ('a2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001',
   'Synthetic reset savings', 10000, 1000, 1000, 'general_savings', null),
  ('a2000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001',
   'Synthetic reset linked goal', 10000, 0, 0, 'debt_payoff', 'a3000000-0000-0000-0000-000000000001'),
  ('a2000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002',
   'Synthetic other savings', 20000, 500, 500, 'general_savings', null);

insert into public.recurring_rules (
  id, user_id, description, amount_cents, kind, category, frequency,
  start_date, next_run_date, debt_id
) values
  ('a4000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001',
   'Synthetic ordinary recurring', 500, 'expense', 'housing', 'monthly', '2099-01-01', '2099-01-01', null),
  ('a4000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001',
   'Synthetic recurring debt', 1000, 'transfer', 'debt_payment', 'monthly', '2099-01-01', '2099-01-01',
   'a3000000-0000-0000-0000-000000000001'),
  ('a4000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002',
   'Synthetic other recurring', 800, 'expense', 'housing', 'monthly', '2099-01-01', '2099-01-01', null);

insert into public.transactions (
  id, user_id, transaction_date, description, amount_cents, kind, category,
  goal_id, debt_id, recurring_rule_id, source
) values
  ('a5000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', '2099-01-01',
   'Synthetic savings transfer', 2000, 'transfer', 'savings', 'a2000000-0000-0000-0000-000000000001', null, null, 'manual'),
  ('a5000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', '2099-01-01',
   'Synthetic manual debt', 1000, 'transfer', 'debt_payment', null, 'a3000000-0000-0000-0000-000000000001', null, 'manual'),
  ('a5000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', '2099-01-01',
   'Synthetic recurring debt', 1000, 'transfer', 'debt_payment', null, 'a3000000-0000-0000-0000-000000000001',
   'a4000000-0000-0000-0000-000000000002', 'recurring'),
  ('a5000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', '2099-01-01',
   'Synthetic ordinary expense', 500, 'expense', 'housing', null, null, null, 'manual'),
  ('a5000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', '2099-01-01',
   'Synthetic other expense', 750, 'expense', 'housing', null, null, null, 'manual');

insert into public.financial_priorities (user_id, active_goal_id) values
  ('a1000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000001'),
  ('a1000000-0000-0000-0000-000000000002', 'a2000000-0000-0000-0000-000000000003');
insert into public.goal_plan_snapshots (user_id, goal_id) values
  ('a1000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000001'),
  ('a1000000-0000-0000-0000-000000000002', 'a2000000-0000-0000-0000-000000000003');
insert into public.goal_actions (user_id, goal_id, action_type, title) values
  ('a1000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000001', 'synthetic_reset', 'Synthetic action'),
  ('a1000000-0000-0000-0000-000000000002', 'a2000000-0000-0000-0000-000000000003', 'synthetic_reset', 'Synthetic other action');

-- Capture complete synthetic state privately inside this rollback transaction.
-- Helpers emit no rows, descriptions, financial values, or account data.
create temp table reset_test_baseline (user_id uuid primary key, state jsonb not null);
create function pg_temp.reset_test_snapshot(p_user_id uuid)
returns jsonb language sql stable security invoker
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'auth_count', (select count(*) from auth.users where id = p_user_id),
    'profiles', (select coalesce(jsonb_agg(to_jsonb(t) order by t.id), '[]') from public.profiles t where id = p_user_id),
    'roles', (select coalesce(jsonb_agg(to_jsonb(t) order by t.user_id), '[]') from public.user_roles t where user_id = p_user_id),
    'preferences', (select coalesce(jsonb_agg(to_jsonb(t) order by t.id), '[]') from public.user_preferences t where user_id = p_user_id),
    'actions', (select coalesce(jsonb_agg(to_jsonb(t) order by t.id), '[]') from public.goal_actions t where user_id = p_user_id),
    'snapshots', (select coalesce(jsonb_agg(to_jsonb(t) order by t.id), '[]') from public.goal_plan_snapshots t where user_id = p_user_id),
    'priorities', (select coalesce(jsonb_agg(to_jsonb(t) order by t.id), '[]') from public.financial_priorities t where user_id = p_user_id),
    'transactions', (select coalesce(jsonb_agg(to_jsonb(t) order by t.id), '[]') from public.transactions t where user_id = p_user_id),
    'rules', (select coalesce(jsonb_agg(to_jsonb(t) order by t.id), '[]') from public.recurring_rules t where user_id = p_user_id),
    'goals', (select coalesce(jsonb_agg(to_jsonb(t) order by t.id), '[]') from public.goals t where user_id = p_user_id),
    'debts', (select coalesce(jsonb_agg(to_jsonb(t) order by t.id), '[]') from public.debts t where user_id = p_user_id)
  );
$$;
insert into reset_test_baseline values
  ('a1000000-0000-0000-0000-000000000001', pg_temp.reset_test_snapshot('a1000000-0000-0000-0000-000000000001')),
  ('a1000000-0000-0000-0000-000000000002', pg_temp.reset_test_snapshot('a1000000-0000-0000-0000-000000000002'));

-- Assert allocation reversal BEFORE the goals/debt disappear. These transient
-- observers make the required ordering executable, not just a comment.
create function pg_temp.assert_reset_reversal()
returns trigger language plpgsql security invoker
set search_path = public, pg_temp
as $$
begin
  if old.user_id = 'a1000000-0000-0000-0000-000000000001'::uuid then
    if tg_table_name = 'goals' then
      if old.current_amount_cents <> 1000 then
        raise exception 'Goal deletion preceded exact transaction reversal.';
      end if;
    elsif tg_table_name = 'debts' then
      if old.current_balance_cents <> 9000 then
        raise exception 'Debt deletion preceded exact transaction reversal.';
      end if;
    end if;
  end if;
  return old;
end;
$$;
create trigger zz_test_reset_reversal before delete on public.goals
  for each row execute function pg_temp.assert_reset_reversal();
create trigger zz_test_reset_reversal before delete on public.debts
  for each row execute function pg_temp.assert_reset_reversal();

create function pg_temp.fail_reset_late()
returns trigger language plpgsql security invoker
set search_path = public, pg_temp
as $$
begin
  if new.user_id = 'a1000000-0000-0000-0000-000000000001'::uuid
    and new.onboarding_completed_at is null
    and current_setting('budgbeacon.test_reset_fail', true) = 'on' then
    raise exception 'Synthetic late reset failure.' using errcode = 'P0091';
  end if;
  return new;
end;
$$;
create trigger zz_test_reset_failure after insert or update on public.user_preferences
  for each row execute function pg_temp.fail_reset_late();

set local role authenticated;
do $$ begin perform set_config('request.jwt.claim.sub', 'a1000000-0000-0000-0000-000000000001', true); end; $$;
do $$ begin perform set_config('request.jwt.claims', '{"sub":"a1000000-0000-0000-0000-000000000001","role":"authenticated"}', true); end; $$;
do $$ begin perform set_config('budgbeacon.test_reset_fail', 'on', true); end; $$;
do $$
declare v_failed boolean := false;
begin
  begin
    perform public.reset_onboarding_with_clean_slate();
  exception when sqlstate 'P0091' then
    v_failed := true;
  end;
  if not v_failed then raise exception 'Late failure injection did not run.'; end if;
end;
$$;
reset role;
do $$
begin
  if exists (select 1 from reset_test_baseline b
    where pg_temp.reset_test_snapshot(b.user_id) is distinct from b.state) then
    raise exception 'Late failure did not restore complete synthetic baseline.';
  end if;
end;
$$;
do $$ begin perform set_config('budgbeacon.test_reset_fail', 'off', true); end; $$;

-- Authenticated role without authenticated identity must fail in the body.
set local role authenticated;
do $$ begin perform set_config('request.jwt.claim.sub', '', true); end; $$;
do $$ begin perform set_config('request.jwt.claims', '{"role":"authenticated"}', true); end; $$;
do $$
declare v_denied boolean := false;
begin
  begin perform public.reset_onboarding_with_clean_slate();
  exception when sqlstate '28000' then v_denied := true; end;
  if not v_denied then raise exception 'Missing identity was accepted.'; end if;
end;
$$;
reset role;

-- Anonymous execution is denied by grants before the function body.
set local role anon;
do $$ begin perform set_config('request.jwt.claim.sub', '', true); end; $$;
do $$ begin perform set_config('request.jwt.claims', '{"role":"anon"}', true); end; $$;
do $$
declare v_denied boolean := false;
begin
  begin perform public.reset_onboarding_with_clean_slate();
  exception when insufficient_privilege then v_denied := true; end;
  if not v_denied then raise exception 'Anonymous reset was accepted.'; end if;
end;
$$;
reset role;

-- No supplied-owner overload exists; normal RLS still denies forged writes.
set local role authenticated;
do $$ begin perform set_config('request.jwt.claim.sub', 'a1000000-0000-0000-0000-000000000002', true); end; $$;
do $$ begin perform set_config('request.jwt.claims', '{"sub":"a1000000-0000-0000-0000-000000000002","role":"authenticated"}', true); end; $$;
do $$
declare v_denied boolean := false;
begin
  if exists (select 1 from public.goals where user_id = 'a1000000-0000-0000-0000-000000000001') then
    raise exception 'Other-owner goals are visible.';
  end if;
  begin
    perform public.reset_onboarding_with_clean_slate('a1000000-0000-0000-0000-000000000001'::uuid);
  exception when undefined_function then v_denied := true; end;
  if not v_denied then raise exception 'A caller-selected-owner overload exists.'; end if;
  v_denied := false;
  begin
    insert into public.transactions (user_id, transaction_date, description, amount_cents, kind, category)
    values ('a1000000-0000-0000-0000-000000000001', '2099-01-02', 'Synthetic forgery', 100, 'expense', 'other');
  exception when insufficient_privilege then v_denied := true; end;
  if not v_denied then raise exception 'Insert ownership forgery was accepted.'; end if;
  v_denied := false;
  begin
    update public.goals set user_id = 'a1000000-0000-0000-0000-000000000001'
      where id = 'a2000000-0000-0000-0000-000000000003';
  exception when insufficient_privilege then v_denied := true; end;
  if not v_denied then raise exception 'Update ownership reassignment was accepted.'; end if;
end;
$$;
reset role;

set local role authenticated;
do $$ begin perform set_config('request.jwt.claim.sub', 'a1000000-0000-0000-0000-000000000001', true); end; $$;
do $$ begin perform set_config('request.jwt.claims', '{"sub":"a1000000-0000-0000-0000-000000000001","role":"authenticated"}', true); end; $$;
do $$
declare
  v_result record;
  v_table text;
  v_count bigint;
begin
  select * into strict v_result from public.reset_onboarding_with_clean_slate();
  if v_result.user_id <> 'a1000000-0000-0000-0000-000000000001'::uuid
    or v_result.onboarding_completed_at is not null
    or v_result.dismissed_tooltips is distinct from '{}'::text[] then
    raise exception 'Reset did not return the expected owner preferences.';
  end if;
  foreach v_table in array array['goal_actions', 'goal_plan_snapshots', 'financial_priorities',
    'transactions', 'recurring_rules', 'goals', 'debts'] loop
    execute format('select count(*) from public.%I where user_id = $1', v_table)
      into v_count using 'a1000000-0000-0000-0000-000000000001'::uuid;
    if v_count <> 0 then raise exception 'An owner workspace table was not emptied.'; end if;
  end loop;
  select * into strict v_result from public.reset_onboarding_with_clean_slate();
  if v_result.onboarding_completed_at is not null then
    raise exception 'Repeated reset was not idempotent without intervening writes.';
  end if;
end;
$$;
reset role;

do $$
declare v_before jsonb; v_after jsonb; v_pref_before jsonb; v_pref_after jsonb;
begin
  select state into strict v_before from reset_test_baseline
    where user_id = 'a1000000-0000-0000-0000-000000000002';
  if pg_temp.reset_test_snapshot('a1000000-0000-0000-0000-000000000002') is distinct from v_before then
    raise exception 'Reset changed another owner''s data.';
  end if;
  select state into strict v_before from reset_test_baseline
    where user_id = 'a1000000-0000-0000-0000-000000000001';
  v_after := pg_temp.reset_test_snapshot('a1000000-0000-0000-0000-000000000001');
  if v_after->'auth_count' is distinct from v_before->'auth_count'
    or v_after->'profiles' is distinct from v_before->'profiles'
    or v_after->'roles' is distinct from v_before->'roles' then
    raise exception 'Reset changed identity, profile/legal acceptance, or roles.';
  end if;
  v_pref_before := (v_before->'preferences'->0) - array['onboarding_completed_at','dismissed_tooltips','quick_add_chips','updated_at'];
  v_pref_after := (v_after->'preferences'->0) - array['onboarding_completed_at','dismissed_tooltips','quick_add_chips','updated_at'];
  if v_pref_after is distinct from v_pref_before
    or v_after->'preferences'->0->'quick_add_chips' is distinct from '[]'::jsonb then
    raise exception 'Unrelated preferences changed or quick-add chips were not reset.';
  end if;
end;
$$;

-- Missing preferences must be recreated without deleting account identity.
set local role authenticated;
do $$ begin perform set_config('request.jwt.claim.sub', 'a1000000-0000-0000-0000-000000000001', true); end; $$;
do $$ begin perform set_config('request.jwt.claims', '{"sub":"a1000000-0000-0000-0000-000000000001","role":"authenticated"}', true); end; $$;
delete from public.user_preferences where user_id = 'a1000000-0000-0000-0000-000000000001';
do $$
declare v_result record;
begin
  select * into strict v_result from public.reset_onboarding_with_clean_slate();
  if v_result.user_id <> 'a1000000-0000-0000-0000-000000000001'::uuid
    or v_result.onboarding_completed_at is not null
    or v_result.dismissed_tooltips is distinct from '{}'::text[] then
    raise exception 'Reset did not recreate missing preferences.';
  end if;
end;
$$;
reset role;

rollback;
select 'atomic reset rollback-only assertions passed' as result;
