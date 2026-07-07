-- Keep the recurring processor aligned after the function body migration.
-- This RPC intentionally bypasses RLS, but only the service role may execute it.
alter function public.process_due_recurring_rules(uuid, date) security definer;
alter function public.process_due_recurring_rules(uuid, date) set search_path = public, pg_temp;

revoke all on function public.process_due_recurring_rules(uuid, date) from public;
revoke all on function public.process_due_recurring_rules(uuid, date) from anon;
revoke all on function public.process_due_recurring_rules(uuid, date) from authenticated;
grant execute on function public.process_due_recurring_rules(uuid, date) to service_role;

comment on function public.process_due_recurring_rules(uuid, date)
  is 'Processes due recurring transaction rules as a privileged maintenance RPC. Execute is restricted to the service role and invoked through the authenticated Edge Function only.';
