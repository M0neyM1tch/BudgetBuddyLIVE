create unique index if not exists goal_actions_open_action_dedupe_idx
  on public.goal_actions (user_id, goal_id, action_type, source)
  where status = 'open'
    and goal_id is not null;

comment on index public.goal_actions_open_action_dedupe_idx is
  'Prevents duplicate open Goal Pack actions for the same user, goal, action type, and source.';
