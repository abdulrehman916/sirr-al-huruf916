begin;
select set_config('test.owner',(select id::text from public.profiles where role='owner' limit 1),true);
insert into public.platform_records(entity,owner_id,data,created_at)
select 'SupportMessage',current_setting('test.owner')::uuid,jsonb_build_object('ticket_id','ROLLBACK-THREAD-916','message','Fixture '||i,'sender_type','CUSTOMER'), '2026-10-01'::timestamptz from generate_series(1,103) i;
insert into public.platform_records(entity,owner_id,data) values('SupportMessage',current_setting('test.owner')::uuid,'{"ticket_id":"OTHER-THREAD","message":"Must not appear"}');
select set_config('request.jwt.claim.sub',current_setting('test.owner'),true);
set local role authenticated;
do $$ declare r jsonb; cursor jsonb; ids text[]:='{}'; row jsonb; begin
 loop
 r:=public.owner_support(jsonb_build_object('action','GET_TICKET_MESSAGES','ticket_id','ROLLBACK-THREAD-916','after',cursor,'limit',7));
 if jsonb_array_length(r->'messages')>7 then raise exception 'Message page unbounded'; end if;
 for row in select * from jsonb_array_elements(r->'messages') loop
  if row->>'ticket_id'<>'ROLLBACK-THREAD-916' or row->>'id'=any(ids) then raise exception 'Wrong thread or duplicate'; end if;
  ids:=array_append(ids,row->>'id');
 end loop;
 exit when not (r->>'has_more')::boolean;
 cursor:=r->'next_cursor';
 end loop;
 if cardinality(ids)<>103 then raise exception 'Lost messages: %',cardinality(ids); end if;
 perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
 begin perform public.owner_support('{"action":"GET_TICKET_MESSAGES","ticket_id":"ROLLBACK-THREAD-916"}'); raise exception 'Anonymous profile accessed owner thread'; exception when insufficient_privilege then null; end;
end $$;
select 'PASS 103-message thread, stable cursor at identical timestamps, no duplicates, no cross-thread rows and owner gate' checks;
rollback;