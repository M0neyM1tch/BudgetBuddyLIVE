alter table public.goals
  add column if not exists icon text not null default 'piggy-bank';

alter table public.goals
  drop constraint if exists goals_icon_check;

alter table public.goals
  add constraint goals_icon_check
  check (
    icon in (
      'piggy-bank',
      'house',
      'target',
      'chart',
      'hand-coins',
      'rocket',
      'dollar',
      'car',
      'plane',
      'graduation',
      'lock',
      'check'
    )
  );

comment on column public.goals.icon is
  'Stable BudgetBuddy goal icon key selected from the app goal icon registry.';
