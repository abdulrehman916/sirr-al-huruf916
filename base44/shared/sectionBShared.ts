// ═══════════════════════════════════════════════════════════════
// sectionBShared — shared logic for Section B (HolyOnePDFName)
// enrichment and verification functions.
// ISOLATED — only Section B functions import this.
// ═══════════════════════════════════════════════════════════════

export const ARRAY_FIELDS = [
  "scholarly_entries", "mujarrabat", "amal", "dua", "wazifa",
  "khawass", "wafq", "talisman", "servitor", "benefits",
  "warnings", "conditions", "timings", "repetitions", "methods",
] as const;

export const CAT_TO_FIELD: Record<string, string> = {
  scholarly_entry: "scholarly_entries",
  meaning: "scholarly_entries",
  explanation: "scholarly_entries",
  historical_reference: "scholarly_entries",
  academic_reference: "scholarly_entries",
  manuscript_reference: "scholarly_entries",
  archive_reference: "scholarly_entries",
  mujarrab: "mujarrabat",
  mujarrabat: "mujarrabat",
  amal: "amal",
  dua: "dua",
  wazifa: "wazifa",
  wird: "wazifa",
  hizb: "wazifa",
  khawass: "khawass",
  wafq: "wafq",
  awfaq: "wafq",
  magic_square: "wafq",
  talisman: "talisman",
  khadim: "servitor",
  servitor: "servitor",
  benefits: "benefits",
  warnings: "warnings",
  conditions: "conditions",
  timing: "timings",
  days: "timings",
  times: "timings",
  repetitions: "repetitions",
  recitation_method: "repetitions",
  methods: "methods",
};

export function dedupKey(entry: Record<string, any>): string {
  const text = String(entry.text || entry.arabic_text || "").trim();
  const source = String(entry.source_book || entry.source_reference || entry.reference || "").trim();
  const page = String(entry.page || entry.source_page || "").trim();
  return JSON.stringify({ text, source, page });
}

export function appendUnique(arr: any[] | undefined, entry: Record<string, any>): { added: boolean; newArr: any[] } {
  const newArr = Array.isArray(arr) ? [...arr] : [];
  const key = dedupKey(entry);
  if (newArr.some((e) => dedupKey(e) === key)) return { added: false, newArr };
  newArr.push(entry);
  return { added: true, newArr };
}

export function buildEntry(it: Record<string, any>, now: string): Record<string, any> {
  return {
    text: String(it.text || ""),
    arabic_text: String(it.arabic_text || ""),
    malayalam: String(it.malayalam || ""),
    source_book: String(it.source_book || ""),
    author: String(it.author || ""),
    page: String(it.page || ""),
    url: String(it.url || ""),
    language: String(it.language || ""),
    confidence: String(it.confidence || "MEDIUM"),
    category: String(it.category || ""),
    construction_method: String(it.construction_method || ""),
    conditions: String(it.conditions || ""),
    repetitions: String(it.repetitions || ""),
    timing: String(it.timing || ""),
    purpose: String(it.purpose || ""),
    warnings: String(it.warnings || ""),
    added_at: now,
  };
}

export function checkSections(card: Record<string, any>): {
  missing: string[];
  weak: { key: string; count: number }[];
  weakSources: number;
  duplicates: number;
} {
  const missing: string[] = [];
  const weak: { key: string; count: number }[] = [];
  let weakSources = 0;
  let duplicates = 0;

  for (const field of ARRAY_FIELDS) {
    const arr = Array.isArray(card[field]) ? card[field] : [];
    if (arr.length === 0) {
      missing.push(field);
    } else if (arr.length < 2) {
      weak.push({ key: field, count: arr.length });
    }
    // Count weak sources (no URL)
    for (const entry of arr) {
      if (!entry.url && !entry.source_url && !entry.reference) weakSources++;
    }
    // Count duplicates
    const seen = new Set<string>();
    for (const entry of arr) {
      const key = dedupKey(entry);
      if (seen.has(key)) duplicates++;
      else seen.add(key);
    }
  }

  return { missing, weak, weakSources, duplicates };
}

export const ENTRY_SCHEMA_PROPERTIES = {
  category: { type: "string" },
  arabic_text: { type: "string" },
  text: { type: "string" },
  malayalam: { type: "string" },
  source_book: { type: "string" },
  author: { type: "string" },
  page: { type: "string" },
  url: { type: "string" },
  language: { type: "string" },
  confidence: { type: "string" },
  construction_method: { type: "string" },
  conditions: { type: "string" },
  repetitions: { type: "string" },
  timing: { type: "string" },
  purpose: { type: "string" },
  warnings: { type: "string" },
};