alter table public.user_preferences
  add column if not exists onboarding_completed_at timestamptz default null,
  add column if not exists dismissed_tooltips text[] not null default '{}';

