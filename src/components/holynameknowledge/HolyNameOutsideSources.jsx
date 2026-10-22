import outsideSources from '@/data/holyNamesOutsideSources.json';
import { useHolyNamesLanguage } from './HolyNamesLanguageContext';

const ORDER = ['wealth', 'job', 'illness', 'marriage', 'love', 'sihr', 'distress', 'general'];

// Outside-the-book material for a Section B card, grouped by purpose. Quran and
// hadith come first inside each group; khawass items are labelled as such.
export default function HolyNameOutsideSources({ nameId }) {
  const { language } = useHolyNamesLanguage();
  const items = outsideSources.names[nameId];
  if (!items?.length) return null;
  const t = value => value?.[language] || value?.en || '';
  const rank = { quran: 0, hadith: 1, khawass: 2 };
  const groups = ORDER.map(purpose => ({
    purpose,
    items: items.filter(item => item.purpose === purpose)
      .sort((a, b) => rank[a.source.type] - rank[b.source.type]),
  })).filter(group => group.items.length);

  return (
    <section data-testid="outside-sources" className="rounded-xl border p-4 space-y-5"
      style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(212,175,55,0.40)' }}>
      <div>
        <h2 className="font-inter font-semibold text-white">
          {language === 'ml' ? 'ഗ്രന്ഥത്തിന് പുറത്തുള്ള സ്രോതസ്സുകൾ — ആവശ്യം അനുസരിച്ച്' : 'Outside sources — by purpose'}
        </h2>
        <p className="text-xs text-white/50 mt-1">
          {language === 'ml'
            ? 'ഖുർആനും ഹദീസും ആദ്യം. «ഖവാസ്വ്» എന്ന് അടയാളപ്പെടുത്തിയവ അനുഭവാടിസ്ഥാനത്തിലുള്ള ഗ്രന്ഥപരാമർശങ്ങളാണ്, ഹദീസ് അല്ല.'
            : 'Qur’an and hadith first. Items marked “khawass” are experience-based book claims, not hadith.'}
        </p>
      </div>
      {groups.map(group => (
        <div key={group.purpose} className="space-y-3">
          <h3 className="text-sm font-semibold" style={{ color: '#F5D060' }}>{t(outsideSources.purposes[group.purpose])}</h3>
          {group.items.map((item, index) => (
            <article key={index} className="rounded-lg p-3 space-y-2" style={{ background: 'rgba(212,175,55,0.06)' }}>
              <p dir="rtl" lang="ar" className="font-amiri text-xl leading-loose text-amber-100">{item.arabic}</p>
              <p className="text-sm text-white/85 leading-relaxed">{language === 'ml' ? item.ml : item.en}</p>
              {item.count_ml && (
                <p className="text-xs text-amber-200/90">
                  {language === 'ml' ? 'എണ്ണം / സമയം: ' : 'Count / time: '}{language === 'ml' ? item.count_ml : item.count_en}
                </p>
              )}
              <p className="text-xs text-white/50">
                <span className="mr-1 rounded px-1.5 py-0.5" style={{ background: 'rgba(255,255,255,0.08)' }}>{t(outsideSources.source_types[item.source.type])}</span>
                <a href={item.source.url} target="_blank" rel="noreferrer" dir="auto" className="underline">{item.source.title}</a>
              </p>
            </article>
          ))}
        </div>
      ))}
    </section>
  );
}
