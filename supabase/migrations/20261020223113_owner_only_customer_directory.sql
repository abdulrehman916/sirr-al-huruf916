-- A single owner controls the app. Legacy role names grant no staff privileges.
create or replace function public.current_role() returns text language sql stable security definer set search_path=''
as $$ select case when exists(select 1 from public.profiles where id=auth.uid() and role='owner' and status='active') then 'owner' else 'customer' end; $$;

create extension if not exists pg_trgm with schema extensions;
create index profiles_customer_email_cursor on public.profiles(lower(email)) where role<>'owner';
create index profiles_customer_search on public.profiles using gin(lower(email||' '||coalesce(full_name,'')) extensions.gin_trgm_ops) where role<>'owner';
create index legacy_customer_email_cursor on public.platform_records(lower(coalesce(data->>'email',data->>'user_email',''))) where entity in ('UserAccessProfile','ApprovedUser');
create index legacy_customer_search on public.platform_records using gin(lower(coalesce(data->>'email',data->>'user_email','')||' '||coalesce(data->>'full_name','')) extensions.gin_trgm_ops) where entity in ('UserAccessProfile','ApprovedUser');

create or replace function public.owner_customer_directory(p_search text default '',p_status text default '',p_after text default '',p_limit integer default 50)
returns jsonb language plpgsql security invoker set search_path=''
as $$
declare page_size integer:=least(greatest(coalesce(p_limit,50),1),100); items jsonb; more boolean; next_cursor text; pattern text;
begin
 if public.current_role()<>'owner' then raise exception 'Owner access required' using errcode='42501'; end if;
 if length(coalesce(p_search,''))>120 then raise exception 'Search must be shorter than 120 characters'; end if;
 pattern:='%'||replace(replace(lower(trim(coalesce(p_search,''))),'%','\%'),'_','\_')||'%';
 with registered as (
   select p.id::text id,p.email,p.full_name,p.status='active' active,
    case when p.status='disabled' then 'BLOCKED' else 'ACTIVE' end account_status,
    true registered,''::text mobile,lower(p.email) sort_key
   from public.profiles p where p.role<>'owner' and lower(p.email)>lower(coalesce(p_after,''))
    and (p_search='' or lower(p.email||' '||coalesce(p.full_name,'')) like pattern)
    and (p_status='' or case when p.status='disabled' then 'BLOCKED' else 'ACTIVE' end=p_status)
   order by lower(p.email) limit page_size+1
 ), legacy as (
   select distinct on (lower(coalesce(r.data->>'email',r.data->>'user_email','')))
    coalesce(r.data->>'_base44_legacy_id',r.id::text) id,coalesce(r.data->>'email',r.data->>'user_email') email,
    coalesce(r.data->>'full_name',r.data->>'name','') full_name,
    coalesce(r.data->>'account_status',r.data->>'status','ACTIVE')='ACTIVE' active,
    coalesce(r.data->>'account_status',r.data->>'status','ACTIVE') account_status,false registered,
    coalesce(r.data->>'mobile',r.data->>'phone','') mobile,lower(coalesce(r.data->>'email',r.data->>'user_email','')) sort_key
   from public.platform_records r where r.entity in ('UserAccessProfile','ApprovedUser')
    and lower(coalesce(r.data->>'email',r.data->>'user_email',''))>lower(coalesce(p_after,''))
    and (p_search='' or lower(coalesce(r.data->>'email',r.data->>'user_email','')||' '||coalesce(r.data->>'full_name','')) like pattern)
    and (p_status='' or coalesce(r.data->>'account_status',r.data->>'status','ACTIVE')=p_status)
    and not exists(select 1 from public.profiles p where lower(p.email)=lower(coalesce(r.data->>'email',r.data->>'user_email','')))
   order by lower(coalesce(r.data->>'email',r.data->>'user_email','')),case when r.entity='UserAccessProfile' then 0 else 1 end,r.updated_at desc
   limit page_size+1
 ), combined as (select * from registered union all select * from legacy), bounded as (
   select *,row_number() over(order by sort_key) position from (select * from combined order by sort_key limit page_size+1) subset
 )
 select coalesce(jsonb_agg(to_jsonb(bounded)-'position'-'sort_key'-'active' order by sort_key) filter(where position<=page_size),'[]'),
   coalesce(bool_or(position>page_size),false),max(sort_key) filter(where position=page_size)
 into items,more,next_cursor from bounded;
 return jsonb_build_object('success',true,'rows',items,'has_more',more,'next_cursor',coalesce(next_cursor,''));
end;
$$;
revoke all on function public.owner_customer_directory(text,text,text,integer) from public,anon;
grant execute on function public.owner_customer_directory(text,text,text,integer) to authenticated;

-- Delegation and admin account/assignment endpoints are retired.
drop function if exists public.manage_admin_workflow(text,jsonb);
drop function if exists private.admin_workflow(text,jsonb);
create or replace function public.owner_set_profile_access(target_id uuid,new_role text default null,new_status text default null)
returns public.profiles language plpgsql security definer set search_path=''
as $$ declare updated_profile public.profiles;
begin
 if public.current_role()<>'owner' then raise exception 'Owner access required'; end if;
 if new_role is not null and new_role not in ('customer','owner') then raise exception 'Separate admin accounts are disabled'; end if;
 if new_status is not null and new_status not in ('active','disabled') then raise exception 'Invalid status'; end if;
 update public.profiles set role=coalesce(new_role,role),status=coalesce(new_status,status) where id=target_id returning * into updated_profile;
 if updated_profile.id is null then raise exception 'Profile not found'; end if;
 return updated_profile;
