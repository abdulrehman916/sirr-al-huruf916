begin;
do $test$
declare owner_id uuid; customer_id uuid; baseline jsonb; actual jsonb; denied boolean:=false;
begin
  select id into owner_id from public.profiles where role='owner' and status='active' limit 1;
  if owner_id is null then raise exception 'No owner test identity'; end if;
  perform set_config('request.jwt.claims',jsonb_build_object('sub',owner_id,'role','authenticated')::text,true);
  baseline:=public.owner_dashboard_stats();
  insert into public.platform_records(entity,data)
  select 'AccessCode',jsonb_build_object('code','dashboard-test-'||gen_random_uuid(),'expiry_date',now()+interval '2 days','page_paths',jsonb_build_array('/test'),'page_names',jsonb_build_array('Test'))
  from generate_series(1,505);
  insert into public.platform_records(entity,data) values
  ('AccessCode',jsonb_build_object('code','dashboard-test-'||gen_random_uuid(),'expiry_date',now()-interval '1 day','page_paths',jsonb_build_array('/old','/life','/soon'),'page_grants',jsonb_build_object('/old',jsonb_build_object('expires_at',now()-interval '1 day'),'/life',jsonb_build_object('expires_at',null),'/soon',jsonb_build_object('expires_at',now()+interval '1 day')))),
  ('AccessCode',jsonb_build_object('code','dashboard-test-'||gen_random_uuid(),'expiry_date','not-a-date','page_paths',jsonb_build_object('invalid',true))),
  ('AccessCode',jsonb_build_object('code','dashboard-test-'||gen_random_uuid(),'is_disabled',true,'expiry_date',null));
  actual:=public.owner_dashboard_stats();
  if (actual->>'total_codes')::int<>(baseline->>'total_codes')::int+508 then raise exception 'Pagination failed'; end if;
  if (actual->>'active_codes')::int<>(baseline->>'active_codes')::int+506 then raise exception 'Active per-page grant test failed: %',actual->>'active_codes'; end if;
  if (actual->>'expired_codes')::int<>(baseline->>'expired_codes')::int+1 then raise exception 'Malformed expiry should not grant lifetime'; end if;
  if (actual->>'disabled_codes')::int<>(baseline->>'disabled_codes')::int+1 then raise exception 'Disabled count failed'; end if;
  if jsonb_array_length(actual->'renewals_due')<>8 then raise exception 'Renewal response not bounded'; end if;
  if not exists(select 1 from jsonb_array_elements(actual->'page_summary') p where p->>'path'='/test' and (p->>'codes')::int=505) then raise exception 'Page summary pagination failed'; end if;
  select id into customer_id from public.profiles where role='customer' and status='active' limit 1;
  if customer_id is not null then
    perform set_config('request.jwt.claims',jsonb_build_object('sub',customer_id,'role','authenticated')::text,true);
    denied:=false;
    begin perform public.owner_dashboard_stats(); exception when insufficient_privilege then denied:=true; end;
    if not denied then raise exception 'Customer authorized'; end if;
    perform set_config('request.jwt.claims',jsonb_build_object('sub',owner_id,'role','authenticated')::text,true);
    begin
      update public.profiles set role='admin' where id=customer_id;
      raise exception 'Delegated admin role accepted';
    exception when check_violation then null;
    end;
  end if;
  if has_function_privilege('anon','public.owner_dashboard_stats()','EXECUTE') then raise exception 'Anon RPC executable'; end if;
  perform set_config('request.jwt.claims',jsonb_build_object('sub',gen_random_uuid(),'role','authenticated')::text,true);
  begin perform public.owner_dashboard_stats(); exception when insufficient_privilege then denied:=true; end;
  if not denied then raise exception 'Missing profile authorized'; end if;
  perform set_config('request.jwt.claims','{}',true);denied:=false;
  begin perform public.owner_dashboard_stats(); exception when insufficient_privilege then denied:=true; end;
  if not denied then raise exception 'Guest authorized'; end if;
end;
$test$;
select 'PASS: owner stats, 508 fixtures, per-page lifetime/expiry, invalid dates, disabled codes, bounded renewals, guest and missing-profile rejection' as validation;

rollback;

