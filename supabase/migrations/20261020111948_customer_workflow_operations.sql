-- Customer replies use their authenticated identity, never a browser session ID.
create or replace function public.reply_access_request(p_payload jsonb)
returns jsonb language plpgsql security invoker set search_path=''
as $$
declare actor public.profiles%rowtype; req public.platform_records%rowtype; text_message text; attachment text;
begin
 select * into actor from public.profiles where id=auth.uid() and status='active';
 if actor.id is null then raise exception 'Sign in required' using errcode='42501'; end if;
 select * into req from public.platform_records where entity='AccessRequest'
 and (id::text=p_payload->>'request_id' or data->>'request_id'=p_payload->>'request_id' or data->>'_base44_legacy_id'=p_payload->>'request_id')
 and (owner_id=actor.id or data->>'user_id'=actor.id::text) limit 1 for update;
 if req.id is null then raise exception 'Request not found' using errcode='42501'; end if;
 text_message:=trim(coalesce(p_payload->>'message','')); attachment:=nullif(p_payload->>'attachment_url','');
 if length(text_message)>4000 or (text_message='' and attachment is null) then raise exception 'A message or attachment is required (maximum 4000 characters)'; end if;
 if attachment is not null and (length(attachment)>2000 or attachment ~* '^(javascript:|data:|//)') then raise exception 'Invalid attachment'; end if;
 insert into public.platform_records(entity,owner_id,data) values('AccessRequestMessage',actor.id,jsonb_build_object(
 'request_id',req.data->>'request_id','user_id',actor.id,'sender_type','USER','sender_role','customer',
 'sender_name',actor.full_name,'sender_email',actor.email,'message',text_message,'attachment_url',attachment,'created_at',now()));
 if coalesce((p_payload->>'reopen')::boolean,false) then
 update public.platform_records set data=data||jsonb_build_object('status','PENDING','reopened_at',now()) where id=req.id; end if;
 return jsonb_build_object('success',true);
end;
$$;
revoke all on function public.reply_access_request(jsonb) from public,anon;
grant execute on function public.reply_access_request(jsonb) to authenticated;