end; $$;

create or replace function private.owner_support_contact()
returns jsonb language sql stable security definer set search_path=''
as $$ select jsonb_build_object('full_name',r.data->>'full_name','whatsapp_number',r.data->>'whatsapp_number')
from public.platform_records r where r.entity='AdminProfile' and coalesce((r.data->>'is_owner')::boolean,false)
and nullif(r.data->>'whatsapp_number','') is not null
and exists(select 1 from public.profiles where id=auth.uid() and status='active') limit 1; $$;
revoke all on function private.owner_support_contact() from public,anon;
grant execute on function private.owner_support_contact() to authenticated;

create or replace function public.owner_support(p_payload jsonb)
returns jsonb language plpgsql security invoker set search_path=''
as $$
declare actor public.profiles%rowtype; items jsonb; has_more boolean; next_cursor jsonb; contact jsonb;
 page_size integer:=least(greatest(coalesce((p_payload->>'limit')::integer,50),1),100);
 search_pattern text:='%'||left(coalesce(p_payload->>'search',''),120)||'%';
begin
 select * into actor from public.profiles where id=auth.uid() and status='active';
 if actor.id is null then raise exception 'Sign in required' using errcode='42501'; end if;
 if p_payload->>'action'='GET_OWNER_CONTACT' then
   -- Only the explicitly configured support number is exposed, never private profile fields.
   contact:=private.owner_support_contact();
   return jsonb_build_object('success',true,'contact',contact);
 end if;
 if actor.role<>'owner' or p_payload->>'action'<>'GET_SCOPED_TICKETS' then raise exception 'Owner access required' using errcode='42501'; end if;
 with page as (
   select r.*,row_number() over(order by r.created_at desc,r.id desc) position
   from public.platform_records r where r.entity='SupportTickets'
    and (coalesce(p_payload->>'status','')='' or r.data->>'status'=p_payload->>'status')
    and (coalesce(p_payload->>'search','')='' or (coalesce(r.data->>'email','')||' '||coalesce(r.data->>'subject','')||' '||coalesce(r.data->>'name','')||' '||coalesce(r.data->>'ticket_id','')) ilike search_pattern)
    and (p_payload->'after' is null or p_payload->'after'='null'::jsonb or (r.created_at,r.id)<((p_payload#>>'{after,created_at}')::timestamptz,(p_payload#>>'{after,id}')::uuid))
   order by r.created_at desc,r.id desc limit page_size+1
 )
 select coalesce(jsonb_agg(data||jsonb_build_object('id',coalesce(data->>'_base44_legacy_id',id::text),'created_date',created_at) order by created_at desc,id desc) filter(where position<=page_size),'[]'),
   coalesce(bool_or(position>page_size),false),
   (jsonb_agg(jsonb_build_object('created_at',created_at,'id',id) order by created_at desc,id desc) filter(where position=page_size))->0
 into items,has_more,next_cursor from page;
 return jsonb_build_object('success',true,'tickets',items,'is_owner',true,'has_more',has_more,'next_cursor',next_cursor);
end; $$;
revoke all on function public.owner_support(jsonb) from public,anon;
grant execute on function public.owner_support(jsonb) to authenticated;

-- Preserve a recoverable pre-sync copy of each existing card/paragraph.
create table private.source_sync_backups(sync_id text not null,record_id uuid not null,entity text not null,data jsonb not null,backed_up_at timestamptz not null default now(),primary key(sync_id,record_id));
alter table private.source_sync_backups enable row level security;
revoke all on private.source_sync_backups from public,anon,authenticated;

create or replace function private.owner_reply_support(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path=''
as $$ declare actor public.profiles%rowtype; ticket public.platform_records%rowtype; request_id uuid; message text;
begin
 select * into actor from public.profiles where id=auth.uid() and role='owner' and status='active';
 if actor.id is null then raise exception 'Owner access required' using errcode='42501'; end if;
 request_id:=(p_payload->>'request_id')::uuid; message:=trim(coalesce(p_payload->>'message',''));
 if request_id is null or length(message) not between 1 and 6000 then raise exception 'A reply and request ID are required'; end if;
 select * into ticket from public.platform_records where entity='SupportTickets' and data->>'ticket_id'=p_payload->>'ticket_id' for update;
 if ticket.id is null then raise exception 'Ticket not found'; end if;
 if exists(select 1 from public.platform_records where entity='SupportMessage' and data->>'client_request_id'=request_id::text) then return jsonb_build_object('success',true,'already_saved',true); end if;
 insert into public.platform_records(entity,owner_id,data) values('SupportMessage',actor.id,jsonb_build_object('message_id','MSG-'||gen_random_uuid()::text,
 'ticket_id',ticket.data->>'ticket_id','sender_type','ADMIN','sender_id',actor.id,'sender_name',actor.full_name,
 'message',message,'created_at',now(),'is_read',false,'client_request_id',request_id));
 update public.platform_records set data=data||jsonb_build_object('admin_reply',message,'status',case when data->>'status'='OPEN' then 'IN_PROGRESS' else data->>'status' end) where id=ticket.id;
 return jsonb_build_object('success',true);
end; $$;
revoke all on function private.owner_reply_support(jsonb) from public,anon;
grant execute on function private.owner_reply_support(jsonb) to authenticated;
create or replace function public.owner_reply_support(p_payload jsonb) returns jsonb language sql security invoker set search_path=''
as $$ select private.owner_reply_support(p_payload); $$;
revoke all on function public.owner_reply_support(jsonb) from public,anon;
grant execute on function public.owner_reply_support(jsonb) to authenticated;
