ALTER TABLE public.goals
  DROP CONSTRAINT goals_icon_check;

ALTER TABLE public.goals
  ADD CONSTRAINT goals_icon_check CHECK (
    icon = ANY (ARRAY[
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
      'check',
      'crown',
      'store',
      'tag',
      'gift',
      'receipt',
      'banknote-up',
      'badge-dollar',
      'party'
    ])
  );