-- Privileged code validation/linking stays in the non-exposed schema.
create or replace function private.redeem_approval_operation(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare actor public.profiles%rowtype; staff public.platform_records%rowtype; approval public.platform_records%rowtype;
 code_record public.platform_records%rowtype; customer public.profiles%rowtype;
 action text:=p_payload->>'action'; aid text; assigned text; next_status text; items jsonb; counts jsonb; patch jsonb;
 is_staff boolean:=false; already boolean;
begin
 select p.* into actor from public.profiles p join auth.users u on u.id=p.id
 where p.id=auth.uid() and p.status='active' and u.email_confirmed_at is not null;
 if actor.id is null then raise exception 'Sign in with your verified email first' using errcode='42501'; end if;
 if actor.role='admin' then
   select * into staff from public.platform_records where entity='AdminProfile'
   and (data->>'user_id'=actor.id::text or lower(data->>'email')=lower(actor.email))
   and data->>'status'='ACTIVE' and coalesce((data->>'perm_redeem_code_approval')::boolean,false) limit 1;
 end if;
 is_staff:=actor.role='owner' or staff.id is not null;
 if action in ('GET_MY_SUBMISSIONS','GET_SCOPED_APPROVALS') then
   if action='GET_SCOPED_APPROVALS' and not is_staff then raise exception 'Approval permission required' using errcode='42501'; end if;
   with scoped as (select data||jsonb_build_object('id',id) item from public.platform_records where entity='RedeemCodeApproval'
    and case when action='GET_MY_SUBMISSIONS' then data->>'customer_user_id'=actor.id::text
      when actor.role='owner' then true else data->>'assigned_admin_id' in (staff.id::text,staff.data->>'admin_profile_id') end
    order by created_at desc), totals as (select count(*) total,count(*) filter(where item->>'status'='PENDING') pending,
      count(*) filter(where item->>'status'='APPROVED') approved,count(*) filter(where item->>'status'='REJECTED') rejected,
      count(*) filter(where item->>'status'='INFO_REQUESTED') info_requested from scoped)
   select coalesce((select jsonb_agg(item) from scoped),'[]'),(select to_jsonb(totals) from totals) into items,counts;
   return jsonb_build_object('success',true,'submissions',items,'approvals',items,'stats',counts,'is_owner',actor.role='owner');
 end if;
 if action='SUBMIT' then
   if actor.role<>'customer' then raise exception 'Customer account required'; end if;
   if lower(trim(coalesce(p_payload->>'email',actor.email)))<>lower(actor.email) then raise exception 'Use your signed-in email' using errcode='42501'; end if;
   select * into code_record from public.platform_records where entity='AccessCode'
     and upper(data->>'code')=upper(trim(p_payload->>'code')) for update;
   if code_record.id is null or coalesce((code_record.data->>'is_disabled')::boolean,false) then raise exception 'Code is unavailable'; end if;
   if nullif(code_record.data->>'linked_user_id','') is not null and code_record.data->>'linked_user_id'<>actor.id::text then raise exception 'Code belongs to another account'; end if;
   if lower(coalesce(nullif(code_record.data->>'linked_user_email',''),nullif(code_record.data->>'email',''),actor.email))<>lower(actor.email) then raise exception 'Code belongs to another email'; end if;
   if not exists(select 1 from jsonb_array_elements_text(coalesce(code_record.data->'page_paths','[]')) p where private.code_page_active(code_record.data,p)) then raise exception 'Code has expired'; end if;
   select * into approval from public.platform_records where entity='RedeemCodeApproval'
     and data->>'customer_user_id'=actor.id::text and data->>'code_record_id'=code_record.id::text limit 1;
   if approval.id is not null then return jsonb_build_object('success',true,'already_submitted',true,'status',approval.data->>'status','approval_id',approval.data->>'approval_id'); end if;
   select data->>'assigned_admin_id' into assigned from public.platform_records where entity in ('UserAccessProfile','ApprovedUser')
     and (data->>'user_id'=actor.id::text or lower(coalesce(data->>'email',data->>'user_email'))=lower(actor.email))
     order by updated_at desc limit 1;
   aid:='APR-'||upper(replace(gen_random_uuid()::text,'-',''));
   insert into public.platform_records(entity,owner_id,data) values('RedeemCodeApproval',actor.id,jsonb_build_object(
    'approval_id',aid,'code_record_id',code_record.id,'code',code_record.data->>'code','customer_user_id',actor.id,
    'customer_email',actor.email,'customer_name',actor.full_name,'assigned_admin_id',assigned,'status','PENDING','submitted_at',now()));
   return jsonb_build_object('success',true,'approval_id',aid,'status','PENDING');
 end if;
 select * into approval from public.platform_records where entity='RedeemCodeApproval'
   and (data->>'approval_id'=p_payload->>'approval_id' or id::text=p_payload->>'approval_id') limit 1 for update;
 if approval.id is null then raise exception 'Approval not found'; end if;
 if action='RESPOND_INFO' then
   if approval.data->>'customer_user_id'<>actor.id::text then raise exception 'Access denied' using errcode='42501'; end if;
   if approval.data->>'status'<>'INFO_REQUESTED' or length(trim(coalesce(p_payload->>'customer_response',''))) not between 1 and 4000 then raise exception 'Valid information response required'; end if;
   patch:=jsonb_build_object('customer_response',p_payload->>'customer_response','responded_at',now(),'status','PENDING');
 else
   if not is_staff or (actor.role<>'owner' and not (coalesce(approval.data->>'assigned_admin_id','')=staff.id::text or coalesce(approval.data->>'assigned_admin_id','')=coalesce(staff.data->>'admin_profile_id',staff.id::text))) then raise exception 'Approval permission required' using errcode='42501'; end if;
   if action='OVERRIDE' and actor.role<>'owner' then raise exception 'Owner access required' using errcode='42501'; end if;
   if action='APPROVE' then next_status:='APPROVED';
   elsif action='REJECT' then next_status:='REJECTED';
   elsif action='REQUEST_INFO' then next_status:='INFO_REQUESTED';
   elsif action='OVERRIDE' and p_payload->>'new_status' in ('APPROVED','REJECTED') then next_status:=p_payload->>'new_status';
   else raise exception 'Invalid approval action'; end if;
   if action<>'OVERRIDE' and approval.data->>'status' not in ('PENDING','INFO_REQUESTED',next_status) then raise exception 'Decision already recorded; owner override required'; end if;
   select * into code_record from public.platform_records where entity='AccessCode' and id::text=approval.data->>'code_record_id' for update;
   if code_record.id is null then raise exception 'Access code no longer exists'; end if;
   select * into customer from public.profiles where id::text=approval.data->>'customer_user_id' and role='customer' and status='active';
   if customer.id is null then raise exception 'Active customer required'; end if;
   if next_status='APPROVED' then
     if coalesce((code_record.data->>'is_disabled')::boolean,false) or not exists(select 1 from jsonb_array_elements_text(coalesce(code_record.data->'page_paths','[]')) p where private.code_page_active(code_record.data,p)) then raise exception 'Code is disabled or expired'; end if;
     if nullif(code_record.data->>'linked_user_id','') is not null and code_record.data->>'linked_user_id'<>customer.id::text then raise exception 'Code belongs to another customer'; end if;
     if lower(coalesce(nullif(code_record.data->>'linked_user_email',''),nullif(code_record.data->>'email',''),customer.email))<>lower(customer.email) then raise exception 'Code belongs to another email'; end if;
     already:=code_record.data->>'linked_user_id'=customer.id::text;
     if not coalesce(already,false) and coalesce((code_record.data->>'use_count')::integer,0)>=coalesce((code_record.data->>'max_uses')::integer,1)
       and nullif(code_record.data->>'used_by_user_id','') is not null then raise exception 'Code use limit reached'; end if;
     update public.platform_records set data=data||jsonb_build_object('linked_user_id',customer.id,'linked_user_email',customer.email,
       'used_by_user_id',customer.id,'used_by_email',customer.email,'used_at',coalesce(data->>'used_at',now()::text),
       'use_count',case when coalesce(already,false) then coalesce((data->>'use_count')::integer,1) else greatest(1,coalesce((data->>'use_count')::integer,0)+1) end,
       'approval_activation_id',case when coalesce(already,false) then data->>'approval_activation_id' else approval.data->>'approval_id' end) where id=code_record.id;
   elsif next_status='REJECTED' and code_record.data->>'approval_activation_id'=approval.data->>'approval_id' then
     update public.platform_records set data=data-'linked_user_id'-'linked_user_email'-'linked_session_id'-'used_by_user_id'-'used_by_email'-'approval_activation_id' where id=code_record.id;
   end if;
   patch:=jsonb_build_object('status',next_status,'reviewed_at',now(),'reviewed_by',actor.id,'reviewed_by_name',actor.full_name,
      'reviewed_by_role',actor.role,'rejection_reason',p_payload->>'rejection_reason','info_request_message',p_payload->>'info_request_message',
      'override_by_owner',action='OVERRIDE','override_reason',p_payload->>'override_reason');
 end if;
 update public.platform_records set data=data||patch where id=approval.id;
 return jsonb_build_object('success',true,'status',coalesce(next_status,'PENDING'));
end;
$$;
revoke all on function private.redeem_approval_operation(jsonb) from public,anon;
grant usage on schema private to authenticated;
grant execute on function private.redeem_approval_operation(jsonb) to authenticated;
create or replace function public.manage_redeem_approval(p_payload jsonb)
returns jsonb language sql security invoker set search_path=''
as $$ select private.redeem_approval_operation(p_payload); $$;
revoke all on function public.manage_redeem_approval(jsonb) from public,anon;
grant execute on function public.manage_redeem_approval(jsonb) to authenticated;
