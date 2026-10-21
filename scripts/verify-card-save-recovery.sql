begin;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where role='owner' and status='active' limit 1),true);
set local role authenticated;
do $$
declare first_save public.owner_content; replay public.owner_content; edited public.owner_content;
begin
 first_save:=public.save_owner_content('/plants/RETRY-ROLLBACK','note-retry','','{"title":"Original","arabic":"اللَّهُمَّ","malayalam":"വിവരണം"}',0);
 replay:=public.save_owner_content(first_save.scope,first_save.section,'',first_save.content,0);
 if replay.revision is distinct from 1 or replay.updated_at is distinct from first_save.updated_at then raise exception 'Create retry changed the accepted record'; end if;
 edited:=public.save_owner_content(first_save.scope,first_save.section,'','{"title":"Owner correction"}',1);
 replay:=public.save_owner_content(first_save.scope,first_save.section,'',edited.content,1);
 if replay.revision is distinct from 2 or replay.updated_at is distinct from edited.updated_at then raise exception 'Update retry changed the accepted record'; end if;
 if (select count(*) from public.owner_content where scope=first_save.scope)<>1 then raise exception 'Retry duplicated a card note'; end if;
 begin perform public.save_owner_content(first_save.scope,first_save.section,'','{"title":"Stale unrelated edit"}',0); raise exception 'Stale overwrite accepted'; exception when serialization_failure then null; end;
 begin perform public.save_owner_content(first_save.scope,first_save.section,'section_a',edited.content,1); raise exception 'Retry changed the access feature'; exception when serialization_failure then null; end;
end $$;
reset role;
do $$ begin
 if (select count(*) from private.owner_content_history where scope='/plants/RETRY-ROLLBACK')<>1 then raise exception 'Retry duplicated version history'; end if;
end $$;
select 'PASS: create/update lost-response retries, one note and one history version, stale-content and changed-feature rejection' checks;
rollback;
