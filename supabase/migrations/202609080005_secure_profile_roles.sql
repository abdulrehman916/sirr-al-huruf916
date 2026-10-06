-- Prevent customers from promoting their own profile role.
-- Role/status changes must go through an owner-authorized RPC.

drop policy if exists "profiles_update_self_or_owner" on public.profiles;
revoke update on public.profiles from authenticated;
grant update (full_name, avatar_url, preferred_language) on public.profiles to authenticated;

create policy "profiles_update_safe_self_fields" on public.profiles
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create or replace function public.owner_set_profile_access(
  target_id uuid,
  new_role text default null,
  new_status text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare updated_profile public.profiles;
begin
  if public.current_role() <> 'owner' then
    raise exception 'Owner access required';
  end if;
  if new_role is not null and new_role not in ('customer','editor','admin','owner') then
    raise exception 'Invalid role';
  end if;
  if new_status is not null and new_status not in ('active','disabled') then
    raise exception 'Invalid status';
  end if;

  update public.profiles
  set role = coalesce(new_role, role),
      status = coalesce(new_status, status)
  where id = target_id
  returning * into updated_profile;

  if updated_profile.id is null then raise exception 'Profile not found'; end if;
  return updated_profile;
end;
$$;

revoke all on function public.owner_set_profile_access(uuid,text,text) from public, anon;
grant execute on function public.owner_set_profile_access(uuid,text,text) to authenticated;
