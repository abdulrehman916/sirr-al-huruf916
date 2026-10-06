create or replace function public.can_access_resource(target uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists(
    select 1 from public.resources r
    where r.id=target and r.status='PUBLISHED' and
      (r.access_mode='FREE' or
       (exists(select 1 from public.profiles p where p.id=auth.uid() and p.status='active')
        and (r.access_mode='LOGIN'
         or public.current_role() in ('editor','admin','owner')
         or exists(select 1 from public.entitlements e where e.user_id=auth.uid()
           and e.resource_id=r.id and e.revoked_at is null
           and (e.expires_at is null or e.expires_at>now()))
         or (r.metadata->>'route_path' is not null
           and public.can_access_legacy_page(r.metadata->>'route_path')))))
  );
$$;