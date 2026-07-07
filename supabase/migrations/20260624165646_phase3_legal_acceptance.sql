alter table public.profiles
  add column if not exists accepted_terms_at timestamptz,
  add column if not exists accepted_terms_version text;

comment on column public.profiles.accepted_terms_at is
  'Timestamp when the user accepted the Terms of Service and Privacy Policy during signup.';

comment on column public.profiles.accepted_terms_version is
  'Terms and Privacy version label accepted during signup.';

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_terms_version text := nullif(new.raw_user_meta_data ->> 'accepted_terms_version', '');
  v_terms_accepted boolean := lower(coalesce(new.raw_user_meta_data ->> 'accepted_terms_accepted', 'false')) in ('true', '1', 'yes');
begin
  insert into public.profiles (
    id,
    email,
    display_name,
    accepted_terms_at,
    accepted_terms_version
  )
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'display_name', ''),
    case when v_terms_accepted and v_terms_version is not null then now() else null end,
    case when v_terms_accepted then v_terms_version else null end
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(public.profiles.display_name, excluded.display_name),
        accepted_terms_at = coalesce(public.profiles.accepted_terms_at, excluded.accepted_terms_at),
        accepted_terms_version = coalesce(public.profiles.accepted_terms_version, excluded.accepted_terms_version);

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;
