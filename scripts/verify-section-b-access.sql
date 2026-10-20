begin;
select set_config('test.owner',(select id::text from public.profiles where role='owner' and status='active' limit 1),true);
select set_config('test.customer',gen_random_uuid()::text,true);
insert into auth.users(id,aud,role,email,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
values(current_setting('test.customer')::uuid,'authenticated','authenticated','rollback-section-b@example.invalid',now(),'{}','{}',now(),now());
insert into public.profiles(id,email,full_name,role,status) values(current_setting('test.customer')::uuid,'rollback-section-b@example.invalid','Rollback only','customer','active') on conflict(id) do update set role='customer',status='active';
update public.platform_records set data=data||'{"requires_permission":true}' where entity='FeatureConfig' and data->>'page_path'='/holy-names' and data->>'feature_id'='section_b';
insert into public.platform_records(entity,owner_id,data) values('AccessCode',current_setting('test.owner')::uuid,
jsonb_build_object('code','ROLLBACK-SECTION-B','linked_user_id',current_setting('test.customer'),'page_paths',jsonb_build_array('/holy-names'),
'page_grants',jsonb_build_object('/holy-names',jsonb_build_object('expires_at',null,'granted_at',now())),
'sub_features',jsonb_build_object('/holy-names',jsonb_build_array('section_a'))));
select set_config('request.jwt.claim.sub',current_setting('test.customer'),true);
set local role authenticated;
do $$ declare visible_count integer;
begin
 select count(*) into visible_count from public.platform_records where entity='HolyOnePDFName';
 if visible_count<>0 then raise exception 'Section A code exposed Section B'; end if;
 perform set_config('request.jwt.claim.sub',current_setting('test.owner'),true);
 update public.platform_records set data=data||jsonb_build_object('sub_features',jsonb_build_object('/holy-names',jsonb_build_array('section_b')),
 'feature_durations',jsonb_build_object('/holy-names:section_b',jsonb_build_object('duration_ms',60000,'added_at',now()-interval '1 hour')))
 where entity='AccessCode' and data->>'code'='ROLLBACK-SECTION-B';
 perform set_config('request.jwt.claim.sub',current_setting('test.customer'),true);
 if exists(select 1 from public.platform_records where entity='HolyOnePDFName') then raise exception 'Expired Section B feature retained access'; end if;
 perform set_config('request.jwt.claim.sub',current_setting('test.owner'),true);
 update public.platform_records set data=jsonb_set(data,'{feature_durations}',jsonb_build_object('/holy-names:section_b',jsonb_build_object('is_lifetime',true))) where entity='AccessCode' and data->>'code'='ROLLBACK-SECTION-B';
 perform set_config('request.jwt.claim.sub',current_setting('test.customer'),true);
 select count(*) into visible_count from public.platform_records where entity='HolyOnePDFName';
 if visible_count<>171 then raise exception 'Expected 171 accessible cards, got %',visible_count; end if;
 if (select jsonb_array_length(public.legacy_permission_grants()))<>1 then raise exception 'Linked grant missing'; end if;
end $$;
select 'PASS section isolation, per-feature expiry, lifetime and 171-card customer reading' as checks;
rollback;
