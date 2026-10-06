# Sirr al-Huruf — Full Architecture & Logic Audit
Date: 2026-07-02 · Scope: Mizaan-9 Methods 1–4 (`src/pages/Mizaan9Page.jsx` + all `src/components/mizaan/*`)
**No code was changed as part of this audit. Inspection only.**

---

## METHOD 1

| # | Check | Result |
|---|-------|--------|
| 1 | Section 1 uses only Section 1 rules | ✅ Verified — `getBastLevelFn = activeSection===2 ? getBastLevelB : getBastLevel` correctly branches the Bast table only; Nine Mizan (Mizaan1–9) intentionally always uses the Section‑1 dataset (`getDataSet(1)`), which is a documented, deliberate design decision, not a defect. |
| 2 | Section 2 uses only Section 2 rules | ✅ Verified — same branch as above routes Section 2's post‑pipeline (Kitabet/A'van/Kasem) through `getBastLevelB`. |
| 3 | No Method 2/3/4 logic present | ✅ Verified — the Method‑1 block only imports `MizaanPipelineFull`, `EsmaAvanSection`, `EsmaKasemSection`, `FinalVefkSummary`, `MizaanConclusionAccordion`. No Method 2/3/4 components are referenced. |
| 4 | Esma‑i Kitabet rules | ✅ Verified — `generateEsmaLevel()` in `mizaanPostEngine.js`: FERD→5/ZEVC→4 grouping, Galib Anasir 1st‑Bast istintak supplement appended at the end. Matches manuscript rule. |
| 5 | Esma‑i A'van rules | ✅ Verified against `EsmaAvanSection.jsx` (self‑recycle completion, not Galib Anasir) — consistent with prior lock. |
| 6 | Esma‑i Kasem rules | ✅ Verified — Method 1 renders the **full** Kasem pipeline (`EsmaKasemSection` with `section1.allExpandedLetters`) but the conclusion accordion (`MizaanConclusionAccordion`) intentionally omits the Kasem Dua — matches the documented Method‑1/Method‑2 split ("Method 1 includes all calculations but omits the final Kasem conclusion"). |
| 7 | Galib Anasir completion rule | ✅ Verified — `GALIB_ANASIR_VALUES` + `istintak()` sliced to the needed remainder, appended at the end (Kitabet only). |
| 8 | Remaining‑letter rule | ✅ Verified — Kitabet completes from Galib Anasir; A'van self‑recycles from its own sequence (per `EsmaAvanSection`). |
| 9 | Istintak pipeline | ✅ Verified — `istintak()` digit‑cycle (Units→Tens→Hundreds→Thousands) matches the locked manuscript algorithm; single source of truth in `mizaanPostEngine.js`. |
| 10 | Bast selection (FERD→B5/ZEVC→B4) | ✅ Verified — `bastLevel = initialSeedLetters.length % 2 !== 0 ? 5 : 4` in `runMizaanPostPipeline`. |
| 11 | Wafq generation | ✅ Verified — `buildVefk()` is the single shared Rubai engine; self‑test (`_runVefkSelfTest`) runs at module load and throws if any invariant breaks. Vefk source = sum of **Bast‑1** of all expanded letters (`expandedLettersTotal`), matching the documented Mizan Option‑1 rule. |
| 12 | Expandable UI | ✅ Verified — "Expanded Letter Values" and "Source" collapsibles present in `MizaanPipelineFull.jsx`, `EsmaAvanSection.jsx`, `EsmaKasemSection.jsx`. |
| 13 | Final reading instructions | ✅ Verified — `MizaanConclusionAccordion` (Method‑1‑only, no Kasem Dua) is the only conclusion component rendered in the Method‑1 block. |

**Method 1 — Verified. No issues found.**

---

## METHOD 2

