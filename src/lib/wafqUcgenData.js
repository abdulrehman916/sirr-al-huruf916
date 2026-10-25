// ═══════════════════════════════════════════════════════════════
// Triangular vefks — Hâvâss I pp. 325-327, "ÜÇGEN VEFKLER".
//
// These are the three figures the book prints, transcribed cell by
// cell. Nothing is generated: the book gives no rule for which number
// goes in which cell, and says plainly where its own account came
// from and how far it trusts it. Those words are kept below and shown
// on the card, because they are the most important thing on it.
// ═══════════════════════════════════════════════════════════════

export const UCGEN_NOTE = {
  page: "325-327",
  tr: "Bu usüle ait herhangi bir yazılı bilgiye rastlamadım. Kimseden de bu konuda bilgi almadım. Bu usülü sadece gördüğüm çok eski örnekleri deşifre ederek buldum.",
  ml: "ഈ രീതിയെക്കുറിച്ച് എഴുതപ്പെട്ട ഒരു വിവരവും എനിക്ക് കിട്ടിയിട്ടില്ല. ആരിൽ നിന്നും ഇതിനെപ്പറ്റി അറിവ് ലഭിച്ചിട്ടുമില്ല. ഞാൻ കണ്ട വളരെ പഴയ ചില മാതൃകകൾ വായിച്ചെടുത്താണ് ഈ രീതി കണ്ടെത്തിയത്.",
  en: "I have come across no written information on this method. Nor did I receive information on it from anyone. I found this method only by deciphering very old examples that I saw.",
};

export const UCGEN_DOUBT = {
  tr: "Herşeye rağmen vefk kontrolünde her satır ve sütun doğru çıkmadığı için bu usülün uygulamasından kuşkulu olduğumu belirtmem gerekir.",
  ml: "എന്തായാലും, വഫ്ഖ് പരിശോധിക്കുമ്പോൾ എല്ലാ വരിയും നിരയും ശരിയായി വരാത്തതുകൊണ്ട്, ഈ രീതി പ്രയോഗിക്കുന്നതിൽ എനിക്ക് സംശയമുണ്ടെന്ന് പറയേണ്ടതുണ്ട്.",
  en: "All the same, since not every row and column comes out right when the vefk is checked, I must say that I am doubtful about applying this method.",
};

export const UCGEN_RULES = {
  ml: [
    "വളരെ അപൂർവമാണെങ്കിലും വഫ്ഖുകൾ ത്രികോണ രൂപത്തിൽ ക്രമീകരിച്ചതും കാണാറുണ്ട്.",
    "ഈ ക്രമീകരണത്തിൽ വശങ്ങളുടെ തുക മാത്രമേ ശരിയായ സംഖ്യ തരുന്നുള്ളൂ. അതായത് 2-5-8, 8-3-4, 2-9-4 എന്നീ വീടുകൾ പൂർണ്ണസംഖ്യ തരുന്നു.",
    "സംഖ്യാ വഫ്ഖുകളുടെ എല്ലാ നിയമങ്ങളും ത്രികോണ വഫ്ഖുകൾക്കും ബാധകമാണ്. സംഖ്യകൾ എഴുതുന്ന വീടുകൾ, സമയനിർണ്ണയം, കൂട്ടേണ്ടതും കുറയ്ക്കേണ്ടതും ഹരിക്കേണ്ടതുമായ സംഖ്യകൾ — ചുരുക്കത്തിൽ എല്ലാം ഒന്നുതന്നെ.",
    "എല്ലാ തരം വഫ്ഖുകൾക്കും ത്രികോണ രൂപം പ്രയോഗിക്കാം. ഉദാഹരണത്തിന് അഞ്ചിന്റെ വഫ്ഖിന്റെ ഹാലി വസത്ത് രീതി പോലും ത്രികോണ വഫ്ഖായി ക്രമീകരിക്കാം.",
    "ത്രികോണത്തിന്റെ കൂർത്ത അറ്റം മുകളിലേക്കാണോ താഴേക്കാണോ എന്നത് പ്രധാനമല്ല. സ്വാഭാവിക ക്രമം ശ്രദ്ധിച്ചാൽ രണ്ട് രീതിയിലും ചെയ്യാം.",
  ],
  en: [
    "Though very rare, vefks are also seen arranged in the shape of a triangle.",
    "In this arrangement only the totals of the sides give the right number. That is, the houses 2-5-8, 8-3-4 and 2-9-4 give the exact number.",
    "All the rules of numeric vefks apply to triangular vefks. The houses the numbers are written in, the timings, the numbers to be added, subtracted and divided — in short, everything is the same.",
    "The triangular form can be applied to every kind of vefk. Even the hâli vasat method of the five-vefk, for instance, can be arranged as a triangular vefk.",
    "Whether the triangle's point faces up or down does not matter. It can be made either way, attending to the natural order.",
  ],
};

