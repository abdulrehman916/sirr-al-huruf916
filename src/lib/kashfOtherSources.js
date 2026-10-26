// ═══════════════════════════════════════════════════════════════
// OTHER ISLAMIC SOURCES — shown beside Kashf al-Haqa'iq, never mixed into its % scores.
//   taha   : تدریس نجوم احکامی — Ustad Taha (Persian, Islamic judicial astrology)
//   havass : Havâss'ın Derinlikleri (Turkish compilation of the Arabic khawass tradition)
// Only everyday matters are carried over (travel, nikah, trade, property, officials,
// healing, learning). Talismanic, magical or harmful items in the sources are left out.
// ═══════════════════════════════════════════════════════════════

export const SOURCES = {
  taha:   { ml: "ഉസ്താദ് ത്വാഹ", en: "Ustad Taha", book_ml: "തദ്‌രീസെ നുജൂമെ അഹ്കാമി", book_en: "Tadris-e Nujum-e Ahkami" },
  havass: { ml: "ബുലന്റ് കിസ", en: "Bülent Kısa", book_ml: "Havâss'ın Derinlikleri", book_en: "Havâss'ın Derinlikleri" },
};

// ── Planets ────────────────────────────────────────────────────
export const PLANET_OTHER = {
  sun: [
    { src: "taha", ml: "നഹ്സ് — പക്ഷേ ശക്തമല്ല; 'സുൽത്വാനുൽ കവാകിബ്' (ഗ്രഹങ്ങളുടെ രാജാവ്)", en: "Nahs — but not strong; 'Sultan al-Kawakib' (king of the planets)" },
    { src: "havass", ml: "ധനം, ഭരണാധികാരികളുടെ പ്രീതി, സൗഹൃദം, ശാരീരിക ആരോഗ്യം", en: "Wealth, favour of rulers, friendship, bodily health" },
  ],
  moon: [
    { src: "taha", ml: "സ്വഭാവത്താൽ സഅ്ദ്; ഏറ്റവും സ്വാധീനമുള്ള ഗ്രഹം", en: "Sa'd by nature; the most influential planet" },
    { src: "taha", ml: "യൗമുൽ ഇഥ്നൈൻ (തിങ്കൾ) റുഖ്‌യ, രോഗശമനം എന്നിവയ്ക്ക്", en: "Monday suits ruqya and healing" },
    { src: "havass", ml: "യാത്ര, കടൽയാത്ര, ജലസംബന്ധമായ കാര്യങ്ങൾ, ദൂതന്മാർ", en: "Journeys, sea travel, water matters, messengers" },
  ],
  mars: [
    { src: "taha", ml: "നഹ്സ് അസ്ഗർ (ചെറിയ അശുഭം)", en: "Nahs Asghar (lesser malefic)" },
    { src: "havass", ml: "ധൈര്യം, സൈനിക കാര്യങ്ങൾ — സാധാരണ കാര്യങ്ങൾക്ക് പറ്റില്ല", en: "Courage, military matters — not for ordinary affairs" },
  ],
  mercury: [
    { src: "taha", ml: "മുംതസിജ് — സഅ്ദിനൊപ്പം സഅ്ദ്, നഹ്സിനൊപ്പം നഹ്സ്", en: "Mumtazij — sa'd with a sa'd, nahs with a nahs" },
    { src: "taha", ml: "കച്ചവടത്തിനും ഇടപാടുകൾക്കും ഏറ്റവും നല്ല സാഅത്ത്", en: "The best hour for trade and dealings" },
    { src: "havass", ml: "സംസാരം, ജോലി, കല, ശാസ്ത്രം, കച്ചവടച്ചരക്ക്", en: "Speech, work, arts and sciences, merchandise" },
  ],
  jupiter: [
    { src: "taha", ml: "സഅ്ദ് അക്ബർ — 'ജാമിഉൽ ഫവാഇദ്' (എല്ലാ ഗുണങ്ങളും ചേർന്നത്)", en: "Sa'd Akbar — 'Jami' al-Fawa'id' (gathers all benefits)" },
    { src: "taha", ml: "ഇബാദത്തിനും ശ്രദ്ധയ്ക്കും ഏറ്റവും നല്ല സാഅത്ത്", en: "The best hour for worship and focus" },
    { src: "havass", ml: "ബഹുമതി, സമ്പത്ത്, സൗഹൃദം, ആരോഗ്യം, അറിവ്", en: "Honour, wealth, friendship, health, knowledge" },
  ],
  venus: [
    { src: "taha", ml: "സഅ്ദ് അസ്ഗർ — സ്നേഹത്തിന്റെയും സൗഹൃദത്തിന്റെയും ഗ്രഹം", en: "Sa'd Asghar — planet of love and friendship" },
    { src: "havass", ml: "സൗഹൃദം, യാത്ര, സന്തോഷം, മര്യാദ", en: "Friendship, travel, joy, courtesy" },
  ],
  saturn: [
    { src: "taha", ml: "നഹ്സ് അക്ബർ (ഏറ്റവും വലിയ അശുഭം)", en: "Nahs Akbar (greater malefic)" },
    { src: "havass", ml: "ഭൂമി, സ്വത്ത്, അറിവ് — നന്മയും തിന്മയും കലർന്നത്", en: "Land, property, knowledge — good and bad mixed" },
  ],
};

