-- DO NOT RUN ON PRODUCTION.
-- Rollback-only behavioral verification for a separately authorized ordinary
-- Free-plan restore-rehearsal project after both Product/UX-Follow-Ups-2
-- migrations are applied. Run as the project database owner with
-- psql ON_ERROR_STOP=1. All users and financial rows below are synthetic.
-- No project URL, key, token, password, connection string, or project ref is
-- accepted by or stored in this script.

begin;

do $$
begin
  if exists (
    select 1 from auth.users
    where id in (
      '00000000-0000-0000-0000-000000000201'::uuid,
      '00000000-0000-0000-0000-000000000202'::uuid
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
    '00000000-0000-0000-0000-000000000201',
    'authenticated', 'authenticated', 'ux2-allocation-owner@example.invalid', '', now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(),
    '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000202',
    'authenticated', 'authenticated', 'ux2-allocation-other@example.invalid', '', now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(),
    '', '', '', ''
  );

insert into public.debts (
  id, user_id, name, debt_type, principal_cents, current_balance_cents,
  interest_rate_basis_points, payment_frequency, minimum_payment_cents,
  is_archived
) values (
  '20000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000201',
  'Synthetic allocation debt', 'credit_card', 10000, 7000, 1000,
  'monthly', 500, false
);

insert into public.goals (
  id, user_id, name, target_amount_cents, starting_balance_cents,
  current_amount_cents, goal_type, linked_debt_id, is_archived
) values
  (
    '10000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000201',
    'Synthetic allocation goal', 10000, 1000, 1000,
    'general_savings', null, false
  ),
  (
    '10000000-0000-0000-0000-000000000202',
    '00000000-0000-0000-0000-000000000201',
    'Synthetic linked debt goal', 10000, 0, 0,
    'debt_payoff', '20000000-0000-0000-0000-000000000201', false
  );

do $$
begin
  if (select current_amount_cents from public.goals
      where id = '10000000-0000-0000-0000-000000000202') <> 3000 then
    raise exception 'Linked-goal fixture did not derive its initial progress.';
  end if;
end;
$$;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000201', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000201","role":"authenticated"}',
  true
);

-- Valid ordinary income and expense rows remain supported.
insert into public.transactions (
  id, user_id, transaction_date, description, amount_cents, kind, category
) values
  ('30000000-0000-0000-0000-000000000201',
   '00000000-0000-0000-0000-000000000201', '2030-02-01',
   'Synthetic ordinary income', 5000, 'income', 'income'),
  ('30000000-0000-0000-0000-000000000202',
   '00000000-0000-0000-0000-000000000201', '2030-02-02',
   'Synthetic ordinary expense', 1200, 'expense', 'other');

-- Direct Data API-style goal/debt allocations apply once and store the exact
-- applied delta.
insert into public.transactions (
  id, user_id, transaction_date, description, amount_cents, kind, category,
  goal_id
) values (
  '30000000-0000-0000-0000-000000000203',
  '00000000-0000-0000-0000-000000000201', '2030-02-03',
  'Synthetic goal transfer', 2000, 'transfer', 'savings',
  '10000000-0000-0000-0000-000000000201'
);

insert into public.transactions (
  id, user_id, transaction_date, description, amount_cents, kind, category,
  debt_id
) values (
  '30000000-0000-0000-0000-000000000204',
  '00000000-0000-0000-0000-000000000201', '2030-02-04',
  'Synthetic debt transfer', 2000, 'transfer', 'debt_payment',
  '20000000-0000-0000-0000-000000000201'
);

do $$
begin
  if (select current_amount_cents from public.goals
      where id = '10000000-0000-0000-0000-000000000201') <> 3000
    or (select allocation_applied_cents from public.transactions
        where id = '30000000-0000-0000-0000-000000000203') <> 2000 then
    raise exception 'Goal allocation was not applied exactly once.';
  end if;

  if (select current_balance_cents from public.debts
      where id = '20000000-0000-0000-0000-000000000201') <> 5000
    or (select current_amount_cents from public.goals
        where id = '10000000-0000-0000-0000-000000000202') <> 5000
    or (select allocation_applied_cents from public.transactions
        where id = '30000000-0000-0000-0000-000000000204') <> 2000 then
    raise exception 'Debt allocation or linked-goal sync was not applied exactly once.';
  end if;
