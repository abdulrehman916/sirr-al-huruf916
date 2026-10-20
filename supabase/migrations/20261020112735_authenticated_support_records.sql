create unique index support_ticket_reference_unique on public.platform_records((data->>'ticket_id')) where entity='SupportTickets';
create or replace function private.can_read_support(p_entity text,p_data jsonb,p_owner uuid)
returns boolean language plpgsql stable security definer set search_path=''
as $$
declare actor public.profiles%rowtype; staff public.platform_records%rowtype; ticket public.platform_records%rowtype;
begin
 select * into actor from public.profiles where id=auth.uid() and status='active';
 if actor.id is null then return false; end if;
 if actor.role='owner' then return true; end if;
 if p_entity='SupportTickets' then ticket.data:=p_data; ticket.owner_id:=p_owner;
 else select * into ticket from public.platform_records where entity='SupportTickets' and data->>'ticket_id'=p_data->>'ticket_id' limit 1; end if;
 if actor.role='customer' then return ticket.owner_id=actor.id or ticket.data->>'user_id'=actor.id::text; end if;
 if actor.role<>'admin' then return false; end if;
 select * into staff from public.platform_records where entity='AdminProfile' and data->>'status'='ACTIVE'
 and (data->>'user_id'=actor.id::text or lower(data->>'email')=lower(actor.email))
 and coalesce((data->>'perm_support_messages')::boolean,false) limit 1;
 return staff.id is not null and exists(select 1 from public.platform_records r where r.entity='UserAccessProfile'
 and lower(coalesce(r.data->>'email',r.data->>'user_email'))=lower(ticket.data->>'email')
 and r.data->>'assigned_admin_id' in (staff.id::text,staff.data->>'admin_profile_id'));
end;
$$;
revoke all on function private.can_read_support(text,jsonb,uuid) from public,anon;
grant execute on function private.can_read_support(text,jsonb,uuid) to authenticated;
create policy support_read_scope on public.platform_records as restrictive for select to authenticated
using (entity not in ('SupportTickets','SupportMessage') or private.can_read_support(entity,data,owner_id));
create policy support_insert_endpoint_only on public.platform_records as restrictive for insert to authenticated
with check (entity not in ('SupportTickets','SupportMessage'));
create policy support_update_scope on public.platform_records as restrictive for update to authenticated
using (entity not in ('SupportTickets','SupportMessage') or (public.current_role() in ('owner','admin') and private.can_read_support(entity,data,owner_id)))
with check (entity not in ('SupportTickets','SupportMessage') or (public.current_role() in ('owner','admin') and private.can_read_support(entity,data,owner_id)));
create policy support_delete_scope on public.platform_records as restrictive for delete to authenticated
using (entity not in ('SupportTickets','SupportMessage') or public.current_role()='owner');

create or replace function private.create_support_record(p_entity text,p_payload jsonb)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare actor public.profiles%rowtype; rec public.platform_records%rowtype; ticket public.platform_records%rowtype;
 payload jsonb; field text; target_id text; value_text text;
begin
 select * into actor from public.profiles where id=auth.uid() and status='active';
 if actor.id is null then raise exception 'Sign in required' using errcode='42501'; end if;
 if p_entity not in ('SupportTickets','SupportMessage') then raise exception 'Invalid support entity'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('support:'||actor.id::text));
 if p_entity='SupportTickets' then
   if length(trim(coalesce(p_payload->>'subject',''))) not between 1 and 250 or length(trim(coalesce(p_payload->>'message',''))) not between 1 and 6000 then raise exception 'Subject and message required (maximum 6000 characters)'; end if;
   if (select count(*) from public.platform_records where entity='SupportTickets' and owner_id=actor.id and created_at>now()-interval '1 hour')>=10 then raise exception 'Please wait before sending more support requests'; end if;
   if p_payload->>'subject'='Live Chat' then
     select * into rec from public.platform_records where entity='SupportTickets' and owner_id=actor.id and data->>'subject'='Live Chat' and data->>'status'<>'CLOSED' order by created_at desc limit 1;
     if rec.id is not null then return to_jsonb(rec); end if;
   end if;
   target_id:=p_payload->>'ticket_id';
   if target_id is null or target_id !~ '^SUP-[A-Fa-f0-9-]{12,40}$' then target_id:='SUP-'||upper(gen_random_uuid()::text); end if;
   select * into rec from public.platform_records where entity='SupportTickets' and data->>'ticket_id'=target_id and owner_id=actor.id;
   if rec.id is not null then return to_jsonb(rec); end if;
   payload:=jsonb_build_object('ticket_id',target_id,'user_id',actor.id,'email',actor.email,
     'contact_email',left(coalesce(p_payload->>'email',actor.email),320),'name',left(coalesce(nullif(p_payload->>'name',''),actor.full_name),200),
     'mobile',left(coalesce(p_payload->>'mobile',''),60),'category',left(coalesce(p_payload->>'category','General Question'),100),
     'subject',p_payload->>'subject','message',p_payload->>'message','status','OPEN','created_at',now());
   foreach field in array array['attachment_url','audio_url'] loop
     value_text:=nullif(p_payload->>field,'');
     if value_text is not null then
       if value_text not like 'storage://private-documents/'||actor.id::text||'/%' then raise exception 'Use an attachment uploaded by this account'; end if;
       payload:=payload||jsonb_build_object(field,value_text);
     end if;
   end loop;
   if p_payload ? 'audio_duration' then payload:=payload||jsonb_build_object('audio_duration',p_payload->'audio_duration'); end if;
 else
   select * into ticket from public.platform_records where entity='SupportTickets' and data->>'ticket_id'=p_payload->>'ticket_id' limit 1;
   if ticket.id is null or not private.can_read_support('SupportTickets',ticket.data,ticket.owner_id) then raise exception 'Ticket not found' using errcode='42501'; end if;
   if length(trim(coalesce(p_payload->>'message',''))) not between 1 and 6000 then raise exception 'A message is required (maximum 6000 characters)'; end if;
   payload:=jsonb_build_object('message_id','MSG-'||gen_random_uuid()::text,'ticket_id',ticket.data->>'ticket_id',
      'sender_type',case when actor.role in ('owner','admin') then 'ADMIN' else 'CUSTOMER' end,'sender_id',actor.id,
      'sender_name',coalesce(actor.full_name,actor.email),'message',p_payload->>'message','created_at',now(),'is_read',false);
 end if;
 insert into public.platform_records(entity,owner_id,data) values(p_entity,actor.id,payload) returning * into rec;
 return to_jsonb(rec);
end;
$$;
revoke all on function private.create_support_record(text,jsonb) from public,anon;
grant execute on function private.create_support_record(text,jsonb) to authenticated;
create or replace function public.create_support_record(p_entity text,p_payload jsonb)
returns jsonb language sql security invoker set search_path='' as $$ select private.create_support_record(p_entity,p_payload); $$;
revoke all on function public.create_support_record(text,jsonb) from public,anon;
grant execute on function public.create_support_record(text,jsonb) to authenticated;

-- Browser recorders use their actual format (Safari may produce MP4 audio).
update storage.buckets set allowed_mime_types=array['application/pdf','image/jpeg','image/png','image/webp','audio/mpeg','audio/webm','audio/mp4','audio/wav','audio/x-wav','audio/ogg'] where id='private-documents';
