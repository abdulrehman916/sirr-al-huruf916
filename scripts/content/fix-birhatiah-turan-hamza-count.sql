with selected as materialized (
 select id,data from public.platform_records
 where entity='HolyNameEsotericKnowledge' and data->>'name_id'='HNK-MHC-004'
 and data#>>'{source_checked_chapter,practices,0,id}'='protection-five'
 and data#>>'{source_checked_chapter,practices,0,translation,en}' like '%five hamzas%'
), updated as (
 update public.platform_records p
 set data=jsonb_set(jsonb_set(p.data,'{source_checked_chapter,practices,0}',$practice${"id": "protection-five", "claim": {"en": "A traditional claim in the source; the outcome is not established.", "ml": "ഗ്രന്ഥത്തിന്റെ പരമ്പരാഗത അവകാശവാദം; ഫലം തെളിയിക്കപ്പെട്ടിട്ടില്ല."}, "count": 5, "title": {"en": "Source account concerning protection", "ml": "സംരക്ഷണത്തെക്കുറിച്ചുള്ള ഗ്രന്ഥപരാമർശം"}, "timing": {"en": "No specific time or day is stated in this instruction.", "ml": "ഈ നിർദ്ദേശത്തിൽ നിശ്ചിത സമയമോ ദിവസമോ പറഞ്ഞിട്ടില്ല."}, "translation": {"en": "The source describes five inscriptions together with the last four verses of al-Hashr, three ha letters and seven hamzas, carried for claimed protection against humans, jinn and tyrants. This note does not substitute for the complete verse text.", "ml": "ഈ പേര് അഞ്ചു തവണ, സൂറത്തുൽ ഹശ്റിന്റെ അവസാന നാല് ആയത്തുകൾ, മൂന്ന് ه അക്ഷരങ്ങൾ, ഏഴ് ഹംസകൾ എന്നിവയ്ക്കൊപ്പം എഴുതി കൈവശം വെക്കുന്നതിനെക്കുറിച്ച് ഗ്രന്ഥം പറയുന്നു. മനുഷ്യർ, ജിന്നുകൾ, അധികാരദുരുപയോഗം ചെയ്യുന്നവർ എന്നിവരുടെ ആധിപത്യത്തിൽനിന്ന് സംരക്ഷണം ലഭിക്കുമെന്നാണ് അതിന്റെ അവകാശവാദം. ഈ കുറിപ്പ് ആയത്തുകളുടെ പൂർണ്ണ പാഠത്തിന് പകരമല്ല."}, "arabic_original": "ومن خواصه أن من كتبه خمس مرات مع آخر أربع آيات آخر سورة الحشر وثلاث هاءات وسبع همزات حرس من سطوة الإنس والجن والجبابرة"}$practice$::jsonb), '{source_checked_chapter,source_review_revision}',to_jsonb('2026-10-08-hamza-count-rechecked-p68'::text)),updated_at=now()
 from selected s where p.id=s.id
 returning p.id,p.data
)
select u.id, u.data#>>'{source_checked_chapter,practices,0,arabic_original}' as arabic_original,
 (u.data-'source_checked_chapter')=(s.data-'source_checked_chapter') as other_record_fields_unchanged,
 ((u.data->'source_checked_chapter')-array['practices','source_review_revision'])=((s.data->'source_checked_chapter')-array['practices','source_review_revision']) as other_chapter_fields_unchanged
from updated u join selected s on u.id=s.id;