// ── Moon: phase and burj (Taha) ────────────────────────────────
export const MOON_OTHER = {
  muhaq: { src: "taha", ml: "ഇജ്തിമാഅ് (ശംസും ഖമറും ഒന്നിക്കുന്ന സമയം) നഹ്സ്", en: "Ijtima' (conjunction of Shams and Qamar) is nahs" },
  eclipse: { src: "taha", ml: "ഗ്രഹണങ്ങൾ (ചന്ദ്ര/സൂര്യ) പൂർണ്ണമായും നഹ്സ്", en: "Eclipses (lunar and solar) are fully nahs" },
  waxing: { src: "havass", ml: "നല്ല കാര്യങ്ങൾക്ക് നൂർ കൂടുന്ന സമയം നല്ലത്", en: "For good works, prefer the waxing moon" },
};
// Taha: Qamar in these buruj is nahs (Hamal, Aqrab, Jady, Dalw). Sign index 0 = Hamal.
export const TAHA_NAHS_BURUJ = [0, 7, 9, 10];
export const BURJ_OTHER_NOTE = {
  src: "taha",
  ml: "ഖമർ ഹമൽ, അഖ്റബ്, ജദ്‌യ്, ദൽവ് എന്നീ ബുർജുകളിൽ ആകുമ്പോൾ നഹ്സ്",
  en: "Qamar in Hamal, Aqrab, Jady or Dalw is nahs",
};

// ── Weekdays (0 = Sunday) — Havass ─────────────────────────────
export const WEEKDAY_OTHER = [
  { src: "havass", ml: "ധനം, ഭരണാധികാരികളുടെ പ്രീതി, സൗഹൃദം, ശരീരബലം", en: "Wealth, favour of rulers, friendship, bodily strength" },
  { src: "havass", ml: "യാത്ര, കടൽയാത്ര, ജലസംബന്ധമായ കാര്യങ്ങൾ", en: "Journeys, sea travel, water matters" },
  { src: "havass", ml: "ധൈര്യവും സൈനിക കാര്യങ്ങളും — സാധാരണ കാര്യങ്ങൾ തുടങ്ങാൻ നല്ലതല്ല", en: "Courage and military matters — not good for starting ordinary affairs" },
  { src: "havass", ml: "സംസാരം, ജോലി, കല, ശാസ്ത്രം, കച്ചവടച്ചരക്ക്", en: "Speech, work, arts and sciences, merchandise" },
  { src: "havass", ml: "ബഹുമതി, സമ്പത്ത്, സൗഹൃദം, ആരോഗ്യം, അറിവ്", en: "Honour, wealth, friendship, health, knowledge" },
  { src: "havass", ml: "സൗഹൃദം, യാത്ര, സന്തോഷം", en: "Friendship, travel, joy" },
  { src: "havass", ml: "സ്വത്ത്, അറിവ് — നന്മയും തിന്മയും കലർന്ന ദിവസം", en: "Property, knowledge — a day of mixed good and bad" },
];

