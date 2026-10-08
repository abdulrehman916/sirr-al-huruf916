import { useHolyNamesLanguage } from './HolyNamesLanguageContext';

const subjects = [
  ['meaning', 'അർഥവും വ്യത്യസ്ത അഭിപ്രായങ്ങളും', 'Meanings and alternative readings', /meaning|അർഥ|അർത്ഥ/i],
  ['pronunciation', 'ഉച്ചാരണവും ഹറകത്തും', 'Pronunciation and reading vowels', /pronunciation|vowel|വായന|വസ്ന്|ഹറകത്ത്|ഹരക്കത്ത്/i],
  ['correspondence', 'അക്ഷരവും മൻസിലും', 'Letter and lunar mansion', /correspond|mansion|മൻസിൽ|അക്ഷര.*ബന്ധ/i],
  ['quran', 'ബന്ധപ്പെട്ട ആയത്തുകൾ', 'Related Quran passages', /quran|sura|verse|ഖുർആൻ|സൂറ|ആയത്ത്|ഫാതിഹ/i],
  ['count', 'ഓതലിന്റെയും എഴുത്തിന്റെയും എണ്ണം', 'Recitation and inscription counts', /recit|inscri|times|തവണ|എഴുത്ത്|എണ്ണം/i],
  ['timing', 'സമയവും ദിവസവും', 'Timing and days', /night|daily|friday|thursday|tuesday|saturday|isha|sunrise|രാത്രി|ദിവസ|ഇശാ|വെള്ളി|വ്യാഴ|ശനി|ചൊവ്വ|സമയം/i],
  ['method', 'രീതി, വസ്തുക്കൾ, സൂക്ഷിക്കുന്ന സ്ഥലം', 'Method, materials and placement', /write|paper|dish|carry|ring|cloth|hang|എഴുത|കടലാസ്|പാത്ര|തുണി|മോതിര|സൂക്ഷി|തൂക്കി|കൈവശ/i],
  ['incense', 'ധൂപവും സുഗന്ധവസ്തുക്കളും', 'Incense and aromatics', /incense|fumig|aloes|musk|saffron|ധൂപ|സുഗന്ധ|കസ്തൂരി|കുങ്കുമ/i],
  ['figure', 'വെഫ്കും കളവും ചിത്രവും', 'Squares and figures', /square|talisman|diagram|വെഫ്ക്|കളം|ചിത്രം/i],
  ['conditions', 'നിബന്ധനകളും സംയുക്ത ഉപയോഗവും', 'Conditions and combined use', /condition|seclusion|fast|paired|collective|നിബന്ധന|ഖൽവ|ഒറ്റപ്പെട്ട|നോമ്പ്|സംയുക്ത|കൂട്ടായി|ഇരുപത്തെട്ട്|28 പേര/i],
  ['claims', 'ഗ്രന്ഥത്തിൽ പറയുന്ന ഗുണങ്ങളും അവകാശവാദങ്ങളും', 'Attributed properties and claims', /claim|propert|historical|അവകാശവാദ|ചരിത്രപര|ഗുണ/i],
];

export function getSourceEntries(chapter) {
  return ['practices', 'edition_accounts', 'source_notes'].flatMap(group =>
    (chapter[group] || []).map(entry => ({ ...entry, group, anchor: `source-${chapter.name_id}-${group}-${entry.id}` }))
  );
}

// Links index existing attributed passages. They do not manufacture new practices.
export default function SourceSubjects({ chapter }) {
  const { language } = useHolyNamesLanguage();
  const ml = language === 'ml';
  const entries = getSourceEntries(chapter);
  const text = entry => [entry.title?.en, entry.title?.ml, entry.translation?.en, entry.translation?.ml, entry.timing?.en, entry.timing?.ml].filter(Boolean).join(' ');
  return <nav aria-label={ml ? 'വിഷയസൂചിക' : 'Subject index'} className="border border-yellow-500/20 rounded-xl p-3 space-y-3">
    <h3 className="font-semibold text-yellow-200">{ml ? 'വിഷയങ്ങൾ അനുസരിച്ച് വായിക്കുക' : 'Browse by subject'}</h3>
    <p className="text-sm text-white/60">{ml ? 'ഒരേ ഭാഗത്തിൽ പല വിഷയങ്ങൾ ഉണ്ടെങ്കിൽ അതിലേക്കുള്ള ലിങ്ക് ബന്ധപ്പെട്ട ഓരോ വിഭാഗത്തിലും കാണും. ഓരോ ഭാഗത്തിനും അതത് സ്രോതസ്സ് നൽകിയിരിക്കുന്നു.' : 'A passage covering several subjects is linked under each relevant subject. Each passage retains its own source.'}</p>
    <div className="grid gap-2 sm:grid-cols-2">
      {subjects.map(([key, labelML, labelEN, pattern]) => {
        const matches = entries.filter(entry => {
          if (Array.isArray(entry.subjects)) return entry.subjects.includes(key);
          if (key === 'count') return entry.count != null || pattern.test(text(entry));
          if (key === 'timing') return /each night|every night|daily|every day|on Friday|on Thursday|on Tuesday|on Saturday|before sunrise|midnight|after.*prayer|ദിവസേന|ഓരോ രാത്രിയിലും|ഇശാ|സൂര്യോദയത്തിനു|അർധരാത്രി/.test(text(entry));
          return pattern.test(text(entry));
        });
        if (!matches.length) return null;
        return <details key={key} className="rounded-lg border border-white/10 p-2">
          <summary className="cursor-pointer text-yellow-100 text-sm">{ml ? labelML : labelEN} ({matches.length})</summary>
          <ul className="pt-2 space-y-2">
            {matches.map(entry => <li key={entry.anchor}><a className="text-sm underline text-white/80" href={`#${entry.anchor}`}>{entry.title?.[language] || entry.id}</a></li>)}
          </ul>
        </details>;
      })}
    </div>
  </nav>;
}
