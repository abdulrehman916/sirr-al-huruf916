// ═══════════════════════════════════════════════════════════════
// FINAL DIVINE NAMES — Complete Esma-ul Husna Calculation
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { istintak, getBastLevel } from "../../lib/mizaanPostEngine";

const G = {
  gold: "#F5D060", goldDim: "rgba(245,208,96,0.55)", goldFaint: "rgba(212,175,55,0.07)",
  goldBorder: "rgba(212,175,55,0.40)", goldBorderHi: "rgba(212,175,55,0.65)",
  bg: "rgba(3,6,20,0.99)", bgCard: "rgba(8,16,40,0.98)", bgInner: "rgba(212,175,55,0.06)",
  green: "#4ADE80", greenDim: "rgba(74,222,128,0.15)", red: "#F87171", dim: "rgba(255,255,255,0.35)",
};

const ELEMENT_COLORS = {
  fire: { color: "#FF6B35", arabic: "النار" }, earth: { color: "#A5C880", arabic: "التراب" },
  air: { color: "#B2EBF2", arabic: "الهواء" }, water: { color: "#4FC3F7", arabic: "الماء" },
};

const ANASIR_LETTERS = {
  fire: ['ا', 'ه', 'ح', 'ط', 'م', 'ف', 'ش'], earth: ['ب', 'و', 'خ', 'ي', 'ن', 'ص', 'د'],
  air: ['ج', 'ز', 'ك', 'ل', 'ق', 'ر', 'ت'], water: ['د', 'ع', 'ذ', 'غ', 'س', 'ث', 'ظ'],
};