/**
 * Each figure's cells, row by row from the apex, in reading order
 * across the row. `null` is a house left empty.
 */
export const UCGEN_FIGURES = [
  {
    id: "u3-up", n: 3, apex: "up", page: "325",
    ml: "മുഅല്ലസ് ത്രികോണം — കൂർപ്പ് മുകളിൽ",
    en: "Üçlü üçgen vefk — point upward",
    sides_ml: "വശങ്ങൾ: 8-5-2, 8-3-4, 2-9-4 — ഓരോന്നും 15",
    sides_en: "The sides: 8-5-2, 8-3-4, 2-9-4 — each 15",
    rows: [
      [8],
      [5, 1, 3],
      [2, 7, 9, 6, 4],
    ],
  },
  {
    id: "u3-down", n: 3, apex: "down", page: "325",
    ml: "അതേ ത്രികോണം — കൂർപ്പ് താഴെ",
    en: "The same triangle — point downward",
    sides_ml: "വശങ്ങൾ: 4-9-2, 4-3-8, 8-5-2 — ഓരോന്നും 15",
    sides_en: "The sides: 4-9-2, 4-3-8, 8-5-2 — each 15",
    rows: [
      [4, 6, 9, 7, 2],
      [3, 1, 5],
      [8],
    ],
  },
  {
    id: "u5", n: 5, apex: "down", page: "326",
    ml: "മുഖമ്മസ് ത്രികോണം",
    en: "Üçgen beşli vefk",
    sides_ml: "വശങ്ങൾ: 18-10-22-14-1, 1-25-19-17-3, 3-8-24-12-18 — ഓരോന്നും 65",
    sides_en: "The sides: 18-10-22-14-1, 1-25-19-17-3, 3-8-24-12-18 — each 65",
    rows: [
      [18, 6, 10, 11, 22, 13, 14, 7, 1],
      [12, 20, 23, 16, 21, 2, 25],
      [24, 5, 15, 4, 19],
      [8, 9, 17],
      [3],
    ],
  },
  {
    id: "u5-hv", n: 5, apex: "up", page: "327", hollow: true,
    ml: "മുഖമ്മസ് ത്രികോണം — ഹാലി വസത്ത് (നടുവ് ഒഴിഞ്ഞ്)",
    en: "Üçgen beşli hâli vasat vefk — the middle house left empty",
    sides_ml: "വശങ്ങൾ: 6-14-13-20-7, 6-16-23-4-11, 7-3-24-15-11 — ഓരോന്നും 60",
    sides_en: "The sides: 6-14-13-20-7, 6-16-23-4-11, 7-3-24-15-11 — each 60",
    rows: [
      [6],
      [14, 18, 16],
      [13, 8, null, 5, 23],
      [20, 9, 22, 12, 21, 10, 4],
      [7, 19, 3, 1, 24, 2, 15, 17, 11],
    ],
  },
];