end;
$$;

-- Goal clamp is stored and reverses by the stored delta on deletion.
insert into public.transactions (
  id, user_id, transaction_date, description, amount_cents, kind, category,
  goal_id
) values (
  '30000000-0000-0000-0000-000000000205',
  '00000000-0000-0000-0000-000000000201', '2030-02-05',
  'Synthetic clamped goal transfer', 10000, 'transfer', 'savings',
  '10000000-0000-0000-0000-000000000201'
);

do $$
begin
  if (select current_amount_cents from public.goals
      where id = '10000000-0000-0000-0000-000000000201') <> 10000
    or (select allocation_applied_cents from public.transactions
        where id = '30000000-0000-0000-0000-000000000205') <> 7000 then
    raise exception 'Goal contribution clamp was not recorded exactly.';
  end if;

  perform public.delete_transaction_and_rebalance_goal(
    '30000000-0000-0000-0000-000000000205'
  );

  if (select current_amount_cents from public.goals
      where id = '10000000-0000-0000-0000-000000000201') <> 3000 then
    raise exception 'Deleting a clamped goal contribution did not reverse its stored delta.';
  end if;
end;
$$;

-- Quick add identical retry returns the same row without a second allocation;
-- reuse of the operation id with different input fails loudly.
do $$
declare
  v_first public.transactions%rowtype;
  v_retry public.transactions%rowtype;
  v_rejected boolean := false;
begin
  select * into v_first
  from public.create_quick_add_transaction(
    '40000000-0000-0000-0000-000000000201', 1000, 'expense', 'other',
    '2030-02-06', 'Synthetic quick-add goal', null,
    '10000000-0000-0000-0000-000000000201', null
  );

  select * into v_retry
  from public.create_quick_add_transaction(
    '40000000-0000-0000-0000-000000000201', 1000, 'expense', 'other',
    '2030-02-06', 'Synthetic quick-add goal', null,
    '10000000-0000-0000-0000-000000000201', null
  );

  if v_first.id is distinct from v_retry.id
    or (select count(*) from public.transactions
        where client_operation_id = '40000000-0000-0000-0000-000000000201') <> 1
    or (select current_amount_cents from public.goals
        where id = '10000000-0000-0000-0000-000000000201') <> 4000 then
    raise exception 'Identical quick-add retry was not exactly once.';
  end if;

  begin
    perform public.create_quick_add_transaction(
      '40000000-0000-0000-0000-000000000201', 1001, 'expense', 'other',
      '2030-02-06', 'Synthetic quick-add goal', null,
      '10000000-0000-0000-0000-000000000201', null
    );
  exception when invalid_parameter_value then
    v_rejected := true;
  end;

  if not v_rejected then
    raise exception 'Quick-add operation-id reuse with changed input was not rejected.';
  end if;
end;
$$;

-- Edit ordinary -> goal -> debt, then delete. Each transition reverses only
-- the stored old delta before applying the new target delta.
insert into public.transactions (
  id, user_id, transaction_date, description, amount_cents, kind, category
) values (
  '30000000-0000-0000-0000-000000000206',
  '00000000-0000-0000-0000-000000000201', '2030-02-07',
  'Synthetic retarget candidate', 500, 'expense', 'other'
);

do $$
begin
  perform public.update_transaction_and_retarget(
    '30000000-0000-0000-0000-000000000206', 1500, 'expense', 'other',
    '2030-02-07', 'Synthetic retarget candidate', null,
    '10000000-0000-0000-0000-000000000201', null
  );
  if (select current_amount_cents from public.goals
      where id = '10000000-0000-0000-0000-000000000201') <> 5500 then
    raise exception 'Ordinary-to-goal retarget did not apply once.';
  end if;

  perform public.update_transaction_and_retarget(
    '30000000-0000-0000-0000-000000000206', 3000, 'expense', 'other',
    '2030-02-08', 'Synthetic retarget candidate', null, null,
    '20000000-0000-0000-0000-000000000201'
  );
  if (select current_amount_cents from public.goals
      where id = '10000000-0000-0000-0000-000000000201') <> 4000
    or (select current_balance_cents from public.debts
        where id = '20000000-0000-0000-0000-000000000201') <> 2000
    or (select current_amount_cents from public.goals
        where id = '10000000-0000-0000-0000-000000000202') <> 8000 then
    raise exception 'Goal-to-debt retarget did not reverse/apply exact deltas.';
  end if;

  perform public.delete_transaction_and_rebalance_goal(
    '30000000-0000-0000-0000-000000000206'
  );
  if (select current_balance_cents from public.debts
      where id = '20000000-0000-0000-0000-000000000201') <> 5000
    or (select current_amount_cents from public.goals
        where id = '10000000-0000-0000-0000-000000000202') <> 5000 then
    raise exception 'Deleting the retargeted debt transaction did not reverse its delta.';
  end if;
