// Editorial meanings of the supplied Arabic headings, not authentication of a divine-name list.
import englishGlosses from '@/data/holyNamesSectionBEnglishGlosses.json';
const glosses = {
  'PDF-HN-0146': ['എല്ലാറ്റിനും കഴിവുള്ളവൻ', 'The All-Powerful'],
  'PDF-HN-0147': ['ഉദാരമായി ദാനങ്ങൾ നൽകുന്നവൻ', 'The Bestower'],
  'PDF-HN-0154': ['വളരെയധികം പൊറുക്കുന്നവൻ', 'The All-Forgiving'],
  'PDF-HN-0155': ['അടുത്തുള്ളവൻ', 'The Near'],
  'PDF-HN-0156': ['പ്രാർത്ഥനയ്ക്ക് ഉത്തരം നൽകുന്നവൻ', 'The One who answers'],
  'PDF-HN-0158': ['ശിക്ഷിക്കാൻ തിടുക്കം കാണിക്കാതെ സഹിക്കുന്നവൻ', 'The Forbearing'],
  'PDF-HN-0159': ['കാര്യങ്ങളുടെ ഉള്ളറകൾ അറിയുന്നവൻ', 'The All-Aware'],
  'PDF-HN-0160': ['അത്യുന്നതൻ', 'The Most High'],
  'PDF-HN-0161': ['മഹത്തായവൻ', 'The Magnificent'],
  'PDF-HN-0164': ['നീതിയോടെ പ്രവർത്തിക്കുന്നവൻ', 'The Equitable'],
  'PDF-HN-0165': ['സകല അധികാരത്തിന്റെയും ഉടമ', 'Owner of all sovereignty'],
  'PDF-HN-0166': ['താഴ്ത്തുന്നവൻ', 'The One who brings low'],
  'PDF-HN-0170': ['നിരീക്ഷിക്കുകയും കാത്തുസൂക്ഷിക്കുകയും ചെയ്യുന്നവൻ', 'The Watchful'],
  'PDF-HN-0172': ['പോഷണം നൽകുകയും നിലനിർത്തുകയും ചെയ്യുന്നവൻ', 'The Sustainer'],
  'PDF-HN-0175': ['ആദ്യമായി സൃഷ്ടിക്കുന്നവൻ', 'The Originator'],
  'PDF-HN-0176': ['എല്ലാറ്റിനെയും കീഴടക്കുന്നവൻ', 'The Subduer'],
  'PDF-HN-0179': ['സൂക്ഷ്മമായി അറിയുന്നവൻ; സൗമ്യമായി കരുണ ചെയ്യുന്നവൻ', 'The Subtle, the Gentle'],
  'PDF-HN-0189': ['അത്യുന്നതനും എല്ലാറ്റിനും മീതെയുള്ളവനും', 'The Supremely Exalted'],
  'PDF-HN-0194': ['ഉത്തരവാദിത്വം ഏറ്റെടുക്കുന്നവൻ; ഉറപ്പുനൽകുന്നവൻ', 'The Guarantor'],
  'PDF-HN-0196': ['അതിയായ കരുണയും വാത്സല്യവും ഉള്ളവൻ', 'The Tenderly Merciful'],
  'PDF-HN-0200': ['നൽകുന്നവൻ', 'The Giver'],
  'PDF-HN-0201': ['വീണ്ടും വീണ്ടും പൊറുത്തുതരുന്നവൻ', 'The Oft-Forgiving'],
  'PDF-HN-0209': ['രോഗശാന്തി നൽകുന്നവൻ', 'The Healer'],
  'PDF-HN-0210': ['ഉദാരനും മഹത്വമുള്ളവനും', 'The Generous, the Noble'],
  'PDF-HN-0220': ['ആവശ്യങ്ങൾ നിറവേറ്റി പര്യാപ്തത നൽകുന്നവൻ', 'The Enricher'],
  'PDF-HN-0226': ['ന്യൂനതകളിൽനിന്ന് മുക്തൻ; സമാധാനത്തിന്റെ ഉറവിടം', 'The One free of imperfection, source of peace'],
  'PDF-HN-0228': ['സൃഷ്ടികൾക്ക് രൂപം നൽകുന്നവൻ', 'The Fashioner'],
  'PDF-HN-0229': ['ഉപജീവനം നൽകുന്നവൻ', 'The Provider'],
  'PDF-HN-0232': ['അറിയുന്നവൻ', 'The Knowing'],
};

export function withSectionBMeaning(card) {
  const gloss = glosses[card?.pdf_name_id];
  const english = englishGlosses[card?.pdf_name_id];
  if (!gloss && !english) return card;
  const supplemental = (!card.meaning_malayalam && Boolean(gloss)) || (!card.meaning_english && !card.english_meaning && Boolean(english));
  return {
    ...card,
    meaning_malayalam: card.meaning_malayalam || gloss?.[0],
    meaning_english: card.meaning_english || card.english_meaning || gloss?.[1] || english,
    editorial_meaning: supplemental,
  };
}