// Sample Esma-ul Husna database (99 Names with Ebced values)
const ESMA_UL_HUSNA = [
  { name: "الله", value: 66, meaning: "Allah — The Greatest Name" },
  { name: "الرحمن", value: 298, meaning: "Ar-Rahman — The Most Gracious" },
  { name: "الرحيم", value: 258, meaning: "Ar-Rahim — The Most Merciful" },
  { name: "الملك", value: 90, meaning: "Al-Malik — The Sovereign King" },
  { name: "القدوس", value: 170, meaning: "Al-Quddus — The Most Holy" },
  { name: "السلام", value: 131, meaning: "As-Salam — The Source of Peace" },
  { name: "المؤمن", value: 108, meaning: "Al-Mu'min — The Granter of Security" },
  { name: "المهيمن", value: 105, meaning: "Al-Muhaymin — The Protector" },
  { name: "العزيز", value: 94, meaning: "Al-Aziz — The Almighty" },
  { name: "الجبار", value: 206, meaning: "Al-Jabbar — The Compeller" },
  { name: "المتكبر", value: 662, meaning: "Al-Mutakabbir — The Supreme" },
  { name: "الخالق", value: 731, meaning: "Al-Khaliq — The Creator" },
  { name: "البارئ", value: 203, meaning: "Al-Bari — The Evolver" },
  { name: "المصور", value: 336, meaning: "Al-Musawwir — The Fashioner" },
  { name: "الغفار", value: 1281, meaning: "Al-Ghaffar — The All-Forgiving" },
  { name: "القهار", value: 306, meaning: "Al-Qahhar — The Subduer" },
  { name: "الوهاب", value: 14, meaning: "Al-Wahhab — The Bestower" },
  { name: "الرزاق", value: 308, meaning: "Ar-Razzaq — The Provider" },
  { name: "الفتاح", value: 489, meaning: "Al-Fattah — The Opener" },
  { name: "العليم", value: 150, meaning: "Al-Alim — The All-Knowing" },
  { name: "القابض", value: 903, meaning: "Al-Qabid — The Constrictor" },
  { name: "الباسط", value: 72, meaning: "Al-Basit — The Expander" },
  { name: "الخافض", value: 1008, meaning: "Al-Khafid — The Abaser" },
  { name: "الرافع", value: 356, meaning: "Ar-Rafi — The Exalter" },
  { name: "المعز", value: 117, meaning: "Al-Mu'izz — The Bestower of Honor" },
  { name: "المذل", value: 744, meaning: "Al-Mudhill — The Humiliator" },
  { name: "السميع", value: 138, meaning: "As-Sami — The All-Hearing" },
  { name: "البصير", value: 312, meaning: "Al-Basir — The All-Seeing" },
  { name: "الحكم", value: 68, meaning: "Al-Hakam — The Judge" },
  { name: "العدل", value: 104, meaning: "Al-Adl — The Just" },
  { name: "اللطيف", value: 129, meaning: "Al-Latif — The Subtle One" },
  { name: "الخبير", value: 812, meaning: "Al-Khabir — The All-Aware" },
  { name: "الحليم", value: 88, meaning: "Al-Halim — The Forbearing" },
  { name: "العظيم", value: 1150, meaning: "Al-Azim — The Magnificent" },
  { name: "الغفور", value: 1286, meaning: "Al-Ghafur — The All-Forgiving" },
  { name: "الشكور", value: 326, meaning: "Ash-Shakur — The Appreciative" },
  { name: "العلي", value: 110, meaning: "Al-Ali — The Most High" },
  { name: "الكبير", value: 232, meaning: "Al-Kabir — The Most Great" },
  { name: "الحفيظ", value: 998, meaning: "Al-Hafiz — The Preserver" },
  { name: "المقيت", value: 550, meaning: "Al-Muqit — The Sustainer" },
  { name: "الحسيب", value: 80, meaning: "Al-Hasib — The Reckoner" },
  { name: "الجليل", value: 73, meaning: "Al-Jalil — The Majestic" },
  { name: "الكريم", value: 250, meaning: "Al-Karim — The Generous" },
  { name: "الرقيب", value: 312, meaning: "Ar-Raqib — The Watchful" },
  { name: "المجيب", value: 56, meaning: "Al-Mujib — The Responsive" },
  { name: "الواسع", value: 137, meaning: "Al-Wasi — The All-Encompassing" },
  { name: "الحكيم", value: 78, meaning: "Al-Hakim — The All-Wise" },
  { name: "الودود", value: 20, meaning: "Al-Wadud — The Loving" },
  { name: "المجيد", value: 57, meaning: "Al-Majid — The Glorious" },
  { name: "الباعث", value: 572, meaning: "Al-Ba'ith — The Resurrector" },
  { name: "الشهيد", value: 319, meaning: "Ash-Shahid — The Witness" },
  { name: "الحق", value: 108, meaning: "Al-Haqq — The Truth" },
  { name: "الوكيل", value: 53, meaning: "Al-Wakil — The Trustee" },
  { name: "القوي", value: 116, meaning: "Al-Qawi — The Strong" },
  { name: "المتين", value: 500, meaning: "Al-Matin — The Firm" },
  { name: "الولي", value: 46, meaning: "Al-Wali — The Protecting Friend" },
  { name: "الحميد", value: 62, meaning: "Al-Hamid — The Praiseworthy" },
  { name: "المحصي", value: 158, meaning: "Al-Muhsi — The Counter" },
  { name: "المبدئ", value: 55, meaning: "Al-Mubdi — The Originator" },
  { name: "المعيد", value: 120, meaning: "Al-Mu'id — The Restorer" },
  { name: "المحيي", value: 22, meaning: "Al-Muhyi — The Giver of Life" },
  { name: "المميت", value: 550, meaning: "Al-Mumit — The Taker of Life" },
  { name: "الحي", value: 18, meaning: "Al-Hayy — The Ever-Living" },
  { name: "القيوم", value: 156, meaning: "Al-Qayyum — The Self-Subsisting" },
  { name: "الواجد", value: 13, meaning: "Al-Wajid — The Finder" },
  { name: "الماجد", value: 48, meaning: "Al-Majid — The Noble" },
  { name: "الواحد", value: 19, meaning: "Al-Wahid — The One" },
  { name: "الصمد", value: 134, meaning: "As-Samad — The Eternal" },
  { name: "القادر", value: 304, meaning: "Al-Qadir — The All-Powerful" },
  { name: "المقتدر", value: 754, meaning: "Al-Muqtadir — The All-Determiner" },
  { name: "المقدم", value: 184, meaning: "Al-Muqaddim — The Expediter" },
  { name: "المؤخر", value: 611, meaning: "Al-Mu'akhkhir — The Delayer" },
  { name: "الأول", value: 37, meaning: "Al-Awwal — The First" },
  { name: "الآخر", value: 211, meaning: "Al-Akhir — The Last" },
  { name: "الظاهر", value: 1061, meaning: "Az-Zahir — The Manifest" },
  { name: "الباطن", value: 562, meaning: "Al-Batin — The Hidden" },
  { name: "الوالي", value: 47, meaning: "Al-Wali — The Governor" },
  { name: "المتعال", value: 571, meaning: "Al-Muta'ali — The Most Exalted" },
  { name: "البر", value: 202, meaning: "Al-Barr — The Source of Goodness" },
  { name: "التواب", value: 409, meaning: "At-Tawwab — The Acceptor of Repentance" },
  { name: "المنتقم", value: 400, meaning: "Al-Muntaqim — The Avenger" },
  { name: "العفو", value: 156, meaning: "Al-Afu — The Pardoner" },
  { name: "الرؤوف", value: 386, meaning: "Ar-Ra'uf — The Compassionate" },
  { name: "مالك الملك", value: 290, meaning: "Malik al-Mulk — Owner of Sovereignty" },
  { name: "ذو الجلال والإكرام", value: 1133, meaning: "Dhu al-Jalal wa al-Ikram — Lord of Majesty and Bounty" },
  { name: "المقسط", value: 200, meaning: "Al-Muqsit — The Equitable" },
  { name: "الجامع", value: 114, meaning: "Al-Jami — The Gatherer" },
  { name: "الغني", value: 1060, meaning: "Al-Ghani — The Self-Sufficient" },
  { name: "المغني", value: 1090, meaning: "Al-Mughni — The Enricher" },
  { name: "المانع", value: 161, meaning: "Al-Mani — The Withholder" },
  { name: "الضار", value: 1001, meaning: "Ad-Darr — The Distresser" },
  { name: "النافع", value: 151, meaning: "An-Nafi — The Benefactor" },
  { name: "النور", value: 256, meaning: "An-Nur — The Light" },
  { name: "الهادي", value: 20, meaning: "Al-Hadi — The Guide" },
  { name: "البديع", value: 116, meaning: "Al-Badi — The Incomparable Originator" },
  { name: "الباقي", value: 113, meaning: "Al-Baqi — The Everlasting" },
  { name: "الوارث", value: 706, meaning: "Al-Warith — The Inheritor" },
  { name: "الرشيد", value: 514, meaning: "Ar-Rashid — The Righteous Teacher" },
  { name: "الصبور", value: 298, meaning: "As-Sabur — The Patient" },
];

