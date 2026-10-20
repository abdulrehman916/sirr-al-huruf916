begin;
select set_config('test.owner',(select id::text from public.profiles where role='owner' and status='active' limit 1),true);
select set_config('test.customer',gen_random_uuid()::text,true);
insert into auth.users(id,aud,role,email,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
values(current_setting('test.customer')::uuid,'authenticated','authenticated','rollback-workflow@example.invalid',now(),'{}','{}',now(),now());
insert into public.profiles(id,email,full_name,role,status) values(current_setting('test.customer')::uuid,
'rollback-workflow@example.invalid','Rollback only','customer','active') on conflict(id) do update set role='customer',status='active';
insert into public.platform_records(entity,owner_id,data) values('AccessCode',current_setting('test.owner')::uuid,
 jsonb_build_object('code','ROLLBACK-WORKFLOW-TEST','page_paths',jsonb_build_array('/abjad'),'max_uses',1,'expiry_date',now()+interval '1 day'));
select set_config('request.jwt.claim.sub',current_setting('test.customer'),true);
set local role authenticated;
do $$ declare result jsonb; aid text; target uuid:=current_setting('test.customer')::uuid;
begin
 result:=public.manage_redeem_approval(jsonb_build_object('action','SUBMIT','code','ROLLBACK-WORKFLOW-TEST'));
 if result->>'success'<>'true' then raise exception 'Submission failed'; end if;
 aid:=result->>'approval_id';
 result:=public.manage_redeem_approval(jsonb_build_object('action','SUBMIT','code','ROLLBACK-WORKFLOW-TEST'));
 if result->>'already_submitted'<>'true' then raise exception 'Duplicate not prevented'; end if;
 begin perform public.manage_redeem_approval(jsonb_build_object('action','APPROVE','approval_id',aid));
 raise exception 'Customer approved own code'; exception when insufficient_privilege then null; end;
 perform set_config('request.jwt.claim.sub',current_setting('test.owner'),true);
 perform public.manage_redeem_approval(jsonb_build_object('action','REQUEST_INFO','approval_id',aid,'info_request_message','Rollback test'));
 perform set_config('request.jwt.claim.sub',current_setting('test.customer'),true);
 perform public.manage_redeem_approval(jsonb_build_object('action','RESPOND_INFO','approval_id',aid,'customer_response','Rollback test response'));
 perform set_config('request.jwt.claim.sub',current_setting('test.owner'),true);
 perform public.manage_redeem_approval(jsonb_build_object('action','APPROVE','approval_id',aid));
 if not exists(select 1 from public.platform_records where entity='AccessCode' and data->>'code'='ROLLBACK-WORKFLOW-TEST' and data->>'linked_user_id'=target::text) then raise exception 'Approved code not linked'; end if;
 perform public.manage_redeem_approval(jsonb_build_object('action','APPROVE','approval_id',aid));
 if (select (data->>'use_count')::integer from public.platform_records where entity='AccessCode' and data->>'code'='ROLLBACK-WORKFLOW-TEST')<>1 then raise exception 'Duplicate approval consumed another use'; end if;
 perform public.manage_redeem_approval(jsonb_build_object('action','OVERRIDE','approval_id',aid,'new_status','REJECTED','override_reason','Rollback test'));
 if exists(select 1 from public.platform_records where entity='AccessCode' and data->>'code'='ROLLBACK-WORKFLOW-TEST' and nullif(data->>'linked_user_id','') is not null) then raise exception 'Rejected approval retained access'; end if;
end $$;
select 'PASS submit, duplicate, customer denial, info request/response, approve/link, repeated approval, override/revoke' as checks;
rollback;
