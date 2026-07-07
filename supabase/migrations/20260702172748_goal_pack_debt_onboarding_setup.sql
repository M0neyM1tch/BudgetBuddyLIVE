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
  v_debt public.debts%rowtype;
  v_existing_debt_id uuid;
  v_debt_name text;
begin
  v_setup := public.create_goal_pack_onboarding_setup(
    p_goal_name,
    p_goal_color,
    p_goal_icon,
    p_target_amount_cents,
    p_starting_balance_cents,
    p_target_date,
    p_goal_type,
    p_priority_rank,
    p_monthly_commitment_cents,
    p_confidence_score,
    p_plan_status,
    p_planning_rules,
    p_top_priority_type,
    p_horizon,
    p_country_code,
    p_region_code,
    p_currency_code,
    p_monthly_income_cents,
    p_monthly_expenses_cents,
    p_action_type,
    p_action_title,
    p_action_description,
    p_action_impact_label,
    p_action_impact_value,
    p_action_source,
    p_action_due_at
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

  begin
    v_existing_debt_id := nullif(v_goal.planning_rules #>> '{onboarding,debtId}', '')::uuid;
  exception
    when invalid_text_representation then
      v_existing_debt_id := null;
  end;

  if v_existing_debt_id is not null then
    select *
    into v_debt
    from public.debts
    where id = v_existing_debt_id
      and user_id = v_user_id
      and is_archived = false
    for update;
  end if;

  v_debt_name := coalesce(nullif(btrim(p_debt_name), ''), v_goal.name);

  if v_debt.id is null then
    insert into public.debts (
      user_id,
      name,
      debt_type,
      principal_cents,
      current_balance_cents,
      interest_rate_basis_points,
      payment_frequency,
      minimum_payment_cents,
      start_date,
      color,
      icon
    )
    values (
      v_user_id,
      v_debt_name,
      p_debt_type,
      p_debt_principal_cents,
      p_debt_current_balance_cents,
      p_debt_interest_rate_basis_points,
      p_debt_payment_frequency,
      p_debt_minimum_payment_cents,
      p_debt_start_date,
      p_debt_color,
      p_debt_icon
    )
    returning * into v_debt;
  else
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
    where id = v_debt.id
      and user_id = v_user_id
    returning * into v_debt;
  end if;

  update public.goals
  set planning_rules = jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(
              coalesce(planning_rules, '{}'::jsonb),
              '{onboarding,debtId}',
              to_jsonb(v_debt.id::text),
              true
            ),
            '{onboarding,debtInterestRateBasisPoints}',
            to_jsonb(p_debt_interest_rate_basis_points),
            true
          ),
          '{onboarding,debtMinimumPaymentCents}',
          to_jsonb(p_debt_minimum_payment_cents),
          true
        ),
        '{onboarding,debtType}',
        to_jsonb(p_debt_type::text),
        true
      ),
      updated_at = now()
  where id = v_goal.id
    and user_id = v_user_id;

  return v_setup || jsonb_build_object('debt_id', v_debt.id);
end;
$$;

revoke all on function public.create_goal_pack_onboarding_setup_v2(
  text,
  text,
  text,
  integer,
  integer,
  date,
  text,
  integer,
  integer,
  integer,
  text,
  jsonb,
  text,
  text,
  text,
  text,
  text,
  integer,
  integer,
  text,
  text,
  text,
  text,
  jsonb,
  text,
  timestamptz,
  text,
  public.debt_type,
  integer,
  integer,
  integer,
  integer,
  public.payment_frequency,
  text,
  text,
  date
) from public;
revoke all on function public.create_goal_pack_onboarding_setup_v2(
  text,
  text,
  text,
  integer,
  integer,
  date,
  text,
  integer,
  integer,
  integer,
  text,
  jsonb,
  text,
  text,
  text,
  text,
  text,
  integer,
  integer,
  text,
  text,
  text,
  text,
  jsonb,
  text,
  timestamptz,
  text,
  public.debt_type,
  integer,
  integer,
  integer,
  integer,
  public.payment_frequency,
  text,
  text,
  date
) from anon;
grant execute on function public.create_goal_pack_onboarding_setup_v2(
  text,
  text,
  text,
  integer,
  integer,
  date,
  text,
  integer,
  integer,
  integer,
  text,
  jsonb,
  text,
  text,
  text,
  text,
  text,
  integer,
  integer,
  text,
  text,
  text,
  text,
  jsonb,
  text,
  timestamptz,
  text,
  public.debt_type,
  integer,
  integer,
  integer,
  integer,
  public.payment_frequency,
  text,
  text,
  date
) to authenticated;

comment on function public.create_goal_pack_onboarding_setup_v2(
  text,
  text,
  text,
  integer,
  integer,
  date,
  text,
  integer,
  integer,
  integer,
  text,
  jsonb,
  text,
  text,
  text,
  text,
  text,
  integer,
  integer,
  text,
  text,
  text,
  text,
  jsonb,
  text,
  timestamptz,
  text,
  public.debt_type,
  integer,
  integer,
  integer,
  integer,
  public.payment_frequency,
  text,
  text,
  date
) is 'Extends Goal Pack onboarding setup by atomically creating or updating the linked debt for debt payoff priorities.';
