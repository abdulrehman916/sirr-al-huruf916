import { useHolyNamesLanguage } from './HolyNamesLanguageContext';
import { BIRHATIAH_FIELD_LABELS, sectionCOriginal, sectionCTranslation } from '@/lib/birhatiahSharedContent';

// Only the truly identical, unscoped records present in all 28 name cards
// appear here once, instead of being mislabelled as 28 distinct practices.
export default function BirhatiahSharedImportedMaterial({ byField = {} }) {
  const { language } = useHolyNamesLanguage();
  const ml = language === 'ml';
  const sections = Object.entries(byField).filter(([, entries]) => entries.length);
  if (!sections.length) return null;
  const count = sections.reduce((total, [, entries]) => total + entries.length, 0);
  return <section className="rounded-xl border border-yellow-500/25 p-4 space-y-4" data-testid="birhatiah-shared-imported-material">
    <h3 className="text-yellow-200 font-semibold">
      {ml ? '28 ഇസ്മുകൾക്കും പൊതുവായ പഴയ ഗ്രന്ഥവിവരങ്ങൾ — ഒരിടത്ത് മാത്രം' : 'Imported source material shared by all 28 names — shown once'} ({count})
    </h3>
    <p className="text-sm text-white/70 leading-loose">
      {ml ? 'ഇവ എല്ലാ 28 കാർഡുകളിലും ഒരേ സ്രോതസ്സും പേജും പാഠവുമുള്ള പഴയ രേഖകളാണ്. പ്രത്യേക നാമത്തിന്റെ മാത്രം അമലായി അവതരിപ്പിക്കുന്നില്ല. വ്യത്യസ്ത ഗ്രന്ഥപതിപ്പുകളിലെ പാഠങ്ങൾ വേർതിരിച്ചാണ് നിലനിർത്തിയത്.' : 'These legacy entries have the same wording, source and page in all 28 cards. They are collected here once, not attributed uniquely to each name. Edition differences remain separate.'}
    </p>
    {sections.map(([field, entries]) => <section key={field} className="rounded-lg border border-white/15 p-3 space-y-3">
      <h3 className="text-yellow-100">
        {(BIRHATIAH_FIELD_LABELS[field] || [field, field])[ml ? 0 : 1]} ({entries.length})
      </h3>
      <div className="space-y-4 pt-3">
        {entries.map((entry, index) => {
          const original = sectionCOriginal(entry);
          const translation = sectionCTranslation(entry, language);
          return <article key={index} className="space-y-2 border-t border-white/10 pt-3">
            {original && <p className="font-amiri text-2xl leading-[2.2] text-right whitespace-pre-wrap text-white/95" dir="auto">{original}</p>}
            <p className={`text-sm leading-loose text-white/85 ${ml ? 'font-malayalam' : 'font-inter'}`}>
              {translation || (ml ? 'ഈ മൂലവാക്യത്തിന്റെ മലയാള അർത്ഥം ഇനിയും ഉറപ്പിച്ച് ചേർത്തിട്ടില്ല.' : 'The source statement has not yet been translated into English.')}
            </p>
            {!original && !translation && <p className="text-xs text-white/60">{ml ? "ഈ മൂലരേഖയുടെ മലയാള പരിഭാഷ ചേർക്കാനുണ്ട്." : "This source entry still needs an English translation."}</p>}
            <p className="text-xs text-white/55 break-words">{entry.source_reference || (ml ? 'സ്രോതസ്സ് രേഖപ്പെടുത്തിയിട്ടില്ല' : 'Source not recorded')}{entry.source_page ? ` · ${ml ? 'പേജ്' : 'Page'} ${entry.source_page}` : ''}</p>
          </article>;
        })}
      </div>
    </section>)}
  </section>;
}
