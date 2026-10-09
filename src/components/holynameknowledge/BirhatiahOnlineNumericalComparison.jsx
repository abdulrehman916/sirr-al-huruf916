import source from '@/data/birhatiahOnlineNumericalComparison.json';
import { useHolyNamesLanguage } from './HolyNamesLanguageContext';

const sum = values => values.reduce((total, number) => total + number, 0);
const gridSums = grid => [
  ...grid.map(sum),
  ...grid[0].map((_, column) => sum(grid.map(row => row[column]))),
  sum(grid.map((row, rowIndex) => row[rowIndex])),
  sum(grid.map((row, rowIndex) => row[row.length - 1 - rowIndex])),
];

export function BirhatiahOnlineNameComparison({ nameId, currentAbjad }) {
  const { language } = useHolyNamesLanguage();
  const ml = language === 'ml';
  const entry = source.entries.find(item => item.name_id === nameId);
  if (!entry) return null;
  const differs = Number.isFinite(Number(currentAbjad)) && Number(currentAbjad) !== entry.abjad_reported;
  return <section className="rounded-xl border border-yellow-500/25 p-3 space-y-3" data-testid="birhatiah-online-comparison">
    <h3 className="text-yellow-200 font-semibold">
      {ml ? 'പുറംസ്രോതസ്സിലെ നാമപാഠവും എബ്ജദ് പാഠഭേദവും' : 'Outside-source name spelling and Abjad variant'}
    </h3>
    <div className="space-y-2 pt-2">
      <p className="font-amiri text-2xl text-right text-yellow-100" lang="ar" dir="rtl">{entry.arabic_original}</p>
      <p className="text-sm text-white/90">{ml ? 'ഈ ഫോറം രേഖപ്പെടുത്തിയ എബ്ജദ് മൂല്യം' : 'Abjad value reported by the forum'}: <strong>{entry.abjad_reported}</strong></p>
      {differs && <p className="text-sm text-white/75">{ml ? `നിലവിലെ കാർഡിലെ കണക്ക്: ${currentAbjad}. വ്യത്യസ്ത അക്ഷരരൂപമോ പാഠഭേദമോ ആകാം; പഴയ കണക്ക് മാറ്റിയിട്ടില്ല.` : `Current card calculation: ${currentAbjad}. This may reflect a spelling or transmission variant; the original calculation is unchanged.`}</p>}
      <p className="text-xs text-white/60 leading-relaxed">{ml ? 'ഈ പുറംരേഖയിൽ പേരുകൾ ഹറകത്തില്ലാതെയാണ്. മൂലഗ്രന്ഥത്തിലെ ഹറകത്തോടെയുള്ള വായന മുകളിലുണ്ട്. മുകളിലെ സംഖ്യ എബ്ജദ് മൂല്യമാണ്; ദിക്റിന്റെ ആവർത്തനസംഖ്യയല്ല.' : 'This outside post prints the names without vowels. Read the manuscript-based vowelled name above. The number is an Abjad value, not a recitation count.'}</p>
      <a href={source.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-yellow-100 underline break-all">{source.source_title}</a>
    </div>
  </section>;
}

function PrintedGrid({ matrix, title, language }) {
  const ml = language === 'ml';
  const sums = gridSums(matrix);
  const valid = sums.every(total => total === sums[0]);
  return <figure className="space-y-3 rounded-lg border border-white/15 p-3">
    <figcaption className="text-yellow-100 font-semibold">{title}</figcaption>
    <div className="grid gap-1 max-w-xs mx-auto" style={{ gridTemplateColumns: `repeat(${matrix[0].length}, minmax(0, 1fr))` }} role="table" aria-label={title}>
      {matrix.flatMap((row, rowIndex) => row.map((value, columnIndex) =>
        <span key={`${rowIndex}-${columnIndex}`} role="cell" className="text-center tabular-nums rounded border border-yellow-500/30 bg-yellow-500/5 p-2 text-sm text-white">{value}</span>
      ))}
    </div>
    <p className="text-xs text-white/65">{ml ? 'വരികളുടെ ആകെ' : 'Row totals'}: {matrix.map(row => sum(row)).join(' · ')}</p>
    {!valid && <p className="text-xs text-amber-200">{ml ? 'അച്ചടിച്ച എല്ലാ വരി/നിര/വികർണ്ണ ആകെകളും തുല്യമല്ല. ഈ രൂപം തിരുത്താതെ മൂലരേഖയിലെപോലെ നൽകിയിരിക്കുന്നു.' : 'Printed rows, columns and diagonals do not all sum equally. This grid is shown as printed, without silent correction.'}</p>}
  </figure>;
}

export function BirhatiahOnlineCollectiveGrids() {
  const { language } = useHolyNamesLanguage();
  const ml = language === 'ml';
  const printed = source.collective.reported_sum;
  const calculated = sum(source.entries.map(item => item.abjad_reported));
  return <section className="rounded-xl border border-yellow-500/25 p-4 space-y-4" data-testid="birhatiah-printed-online-grids">
    <h3 className="font-semibold text-yellow-200">{ml ? 'പുറത്തെ അച്ചടിരൂപത്തിലെ രണ്ട് കളങ്ങളും സംഖ്യാഭേദങ്ങളും' : 'Two externally printed grids and numerical variants'}</h3>
    <div className="space-y-4 pt-3">
      <p className="text-sm leading-relaxed text-white/85">{ml ? `പുറംപോസ്റ്റ് ആകെ ${printed} എന്ന് രേഖപ്പെടുത്തുന്നു. അതേ പോസ്റ്റിലെ 28 സംഖ്യകൾ കൂട്ടിയാൽ ${calculated} ആണ്. ഈ വ്യത്യാസം മറച്ചിട്ടില്ല.` : `The forum claims a sum of ${printed}, while its 28 listed numbers actually total ${calculated}. Both readings are retained without altering the site's canonical values.`}</p>
      <PrintedGrid matrix={source.collective.triangle} title={ml ? 'ത്രികോൺ കളം — പോസ്റ്റിലെ രൂപം' : '3 × 3 grid — forum printing'} language={language}/>
      <PrintedGrid matrix={source.collective.square} title={ml ? 'ചതുരക്കളം — പോസ്റ്റിലെ രൂപം' : '4 × 4 grid — forum printing'} language={language}/>
      <p className="text-xs leading-relaxed text-white/70">{ml ? '2012 ഡിസംബർ 13-ലെ മറുപടിയിൽ ത്രികോൺ കളത്തിലെ 6139 എന്നത് 6193 ആകണമെന്ന് ഒരാൾ തിരുത്തൽ നിർദേശിച്ചിട്ടുണ്ട്. അതുകൊണ്ട് മൂലസംഖ്യയും മറുപടിയും പ്രത്യേകം സൂക്ഷിക്കുന്നു.' : source.collective.forum_correction}</p>
      <a href={source.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-yellow-100 underline break-all">{source.source_title}</a>
      {(source.related_online_witnesses || []).map(witness => <section key={witness.id} className="rounded-lg border border-white/15 p-3 space-y-2" data-source-witness={witness.id}>
        <h4 className="text-sm text-yellow-100">{ml ? 'പഴയ പുറംഫോറം പാഠത്തിന്റെ താരതമ്യം' : 'Comparison with an earlier online forum witness'}</h4>
        <p className="text-sm text-white/80 leading-loose">{witness.notes[language]}</p>
        <a href={witness.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-yellow-100 underline break-all">{witness.source_title}</a>
      </section>)}
    </div>
  </section>;
}
