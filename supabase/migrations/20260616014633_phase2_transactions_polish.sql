alter table public.transactions
  drop constraint if exists transactions_description_check;

alter table public.transactions
  add constraint transactions_description_check
  check (char_length(description) <= 120);

alter table public.recurring_rules
  drop constraint if exists recurring_rules_description_check;

alter table public.recurring_rules
  add column if not exists notes text;

alter table public.recurring_rules
  add constraint recurring_rules_description_check
  check (char_length(description) <= 120);

alter table public.recurring_rules
  add constraint recurring_rules_notes_check
  check (notes is null or char_length(notes) <= 500);

create unique index if not exists transactions_recurring_rule_date_key
  on public.transactions (recurring_rule_id, transaction_date)
  where recurring_rule_id is not null;