| # | Check | Result |
|---|-------|--------|
| 1 | Section 1/2 use only Method‑2 Section rules | ✅ Verified — same `getBastLevelFn` branch as Method 1 (shared, correct, no cross‑method leakage). |
| 2 | No Method 1/3/4 logic | ✅ Verified — Method‑2 block imports `MizaanPipelineFull`, `EsmaAvanSection`, `EsmaKasemSection`, `KasamSection`, `MizaanConclusionAccordionMethod2` only. |
| 3 | Pipelines match the book | ⚠️ **Minor — duplicate calculation risk.** Method 2 renders `EsmaAvanSection` with `allExpandedLetters={section1.allExpandedLetters}` (this is what the user sees). Separately, to build the Kasem step's input, Mizaan9Page **independently re‑derives** the A'van pipeline a second time (`s2GrandBast`/`s2GrandLetters` → `runMizaanPostPipeline` again) instead of reusing the actual A'van output that `EsmaAvanSection` already computed and displayed. |
| | **Why it's a problem** | Two separate code paths compute "the A'van expanded letters" using the same formula but independently. They currently agree because both use the same `bastTotal + letterCount → istintak` formula, but this is fragile: any future formula change made in only one of the two places will silently desync the Kasem step's input from what Section 2 (A'van) actually displays to the user. |
| | **Correct behaviour** | The Kasem step's input should be sourced directly from `EsmaAvanSection`'s own computed output (e.g. via its `onVefkReady`/callback, extended to also report its `allExpandedLetters`), not recomputed from scratch on the page. |
| | **Suggested fix** | Extend `EsmaAvanSection`'s existing callback payload to include `allExpandedLetters`, and have `Mizaan9Page.jsx` pass that value straight into `EsmaKasemSection` instead of calling `runMizaanPostPipeline` a second time. |
| 4 | Completion rules match the book | ✅ Verified. |
| 5 | Wafqs correct | ✅ Verified — same `buildVefk` engine, same source rule (Bast‑1 sum of expanded letters) for Kitabet/A'van; Kasem uses `EsmaKasemSection`'s parity‑based Bast level (4/5) on the **expanded** letters, matching the locked rule. |
| 6 | UI matches Method 2 | ✅ Verified — `KasamSection` ("Common Kasem") and `MizaanConclusionAccordionMethod2` are Method‑2‑exclusive and correctly gated. |