end;
$$;

-- A debt clamp reaches zero and deleting it restores only the applied amount.
insert into public.transactions (
  id, user_id, transaction_date, description, amount_cents, kind, category,
  debt_id
) values (
  '30000000-0000-0000-0000-000000000207',
  '00000000-0000-0000-0000-000000000201', '2030-02-09',
  'Synthetic clamped debt transfer', 10000, 'transfer', 'debt_payment',
  '20000000-0000-0000-0000-000000000201'
);

do $$
begin
  if (select current_balance_cents from public.debts
      where id = '20000000-0000-0000-0000-000000000201') <> 0
    or (select allocation_applied_cents from public.transactions
        where id = '30000000-0000-0000-0000-000000000207') <> 5000 then
    raise exception 'Debt payment clamp was not recorded exactly.';
  end if;

  perform public.delete_transaction_and_rebalance_goal(
    '30000000-0000-0000-0000-000000000207'
  );
  if (select current_balance_cents from public.debts
      where id = '20000000-0000-0000-0000-000000000201') <> 5000 then
    raise exception 'Deleting a clamped debt payment did not restore its stored delta.';
  end if;
end;
$$;

insert into public.recurring_rules (
  id, user_id, description, amount_cents, kind, category, frequency,
  start_date, next_run_date, day_of_month, is_active, debt_id, notes
) values (
  '50000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000201', 'Synthetic recurring debt',
  1000, 'transfer', 'debt_payment', 'monthly', '2030-02-10', '2030-02-10',
  10, true, '20000000-0000-0000-0000-000000000201',
  'Synthetic recurring rule note'
);

-- A same-owner direct writer cannot occupy a recurring occurrence slot with
-- manual source or rule-mismatched financial/text semantics. Transaction notes
-- may differ because the current UI intentionally separates the initial
-- transaction note from the recurring rule note.
do $$
declare
  v_rejected boolean;
begin
  v_rejected := false;
  begin
    insert into public.transactions (
      user_id, transaction_date, description, amount_cents, kind, category,
      source, recurring_rule_id, debt_id
    ) values (
      '00000000-0000-0000-0000-000000000201', '2031-01-10',
      'Synthetic recurring debt', 1000, 'transfer', 'debt_payment', 'manual',
      '50000000-0000-0000-0000-000000000201',
      '20000000-0000-0000-0000-000000000201'
    );
  exception when invalid_parameter_value then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'Manual-source recurring slot poisoning was not rejected.';
  end if;

  v_rejected := false;
  begin
    insert into public.transactions (
      user_id, transaction_date, description, amount_cents, kind, category,
      source, recurring_rule_id, debt_id
    ) values (
      '00000000-0000-0000-0000-000000000201', '2031-02-10',
      'Synthetic recurring debt', 1001, 'transfer', 'debt_payment', 'recurring',
      '50000000-0000-0000-0000-000000000201',
      '20000000-0000-0000-0000-000000000201'
    );
  exception when invalid_parameter_value then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'Amount-mismatched recurring slot poisoning was not rejected.';
  end if;

  v_rejected := false;
  begin
    insert into public.transactions (
      user_id, transaction_date, description, amount_cents, kind, category,
      source, recurring_rule_id, debt_id
    ) values (
      '00000000-0000-0000-0000-000000000201', '2031-03-10',
      'Synthetic mismatched description', 1000, 'transfer', 'debt_payment', 'recurring',
      '50000000-0000-0000-0000-000000000201',
      '20000000-0000-0000-0000-000000000201'
    );
  exception when invalid_parameter_value then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'Description-mismatched recurring slot poisoning was not rejected.';
  end if;
end;
$$;

