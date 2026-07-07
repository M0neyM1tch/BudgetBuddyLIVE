create or replace function public.apply_goal_plan_recalculation(
  p_goal_id uuid,
  p_goal_type text,
  p_priority_rank integer,
  p_monthly_commitment_cents integer,
  p_confidence_score integer,
  p_plan_status text,
  p_planning_rules jsonb,
  p_last_plan_calculated_at timestamptz,
  p_snapshot_kind text,
  p_progress_percent numeric,
  p_projected_completion_date date,
  p_required_monthly_cents integer,
  p_current_monthly_capacity_cents integer,
  p_snapshot_confidence_score integer,
  p_drivers jsonb,
  p_recommendations jsonb,
  p_action_type text,
  p_action_title text,
  p_action_description text default null,
  p_action_impact_label text default null,
  p_action_impact_value jsonb default '{}'::jsonb,
  p_action_source text default 'system',
  p_action_due_at timestamptz default null
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_goal public.goals%rowtype;
  v_snapshot public.goal_plan_snapshots%rowtype;
  v_action public.goal_actions%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication is required to recalculate a Goal Pack plan.'
      using errcode = '28000';
  end if;

  select *
  into v_goal
  from public.goals
  where id = p_goal_id
    and user_id = v_user_id
    and is_archived = false
  for update;

  if not found then
    raise exception 'Goal plan was not found.'
      using errcode = 'P0002';
  end if;

  update public.goals
  set goal_type = p_goal_type,
      priority_rank = p_priority_rank,
      monthly_commitment_cents = p_monthly_commitment_cents,
      confidence_score = p_confidence_score,
      plan_status = p_plan_status,
      planning_rules = coalesce(p_planning_rules, '{}'::jsonb),
      last_plan_calculated_at = p_last_plan_calculated_at,
      updated_at = now()
  where id = v_goal.id
    and user_id = v_user_id
  returning * into v_goal;

  insert into public.goal_plan_snapshots (
    user_id,
    goal_id,
    snapshot_kind,
    progress_percent,
    projected_completion_date,
    required_monthly_cents,
    current_monthly_capacity_cents,
    confidence_score,
    drivers,
    recommendations
  )
  values (
    v_user_id,
    v_goal.id,
    p_snapshot_kind,
    p_progress_percent,
    p_projected_completion_date,
    p_required_monthly_cents,
    p_current_monthly_capacity_cents,
    p_snapshot_confidence_score,
    coalesce(p_drivers, '[]'::jsonb),
    coalesce(p_recommendations, '[]'::jsonb)
  )
  returning * into v_snapshot;

  if nullif(btrim(p_action_type), '') is not null
    and nullif(btrim(p_action_title), '') is not null then
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
      btrim(p_action_type),
      btrim(p_action_title),
      nullif(btrim(p_action_description), ''),
      nullif(btrim(p_action_impact_label), ''),
      coalesce(p_action_impact_value, '{}'::jsonb),
      coalesce(nullif(btrim(p_action_source), ''), 'system'),
      'open',
      p_action_due_at
    )
    on conflict (user_id, goal_id, action_type, source)
      where status = 'open'
        and goal_id is not null
    do update
    set title = excluded.title,
        description = excluded.description,
        impact_label = excluded.impact_label,
        impact_value = excluded.impact_value,
        due_at = excluded.due_at,
        updated_at = now()
    returning * into v_action;
  end if;

  return jsonb_build_object(
    'action', case when v_action.id is null then null else to_jsonb(v_action) end,
    'goal', to_jsonb(v_goal),
    'snapshot', to_jsonb(v_snapshot)
  );
end;
$$;

revoke all on function public.apply_goal_plan_recalculation(
  uuid,
  text,
  integer,
  integer,
  integer,
  text,
  jsonb,
  timestamptz,
  text,
  numeric,
  date,
  integer,
  integer,
  integer,
  jsonb,
  jsonb,
  text,
  text,
  text,
  text,
  jsonb,
  text,
  timestamptz
) from public;
revoke all on function public.apply_goal_plan_recalculation(
  uuid,
  text,
  integer,
  integer,
  integer,
  text,
  jsonb,
  timestamptz,
  text,
  numeric,
  date,
  integer,
  integer,
  integer,
  jsonb,
  jsonb,
  text,
  text,
  text,
  text,
  jsonb,
  text,
  timestamptz
) from anon;
grant execute on function public.apply_goal_plan_recalculation(
  uuid,
  text,
  integer,
  integer,
  integer,
  text,
  jsonb,
  timestamptz,
  text,
  numeric,
  date,
  integer,
  integer,
  integer,
  jsonb,
  jsonb,
  text,
  text,
  text,
  text,
  jsonb,
  text,
  timestamptz
) to authenticated;

