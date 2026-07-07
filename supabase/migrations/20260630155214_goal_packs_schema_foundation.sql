alter table public.goals
  add column goal_type text not null default 'custom',
  add column priority_rank integer,
  add column monthly_commitment_cents integer,
  add column confidence_score integer,
  add column plan_status text not null default 'draft',
  add column planning_rules jsonb not null default '{}'::jsonb,
  add column last_plan_calculated_at timestamptz,
  add constraint goals_goal_type_check check (
    goal_type in (
      'emergency_fund',
      'debt_payoff',
      'major_purchase',
      'home_fund',
      'custom',
      'retirement',
      'general_savings',
      'bill_reliability'
    )
  ),
  add constraint goals_priority_rank_check check (
    priority_rank is null or priority_rank > 0
  ),
  add constraint goals_monthly_commitment_cents_check check (
    monthly_commitment_cents is null or monthly_commitment_cents >= 0
  ),
  add constraint goals_confidence_score_check check (
    confidence_score is null or confidence_score between 0 and 100
  ),
  add constraint goals_plan_status_check check (
    plan_status in ('draft', 'active', 'paused', 'completed', 'archived')
  ),
  add constraint goals_planning_rules_object_check check (
    jsonb_typeof(planning_rules) = 'object'
  );

create table public.financial_priorities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  active_goal_id uuid references public.goals(id) on delete set null,
  top_priority_type text not null default 'custom',
  horizon text not null default 'unknown',
  country_code text,
  region_code text,
  currency_code text not null default 'CAD',
  monthly_income_cents integer,
  monthly_expenses_cents integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint financial_priorities_top_priority_type_check check (
    top_priority_type in (
      'emergency_fund',
      'debt_payoff',
      'major_purchase',
      'home_fund',
      'custom',
      'retirement',
      'general_savings',
      'bill_reliability'
    )
  ),
  constraint financial_priorities_horizon_check check (
    horizon in ('short_term', 'medium_term', 'long_term', 'ongoing', 'unknown')
  ),
  constraint financial_priorities_country_code_check check (
    country_code is null or char_length(country_code) between 2 and 3
  ),
  constraint financial_priorities_currency_code_check check (
    currency_code ~ '^[A-Z]{3}$'
  ),
  constraint financial_priorities_monthly_income_cents_check check (
    monthly_income_cents is null or monthly_income_cents >= 0
  ),
  constraint financial_priorities_monthly_expenses_cents_check check (
    monthly_expenses_cents is null or monthly_expenses_cents >= 0
  )
);

create table public.goal_plan_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null references public.goals(id) on delete cascade,
  snapshot_kind text not null default 'recalculation',
  progress_percent numeric(6,2) not null default 0,
  projected_completion_date date,
  required_monthly_cents integer,
  current_monthly_capacity_cents integer,
  confidence_score integer not null default 0,
  drivers jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint goal_plan_snapshots_kind_check check (
    snapshot_kind in (
      'initial',
      'recalculation',
      'action_completed',
      'manual_update',
      'scheduled_review',
      'scenario_applied'
    )
  ),
  constraint goal_plan_snapshots_progress_percent_check check (
    progress_percent between 0 and 100
  ),
  constraint goal_plan_snapshots_required_monthly_cents_check check (
    required_monthly_cents is null or required_monthly_cents >= 0
  ),
  constraint goal_plan_snapshots_current_capacity_check check (
    current_monthly_capacity_cents is null or current_monthly_capacity_cents >= 0
  ),
  constraint goal_plan_snapshots_confidence_score_check check (
    confidence_score between 0 and 100
  ),
  constraint goal_plan_snapshots_drivers_array_check check (
    jsonb_typeof(drivers) = 'array'
  ),
  constraint goal_plan_snapshots_recommendations_array_check check (
    jsonb_typeof(recommendations) = 'array'
  )
);