// ── 28 manazil — Havass general ruling + everyday notes ───────
// nature: saad | nahs | mixed
export const MANSION_OTHER = [
  null,
  { nature: "nahs",  ml: "അത്യാവശ്യമില്ലാത്ത ഒരു കാര്യവും തുടങ്ങരുത്", en: "Begin nothing that is not necessary" },
  { nature: "saad",  ml: "ചികിത്സ, റിസ്ഖ് വർധന", en: "Healing, opening of rizq" },
  { nature: "saad",  ml: "നിക്കാഹ്, വിവാഹാലോചന, ജോലി തുടങ്ങൽ, കച്ചവട ലാഭം", en: "Nikah and proposals, opening work, trade gain" },
  { nature: "nahs",  ml: "രഹസ്യങ്ങൾ സൂക്ഷിക്കുക; ഭൂമി, കൃഷിയിടം, വീട് കാര്യങ്ങൾക്ക് മാത്രം നല്ലത്", en: "Keep secrets; good only for land, fields and house matters" },
  { nature: "nahs",  ml: "ഈ സമയത്തെ നിക്കാഹും വിവാഹനിശ്ചയവും നിലനിൽക്കില്ല; ഭൂമി, തോട്ടം, സ്വത്ത് കാര്യങ്ങൾ മാത്രം നല്ലത്", en: "Nikah and engagement made now do not last; only land, garden and property matters go well" },
  { nature: "saad",  ml: "പിണക്കം തീർക്കൽ, പ്രമുഖരോട് ആവശ്യപ്പെടൽ, ആരോഗ്യം, പുതിയ സാധനം വാങ്ങൽ, സുഹൃദ്‌സംഗമം, നിക്കാഹ്", en: "Reconciling, asking important people, health, buying new things, meeting friends, nikah" },
  { nature: "saad",  ml: "പഠനവിജയം, യോഗങ്ങളും കരാറുകളും, സ്വത്ത്, അധികാരികളോട് ആവശ്യപ്പെടൽ", en: "Success in learning, meetings and agreements, property, requests to officials" },
  { nature: "nahs",  ml: "പങ്കാളിത്തം, നിക്കാഹ്, വിവാഹനിശ്ചയം വേണ്ട; വീടോ ഭൂമിയോ വാങ്ങാനോ വാടകയ്ക്കെടുക്കാനോ നല്ലതല്ല", en: "No partnership, nikah or engagement; buying or renting house or land does not go well" },
  { nature: "nahs",  ml: "സർക്കാർ കാര്യങ്ങൾ നടത്തരുത്; ആരോടും ആവശ്യപ്പെടരുത്", en: "Do not pursue official matters; make no requests" },
  { nature: "mixed", ml: "സൗഹൃദം, സാമൂഹിക ഉയർച്ച, വിജയം", en: "Friendship, social progress, success" },
  { nature: "saad",  ml: "രോഗമുക്തി, കച്ചവടത്തിൽ എളുപ്പം, പ്രമുഖരുടെ പ്രീതി", en: "Recovery from illness, ease in trade, favour of important people" },
  { nature: "nahs",  ml: "എല്ലാ കാര്യങ്ങൾക്കും പ്രതികൂലം", en: "Unfavourable for every matter" },
  { nature: "nahs",  ml: "ആരോടും ആവശ്യപ്പെടരുത്; സർക്കാർ, നിയമ കാര്യങ്ങളിൽ നിന്ന് അകന്നുനിൽക്കുക", en: "Make no requests; keep away from official and legal matters" },
  { nature: "nahs",  ml: "ജോലിയിൽ പരാജയം, സാമ്പത്തിക ഞെരുക്കം; വിശ്വസിക്കാൻ പറ്റാത്തവരെ സൂക്ഷിക്കുക", en: "Failure at work, financial strain; beware untrustworthy people" },
  { nature: "saad",  ml: "സൗഹൃദം, രമ്യത, ജോലി കിട്ടൽ, രോഗശമനം", en: "Friendship, reconciliation, finding work, healing" },
  { nature: "saad",  ml: "മുറിവുകളും വേദനയും വേഗം മാറൽ, ചികിത്സ, വിജയം", en: "Wounds and pains heal quickly, treatment, success" },
  { nature: "mixed", ml: "ധനനഷ്ടം, കരാറുകൾ നടക്കാതിരിക്കൽ — അല്ലെങ്കിൽ നേരെ മറിച്ച്", en: "Loss of money, agreements failing — or the opposite" },
  { nature: "mixed", ml: "കാര്യങ്ങൾ കേടാകാം; അപ്രതീക്ഷിത ലാഭവും രോഗശമനവും ആകാം", en: "Matters may spoil; unexpected gain and healing are also possible" },
  { nature: "mixed", ml: "പ്രയാസമുള്ള കാര്യങ്ങൾ തീരാം, അല്ലെങ്കിൽ കുരുങ്ങാം", en: "Hard matters may be solved — or get stuck" },
  { nature: "saad",  ml: "സന്തോഷം, സൗഹൃദം, പ്രയാസത്തിൽ നിന്ന് മോചനം, വീട് സ്വന്തമാക്കൽ", en: "Joy, friendship, relief from hardship, acquiring a house" },
  { nature: "nahs",  ml: "എല്ലാ വാങ്ങൽ-വിൽക്കലിനും മോശം സമയം", en: "A bad time for all buying and selling" },
  { nature: "nahs",  ml: "രഹസ്യങ്ങൾ പുറത്താകാം; ഒഴിവാക്കുക", en: "Secrets may come out; avoid" },
  { nature: "mixed", ml: "ആരെയും വിശ്വസിക്കരുത്", en: "Trust no one" },
  { nature: "saad",  ml: "എല്ലാം നേരെയാകും; പ്രമുഖരുടെ പിന്തുണ, ആവശ്യങ്ങൾ സ്വീകരിക്കപ്പെടും", en: "Everything is set right; support of important people, requests accepted" },
  { nature: "nahs",  ml: "എല്ലാ കാര്യത്തിലും പരാജയം", en: "Failure in every matter" },
  { nature: "saad",  ml: "പുതിയ ബന്ധങ്ങൾ, പ്രമുഖരുടെ പിന്തുണ, എല്ലാ കാര്യത്തിലും വിജയം", en: "New relations, support of important people, success in all matters" },
  { nature: "nahs",  ml: "അപകടവും രോഗവും സൂക്ഷിക്കുക", en: "Beware accidents and illness" },
  { nature: "saad",  ml: "വിജയം, സമ്പത്ത്, നല്ല ബന്ധങ്ങൾ, യാത്ര", en: "Success, wealth, good relations, travel" },
];