**Method 2 — 1 minor issue (duplicate A'van derivation, see above). No calculation drift currently observed.**

---

## METHOD 3

| # | Check | Result |
|---|-------|--------|
| 1 | Section 1 uses only Method‑3 Section 1 rules | ✅ Verified — Kitabet stage is explicitly documented and coded as identical to Methods 1/2 (`MizaanPipelineFull`), by design. |
| 2 | Section 2 uses only Method‑3 Section 2 rules | ✅ Verified — `Method3AvanSection.jsx` overrides only the **starting value** (`lastNameBast + galibAnasirBast + nineMizanTotal`, using the **original**, pre‑supplement Kitabet name) and forwards it into the unmodified, shared `EsmaAvanSection` engine via `sourceOverride`. Clean isolation — no duplicated pipeline logic. |
| 3 | No Method 1/2/4 logic exists | ✅ Verified — Method‑3 block imports only `Method3AvanSection`, `Method3FinalTotalSection`, `Method3AbjadVerificationSection`, `Method3DivineNamesMatchSection`, `Method3ConclusionAccordion`, plus the shared `MizaanPipelineFull`/`EsmaKasemSection`. |
| 4 | All calculations follow Method 3 only | ✅ Verified — Kasem input override (`kasemInputTotal = lastAvanNameBast + galibAnasirBast + avanInputTotal`) again uses the **original** (pre‑supplement) A'van name, matching the documented Method‑3 rule, and is passed via `sourceOverride`/`sourceBreakdown` into the same shared `EsmaKasemSection`. |
| 5 | Wafqs correct | ✅ Verified — same shared `buildVefk`/`EsmaKasemSection` Vefk logic as Methods 1/2; the `Method3KasemSourceDerivation` display branch inside `EsmaKasemSection.jsx` is used automatically whenever `sourceBreakdown` is present. |
| 6 | UI correct | ✅ Verified — `Method3FinalTotalSection`, `Method3AbjadVerificationSection`, `Method3DivineNamesMatchSection` are Method‑3‑exclusive and appear only inside the Method‑3 block. |

**Method 3 — Verified. No issues found.**

---

## METHOD 4

| # | Check | Result |
|---|-------|--------|
| 1 | Nine Mizan shared correctly | ✅ Verified — Method 4 reuses the identical `Mizaan1…Mizaan9Final`/`MizaanFinalSummary` components and the same `computeGrandTotals()` helper as Methods 1–3. No separate Nine Mizan engine exists for Method 4. |
| 2 | No duplicate Nine Mizan calculations | ✅ Verified — `nineMizanTotal = grandBast + grandLetters` computed once per render, passed down as a prop. |
| 3 | Method 4 uses only Method 4 rules | ✅ Verified — `Method4Step1Section.jsx` does not import any Method 1/2/3 component. |
| 4 | Esma‑i Kitabet logic | ✅ Verified — FERD→5/ZEVC→4 grouping + Galib‑Anasir‑istintak completion, same rule as the shared engine, reproduced correctly (see architectural note below). |
| 5 | Esma‑i A'van logic | ✅ Verified — self‑recycle‑from‑front completion, matching the shared `EsmaAvanSection` rule. |
| 6 | Esma‑i Kasem logic (names) | ✅ Verified — self‑recycle‑from‑front completion for naming, matching `EsmaKasemSection`'s rule. |
| 7 | **Esma‑i Kasem Wafq source** | ❌ **Issue found — see below.** |
| 8 | Alternative Method (Book Method) follows manuscript | ✅ Verified — reuses the existing Next Number/letters (no recompute), builds the A'van name with Galib‑Anasir completion. |
| 9 | Ayil subtraction | ✅ Verified — `reducedNumber1 = nextNumber - 51` (Ayil = 51), applied once, correctly. |
| 10 | Yuş(in) subtraction | ✅ Verified — `reducedNumber2 = reducedNumber1 - 316` (Yuşin = 316), applied after Ayil, correct order. |
| 11 | Invocation order | ✅ Verified — `يا + [A'van name] + آييل` then `بحق + [Kasem name] + يوش`, matching the corrected manuscript phrasing already locked in prior work. |
| 12 | Wafqs (Kitabet/A'van) | ✅ Verified — both use `buildVefk` with source = Bast‑1 sum of their respective expanded‑letter sets, matching the shared‑engine rule. |
| 13 | UI sections | ✅ Verified — Final Vefk Summary (3 collapsible Wafq cards) and Conclusion accordion now match the Methods 1–3 presentation pattern. |

### ❌ Issue: Esma‑i Kasem Wafq source does not match the locked shared‑engine rule

1. **Location:** Method 4 → `src/components/mizaan/Method4Step1Section.jsx` (`kasemVefkSource` / `kasemVefk` computation, ~line 220).
2. **Problem:** The Kasem Wafq's source number is computed as
   `kasemLetters.reduce((s,l) => s + getBastLevelFn(l, kasemIsFerd ? 5 : 4), 0)`
   — i.e. it sums the chosen Bast level directly over `kasemLetters` (= `nextLetters3`, the **raw Istintak/name letters**, before any Bast‑expansion of this stage).
3. **Why it is wrong:** In the shared engine (`EsmaKasemSection.jsx`, used by Methods 1–3), the locked rule ("KASEM VEFK BAST LOGIC FIX") is: the Vefk source = sum of the chosen Bast level over **`allExpandedLetters`** (the fully Bast‑derived expanded set from Step 3 of that section), with the Bast level (4 or 5) chosen by the parity of that same expanded‑letter count. Method 4's Kasem Wafq instead sums over the **un‑expanded** name letters, skipping the expansion step entirely for the Wafq‑source calculation. This is a genuine rule mismatch between Method 4 and the otherwise‑identical rule used everywhere else, and it stems directly from Method 4 having its own hand‑duplicated pipeline instead of reusing `EsmaKasemSection`'s engine (see Global Audit, "Duplicate Method‑4 pipeline logic").
4. **Correct behaviour:** The Kasem Wafq source in Method 4 should sum the chosen Bast level (4 or 5, by parity of `allExpandedLetters3.length`) over `allExpandedLetters3` (the Bast‑expanded letters actually produced in Step 16–18 of the Method‑4 pipeline), exactly mirroring `EsmaKasemSection.jsx`'s rule.
5. **Suggested fix:** In `Method4Step1Section.jsx`, change the `kasemVefkBastLevel`/`kasemVefkSource`/`kasemVefk` calculation to use `allExpandedLetters3` (with Bast level chosen from its own parity) instead of `kasemLetters`. **Not applied automatically per this audit's "no fixes" instruction — flagged only.**

**Method 4 — 1 issue found (Kasem Wafq source rule mismatch, detailed above). All other checks verified.**

---

## GLOBAL AUDIT

| Check | Result |
|---|---|
| Rule mixing between methods | ✅ None found — each Method's block only imports its own components; the one shared engine (`mizaanPostEngine.js`) is used identically by Methods 1–3. Method 4 does **not** reuse this shared engine (see below) but does not mix in another Method's rules either. |
| Rule mixing between sections | ✅ None found — Section 1/Section 2 branching is confined to a single `getBastLevelFn` selection, applied consistently. |
| Wrong Bast usage | ❌ 1 instance — Method 4 Kasem Wafq source (see Method 4 section above). |
| Wrong Istintak source | ✅ None found — `istintak()` is called on the correct running totals at every stage inspected. |
| Wrong remaining‑letter logic | ✅ None found. |
| Wrong Galib Anasir usage | ✅ None found. |
| Wrong Esma‑i Kitabet completion | ✅ None found. |
| Wrong Esma‑i A'van completion | ✅ None found. |
| Wrong Esma‑i Kasem completion (naming) | ✅ None found (naming completion is correct; only the **Wafq source number** for Kasem is wrong in Method 4, not the name grouping itself). |
| Wrong Wafq source | ❌ Method 4 Kasem Wafq (see above). |
| Wrong UI labels | ✅ None found in the reviewed components. |
| Duplicate calculations | ⚠️ 2 instances: <br>1. Method 2's Kasem input is derived twice (once inside `EsmaAvanSection`, once again manually in `Mizaan9Page.jsx`) — see Method 2 section. <br>2. **Method 4 reimplements the entire Bast‑expansion/grouping pipeline three separate times inline inside `Method4Step1Section.jsx`** (the three "pipeline passes" — Kitabet, A'van, Kasem — each ~15 lines of copy‑pasted derivation logic) instead of calling the shared `expandAllSeedLetters`/`generateEsmaLevel` functions already in `mizaanPostEngine.js`. This is the root cause of the Kasem Wafq‑source mismatch above, and is a standing risk: any future correction to the shared engine's rules will not automatically propagate to Method 4. **Suggested fix:** refactor Method 4's three pipeline passes to call `expandAllSeedLetters()` / `generateEsmaLevel()` from `mizaanPostEngine.js` instead of re‑deriving the same logic inline. |
| Dead code | ✅ None found in the components reviewed (all components imported are referenced and rendered). |
| Unused components | ✅ None found — every `Method3*`/`Method4*` component is imported and rendered exactly once in its owning Method block. |
| Broken navigation | ℹ️ Informational, not a bug: there is no literal "Next/Previous" page‑stepper anywhere in Methods 1–4 — navigation is a flat Method‑switch (1–5) + Section‑switch (1/2) button row, and the only "Next" control anywhere is the per‑Wafq "Writing Assistant" cell‑reveal stepper (present identically in `FinalVefkSummary.jsx` and now `Method4FinalVefkSummary.jsx`). This matches the app's actual, intentional design — flagged here only so it isn't mistaken for a missing feature. |
| State management problems | ⚠️ Minor — `s1VefkData/s2VefkData/s3VefkData` (used by Methods 1–3's `FinalVefkSummary`) are reset by a `useEffect` keyed on `[activeMethod, activeSection]`, which runs **after** the switch‑triggering render. On a fast Method/Section switch this can theoretically flash the *previous* Method's Wafq data for one render before the reset effect fires. Low practical impact (effect runs before the user perceives anything in normal use), but worth noting as a possible future bug source if more Wafq state is added to this shared trio. **Suggested fix (not applied):** reset the three state values synchronously inside the method/section switch button handlers, not only in a `useEffect`. |
| Performance issues | ✅ None found — all per‑Method pipelines are wrapped in `useMemo` keyed on their actual inputs; letter arrays involved are small (≈tens of items), so the triple‑pipeline duplication in Method 4 has no measurable runtime cost, only a maintainability cost. |
| Possible future bugs | See "Duplicate calculations" and "State management problems" above — both are the most likely sources of future drift. |

---

## Summary of Actionable Issues (nothing auto‑fixed)

| # | Severity | Location | Issue |
|---|----------|----------|-------|
| 1 | **High** | Method 4 → `Method4Step1Section.jsx` | Esma‑i Kasem Wafq source sums Bast(4/5) over the raw Kasem name letters instead of over the Bast‑expanded letter set, unlike the identical rule already locked in `EsmaKasemSection.jsx` for Methods 1–3. |
| 2 | Medium | Method 4 → `Method4Step1Section.jsx` | The entire Bast‑expansion/grouping pipeline is hand‑duplicated three times instead of calling the shared `mizaanPostEngine.js` functions — root cause of issue #1 and a standing drift risk. |
| 3 | Low | Method 2 → `Mizaan9Page.jsx` | A'van pipeline is computed twice (once by `EsmaAvanSection`, once again manually) to feed the Kasem step — currently consistent, but fragile. |
| 4 | Low | Global → `Mizaan9Page.jsx` | `s1VefkData/s2VefkData/s3VefkData` reset via `useEffect` could theoretically flash stale data for one render on rapid Method/Section switching. |

No other issues were found. All sections not listed above are explicitly **Verified — No issues found.**