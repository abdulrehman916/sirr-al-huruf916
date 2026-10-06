create or replace function public.request_page_access(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare profile public.profiles%rowtype; request_ref text;
begin
 select * into profile from public.profiles where id=auth.uid() and status='active';
 if not found or profile.role<>'customer' then
   raise exception 'Customer sign in required' using errcode='42501'; end if;
 if length(coalesce(p_payload->>'page_path',''))<2
   or p_payload->>'page_path' not like '/%'
   or p_payload->>'page_path' like '/admin/%' then
   raise exception 'Valid content page required'; end if;
 if length(coalesce(p_payload->>'message','')) > 2000 then
   raise exception 'Message is too long'; end if;
 request_ref := 'REQ-' || upper(replace(gen_random_uuid()::text,'-',''));
 insert into public.platform_records(entity,owner_id,data) values
 ('AccessRequest',profile.id,jsonb_build_object(
   'request_id',request_ref,'user_id',profile.id,'email',profile.email,
   'name',coalesce(nullif(profile.full_name,''),p_payload->>'name'),
   'phone',left(coalesce(p_payload->>'phone',''),60),
   'message',coalesce(p_payload->>'message',''),
   'page_path',p_payload->>'page_path',
   'page_name',p_payload->>'page_name','requested_at',now(),'status','PENDING'));
 return jsonb_build_object('success',true,'request_id',request_ref);
end;
$$;
revoke all on function public.request_page_access(jsonb) from public,anon;
grant execute on function public.request_page_access(jsonb) to authenticated;