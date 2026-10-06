// ═══════════════════════════════════════════════════════════════
// MANUSCRIPT LIBRARY SYNC — DATABASE ↔ SIRR KNOWLEDGE STRUCTURE
// ═══════════════════════════════════════════════════════════════
// Fetches ManuscriptBook, ManuscriptEntry, and ManuscriptHeading
// records from the database. Merges entries into the existing static
// Sirr knowledge structure. Database entries appear alongside static
// manuscript data, grouped by section → topic → method (by book).
//
// HEADING TREE: ManuscriptHeading records form a dynamic tree (any
// depth) via parent_heading_id. buildHeadingTree() converts the flat
// list into a nested structure for UI navigation.
// ═══════════════════════════════════════════════════════════════
import { base44 } from "@/api/base44Client";

// ── Fetch all ManuscriptBook records ──
export async function fetchManuscriptBooks() {
  try {
    const books = await base44.entities.ManuscriptBook.list("-created_date", 500);
    return books || [];
  } catch {
    return [];
  }
}

// ── Fetch all ManuscriptEntry records ──
export async function fetchManuscriptEntries() {
  try {
    const entries = await base44.entities.ManuscriptEntry.list("-created_date", 500);
    return entries || [];
  } catch {
    return [];
  }
}

// ── Fetch all ManuscriptHeading records ──
export async function fetchManuscriptHeadings() {
  try {
    const headings = await base44.entities.ManuscriptHeading.list("-created_date", 500);
    return headings || [];
  } catch {
    return [];
  }
}

// ── Build a nested heading tree from flat ManuscriptHeading records ──
// Returns: array of top-level heading nodes, each with .children[] (recursive)
export function buildHeadingTree(headings) {
  if (!headings || headings.length === 0) return [];

  const byParent = {};
  const byId = {};

  // Index all headings
  for (const h of headings) {
    byId[h.heading_id] = { ...h, children: [] };
  }

  // Group by parent
  for (const h of headings) {
    const parentId = h.parent_heading_id || "";
    if (!byParent[parentId]) byParent[parentId] = [];
    byParent[parentId].push(byId[h.heading_id]);
  }

  // Attach children to parents
  for (const h of headings) {
    const parentId = h.parent_heading_id || "";
    if (parentId && byId[parentId]) {
      byId[parentId].children = byParent[h.heading_id] || [];
    }
  }

  // Return top-level headings (parent_heading_id empty), sorted by heading_order
  const topLevel = (byParent[""] || []).sort((a, b) => (a.heading_order || 0) - (b.heading_order || 0));

  // Recursively sort children
  function sortChildren(node) {
    if (node.children) {
      node.children.sort((a, b) => (a.heading_order || 0) - (b.heading_order || 0));
      node.children.forEach(sortChildren);
    }
  }
  topLevel.forEach(sortChildren);

  return topLevel;
}

// ── Group entries by heading_id ──
// Returns: { [heading_id]: [entry1, entry2, ...] } sorted by entry_order
export function groupEntriesByHeading(entries) {
  const byHeading = {};
  for (const e of entries) {
    const hid = e.heading_id || "";
    if (!byHeading[hid]) byHeading[hid] = [];
    byHeading[hid].push(e);
  }
  // Sort each group by entry_order
  for (const hid of Object.keys(byHeading)) {
    byHeading[hid].sort((a, b) => (a.entry_order || 0) - (b.entry_order || 0));
  }
  return byHeading;
}

// ── Merge database entries into the static Sirr knowledge structure ──
export function mergeEntriesIntoStructure(structure, entries) {
  if (!entries || entries.length === 0) return structure;

  // Deep copy the structure
  const merged = JSON.parse(JSON.stringify(structure));

  // For each database entry, add it to the appropriate section/topic
  entries.forEach((entry) => {
    const section = merged.sections.find((s) => s.id === entry.sirr_section);
    if (!section) return;

    // Find or create the topic
    const topicKey = entry.topic || "General";
    let topic = section.topics.find((t) => t.topic_key === topicKey);
    if (!topic) {
      topic = {
        id: `sirr${section.id}_db_${topicKey.replace(/\s+/g, "_").toLowerCase()}`,
        topic_key: topicKey,
        topic_en: entry.topic || entry.purpose || "Unknown",
        topic_ml: entry.topic_ml || entry.topic || "",
        topic_ar: entry.topic_ar || "",
        methods: [],
      };
      section.topics.push(topic);
    }

    // Add the method (from database)
    topic.methods.push({
      id: entry.entry_id,
      type: entry.entry_type,
      book_name: entry.book_title,
      book_name_ar: entry.book_title_ar || "",
      page_number: entry.page_number,
      purpose: entry.purpose || "",
      purpose_ml: entry.purpose_ml || entry.malayalam_meaning || "",
      purpose_en: entry.english_meaning || entry.purpose || "",
      arabic_text: entry.arabic_text || "",
      introduction: entry.introduction || "",
      conditions: entry.conditions || "",
      materials: entry.materials || "",
      preparation: entry.preparation || "",
      procedure: entry.procedure || "",
      timing: entry.timing || "",
      planet: entry.planet || "",
      day: entry.day || "",
      incense: entry.incense || "",
      repetition: entry.repetition || "",
      warnings: entry.warnings || "",
      benefits: entry.benefits || "",
      notes: entry.notes || "",
      malayalam_meaning: entry.malayalam_meaning || "",
      english_meaning: entry.english_meaning || "",
      content_translations_ml: entry.content_translations_ml || {},
      images: entry.images || [],
      verified_arabic_hash: entry.verified_arabic_hash || "",
      heading_id: entry.heading_id || "",
      entry_order: entry.entry_order || 0,
      source: "database",
    });

    // Update section counts
    section.topic_count = section.topics.length;
    section.method_count = section.topics.reduce((s, t) => s + t.methods.length, 0);
  });

  // Re-sort topics in each section
  merged.sections.forEach((s) => {
    s.topics.sort((a, b) => a.topic_en.localeCompare(b.topic_en));
  });

  return merged;
}