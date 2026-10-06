/**
 * ManuscriptEsmaSection — FULL MANUSCRIPT AUDIT MODE
 * Shows EVERY step exactly as the book performs it for line-by-line validation.
 * NO hidden calculations, NO skipped stages, NO summaries.
 */
import { useMemo } from "react";
import { buildVefk, ELEMENT_BAST_TOTALS, istintak, getBastLevel } from "../../lib/mizaanPostEngine";
import IstintakSteps from "./IstintakSteps";

const AR = {
  fontFamily: "'Noto Naskh Arabic','Amiri','Scheherazade New',serif",
};

const G = {
  text:   "#F5D060",
  dim:    "rgba(212,175,55,0.55)",
  border: "rgba(212,175,55,0.30)",
  bg:     "rgba(212,175,55,0.06)",
  green:  "#4ADE80",
  purple: "#C4B5FD",
  cyan:   "#B2EBF2",
};

// Letter chip component
function LetterChip({ letter, color, size = "1.3rem" }) {
  return (
    <span 
      dir="rtl" 
      lang="ar"
      style={{ 
        fontFamily: "'Noto Naskh Arabic','Amiri','Scheherazade New',serif",
        fontSize: size, 
        color: color, 
        fontWeight: "500",
        padding: "2px 6px",
        borderRadius: "4px",
        background: `${color}10`,
        border: `1px solid ${color}20`,
        display: "inline-block",
        margin: "2px"
      }}
    >
      {letter}
    </span>
  );
}

// Step row component
function StepRow({ step, children, color }) {
  return (
    <div style={{ 
      marginBottom: "12px", 
      padding: "10px", 
      border: `1px solid ${color}30`, 
      borderRadius: "6px",
      background: `${color}05`
    }}>
      <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.40)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "1px" }}>
        {step}
      </div>
      {children}
    </div>
  );
}

