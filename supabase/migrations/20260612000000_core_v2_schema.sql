create extension if not exists "pgcrypto" with schema extensions;

create schema if not exists private;

create type public.transaction_kind as enum ('income', 'expense', 'transfer');
create type public.transaction_source as enum ('manual', 'recurring', 'plaid', 'csv_import');
create type public.recurring_frequency as enum ('weekly', 'biweekly', 'semi_monthly', 'monthly');
create type public.debt_type as enum ('mortgage', 'car_loan', 'student_loan', 'credit_card', 'line_of_credit', 'personal_loan', 'other');
create type public.payment_frequency as enum ('weekly', 'biweekly', 'semi_monthly', 'monthly');
create type public.user_role as enum ('user', 'admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now()
);

create table public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  quick_add_chips jsonb not null default '[]'::jsonb,
  currency_code text not null default 'CAD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_preferences_currency_code_check check (char_length(currency_code) = 3)
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount_cents integer not null,
  starting_balance_cents integer not null default 0,
  current_amount_cents integer not null default 0,
  target_date date,
  color text,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint goals_name_check check (char_length(name) between 1 and 100),
  constraint goals_target_amount_check check (target_amount_cents > 0),
  constraint goals_starting_balance_check check (starting_balance_cents >= 0),
  constraint goals_current_amount_check check (current_amount_cents >= 0)
);

create table public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  debt_type public.debt_type not null default 'personal_loan',
  principal_cents integer not null default 0,
  current_balance_cents integer not null default 0,
  interest_rate_basis_points integer not null default 0,
  payment_frequency public.payment_frequency not null default 'monthly',
  minimum_payment_cents integer not null default 0,
  start_date date,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint debts_name_check check (char_length(name) between 1 and 100),
  constraint debts_principal_check check (principal_cents >= 0),
  constraint debts_current_balance_check check (current_balance_cents >= 0),
  constraint debts_interest_rate_check check (interest_rate_basis_points between 0 and 10000),
  constraint debts_minimum_payment_check check (minimum_payment_cents >= 0)
);

create table public.recurring_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  amount_cents integer not null,
  kind public.transaction_kind not null,
  category text not null,
  frequency public.recurring_frequency not null,
  start_date date not null,
  next_run_date date not null,
  day_of_month integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recurring_rules_description_check check (char_length(description) between 1 and 200),
  constraint recurring_rules_amount_check check (amount_cents <> 0),
  constraint recurring_rules_category_check check (char_length(category) between 1 and 50),
  constraint recurring_rules_day_of_month_check check (day_of_month is null or day_of_month between 1 and 31)
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  transaction_date date not null,
  description text not null,
  amount_cents integer not null,
  kind public.transaction_kind not null,
  category text not null,
  source public.transaction_source not null default 'manual',
  recurring_rule_id uuid references public.recurring_rules(id) on delete set null,
  goal_id uuid references public.goals(id) on delete set null,
  debt_id uuid references public.debts(id) on delete set null,
  bank_connection_id uuid,
  plaid_transaction_id text,
  needs_review boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transactions_description_check check (char_length(description) between 1 and 200),
  constraint transactions_amount_check check (amount_cents <> 0),
  constraint transactions_category_check check (char_length(category) between 1 and 50),
  constraint transactions_notes_check check (notes is null or char_length(notes) <= 500)
);

create unique index transactions_plaid_transaction_id_key
  on public.transactions (plaid_transaction_id)
  where plaid_transaction_id is not null;

create index transactions_user_date_idx on public.transactions (user_id, transaction_date desc);
create index goals_user_idx on public.goals (user_id);
create index debts_user_idx on public.debts (user_id);
create index recurring_rules_user_next_run_idx on public.recurring_rules (user_id, next_run_date) where is_active;

grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.profiles to authenticated;
grant select on table public.user_roles to authenticated;
grant select, insert, update, delete on table public.user_preferences to authenticated;
grant select, insert, update, delete on table public.goals to authenticated;
grant select, insert, update, delete on table public.debts to authenticated;
grant select, insert, update, delete on table public.recurring_rules to authenticated;
grant select, insert, update, delete on table public.transactions to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger user_preferences_set_updated_at before update on public.user_preferences
  for each row execute function public.set_updated_at();
create trigger goals_set_updated_at before update on public.goals
  for each row execute function public.set_updated_at();
create trigger debts_set_updated_at before update on public.debts
  for each row execute function public.set_updated_at();
create trigger recurring_rules_set_updated_at before update on public.recurring_rules
  for each row execute function public.set_updated_at();
create trigger transactions_set_updated_at before update on public.transactions
  for each row execute function public.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'display_name', '')
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(public.profiles.display_name, excluded.display_name);

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.goals enable row level security;
alter table public.debts enable row level security;
alter table public.recurring_rules enable row level security;
alter table public.transactions enable row level security;

create policy profiles_select_own on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);
create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
create policy profiles_delete_own on public.profiles
  for delete to authenticated
  using ((select auth.uid()) = id);

create policy user_roles_select_own on public.user_roles
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy user_preferences_select_own on public.user_preferences
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy user_preferences_insert_own on public.user_preferences
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy user_preferences_update_own on public.user_preferences
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy user_preferences_delete_own on public.user_preferences
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy goals_select_own on public.goals
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy goals_insert_own on public.goals
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy goals_update_own on public.goals
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy goals_delete_own on public.goals
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy debts_select_own on public.debts
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy debts_insert_own on public.debts
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy debts_update_own on public.debts
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy debts_delete_own on public.debts
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy recurring_rules_select_own on public.recurring_rules
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy recurring_rules_insert_own on public.recurring_rules
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy recurring_rules_update_own on public.recurring_rules
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy recurring_rules_delete_own on public.recurring_rules
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy transactions_select_own on public.transactions
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy transactions_insert_own on public.transactions
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy transactions_update_own on public.transactions
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy transactions_delete_own on public.transactions
  for delete to authenticated
  using ((select auth.uid()) = user_id);
