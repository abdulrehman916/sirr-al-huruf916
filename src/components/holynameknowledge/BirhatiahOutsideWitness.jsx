import source from '@/data/birhatiahOutsideWitness2017.json';
import { useHolyNamesLanguage } from './HolyNamesLanguageContext';

export default function BirhatiahOutsideWitness({ nameId = null }) {
  const { language } = useHolyNamesLanguage();
  const ml = language === 'ml';
  const entries = source.entries.filter(entry => !nameId || entry.name_id === nameId);
  const variantNotes = (source.variant_notes || []).filter(note => !nameId || note.related_name_ids.includes(nameId));
  if (!entries.length) return null;
  return <section className="rounded-xl border border-yellow-500/25 p-4 space-y-3" data-testid="birhatiah-outside-witness-2017">
    <h3 className="text-yellow-200 font-semibold">{ml ? 'മറ്റൊരു പുറംപതിപ്പിലെ നാമസംഖ്യകൾ' : 'Name numbers in another outside witness'}</h3>
    <p className="text-sm text-white/75 leading-loose">{source.scope[language]}</p>
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead><tr className="text-yellow-100"><th scope="col" className="p-2">{ml ? 'കാർഡ്' : 'Card'}</th><th scope="col" className="p-2">{ml ? 'പോസ്റ്റിലെ നാമസംഖ്യ' : 'Posted name number'}</th></tr></thead>
        <tbody>{entries.map(entry => <tr key={entry.name_id} data-witness-name={entry.name_id} className="border-t border-white/10 text-white/85">
          <th scope="row" className="p-2 font-normal">{Number(entry.name_id.slice(-3))}</th><td className="p-2 tabular-nums">{entry.reported_name_number}</td>
        </tr>)}</tbody>
      </table>
    </div>
    {variantNotes.map(note => <p key={note.id} data-witness-variant={note.id} className="text-sm text-white/80 leading-loose">{note.text[language]}</p>)}
    <p className="text-xs text-white/60">{ml ? 'പോസ്റ്റിൽ കാണുന്ന തീയതി' : 'Displayed publication date'}: {source.publication_date_as_displayed}; {ml ? 'ഉള്ളിൽ പകർത്തിയ പഴയ തീയതി' : 'Embedded earlier date'}: {source.embedded_repost_date}</p>
    <a href={source.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-yellow-100 underline break-all">{source.source_title}</a>
  </section>;
}