export default function ManuscriptEsmaSection({
  tier,
  data,
  element,
  satirTotal,
  color,
  prefix,
}) {
  const TIER_LABELS = {
    kitabet: { ar: 'أسماء الكتابة', en: 'ESMA-I KITABET' },
    avan:    { ar: 'أسماء الأعوان', en: 'ESMA-I A\'VAN' },
    kasem:   { ar: 'أسماء القسم', en: 'ESMA-I KASEM' },
  };
  const meta = TIER_LABELS[tier];

  const vefk = useMemo(() => buildVefk(satirTotal, element), [satirTotal, element]);
  const guardianName = useMemo(() => 
    istintak(ELEMENT_BAST_TOTALS[element] || 3550).join(''), 
    [element]
  );

  return (
    <div style={{ fontFamily: AR.fontFamily, direction: "rtl", textAlign: "right", marginBottom: "32px" }}>
      
      {/* Section title */}
      <h3 style={{ fontSize: "1.5rem", color, marginBottom: "20px", fontWeight: "bold", borderBottom: `2px solid ${color}40`, paddingBottom: "10px" }}>
        {meta.ar} <span style={{ fontSize: "0.9rem", color: G.dim, fontWeight: "400" }}>({meta.en})</span>
      </h3>

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 1: INPUT LETTERS FROM PREVIOUS STAGE
          ═══════════════════════════════════════════════════════════════ */}
      <StepRow step="المرحلة ١: حروف المدخلة من المرحلة السابقة (Stage 1: Input Letters from Previous Stage)" color={color}>
        <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "2px", direction: "ltr" }}>
          {[...data.inputLetters].reverse().map((l, i) => (
            <LetterChip key={i} letter={l} color={color} size="1.2rem" />
          ))}
        </div>
        <div style={{ fontSize: "0.75rem", color: G.dim, marginTop: "8px" }}>
          Input letter count: {data.inputLetters.length}
        </div>
      </StepRow>

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 2: SATIR VAHID SUM (First Bast + Letter Count)
          ═══════════════════════════════════════════════════════════════ */}
      <StepRow step="المرحلة ٢: حساب سطر واحد (Stage 2: Satır Vahid Calculation)" color={color}>
        <div style={{ display: "grid", gap: "6px" }}>
          <div style={{ fontSize: "0.8rem", color: G.text }}>
            First Bast Sum: <span style={{ fontWeight: "bold" }}>{data.bastSum.toLocaleString()}</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: G.text }}>
            Letter Count: <span style={{ fontWeight: "bold" }}>{data.letterCount}</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: G.green, fontWeight: "bold", borderTop: `1px solid ${color}30`, paddingTop: "6px" }}>
            Satır Vahid Total: {data.bastSum.toLocaleString()} + {data.letterCount} = <span style={{ fontSize: "1.1rem" }}>{data.satirTotal.toLocaleString()}</span>
          </div>
        </div>
      </StepRow>

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 3: ISTINTAK OF SATIR VAHID TOTAL
          ═══════════════════════════════════════════════════════════════ */}
      <StepRow step="المرحلة ٣: استنطاق مجموع سطر واحد (Stage 3: Istintak of Satır Vahid)" color={color}>
        <IstintakSteps n={data.satirTotal} msMarker={true} compact={false} />
        <div style={{ fontSize: "0.75rem", color: G.dim, marginTop: "8px" }}>
          Seed letter count: {data.seedLetters.length}
        </div>
      </StepRow>

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 4: ZEVC/FERD DETERMINATION
          ═══════════════════════════════════════════════════════════════ */}
      <StepRow step="المرحلة ٤: تحديد زوج أو فرد (Stage 4: Zevc/Ferd Determination)" color={color}>
        <div style={{ fontSize: "0.8rem", color: G.text }}>
          Seed count: {data.seedCount}
        </div>
        <div style={{ 
          fontSize: "0.9rem", 
          fontWeight: "bold", 
          color: data.isZevc ? G.green : "#F87171",
          marginTop: "6px",
          padding: "6px 10px",
          borderRadius: "4px",
          background: data.isZevc ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)"
        }}>
          {data.isZevc ? '✓ ZEVC (زوج) - Even' : '✓ FERD (فرد) - Odd'}
        </div>
        <div style={{ fontSize: "0.75rem", color: G.dim, marginTop: "8px" }}>
          Manuscript rule: Zevc → 4th Bast, Ferd → 5th Bast
        </div>
      </StepRow>

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 5: BAST LEVEL SELECTION
          ═══════════════════════════════════════════════════════════════ */}
      <StepRow step="المرحلة ٥: اختيار مستوى البسط (Stage 5: Bast Level Selection)" color={color}>
        <div style={{ fontSize: "0.8rem", color: G.text }}>
          {tier === 'kasem' ? (
            <>Kasem rule: Always 5th Bast</>
          ) : (
            <>{data.isZevc ? 'Zevc rule: 4th Bast' : 'Ferd rule: 5th Bast'}</>
          )}
        </div>
        <div style={{ 
          fontSize: "1rem", 
          fontWeight: "bold", 
          color: G.green,
          marginTop: "6px",
          padding: "6px 10px",
          borderRadius: "4px",
          background: `${G.green}15`,
          display: "inline-block"
        }}>
          Bast Level: {data.bastLevelUsed}{data.bastLevelUsed === 4 ? ' (رابع)' : data.bastLevelUsed === 5 ? ' (خامس)' : ''}
        </div>
      </StepRow>

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 6: APPLY BAST TO EACH SEED LETTER + ISTINTAK
          ═══════════════════════════════════════════════════════════════ */}
      <StepRow step="المرحلة ٦: تطبيق البسط على كل حرف واستنطاق (Stage 6: Apply Bast + Istintak to Each Seed)" color={color}>
        <div style={{ display: "grid", gap: "10px" }}>
          {data.seedBastValues.map((seed, idx) => (
            <div key={idx} style={{ 
              padding: "8px", 
              border: `1px solid ${color}30`, 
              borderRadius: "6px",
              background: `${color}05`
            }}>
              <div style={{ fontSize: "0.75rem", color: G.dim, marginBottom: "4px" }}>
                Seed {idx + 1}: {seed.letter}
              </div>
              <div style={{ fontSize: "0.8rem", color: G.text }}>
                Bast {data.bastLevelUsed}({seed.letter}) = <span style={{ fontWeight: "bold", color: G.text }}>{seed.bastValue.toLocaleString()}</span>
              </div>
              <div style={{ fontSize: "0.7rem", color: G.dim, marginTop: "4px", marginBottom: "4px" }}>
                Istintak({seed.bastValue.toLocaleString()}):
              </div>
              <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "2px", direction: "ltr" }}>
                {[...seed.expansionLetters].reverse().map((l, i) => (
                  <LetterChip key={i} letter={l} color={G.purple} size="1.1rem" />
                ))}
              </div>
              <div style={{ fontSize: "0.7rem", color: G.dim, marginTop: "4px" }}>
                Expansion count: {seed.expansionLetters.length}
              </div>
            </div>
          ))}
        </div>
      </StepRow>

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 7: CONCATENATE ALL EXPANSION LETTERS → SATR-I VAHID
          ═══════════════════════════════════════════════════════════════ */}
      <StepRow step="المرحلة ٧: دمج كل الحروف في سطر واحد (Stage 7: Concatenate → Satr-ı Vahid)" color={color}>
        <div style={{ fontSize: "0.75rem", color: G.dim, marginBottom: "8px" }}>
          Complete Satr-ı Vahid letter sequence ({data.expandedCount} حرف):
        </div>
        <div style={{ 
          padding: "12px", 
          border: `2px solid ${color}40`, 
          borderRadius: "8px",
          background: `${color}08`,
          marginBottom: "8px"
        }}>
          <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "3px", direction: "ltr" }}>
            {[...data.expandedLetters].reverse().map((l, i) => (
              <LetterChip key={i} letter={l} color={color} size="1.3rem" />
            ))}
          </div>
        </div>
        <div style={{ fontSize: "0.8rem", color: G.text }}>
          Total expanded letters: {data.expandedCount}
        </div>
      </StepRow>

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 8: ZEVC/FERD OF EXPANDED COUNT → GROUP SIZE
          ═══════════════════════════════════════════════════════════════ */}
      <StepRow step="المرحلة ٨: تحديد حجم المجموعة (Stage 8: Group Size Determination)" color={color}>
        <div style={{ fontSize: "0.8rem", color: G.text }}>
          Expanded count: {data.expandedCount}
        </div>
        <div style={{ 
          fontSize: "0.9rem", 
          fontWeight: "bold", 
          color: data.isExpandedZevc ? G.green : "#F87171",
          marginTop: "6px",
          padding: "6px 10px",
          borderRadius: "4px",
          background: data.isExpandedZevc ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)"
        }}>
          {data.isExpandedZevc ? '✓ ZEVC (زوج) - Even → Group size: 4' : '✓ FERD (فرد) - Odd → Group size: 5'}
        </div>
      </StepRow>

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 9: GROUP INTO NAMES
          ═══════════════════════════════════════════════════════════════ */}
      <StepRow step="المرحلة ٩: تجميع في أسماء (Stage 9: Group into Names)" color={color}>
        <div style={{ fontSize: "0.75rem", color: G.dim, marginBottom: "8px" }}>
          Grouping {data.expandedCount} letters into groups of {data.groupSize}:
        </div>
        <div style={{ display: "grid", gap: "8px" }}>
          {data.names.map((name, i) => {
            const startIdx = i * data.groupSize;
            const endIdx = Math.min(startIdx + data.groupSize, data.expandedCount);
            const groupLetters = data.expandedLetters.slice(startIdx, endIdx);
            return (
              <div key={i} style={{ 
                padding: "10px", 
                border: `1px solid ${color}40`, 
                borderRadius: "6px",
                background: `${color}08`
              }}>
                <div style={{ fontSize: "0.7rem", color: G.dim, marginBottom: "4px" }}>
                  Name {i + 1} (letters {startIdx + 1}-{endIdx}):
                </div>
                <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "2px", direction: "ltr", marginBottom: "6px" }}>
                  {[...groupLetters].reverse().map((l, idx) => (
                    <LetterChip key={idx} letter={l} color={G.cyan} size="1.1rem" />
                  ))}
                </div>
                <div style={{ fontSize: "1.4rem", color, fontWeight: "bold", borderTop: `1px solid ${color}30`, paddingTop: "6px" }}>
                  {prefix && <span style={{ opacity: 0.6, fontSize: "1.1rem" }}>{prefix} </span>}{name}
                </div>
              </div>
            );
          })}
        </div>
        {data.remainder && data.remainder.length > 0 && (
          <div style={{ 
            marginTop: "10px", 
            padding: "8px", 
            border: `1px dashed ${color}40`, 
            borderRadius: "6px",
            background: `${color}05`
          }}>
            <div style={{ fontSize: "0.75rem", color: G.dim, marginBottom: "4px" }}>
              Remainder letters ({data.remainder.length}):
            </div>
            <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "2px", direction: "ltr" }}>
              {[...data.remainder].reverse().map((l, i) => (
                <LetterChip key={i} letter={l} color={G.dim} size="1.1rem" />
              ))}
            </div>
            {data.supplementLetters && data.supplementLetters.length > 0 && (
              <>
                <div style={{ fontSize: "0.75rem", color: G.dim, marginTop: "8px", marginBottom: "4px" }}>
                  Supplement from {element} element:
                </div>
                <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "2px", direction: "ltr" }}>
                  {[...data.supplementLetters].reverse().map((l, i) => (
                    <LetterChip key={i} letter={l} color={G.green} size="1.1rem" />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </StepRow>

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 10: FINAL NAMES
          ═══════════════════════════════════════════════════════════════ */}
      <StepRow step="المرحلة ١٠: الأسماء النهائية (Stage 10: Final Names)" color={color}>
        <div style={{ display: "grid", gap: "6px" }}>
          {data.names.map((name, i) => (
            <div key={i} style={{ 
              fontSize: "1.6rem", 
              color, 
              fontWeight: "bold",
              padding: "10px",
              border: `1px solid ${color}40`,
              borderRadius: "6px",
              background: `${color}08`
            }}>
              <span style={{ fontSize: "0.8rem", color: G.dim, marginLeft: "8px" }}>#{i + 1}</span>
              {prefix && <span style={{ opacity: 0.6, fontSize: "1.2rem" }}>{prefix} </span>}{name}
            </div>
          ))}
        </div>
      </StepRow>

    </div>
  );
}