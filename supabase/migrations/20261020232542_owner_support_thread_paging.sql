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
 if actor.role<>'owner' or coalesce(p_payload->>'action','') not in ('GET_SCOPED_TICKETS','GET_TICKET_MESSAGES') then raise exception 'Owner access required' using errcode='42501'; end if;
 with page as (
   select r.*,row_number() over(order by r.created_at desc,r.id desc) position
   from public.platform_records r where ((p_payload->>'action'='GET_SCOPED_TICKETS' and r.entity='SupportTickets') or (p_payload->>'action'='GET_TICKET_MESSAGES' and r.entity='SupportMessage' and r.data->>'ticket_id'=p_payload->>'ticket_id'))
    and (coalesce(p_payload->>'status','')='' or r.data->>'status'=p_payload->>'status')
    and (coalesce(p_payload->>'search','')='' or (coalesce(r.data->>'email','')||' '||coalesce(r.data->>'subject','')||' '||coalesce(r.data->>'name','')||' '||coalesce(r.data->>'ticket_id','')) ilike search_pattern)
    and (p_payload->'after' is null or p_payload->'after'='null'::jsonb or (r.created_at,r.id)<((p_payload#>>'{after,created_at}')::timestamptz,(p_payload#>>'{after,id}')::uuid))
   order by r.created_at desc,r.id desc limit page_size+1
 )
 select coalesce(jsonb_agg(data||jsonb_build_object('id',coalesce(data->>'_base44_legacy_id',id::text),'created_date',created_at) order by created_at desc,id desc) filter(where position<=page_size),'[]'),
   coalesce(bool_or(position>page_size),false),
   (jsonb_agg(jsonb_build_object('created_at',created_at,'id',id) order by created_at desc,id desc) filter(where position=page_size))->0
 into items,has_more,next_cursor from page;
 return jsonb_build_object('success',true,case when p_payload->>'action'='GET_TICKET_MESSAGES' then 'messages' else 'tickets' end,items,'is_owner',true,'has_more',has_more,'next_cursor',next_cursor);
end; $$;
revoke all on function public.owner_support(jsonb) from public,anon;
grant execute on function public.owner_support(jsonb) to authenticated;