function SectionHeader({ step, label, arabic, color = "#F5D060" }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="flex items-center justify-center w-7 h-7 rounded-lg font-inter text-xs font-black" style={{ background: color + "22", border: `1px solid ${color}55`, color }}>{step}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-inter text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color }}>{label}</span>
          {arabic && <span className="font-amiri text-base" style={{ color: "rgba(245,208,96,0.55)", lineHeight: 1.8 }}>{arabic}</span>}
        </div>
      </div>
      <div className="h-px flex-1 max-w-[60px]" style={{ background: `linear-gradient(to right, ${color}40, transparent)` }} />
    </div>
  );
}

function Card({ children, accent }) {
  return (
    <div className="rounded-xl border p-4" style={{ background: "rgba(8,16,40,0.98)", borderColor: accent ? accent + "55" : "rgba(212,175,55,0.40)", borderLeft: accent ? `3px solid ${accent}` : undefined }}>
      {children}
    </div>
  );
}

function LetterCell({ letter, color = "#F5D060", size = "lg" }) {
  const sizes = { sm: "text-xl px-2.5 py-1.5", lg: "text-3xl px-4 py-2.5", xl: "text-4xl px-5 py-3" };
  return (
    <span className={`font-amiri font-bold rounded-lg border ${sizes[size]}`} style={{ color, borderColor: color + "55", background: color + "12", lineHeight: 1.8, display: "inline-block" }}>{letter}</span>
  );
}

function LetterRow({ letters, color = "#F5D060", size = "lg", rtl = false }) {
  const safe = Array.isArray(letters) ? letters : [];
  if (!safe.length) return <span className="font-inter text-xs italic" style={{ color: "rgba(255,255,255,0.35)" }}>—</span>;
  return (
    <div className="flex flex-wrap gap-2.5 items-center" style={{ direction: rtl ? "rtl" : "ltr" }}>
      {safe.map((l, i) => <LetterCell key={i} letter={l} color={color} size={size} />)}
    </div>
  );
}

