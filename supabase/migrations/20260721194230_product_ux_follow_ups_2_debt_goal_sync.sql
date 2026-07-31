-- Establish a same-owner relational link between a debt-payoff goal and its debt.
-- The composite foreign key prevents cross-user links even outside normal RLS paths.
alter table public.debts
  add constraint debts_id_user_id_key unique (id, user_id);

-- Composite target foreign keys added by the following transaction migration
-- use this key to enforce ownership independently of RLS.
alter table public.goals
  add constraint goals_id_user_id_key unique (id, user_id);

alter table public.goals
  add column linked_debt_id uuid,
  add constraint goals_linked_debt_only_for_debt_payoff_check check (
    linked_debt_id is null or goal_type = 'debt_payoff'
  ),
  add constraint goals_linked_debt_owner_fkey
    foreign key (linked_debt_id, user_id)
    references public.debts (id, user_id)
    on delete set null (linked_debt_id);

create index goals_linked_debt_id_idx
  on public.goals (linked_debt_id)
  where linked_debt_id is not null;

-- A linked goal's progress is derived exclusively from the remaining debt.
create or replace function public.sync_debt_payoff_goal_progress()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_debt public.debts%rowtype;
begin
  if new.linked_debt_id is null then
    return new;
  end if;

  select *
  into v_debt
  from public.debts
  where id = new.linked_debt_id
    and user_id = new.user_id;

  if not found then
    raise exception 'Linked debt was not found for this goal.'
      using errcode = '23503';
  end if;

  if (tg_op = 'INSERT' or old.linked_debt_id is distinct from new.linked_debt_id)
    and v_debt.is_archived then
    raise exception 'An archived debt cannot be linked to a goal.'
      using errcode = '22023';
  end if;

  new.current_amount_cents := least(
    new.target_amount_cents,
    greatest(0, new.target_amount_cents - v_debt.current_balance_cents)
  );

  return new;
end;
$$;

revoke all on function public.sync_debt_payoff_goal_progress() from public, anon, authenticated;

create trigger goals_sync_debt_payoff_progress
  before insert or update of linked_debt_id, user_id, goal_type, target_amount_cents, current_amount_cents
  on public.goals
  for each row
  execute function public.sync_debt_payoff_goal_progress();

create or replace function public.sync_linked_goals_after_debt_change()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  update public.goals
  set current_amount_cents = least(
        target_amount_cents,
        greatest(0, target_amount_cents - new.current_balance_cents)
      ),
      updated_at = now()
  where linked_debt_id = new.id
    and user_id = new.user_id
    and current_amount_cents is distinct from least(
      target_amount_cents,
      greatest(0, target_amount_cents - new.current_balance_cents)
    );

  return new;
end;
$$;

revoke all on function public.sync_linked_goals_after_debt_change() from public, anon, authenticated;

create trigger debts_sync_linked_goal_progress
  after update of current_balance_cents on public.debts
  for each row
  when (old.current_balance_cents is distinct from new.current_balance_cents)
  execute function public.sync_linked_goals_after_debt_change();

