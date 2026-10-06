# ASTRO CLOCK MASTER KNOWLEDGE BASE FRAMEWORK

**Status:** Active  
**Principle:** Cumulative growth — additive only, never destructive  
**Last Updated:** 2026-06-14

---

## 📚 KNOWLEDGE INGESTION PROTOCOL

### For Every New PDF:

1. **Read completely** — No page skipped
2. **Extract all timing rules** — Categorize by section
3. **Preserve source metadata:**
   - Book Name
   - Author (if available)
   - Page Number
   - Chapter Name
   - Rule Category
   - Original Text (verbatim)
   - Translation (if applicable)
   - Notes

4. **Store in knowledge base** — Add to appropriate section
5. **Handle conflicts:**
   - If Rule A from Book 1 conflicts with Rule B from Book 2
   - **Preserve both** with source references
   - **Never choose** automatically
   - User decides which to follow

---

## 📑 KNOWLEDGE SECTIONS (14 Total)

| Section | Content | Current Rules |
|---------|---------|---------------|
| 1. DAYS | Planetary day rulers, suitable operations | 7 |
| 2. HOURS | Planetary hour tables, calculation methods | 5+ |
| 3. LUNAR MANSIONS | 28 Manazil with effects | 28 |
| 4. TIMING RULES | Moon phases, hour nature, general principles | 2+ |
| 5. PLANETS | Planetary properties, letter correspondences | 7+ |
| 6. ZODIAC | Signs, elements, letter distributions | 12+ |
| 7. SAAD/NAHS | Lucky/unlucky classifications | Multiple |
| 8. SPIRITUAL WORKS | Spiritual operation timings | Growing |
| 9. WEALTH WORKS | Wealth-related timings | Growing |
| 10. LOVE WORKS | Love-related timings | Growing |
| 11. PROTECTION WORKS | Protection timings | Growing |
| 12. TRAVEL WORKS | Travel timings | Growing |
| 13. ELEMENT RULES | Fire/Earth/Air/Water rules | Multiple |
| 14. LETTER RULES | Letter classifications, transformations | Multiple |

---

## 🗂️ SOURCE TRACKING FORMAT

```javascript
{
  id: "unique_id",
  category: "SECTION_NAME",
  subcategory: "SPECIFIC_TOPIC",
  source: {
    book: "Book Title",
    page: 123,
    chapter: "Chapter Name"
  },
  rule_text: "Rule in original language",
  original_text: "Verbatim quote if different",
  data: { /* structured data */ },
  notes: "Additional context"
}
```

---

## ⚖️ CONFLICT RESOLUTION

**Example:** If Book 1 says "Şarteyn is Nahs" and Book 2 says "Şarteyn is Saad":

```javascript
// Store BOTH:
{
  id: "moon_001_book1",
  source: { book: "Havâss'ın Derinlikleri I", page: 66 },
  classification: "Uğursuz (Nahs)"
},
{
  id: "moon_001_book2", 
  source: { book: "Other Book", page: 45 },
  classification: "Mutlu (Saad)"
}
```

**Result:** Both versions preserved. User sees both sources and decides.

---

## 📈 KNOWLEDGE GROWTH

| PDF | Status | Rules Added |
|-----|--------|-------------|
| PDF #1 (Havâss I, p.1-50) | ✅ Ingested | 150+ |
| PDF #2 (Havâss II, p.51-100) | ✅ Ingested | 200+ |
| PDF #3 (Future) | ⏳ Awaiting | TBD |
| PDF #4+ (Future) | ⏳ Awaiting | TBD |

**Total Rules:** 350+  
**Total Sources:** 2 books  
**Total Sections:** 14 active

---

## 🔍 SEARCH CAPABILITIES

Knowledge base supports search by:
- Category (DAYS, HOURS, LUNAR_MANSIONS, etc.)
- Subcategory (PLANETARY_RULERS, SAAD/NAHS, etc.)
- Source book
- Page number
- Rule ID
- Keywords in rule_text

---

## 📝 NEXT STEPS

**Ready for:** Next PDF upload  
**Action:** Upon upload, extract all timing rules → categorize → store with source metadata → update this document

**Astro Clock grows with every manuscript.**