// ── Monthly nahs days narrated in Taha's book (month 1 = Muharram) ──
export const TAHA_MONTH_NAHS = [
  {
    ml: "ഇമാം അലി (റ) യിൽ നിന്നുള്ള റിവായത്ത്", en: "Narration from Imam Ali (RA)",
    days: { 1: [11, 21], 2: [21], 3: [2, 10], 6: [9, 13], 7: [24], 8: [23], 9: [5, 6], 10: [16], 11: [27], 12: [21] },
  },
  {
    ml: "ഇമാം ഹസൻ അസ്കരി യിൽ നിന്നുള്ള റിവായത്ത്", en: "Narration from Imam Hasan al-Askari",
    days: { 1: [22], 2: [10], 3: [4], 4: [4], 5: [26], 6: [12], 7: [22], 8: [26], 9: [24], 10: [2], 11: [28], 12: [8] },
  },
];
// Taha also cites 3, 5, 13, 16, 21, 24, 25 as nahs (Persian calendar) — the same numbers as Kashf's kawamil.
export const KAWAMIL_AGREEMENT = {
  src: "taha",
  ml: "ഉസ്താദ് ത്വാഹയും ഇതേ 7 തീയതികൾ (3, 5, 13, 16, 21, 24, 25) നഹ്സ് ആയി ഉദ്ധരിക്കുന്നു (പേർഷ്യൻ കലണ്ടറിൽ, ഇമാം അലി (റ) യിൽ നിന്ന്)",
  en: "Ustad Taha cites the same seven dates (3, 5, 13, 16, 21, 24, 25) as nahs (in the Persian calendar, from Imam Ali (RA))",
};

export function tahaNahsFor(month, day) {
  return TAHA_MONTH_NAHS.filter((r) => (r.days[month] || []).includes(day));
}
