-- Profiles only allow 'customer' and 'owner' (see retire_delegated_staff_roles).
-- Remove the unreachable delegated-admin branches from the remaining functions.
do $$
declare
  edits text[][] := array[
    array['private.create_support_record(text,jsonb)', 'actor.role in (''owner'',''admin'')', 'actor.role=''owner'''],
    array['public.owner_configuration(text,jsonb)', 'actor.role not in (''owner'',''admin'')', 'actor.role<>''owner'''],
    array['public.owner_configuration(text,jsonb)', 'Administrator access required', 'Owner access required'],
    array['public.can_access_resource(uuid)', 'public.current_role() in (''editor'',''admin'',''owner'')', 'public.current_role()=''owner''']
  ];
  i int; fn regprocedure; def text; nd text;
begin
  for i in 1..array_length(edits,1) loop
    fn := edits[i][1]::regprocedure;
    def := pg_get_functiondef(fn);
    nd := replace(def, edits[i][2], edits[i][3]);
    if nd = def then raise exception 'edit % did not apply to %', i, edits[i][1]; end if;
    execute nd;
  end loop;

  def := pg_get_functiondef('private.can_read_support(text,jsonb,uuid)'::regprocedure);
  nd := regexp_replace(def, 'if actor\.role<>''admin'' then return false; end if;.*\)\);\s*end;', 'return false;' || chr(10) || 'end;');
  if nd = def then raise exception 'can_read_support edit did not apply'; end if;
  execute nd;

  def := pg_get_functiondef('private.redeem_approval_operation(jsonb)'::regprocedure);
  nd := regexp_replace(def, 'if actor\.role=''admin'' then.*?end if;\s*is_staff:=', 'is_staff:=');
  if nd = def then raise exception 'redeem_approval_operation edit did not apply'; end if;
  execute nd;

  def := pg_get_functiondef('public.owner_dashboard_stats()'::regprocedure);
  nd := regexp_replace(def, 'can_read_codes := caller_role=''owner'' or exists\(.*?\);', 'can_read_codes := true;');
  if nd = def then raise exception 'owner_dashboard_stats edit did not apply'; end if;
  execute nd;
end $$;
