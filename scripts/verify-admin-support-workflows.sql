begin;
select set_config('test.owner',(select id::text from public.profiles where role='owner' and status='active' limit 1),true);
do $$ declare label text; uid uuid;
begin foreach label in array array['staff','customer','other'] loop
 uid:=gen_random_uuid(); perform set_config('test.'||label,uid::text,true);
 insert into auth.users(id,aud,role,email,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
 values(uid,'authenticated','authenticated','rollback-'||label||'@example.invalid',now(),'{}','{}',now(),now());
 insert into public.profiles(id,email,full_name,role,status) values(uid,'rollback-'||label||'@example.invalid',label,'customer','active')
 on conflict(id) do update set role='customer',status='active';
end loop; end $$;
select set_config('request.jwt.claim.sub',current_setting('test.owner'),true);
set local role authenticated;
do $$ declare result jsonb; admin_id text; ticket jsonb; message jsonb; changed bigint;
begin
 result:=public.manage_admin_workflow('admins','{"action":"CREATE","email":"rollback-staff@example.invalid","full_name":"Rollback staff","whatsapp_number":"1234567890","permissions":{"support_messages":true,"redeem_code_approval":true}}');
 admin_id:=result#>>'{profile,admin_profile_id}';
 if admin_id is null then raise exception 'Admin creation failed'; end if;
 perform public.manage_admin_workflow('admins',jsonb_build_object('action','UPDATE_PERMISSIONS','admin_profile_id',admin_id,'permissions',jsonb_build_object('support_messages',true)));
 perform public.manage_admin_workflow('assignments',jsonb_build_object('action','ASSIGN','customer_email','rollback-customer@example.invalid','admin_profile_id',admin_id));
 perform set_config('request.jwt.claim.sub',current_setting('test.customer'),true);
 ticket:=public.create_support_record('SupportTickets',jsonb_build_object('ticket_id','SUP-'||gen_random_uuid()::text,'subject','Rollback test','message','Only a rollback fixture','email','spoof@example.invalid'));
 if ticket#>>'{data,email}'<>'rollback-customer@example.invalid' then raise exception 'Email spoofing was accepted'; end if;
 message:=public.create_support_record('SupportMessage',jsonb_build_object('ticket_id',ticket#>>'{data,ticket_id}','message','Rollback customer message','sender_type','ADMIN'));
 if message#>>'{data,sender_type}'<>'CUSTOMER' then raise exception 'Sender spoofing was accepted'; end if;
 update public.platform_records set data=data||'{"admin_reply":"forged"}' where id=(ticket->>'id')::uuid;
 get diagnostics changed=row_count;
 if changed<>0 then raise exception 'Customer forged admin reply'; end if;
 perform set_config('request.jwt.claim.sub',current_setting('test.other'),true);
 if exists(select 1 from public.platform_records where id=(ticket->>'id')::uuid or id=(message->>'id')::uuid) then raise exception 'Another customer saw private support'; end if;
 begin perform public.create_support_record('SupportMessage',jsonb_build_object('ticket_id',ticket#>>'{data,ticket_id}','message','Unauthorized'));
 raise exception 'Cross-customer message accepted'; exception when insufficient_privilege then null; end;
 perform set_config('request.jwt.claim.sub',current_setting('test.staff'),true);
 result:=public.manage_admin_workflow('support','{"action":"GET_SCOPED_TICKETS"}');
 if jsonb_array_length(result->'tickets')<>1 then raise exception 'Assigned admin cannot see ticket'; end if;
 perform public.create_support_record('SupportMessage',jsonb_build_object('ticket_id',ticket#>>'{data,ticket_id}','message','Rollback staff reply'));
 perform set_config('request.jwt.claim.sub',current_setting('test.customer'),true);
 if (select count(*) from public.platform_records where entity='SupportMessage' and data->>'ticket_id'=ticket#>>'{data,ticket_id}')<>2 then raise exception 'Customer cannot read staff reply'; end if;
 perform set_config('request.jwt.claim.sub',current_setting('test.owner'),true);
 perform public.manage_admin_workflow('admins',jsonb_build_object('action','DISABLE','admin_profile_id',admin_id));
 perform public.manage_admin_workflow('admins',jsonb_build_object('action','ENABLE','admin_profile_id',admin_id));
 perform public.manage_admin_workflow('assignments','{"action":"REMOVE","customer_email":"rollback-customer@example.invalid"}');
 perform public.manage_admin_workflow('admins',jsonb_build_object('action','DELETE','admin_profile_id',admin_id));
 if not exists(select 1 from public.profiles where id=current_setting('test.staff')::uuid and role='customer') then raise exception 'Admin deletion did not demote account'; end if;
end $$;
select 'PASS admin create/permissions/disable/enable/delete; assignment; support ticket/message; sender/email protection; customer isolation; assigned admin and customer replies' as checks;
rollback;
