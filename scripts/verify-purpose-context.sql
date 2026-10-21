begin;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where role='owner' and status='active' limit 1),true);
set local role authenticated;
do $$
declare original public.platform_records; saved jsonb;
begin
 if public.lookup_purpose_intent_for_action('أولاد','sihhat')->>'normalized_purpose_key' is distinct from 'sihhat' then raise exception 'Children health context failed'; end if;
 if public.lookup_purpose_intent_for_action('أولاد','celb')->>'normalized_purpose_key' is distinct from 'celb' then raise exception 'Children attraction context failed'; end if;
 if public.lookup_purpose_intent_for_action('دواب','sihhat')->>'normalized_purpose_key' is distinct from 'sihhat' then raise exception 'Animal health context failed'; end if;
 if public.lookup_purpose_intent_for_action('دواب','rizq')->>'normalized_purpose_key' is distinct from 'rizq' then raise exception 'Cattle livelihood context failed'; end if;
 if not (public.lookup_purpose_intent('أولاد')->>'ambiguous')::boolean then raise exception 'Ambiguous keyword chose a purpose without context'; end if;
 select * into original from public.platform_records where entity='PurposeDictionary' and data->>'purpose_phrase'='صِحَّةُ الأَوْلَادِ' limit 1;
 if original.id is null then raise exception 'Context fixture missing'; end if;
 saved:=public.save_purpose_entry(original.id::text,original.data);
 if saved->>'id'<>original.id::text then raise exception 'Legitimate entry could not be edited'; end if;
 begin perform public.save_purpose_entry(null,original.data); raise exception 'Exact duplicate accepted'; exception when unique_violation then null; end;
end $$;
select 'PASS: selected-action lookup, ambiguous keyword refusal, distinct-purpose editing and exact-duplicate rejection' checks;
rollback;