-- Backfill only unambiguous, syntactically valid UUID references owned by the
-- same user. The legacy JSON remains untouched for backward compatibility.
with candidate_links as (
  select
    g.id as goal_id,
    btrim(g.planning_rules #>> '{onboarding,debtId}')::uuid as debt_id
  from public.goals g
  where g.goal_type = 'debt_payoff'
    and g.linked_debt_id is null
    and coalesce(btrim(g.planning_rules #>> '{onboarding,debtId}'), '') ~*
      '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
)
update public.goals g
set linked_debt_id = candidate_links.debt_id
from candidate_links
join public.debts d
  on d.id = candidate_links.debt_id
where g.id = candidate_links.goal_id
  and d.user_id = g.user_id
  and d.is_archived = false;

-- Recreate onboarding v2 with the same public signature. Retries prefer the
-- relational link, use legacy JSON only as a compatible fallback, and update
-- both representations atomically.
create or replace function public.create_goal_pack_onboarding_setup_v2(
  p_goal_name text,
  p_goal_color text,
  p_goal_icon text,
  p_target_amount_cents integer,
  p_starting_balance_cents integer,
  p_target_date date,
  p_goal_type text,
  p_priority_rank integer,
  p_monthly_commitment_cents integer,
  p_confidence_score integer,
  p_plan_status text,
  p_planning_rules jsonb,
  p_top_priority_type text,
  p_horizon text,
  p_country_code text,
  p_region_code text,
  p_currency_code text,
  p_monthly_income_cents integer,
  p_monthly_expenses_cents integer,
  p_action_type text,
  p_action_title text,
  p_action_description text default null,
  p_action_impact_label text default null,
  p_action_impact_value jsonb default '{}'::jsonb,
  p_action_source text default 'onboarding',
  p_action_due_at timestamptz default null,
  p_debt_name text default null,
  p_debt_type public.debt_type default 'credit_card',
  p_debt_principal_cents integer default null,
  p_debt_current_balance_cents integer default null,
  p_debt_interest_rate_basis_points integer default null,
  p_debt_minimum_payment_cents integer default null,
  p_debt_payment_frequency public.payment_frequency default 'monthly',
  p_debt_color text default null,
  p_debt_icon text default null,
  p_debt_start_date date default null
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_setup jsonb;
  v_goal public.goals%rowtype;
  v_existing_debt_id uuid;
  v_debt_id uuid;
  v_debt_name text;
begin
  if v_user_id is null then
    raise exception 'Authentication is required to create a Goal Pack onboarding setup.'
      using errcode = '28000';
  end if;

  begin
    select coalesce(
      g.linked_debt_id,
      case
        when coalesce(btrim(g.planning_rules #>> '{onboarding,debtId}'), '') ~*
          '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        then btrim(g.planning_rules #>> '{onboarding,debtId}')::uuid
        else null
      end
    )
    into v_existing_debt_id
    from public.financial_priorities fp
    join public.goals g on g.id = fp.active_goal_id
    where fp.user_id = v_user_id
      and g.user_id = v_user_id
      and g.is_archived = false
    limit 1
    for update of fp;
  exception
    when invalid_text_representation then
      v_existing_debt_id := null;
  end;

  -- Serialize onboarding per priority row, then take an existing debt lock
  -- before the base RPC locks/reuses the goal. This matches the global
  -- recurring-rule -> debt -> linked-goal order used by allocation paths.
  if p_goal_type = 'debt_payoff' and v_existing_debt_id is not null then
    select d.id
    into v_existing_debt_id
    from public.debts d
    where d.id = v_existing_debt_id
      and d.user_id = v_user_id
      and d.is_archived = false
    for update;
  end if;

  -- The base setup RPC may reuse the active goal. Clear the relational link
  -- first when the retry intentionally changes that goal away from debt payoff;
  -- legacy planning JSON remains available for backward compatibility.
  if p_goal_type <> 'debt_payoff' then
    update public.goals g
    set linked_debt_id = null,
        updated_at = now()
    from public.financial_priorities fp
    where fp.user_id = v_user_id
      and fp.active_goal_id = g.id
      and g.user_id = v_user_id
      and g.linked_debt_id is not null;
  end if;

  v_setup := public.create_goal_pack_onboarding_setup(
    p_goal_name, p_goal_color, p_goal_icon, p_target_amount_cents,
    p_starting_balance_cents, p_target_date, p_goal_type, p_priority_rank,
    p_monthly_commitment_cents, p_confidence_score, p_plan_status,
    p_planning_rules, p_top_priority_type, p_horizon, p_country_code,
    p_region_code, p_currency_code, p_monthly_income_cents,
    p_monthly_expenses_cents, p_action_type, p_action_title,
    p_action_description, p_action_impact_label, p_action_impact_value,
    p_action_source, p_action_due_at
  );

  if p_goal_type <> 'debt_payoff' then
    return v_setup || jsonb_build_object('debt_id', null);
  end if;

  if p_debt_principal_cents is null or p_debt_principal_cents <= 0 then
    raise exception 'Debt payoff onboarding requires a debt balance greater than zero.'
      using errcode = '22023';
  end if;
  if p_debt_current_balance_cents is null or p_debt_current_balance_cents < 0 then
    raise exception 'Debt payoff onboarding requires a current debt balance.'
      using errcode = '22023';
  end if;
  if p_debt_current_balance_cents > p_debt_principal_cents then
    raise exception 'Current debt balance cannot exceed the original balance.'
      using errcode = '22023';
  end if;
  if p_debt_interest_rate_basis_points is null
    or p_debt_interest_rate_basis_points < 0
    or p_debt_interest_rate_basis_points > 10000 then
    raise exception 'Debt payoff onboarding requires an interest rate between 0 and 100 percent.'
      using errcode = '22023';
  end if;
  if p_debt_minimum_payment_cents is null or p_debt_minimum_payment_cents <= 0 then
    raise exception 'Debt payoff onboarding requires a minimum monthly payment greater than zero.'
      using errcode = '22023';
  end if;

  select *
  into v_goal
  from public.goals
  where id = (v_setup ->> 'goal_id')::uuid
    and user_id = v_user_id
    and is_archived = false
  for update;

  if not found then
    raise exception 'Goal Pack setup did not return an active goal.'
      using errcode = 'P0002';
  end if;

  if v_existing_debt_id is null then
    v_existing_debt_id := v_goal.linked_debt_id;
  end if;

  if v_existing_debt_id is null
    and coalesce(btrim(v_goal.planning_rules #>> '{onboarding,debtId}'), '') ~*
      '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    v_existing_debt_id := btrim(v_goal.planning_rules #>> '{onboarding,debtId}')::uuid;
  end if;

  v_debt_name := coalesce(nullif(btrim(p_debt_name), ''), v_goal.name);

  if v_existing_debt_id is not null then
    update public.debts
    set name = v_debt_name,
        debt_type = p_debt_type,
        principal_cents = p_debt_principal_cents,
        current_balance_cents = p_debt_current_balance_cents,
        interest_rate_basis_points = p_debt_interest_rate_basis_points,
        payment_frequency = p_debt_payment_frequency,
        minimum_payment_cents = p_debt_minimum_payment_cents,
        start_date = p_debt_start_date,
        color = p_debt_color,
        icon = p_debt_icon,
        updated_at = now()
    where id = v_existing_debt_id
      and user_id = v_user_id
      and is_archived = false
    returning id into v_debt_id;
  end if;

  if v_debt_id is null then
    insert into public.debts (
      user_id, name, debt_type, principal_cents, current_balance_cents,
      interest_rate_basis_points, payment_frequency, minimum_payment_cents,
      start_date, color, icon
    ) values (
      v_user_id, v_debt_name, p_debt_type, p_debt_principal_cents,
      p_debt_current_balance_cents, p_debt_interest_rate_basis_points,
      p_debt_payment_frequency, p_debt_minimum_payment_cents,
      p_debt_start_date, p_debt_color, p_debt_icon
    )
    returning id into v_debt_id;
  end if;

  update public.goals
  set linked_debt_id = v_debt_id,
      planning_rules = jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(
              coalesce(planning_rules, '{}'::jsonb),
              '{onboarding,debtId}', to_jsonb(v_debt_id::text), true
            ),
            '{onboarding,debtInterestRateBasisPoints}',
            to_jsonb(p_debt_interest_rate_basis_points), true
          ),
          '{onboarding,debtMinimumPaymentCents}',
          to_jsonb(p_debt_minimum_payment_cents), true
        ),
        '{onboarding,debtType}', to_jsonb(p_debt_type::text), true
      ),
      updated_at = now()
  where id = v_goal.id
    and user_id = v_user_id;

  return v_setup || jsonb_build_object('debt_id', v_debt_id);
end;
$$;

revoke all on function public.create_goal_pack_onboarding_setup_v2(
  text, text, text, integer, integer, date, text, integer, integer, integer,
  text, jsonb, text, text, text, text, text, integer, integer, text, text,
  text, text, jsonb, text, timestamptz, text, public.debt_type, integer,
  integer, integer, integer, public.payment_frequency, text, text, date
) from public, anon;

grant execute on function public.create_goal_pack_onboarding_setup_v2(
  text, text, text, integer, integer, date, text, integer, integer, integer,
  text, jsonb, text, text, text, text, text, integer, integer, text, text,
  text, text, jsonb, text, timestamptz, text, public.debt_type, integer,
  integer, integer, integer, public.payment_frequency, text, text, date
) to authenticated;

comment on function public.create_goal_pack_onboarding_setup_v2(
  text, text, text, integer, integer, date, text, integer, integer, integer,
  text, jsonb, text, text, text, text, text, integer, integer, text, text,
  text, text, jsonb, text, timestamptz, text, public.debt_type, integer,
  integer, integer, integer, public.payment_frequency, text, text, date
) is 'Atomically creates or reuses a debt-payoff onboarding setup and maintains the relational goal-to-debt link while preserving legacy planning JSON.';