export default function FinalDivineNamesSection({ mizanulMevazin, kitabetTotal, avanTotal, kasemTotal, dominant, getBastLevelFn = getBastLevel }) {
  const elementMeta = ELEMENT_COLORS[dominant] || ELEMENT_COLORS.fire;
  const anasirLetters = ANASIR_LETTERS[dominant] || ANASIR_LETTERS.fire;
  const anasirB1 = anasirLetters.reduce((s, l) => s + (getBastLevelFn(l, 1) || 0), 0);
  
  // PDF Formula
  const kitabetWithAnasir = kitabetTotal + anasirB1;
  const avanWithAnasir = avanTotal + anasirB1;
  const grandTotal = mizanulMevazin + kitabetWithAnasir + avanWithAnasir + kasemTotal;
  
  // Istintaq → Divine Letters
  const divineLetters = useMemo(() => istintak(grandTotal), [grandTotal]);
  
  // Ebced-i Kebir conversion
  const ebcedValues = useMemo(() => divineLetters.map(letter => ({
    letter,
    value: getBastLevelFn(letter, 1) || 0,
  })), [divineLetters, getBastLevelFn]);
  
  const ebcedTotal = ebcedValues.reduce((s, v) => s + v.value, 0);
  
  // Match Divine Names
  const matchingNames = useMemo(() => ESMA_UL_HUSNA.filter(n => n.value === ebcedTotal), [ebcedTotal]);
  
  return (
    <Card accent={elementMeta.color}>
      <SectionHeader step="F" label="Final Divine Names Calculation" arabic="الأسماء الإلهية النهائية" color={elementMeta.color} />
      
      {/* Formula Breakdown */}
      <div className="space-y-3 mb-6">
        <div className="rounded-lg border p-4" style={{ background: "rgba(212,175,55,0.06)", borderColor: "rgba(212,175,55,0.40)" }}>
          <div className="text-[7px] mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>Nine Mizan Total (Mizanül Mevazin)</div>
          <div className="text-2xl font-bold tabular-nums" style={{ color: elementMeta.color }}>{mizanulMevazin.toLocaleString()}</div>
        </div>
        
        <div className="rounded-lg border p-4" style={{ background: "rgba(212,175,55,0.06)", borderColor: "rgba(212,175,55,0.40)" }}>
          <div className="text-[7px] mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>Esma-i Kitabet Total + Dominant Anasir</div>
          <div className="flex items-center gap-3 text-lg">
            <span className="tabular-nums" style={{ color: elementMeta.color }}>{kitabetTotal.toLocaleString()}</span>
            <span style={{ color: "rgba(245,208,96,0.55)" }}>+</span>
            <span className="tabular-nums" style={{ color: elementMeta.color }}>{anasirB1.toLocaleString()}</span>
            <span style={{ color: "rgba(245,208,96,0.55)" }}>=</span>
            <span className="tabular-nums text-xl font-bold" style={{ color: "#F5D060" }}>{kitabetWithAnasir.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="rounded-lg border p-4" style={{ background: "rgba(212,175,55,0.06)", borderColor: "rgba(212,175,55,0.40)" }}>
          <div className="text-[7px] mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>Esma-i A'van Total + Dominant Anasir</div>
          <div className="flex items-center gap-3 text-lg">
            <span className="tabular-nums" style={{ color: elementMeta.color }}>{avanTotal.toLocaleString()}</span>
            <span style={{ color: "rgba(245,208,96,0.55)" }}>+</span>
            <span className="tabular-nums" style={{ color: elementMeta.color }}>{anasirB1.toLocaleString()}</span>
            <span style={{ color: "rgba(245,208,96,0.55)" }}>=</span>
            <span className="tabular-nums text-xl font-bold" style={{ color: "#F5D060" }}>{avanWithAnasir.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="rounded-lg border p-4" style={{ background: "rgba(212,175,55,0.06)", borderColor: "rgba(212,175,55,0.40)" }}>
          <div className="text-[7px] mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>Esma-i Kasem Total</div>
          <div className="text-2xl font-bold tabular-nums" style={{ color: "#F5D060" }}>{kasemTotal.toLocaleString()}</div>
        </div>
        
        {/* Grand Total */}
        <div className="rounded-xl border p-5 text-center" style={{ background: "rgba(3,6,20,0.99)", borderColor: elementMeta.color }}>
          <div className="text-[8px] mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>Grand Total Formula</div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xl font-bold">
            <span className="tabular-nums" style={{ color: elementMeta.color }}>{mizanulMevazin.toLocaleString()}</span>
            <span style={{ color: "rgba(245,208,96,0.55)" }}>+</span>
            <span className="tabular-nums" style={{ color: elementMeta.color }}>{kitabetWithAnasir.toLocaleString()}</span>
            <span style={{ color: "rgba(245,208,96,0.55)" }}>+</span>
            <span className="tabular-nums" style={{ color: elementMeta.color }}>{avanWithAnasir.toLocaleString()}</span>
            <span style={{ color: "rgba(245,208,96,0.55)" }}>+</span>
            <span className="tabular-nums" style={{ color: "#F5D060" }}>{kasemTotal.toLocaleString()}</span>
            <span style={{ color: "rgba(245,208,96,0.55)" }}>=</span>
            <span className="tabular-nums text-4xl" style={{ color: "#F5D060" }}>{grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      {/* Istintaq Letters */}
      <div className="mb-6">
        <div className="text-[8px] uppercase tracking-widest mb-3 text-center" style={{ color: "rgba(255,255,255,0.35)" }}>Istintaq of Grand Total → Divine Name Letters</div>
        <LetterRow letters={divineLetters} color="#F5D060" size="xl" rtl />
        <div className="text-center mt-2">
          <span className="text-[7px]" style={{ color: "rgba(255,255,255,0.35)" }}>Count: </span>
          <span className="text-sm font-bold" style={{ color: "#F5D060" }}>{divineLetters.length} letters</span>
        </div>
      </div>
      
      {/* Ebced-i Kebir Conversion */}
      <div className="mb-6">
        <div className="text-[8px] uppercase tracking-widest mb-3 text-center" style={{ color: "rgba(255,255,255,0.35)" }}>Ebced-i Kebir Conversion — Every Letter</div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {ebcedValues.map((ev, idx) => (
            <div key={idx} className="rounded-lg border p-2 text-center" style={{ background: "rgba(212,175,55,0.06)", borderColor: "rgba(212,175,55,0.40)" }}>
              <LetterCell letter={ev.letter} color="#F5D060" size="sm" />
              <div className="text-[6px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>Value</div>
              <div className="text-sm font-bold tabular-nums" style={{ color: elementMeta.color }}>{ev.value.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Final Ebced Total */}
      <div className="mb-6 rounded-xl border p-5 text-center" style={{ background: "rgba(3,6,20,0.99)", borderColor: "#F5D060" }}>
        <div className="text-[8px] mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>Sum of All Ebced-i Kebir Values</div>
        <div className="text-5xl font-black mb-2" style={{ color: "#F5D060" }}>{ebcedTotal.toLocaleString()}</div>
        <div className="text-[7px]" style={{ color: "rgba(255,255,255,0.35)" }}>Target Number for Esma-ul Husna Matching</div>
      </div>
      
      {/* Divine Names Matching */}
      <div className="rounded-xl border p-5" style={{ background: "rgba(212,175,55,0.07)", borderColor: "rgba(212,175,55,0.65)" }}>
        <div className="text-[8px] uppercase tracking-widest mb-4 text-center" style={{ color: "rgba(255,255,255,0.35)" }}>Esma-ul Husna — Divine Names</div>
        
        {matchingNames.length > 0 ? (
          <div className="space-y-3">
            <div className="text-center mb-3">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold" style={{ background: "rgba(74,222,128,0.15)", borderColor: "rgba(74,222,128,0.55)", color: "#4ADE80" }}>
                ✓ {matchingNames.length} Matching Name{matchingNames.length !== 1 ? 's' : ''} Found
              </span>
            </div>
            {matchingNames.map((dn, idx) => (
              <div key={idx} className="rounded-xl border p-5 text-center" style={{ background: "rgba(212,175,55,0.06)", borderColor: "rgba(212,175,55,0.65)" }}>
                <div className="font-amiri text-5xl font-bold mb-3" style={{ color: "#F5D060" }} dir="rtl">{dn.name}</div>
                <div className="text-[7px] mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>Ebced Value: <span className="font-bold" style={{ color: "#F5D060" }}>{dn.value.toLocaleString()}</span></div>
                <div className="font-inter text-sm" style={{ color: "rgba(245,208,96,0.55)" }}>{dn.meaning}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border mb-3" style={{ background: "rgba(212,175,55,0.06)", borderColor: "rgba(212,175,55,0.40)" }}>
              <span className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>No exact match for</span>
              <span className="font-inter text-sm font-bold" style={{ color: "#F5D060" }}>{ebcedTotal.toLocaleString()}</span>
            </div>
            <div className="text-[7px]" style={{ color: "rgba(255,255,255,0.35)" }}>
              This number may correspond to a Divine Name not in this database
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}