insert into public.transactions (
  id, user_id, transaction_date, description, amount_cents, kind, category,
  source, recurring_rule_id, debt_id, notes
) values (
  '30000000-0000-0000-0000-000000000208',
  '00000000-0000-0000-0000-000000000201', '2031-04-10',
  'Synthetic recurring debt', 1000, 'transfer', 'debt_payment', 'recurring',
  '50000000-0000-0000-0000-000000000201',
  '20000000-0000-0000-0000-000000000201',
  'Synthetic intentionally different initial note'
);

insert into public.transactions (
  id, user_id, transaction_date, description, amount_cents, kind, category,
  source, recurring_rule_id, debt_id, notes
) values (
  '30000000-0000-0000-0000-000000000209',
  '00000000-0000-0000-0000-000000000201', '2031-04-10',
  'Synthetic recurring debt', 1000, 'transfer', 'debt_payment', 'recurring',
  '50000000-0000-0000-0000-000000000201',
  '20000000-0000-0000-0000-000000000201',
  'Synthetic intentionally different initial note'
);

do $$
begin
  if (select count(*) from public.transactions
      where recurring_rule_id = '50000000-0000-0000-0000-000000000201'
        and transaction_date = '2031-04-10') <> 1 then
    raise exception 'Exact recurring occurrence retry was not idempotent.';
  end if;

  perform public.delete_transaction_and_rebalance_goal(
    '30000000-0000-0000-0000-000000000208'
  );
  if (select current_balance_cents from public.debts
      where id = '20000000-0000-0000-0000-000000000201') <> 5000 then
    raise exception 'Recurring slot verification cleanup did not reverse its allocation.';
  end if;
end;
$$;

reset role;
set local role service_role;
select public.process_due_recurring_rules(
  '00000000-0000-0000-0000-000000000201', '2030-02-10'
);
select public.process_due_recurring_rules(
  '00000000-0000-0000-0000-000000000201', '2030-02-10'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000201', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000201","role":"authenticated"}',
  true
);

do $$
begin
  if (select count(*) from public.transactions
      where recurring_rule_id = '50000000-0000-0000-0000-000000000201'
        and transaction_date = '2030-02-10') <> 1
    or (select current_balance_cents from public.debts
        where id = '20000000-0000-0000-0000-000000000201') <> 4000
    or (select current_amount_cents from public.goals
        where id = '10000000-0000-0000-0000-000000000202') <> 6000 then
    raise exception 'Recurring debt processing was not exactly once.';
  end if;
end;
$$;

-- Summary RPC parity with the owner-visible list aggregate. Transfers count as
-- rows but contribute zero to income, expense, and net.
do $$
declare
  v_summary record;
  v_list record;
begin
  select * into v_summary
  from public.get_transaction_summary(
    '2030-02-01', '2030-02-28', null, null, null, null, null, null
  );

  select
    coalesce(sum(abs(amount_cents::bigint)) filter (where kind = 'income'), 0)::bigint
      as income_cents,
    coalesce(sum(abs(amount_cents::bigint)) filter (where kind = 'expense'), 0)::bigint
      as expense_cents,
    coalesce(sum(
      case
        when kind = 'income' then abs(amount_cents::bigint)
        when kind = 'expense' then -abs(amount_cents::bigint)
        else 0
      end
    ), 0)::bigint as net_cents,
    count(*)::bigint as transaction_count
  into v_list
  from public.transactions
  where user_id = '00000000-0000-0000-0000-000000000201'
    and transaction_date between '2030-02-01' and '2030-02-28';

  if v_summary.income_cents is distinct from v_list.income_cents
    or v_summary.expense_cents is distinct from v_list.expense_cents
    or v_summary.net_cents is distinct from v_list.net_cents
    or v_summary.transaction_count is distinct from v_list.transaction_count then
    raise exception 'Transaction summary does not match the owner-visible list aggregate.';
  end if;

  if v_summary.income_cents <> 5000
    or v_summary.expense_cents <> 1200
    or v_summary.net_cents <> 3800
    or v_summary.transaction_count <> 6 then
    raise exception 'Unexpected final synthetic summary: %, %, %, %',
      v_summary.income_cents, v_summary.expense_cents,
      v_summary.net_cents, v_summary.transaction_count;
  end if;
end;
$$;

reset role;
rollback;
