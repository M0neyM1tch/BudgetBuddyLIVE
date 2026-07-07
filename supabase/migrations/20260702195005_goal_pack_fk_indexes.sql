create index if not exists financial_priorities_active_goal_id_idx
  on public.financial_priorities (active_goal_id)
  where active_goal_id is not null;

create index if not exists goal_actions_goal_id_idx
  on public.goal_actions (goal_id)
  where goal_id is not null;

create index if not exists goal_plan_snapshots_goal_id_idx
  on public.goal_plan_snapshots (goal_id);
