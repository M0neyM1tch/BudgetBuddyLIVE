create extension if not exists pg_cron with schema extensions;

create or replace function public.process_due_recurring_rules(
  p_user_id uuid default null,
  p_through date default current_date
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_rule record;
  v_next_run date;
  v_month_start date;
  v_last_day int;
  v_desired_day int;
  v_created int := 0;
  v_rules_advanced int := 0;
  v_skipped_paused int := 0;
  v_limited boolean := false;
  v_max int := 100;
  v_processed_occurrences int := 0;
  v_inserted int := 0;
  v_paused_names text[] := '{}';
begin
  for v_rule in
    select *
    from public.recurring_rules
    where is_active = true
      and next_run_date <= p_through
      and (p_user_id is null or user_id = p_user_id)
    order by user_id, next_run_date, id
  loop
    v_next_run := v_rule.next_run_date;

    while v_next_run <= p_through loop
      if v_processed_occurrences >= v_max then
        v_limited := true;
        exit;
      end if;

      insert into public.transactions (
        user_id,
        amount_cents,
        kind,
        category,
        transaction_date,
        description,
        notes,
        source,
        recurring_rule_id
      )
      values (
        v_rule.user_id,
        v_rule.amount_cents,
        v_rule.kind,
        v_rule.category,
        v_next_run,
        v_rule.description,
        v_rule.notes,
        'recurring',
        v_rule.id
      )
      on conflict (recurring_rule_id, transaction_date)
      where recurring_rule_id is not null
      do nothing;

      get diagnostics v_inserted = row_count;
      v_created := v_created + v_inserted;
      v_processed_occurrences := v_processed_occurrences + 1;

      if v_rule.frequency = 'weekly' then
        v_next_run := v_next_run + interval '7 days';
      elsif v_rule.frequency = 'biweekly' then
        v_next_run := v_next_run + interval '14 days';
      elsif v_rule.frequency = 'semi_monthly' then
        v_next_run := v_next_run + interval '15 days';
      else
        v_desired_day := coalesce(v_rule.day_of_month, extract(day from v_next_run)::int);
        v_month_start := (date_trunc('month', v_next_run)::date + interval '1 month')::date;
        v_last_day := extract(day from (date_trunc('month', v_month_start)::date + interval '1 month - 1 day'))::int;
        v_next_run := make_date(
          extract(year from v_month_start)::int,
          extract(month from v_month_start)::int,
          least(v_desired_day, v_last_day)
        );
      end if;
    end loop;

    update public.recurring_rules
    set next_run_date = v_next_run,
        updated_at = now()
    where id = v_rule.id
      and user_id = v_rule.user_id;

    v_rules_advanced := v_rules_advanced + 1;

    if v_limited then
      exit;
    end if;
  end loop;

  select count(*),
         coalesce(array_agg(coalesce(nullif(description, ''), category) order by next_run_date, id), '{}')
  into v_skipped_paused, v_paused_names
  from public.recurring_rules
  where is_active = false
    and next_run_date <= p_through
    and (p_user_id is null or user_id = p_user_id);

  return jsonb_build_object(
    'created', v_created,
    'rules_advanced', v_rules_advanced,
    'skipped_paused', v_skipped_paused,
    'paused_names', v_paused_names,
    'limited', v_limited,
    'through', p_through
  );
end;
$$;

revoke all on function public.process_due_recurring_rules(uuid, date) from public;
revoke all on function public.process_due_recurring_rules(uuid, date) from anon;
revoke all on function public.process_due_recurring_rules(uuid, date) from authenticated;
grant execute on function public.process_due_recurring_rules(uuid, date) to service_role;

comment on function public.process_due_recurring_rules(uuid, date)
  is 'Processes due recurring transaction rules atomically for one user or, when called by trusted database cron, all users.';

create or replace function public.recurring_rules_set_next_run()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    new.next_run_date := new.start_date;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_recurring_rules_next_run on public.recurring_rules;

create trigger trg_recurring_rules_next_run
  before insert on public.recurring_rules
  for each row
  execute function public.recurring_rules_set_next_run();

do $$
begin
  perform cron.unschedule('process-recurring-daily');
exception
  when others then
    null;
end;
$$;

select cron.schedule(
  'process-recurring-daily',
  '0 4 * * *',
  $$select public.process_due_recurring_rules(null, current_date);$$
);