create table public.goal_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid references public.goals(id) on delete cascade,
  action_type text not null,
  title text not null,
  description text,
  impact_label text,
  impact_value jsonb not null default '{}'::jsonb,
  source text not null default 'system',
  status text not null default 'open',
  due_at timestamptz,
  completed_at timestamptz,
  dismissed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint goal_actions_action_type_check check (
    char_length(action_type) between 1 and 80
  ),
  constraint goal_actions_title_check check (
    char_length(title) between 1 and 140
  ),
  constraint goal_actions_description_check check (
    description is null or char_length(description) <= 500
  ),
  constraint goal_actions_impact_label_check check (
    impact_label is null or char_length(impact_label) <= 140
  ),
  constraint goal_actions_impact_value_object_check check (
    jsonb_typeof(impact_value) = 'object'
  ),
  constraint goal_actions_source_check check (
    source in ('onboarding', 'system', 'scenario', 'user', 'recurring_review')
  ),
  constraint goal_actions_status_check check (
    status in ('open', 'completed', 'dismissed', 'expired')
  )
);

create index goals_user_priority_idx
  on public.goals (user_id, priority_rank)
  where priority_rank is not null and is_archived = false;

create index goals_user_goal_type_idx
  on public.goals (user_id, goal_type);

create index financial_priorities_user_idx
  on public.financial_priorities (user_id);

create index financial_priorities_user_active_goal_idx
  on public.financial_priorities (user_id, active_goal_id);

create index goal_plan_snapshots_user_goal_created_idx
  on public.goal_plan_snapshots (user_id, goal_id, created_at desc);

create index goal_actions_user_status_due_idx
  on public.goal_actions (user_id, status, due_at);

create index goal_actions_user_goal_status_idx
  on public.goal_actions (user_id, goal_id, status);

create trigger financial_priorities_set_updated_at before update on public.financial_priorities
  for each row execute function public.set_updated_at();

create trigger goal_actions_set_updated_at before update on public.goal_actions
  for each row execute function public.set_updated_at();

alter table public.financial_priorities enable row level security;
alter table public.goal_plan_snapshots enable row level security;
alter table public.goal_actions enable row level security;

revoke all privileges on table
  public.financial_priorities,
  public.goal_plan_snapshots,
  public.goal_actions
from anon;

revoke all privileges on table
  public.financial_priorities,
  public.goal_plan_snapshots,
  public.goal_actions
from authenticated;

grant select, insert, update, delete on table public.financial_priorities to authenticated;
grant select, insert, update, delete on table public.goal_plan_snapshots to authenticated;
grant select, insert, update, delete on table public.goal_actions to authenticated;

create policy financial_priorities_select_own on public.financial_priorities
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy financial_priorities_insert_own on public.financial_priorities
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and (
      active_goal_id is null
      or exists (
        select 1
        from public.goals
        where goals.id = active_goal_id
          and goals.user_id = (select auth.uid())
      )
    )
  );

create policy financial_priorities_update_own on public.financial_priorities
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and (
      active_goal_id is null
      or exists (
        select 1
        from public.goals
        where goals.id = active_goal_id
          and goals.user_id = (select auth.uid())
      )
    )
  );

create policy financial_priorities_delete_own on public.financial_priorities
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy goal_plan_snapshots_select_own on public.goal_plan_snapshots
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy goal_plan_snapshots_insert_own on public.goal_plan_snapshots
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.goals
      where goals.id = goal_id
        and goals.user_id = (select auth.uid())
    )
  );

create policy goal_plan_snapshots_update_own on public.goal_plan_snapshots
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.goals
      where goals.id = goal_id
        and goals.user_id = (select auth.uid())
    )
  );

create policy goal_plan_snapshots_delete_own on public.goal_plan_snapshots
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy goal_actions_select_own on public.goal_actions
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy goal_actions_insert_own on public.goal_actions
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and (
      goal_id is null
      or exists (
        select 1
        from public.goals
        where goals.id = goal_id
          and goals.user_id = (select auth.uid())
      )
    )
  );

create policy goal_actions_update_own on public.goal_actions
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and (
      goal_id is null
      or exists (
        select 1
        from public.goals
        where goals.id = goal_id
          and goals.user_id = (select auth.uid())
      )
    )
  );

create policy goal_actions_delete_own on public.goal_actions
  for delete to authenticated
  using ((select auth.uid()) = user_id);
