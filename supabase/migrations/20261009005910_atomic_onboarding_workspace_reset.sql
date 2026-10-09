-- One PostgREST transaction replaces the browser's independent DELETE requests.
-- Requires the allocation/retarget schema from 20260721194410.
create function public.reset_onboarding_with_clean_slate()
returns table (
  user_id uuid,
  onboarding_completed_at timestamptz,
  dismissed_tooltips text[]
)
language plpgsql
volatile
security invoker
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Authentication is required to reset the workspace.'
      using errcode = '28000';
  end if;

  -- Coordinate reset calls only. Existing clients and recurring processing
  -- retain their normal locking behavior; this is not authorization or a
  -- promise that writes submitted concurrently/after reset cannot remain.
  if not pg_catalog.pg_try_advisory_xact_lock(
    pg_catalog.hashtextextended('budgbeacon.workspace-reset:' || v_user_id::text, 0)
  ) then
    raise exception 'Another reset is in progress. Refresh and try again.'
      using errcode = '55P03';
  end if;

  -- Follow the allocation contract's recurring -> transaction -> debt -> goal
  -- lock order; deterministic ordering reduces competing row-lock inversions.
  -- A timeout/deadlock still aborts this whole call, without partial deletions.
  perform 1 from public.recurring_rules r
    where r.user_id = v_user_id order by r.id for update;
  perform 1 from public.transactions t
    where t.user_id = v_user_id order by t.id for update;
  perform 1 from public.debts d
    where d.user_id = v_user_id order by d.id for update;
  perform 1 from public.goals g
    where g.user_id = v_user_id order by g.id for update;

  delete from public.goal_actions a where a.user_id = v_user_id;
  delete from public.goal_plan_snapshots s where s.user_id = v_user_id;
  delete from public.financial_priorities p where p.user_id = v_user_id;

  -- Keep allocation targets and rules until transaction triggers reverse their
  -- exact recorded applied amounts. Never disable those financial triggers.
  delete from public.transactions t where t.user_id = v_user_id;
  delete from public.recurring_rules r where r.user_id = v_user_id;
  delete from public.goals g where g.user_id = v_user_id;
  delete from public.debts d where d.user_id = v_user_id;

  -- Preserve preference identity/currency and account/profile/legal/role data.
  -- Recreate missing preferences; a failure here rolls back every earlier step.
  return query
    insert into public.user_preferences as p (
      user_id, onboarding_completed_at, dismissed_tooltips, quick_add_chips
    ) values (v_user_id, null, '{}'::text[], '[]'::jsonb)
    on conflict on constraint user_preferences_user_id_key do update set
      onboarding_completed_at = excluded.onboarding_completed_at,
      dismissed_tooltips = excluded.dismissed_tooltips,
      quick_add_chips = excluded.quick_add_chips
    returning p.user_id, p.onboarding_completed_at, p.dismissed_tooltips;
end;
$$;

revoke all on function public.reset_onboarding_with_clean_slate()
  from public, anon, authenticated, service_role;
grant execute on function public.reset_onboarding_with_clean_slate() to authenticated;

comment on function public.reset_onboarding_with_clean_slate() is
  'Atomically resets the authenticated owner workspace while preserving identity and unrelated preferences. Coordinates reset calls only; concurrent ordinary writes may remain.';
