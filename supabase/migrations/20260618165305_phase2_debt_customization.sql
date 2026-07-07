alter table public.debts
  add column if not exists color text default '#00ffaa',
  add column if not exists icon text not null default 'credit-card';

alter table public.debts
  drop constraint if exists debts_color_check;

alter table public.debts
  add constraint debts_color_check
  check (color is null or color ~ '^#[0-9A-Fa-f]{6}$');

alter table public.debts
  drop constraint if exists debts_icon_check;

alter table public.debts
  add constraint debts_icon_check
  check (
    icon = any (array[
      'shopping-cart',
      'credit-card',
      'house',
      'car',
      'landmark',
      'graduation',
      'briefcase',
      'banknote',
      'shirt',
      'travel'
    ])
  );

comment on column public.debts.color is
  'BudgetBuddy debt card accent color stored as a hex color.';

comment on column public.debts.icon is
  'Stable BudgetBuddy debt icon key selected from the app debt icon registry.';
