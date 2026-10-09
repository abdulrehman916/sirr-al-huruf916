import diagram from '@/data/birhatiahOmanSquareP561.json';
import { useHolyNamesLanguage } from './HolyNamesLanguageContext';

const arabicDigits = number => String(number).replace(/[0-9]/g, digit => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);
const total = values => values.reduce((a, b) => a + b, 0);
const allLines = grid => [
  ...grid.map(total),
  ...grid[0].map((_, i) => total(grid.map(row => row[i]))),
  total(grid.map((row, i) => row[i])),
  total(grid.map((row, i) => row[row.length - i - 1])),
];

// A faithful numerical reconstruction of the user's supplied printed book
// diagram. Both the large source values and its smaller position numbers are
// preserved exactly; the full source PDF is not published.
export default function BirhatiahOmanSquare() {
  const { language } = useHolyNamesLanguage();
  const ml = language === 'ml';
  const valid = allLines(diagram.numbers).every(x => x === diagram.verified_magic_sum);
  return <section className="rounded-xl border border-yellow-500/25 p-4 space-y-4" data-testid="birhatiah-oman-original-square">
    <h3 className="font-semibold text-yellow-200">{diagram.title[language]}</h3>
    <div className="space-y-3 pt-3">
      <p className="font-amiri text-lg text-right text-white/85" lang="ar" dir="rtl">{diagram.heading_arabic}</p>
      <p className={`text-sm leading-loose text-white/85 ${ml?'font-malayalam':'font-inter'}`}>{diagram.purpose[language]}</p>
      <div className="max-w-md mx-auto grid grid-cols-4 border border-yellow-500/50 rounded-md overflow-hidden" role="table" aria-label={diagram.title[language]} dir="ltr">
        {diagram.numbers.flatMap((row, ri) => row.map((number, ci) => <div role="cell" key={ri+'-'+ci} dir="rtl" className="relative aspect-square border border-yellow-500/35 bg-yellow-500/5 flex justify-center items-center p-2">
          <span lang="ar" className="font-amiri text-2xl sm:text-3xl text-yellow-100">{arabicDigits(number)}</span>
          <span lang="ar" className="absolute bottom-1 right-1 font-amiri text-xs text-white/65">{arabicDigits(diagram.printed_minor_positions[ri][ci])}</span>
        </div>))}
      </div>
      <p className={`text-sm text-white/75 ${ml?'font-malayalam':'font-inter'}`}>{ml?'പരിശോധിച്ച വരി/നിര/വികർണ്ണ ആകെ':'Verified row/column/diagonal total'}: <strong>{diagram.verified_magic_sum}</strong> {valid ? '✓' : (ml ? '— പരിശോധനാവ്യത്യാസം' : '— discrepancy')}</p>
      <p className={`text-xs text-white/65 leading-relaxed ${ml?'font-malayalam':'font-inter'}`}>{diagram.reading_note[language]}</p>
      <p className="text-xs text-white/50">{diagram.source_title_ar} · {ml?'പേജ്':'p.'} {diagram.printed_page}</p>
    </div>
  </section>;
}
