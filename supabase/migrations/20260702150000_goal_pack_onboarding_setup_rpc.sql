create or replace function public.create_goal_pack_onboarding_setup(
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
  p_action_due_at timestamptz default null
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_priority public.financial_priorities%rowtype;
  v_goal public.goals%rowtype;
  v_action public.goal_actions%rowtype;
  v_reused_goal boolean := false;
begin
  if v_user_id is null then
    raise exception 'Authentication is required to create a Goal Pack onboarding setup.'
      using errcode = '28000';
  end if;

  if nullif(btrim(p_goal_name), '') is null then
    raise exception 'Goal name is required.'
      using errcode = '22023';
  end if;

  if p_target_amount_cents is null or p_target_amount_cents <= 0 then
    raise exception 'Goal target amount must be greater than zero.'
      using errcode = '22023';
  end if;

  if p_starting_balance_cents is null or p_starting_balance_cents < 0 then
    raise exception 'Goal starting balance cannot be negative.'
      using errcode = '22023';
  end if;

  if p_starting_balance_cents > p_target_amount_cents then
    raise exception 'Goal starting balance cannot exceed the target amount.'
      using errcode = '22023';
  end if;

  if nullif(btrim(p_action_type), '') is null or nullif(btrim(p_action_title), '') is null then
    raise exception 'A starter action type and title are required.'
      using errcode = '22023';
  end if;

  select *
  into v_priority
  from public.financial_priorities
  where user_id = v_user_id
  for update;

  if found and v_priority.active_goal_id is not null then
    select *
    into v_goal
    from public.goals
    where id = v_priority.active_goal_id
      and user_id = v_user_id
      and is_archived = false
    for update;

    if found then
      v_reused_goal := true;
    end if;
  end if;

  if v_reused_goal then
    update public.goals
    set name = btrim(p_goal_name),
        color = p_goal_color,
        icon = p_goal_icon,
        target_amount_cents = p_target_amount_cents,
        starting_balance_cents = p_starting_balance_cents,
        current_amount_cents = case
          when current_amount_cents = starting_balance_cents then p_starting_balance_cents
          else current_amount_cents
        end,
        target_date = p_target_date,
        goal_type = p_goal_type,
        priority_rank = p_priority_rank,
        monthly_commitment_cents = p_monthly_commitment_cents,
        confidence_score = p_confidence_score,
        plan_status = p_plan_status,
        planning_rules = coalesce(p_planning_rules, '{}'::jsonb),
        last_plan_calculated_at = now(),
        updated_at = now()
    where id = v_goal.id
      and user_id = v_user_id
    returning * into v_goal;
  else
    insert into public.goals (
      user_id,
      name,
      color,
      icon,
      target_amount_cents,
      starting_balance_cents,
      current_amount_cents,
      target_date,
      goal_type,
      priority_rank,
      monthly_commitment_cents,
      confidence_score,
      plan_status,
      planning_rules,
      last_plan_calculated_at
    )
    values (
      v_user_id,
      btrim(p_goal_name),
      p_goal_color,
      p_goal_icon,
      p_target_amount_cents,
      p_starting_balance_cents,
      p_starting_balance_cents,
      p_target_date,
      p_goal_type,
      p_priority_rank,
      p_monthly_commitment_cents,
      p_confidence_score,
      p_plan_status,
      coalesce(p_planning_rules, '{}'::jsonb),
      now()
    )
    returning * into v_goal;
  end if;

  insert into public.financial_priorities (
    user_id,
    active_goal_id,
    top_priority_type,
    horizon,
    country_code,
    region_code,
    currency_code,
    monthly_income_cents,
    monthly_expenses_cents
  )
  values (
    v_user_id,
    v_goal.id,
    p_top_priority_type,
    p_horizon,
    p_country_code,
    nullif(btrim(p_region_code), ''),
    p_currency_code,
    p_monthly_income_cents,
    p_monthly_expenses_cents
  )
  on conflict (user_id) do update
  set active_goal_id = excluded.active_goal_id,
      top_priority_type = excluded.top_priority_type,
      horizon = excluded.horizon,
      country_code = excluded.country_code,
      region_code = excluded.region_code,
      currency_code = excluded.currency_code,
      monthly_income_cents = excluded.monthly_income_cents,
      monthly_expenses_cents = excluded.monthly_expenses_cents,
      updated_at = now();

  select *
  into v_action
  from public.goal_actions
  where user_id = v_user_id
    and goal_id = v_goal.id
    and source = p_action_source
    and action_type = p_action_type
    and status = 'open'
  order by created_at desc
  limit 1
  for update;

  if found then
    update public.goal_actions
    set title = btrim(p_action_title),
        description = nullif(btrim(p_action_description), ''),
        impact_label = nullif(btrim(p_action_impact_label), ''),
        impact_value = coalesce(p_action_impact_value, '{}'::jsonb),
        due_at = p_action_due_at,
        updated_at = now()
    where id = v_action.id
      and user_id = v_user_id
    returning * into v_action;
  else
    insert into public.goal_actions (
      user_id,
      goal_id,
      action_type,
      title,
      description,
      impact_label,
      impact_value,
      source,
      status,
      due_at
    )
    values (
      v_user_id,
      v_goal.id,
      p_action_type,
      btrim(p_action_title),
      nullif(btrim(p_action_description), ''),
      nullif(btrim(p_action_impact_label), ''),
      coalesce(p_action_impact_value, '{}'::jsonb),
      p_action_source,
      'open',
      p_action_due_at
    )
    returning * into v_action;
  end if;

  return jsonb_build_object(
    'goal_id', v_goal.id,
    'action_id', v_action.id,
    'reused_goal', v_reused_goal
  );
end;
$$;

revoke all on function public.create_goal_pack_onboarding_setup(
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
  timestamptz
) from public;
revoke all on function public.create_goal_pack_onboarding_setup(
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
  timestamptz
) from anon;
grant execute on function public.create_goal_pack_onboarding_setup(
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
  timestamptz
) to authenticated;

comment on function public.create_goal_pack_onboarding_setup(
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
  timestamptz
) is 'Atomically creates or reuses a starter Goal Pack goal, financial priority, and first onboarding action for the authenticated user.';