comment on function public.apply_goal_plan_recalculation(
  uuid,
  text,
  integer,
  integer,
  integer,
  text,
  jsonb,
  timestamptz,
  text,
  numeric,
  date,
  integer,
  integer,
  integer,
  jsonb,
  jsonb,
  text,
  text,
  text,
  text,
  jsonb,
  text,
  timestamptz
) is 'Atomically applies a Goal Pack recalculation: goal planning fields, snapshot creation, and idempotent open-action upsert.';

create or replace function public.complete_goal_action_with_plan(
  p_action_id uuid,
  p_completed_at timestamptz,
  p_goal_type text,
  p_priority_rank integer,
  p_monthly_commitment_cents integer,
  p_confidence_score integer,
  p_plan_status text,
  p_planning_rules jsonb,
  p_last_plan_calculated_at timestamptz,
  p_progress_percent numeric,
  p_projected_completion_date date,
  p_required_monthly_cents integer,
  p_current_monthly_capacity_cents integer,
  p_snapshot_confidence_score integer,
  p_drivers jsonb,
  p_recommendations jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_action public.goal_actions%rowtype;
  v_goal public.goals%rowtype;
  v_snapshot public.goal_plan_snapshots%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication is required to complete a Goal Pack action.'
      using errcode = '28000';
  end if;

  select *
  into v_action
  from public.goal_actions
  where id = p_action_id
    and user_id = v_user_id
  for update;

  if not found then
    raise exception 'Goal action was not found.'
      using errcode = 'P0002';
  end if;

  if v_action.status not in ('open', 'completed') then
    raise exception 'Only open Goal Pack actions can be completed.'
      using errcode = '22023';
  end if;

  if v_action.goal_id is null then
    update public.goal_actions
    set completed_at = coalesce(p_completed_at, now()),
        dismissed_at = null,
        status = 'completed',
        updated_at = now()
    where id = v_action.id
      and user_id = v_user_id
    returning * into v_action;

    return jsonb_build_object(
      'action', to_jsonb(v_action),
      'goal', null,
      'snapshot', null
    );
  end if;

  select *
  into v_goal
  from public.goals
  where id = v_action.goal_id
    and user_id = v_user_id
    and is_archived = false
  for update;

  if not found then
    raise exception 'Goal plan was not found.'
      using errcode = 'P0002';
  end if;

  update public.goal_actions
  set completed_at = coalesce(p_completed_at, now()),
      dismissed_at = null,
      status = 'completed',
      updated_at = now()
  where id = v_action.id
    and user_id = v_user_id
  returning * into v_action;

  update public.goals
  set goal_type = p_goal_type,
      priority_rank = p_priority_rank,
      monthly_commitment_cents = p_monthly_commitment_cents,
      confidence_score = p_confidence_score,
      plan_status = p_plan_status,
      planning_rules = coalesce(p_planning_rules, '{}'::jsonb),
      last_plan_calculated_at = p_last_plan_calculated_at,
      updated_at = now()
  where id = v_goal.id
    and user_id = v_user_id
  returning * into v_goal;

  insert into public.goal_plan_snapshots (
    user_id,
    goal_id,
    snapshot_kind,
    progress_percent,
    projected_completion_date,
    required_monthly_cents,
    current_monthly_capacity_cents,
    confidence_score,
    drivers,
    recommendations
  )
  values (
    v_user_id,
    v_goal.id,
    'action_completed',
    p_progress_percent,
    p_projected_completion_date,
    p_required_monthly_cents,
    p_current_monthly_capacity_cents,
    p_snapshot_confidence_score,
    coalesce(p_drivers, '[]'::jsonb),
    coalesce(p_recommendations, '[]'::jsonb)
  )
  returning * into v_snapshot;

  return jsonb_build_object(
    'action', to_jsonb(v_action),
    'goal', to_jsonb(v_goal),
    'snapshot', to_jsonb(v_snapshot)
  );
end;
$$;

revoke all on function public.complete_goal_action_with_plan(
  uuid,
  timestamptz,
  text,
  integer,
  integer,
  integer,
  text,
  jsonb,
  timestamptz,
  numeric,
  date,
  integer,
  integer,
  integer,
  jsonb,
  jsonb
) from public;
revoke all on function public.complete_goal_action_with_plan(
  uuid,
  timestamptz,
  text,
  integer,
  integer,
  integer,
  text,
  jsonb,
  timestamptz,
  numeric,
  date,
  integer,
  integer,
  integer,
  jsonb,
  jsonb
) from anon;
grant execute on function public.complete_goal_action_with_plan(
  uuid,
  timestamptz,
  text,
  integer,
  integer,
  integer,
  text,
  jsonb,
  timestamptz,
  numeric,
  date,
  integer,
  integer,
  integer,
  jsonb,
  jsonb
) to authenticated;

comment on function public.complete_goal_action_with_plan(
  uuid,
  timestamptz,
  text,
  integer,
  integer,
  integer,
  text,
  jsonb,
  timestamptz,
  numeric,
  date,
  integer,
  integer,
  integer,
  jsonb,
  jsonb
) is 'Atomically completes a Goal Pack action and applies the resulting goal plan update and action-completed snapshot.';
