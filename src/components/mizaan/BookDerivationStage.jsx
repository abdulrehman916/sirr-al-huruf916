/**
 * BookDerivationStage — Shows complete book-style derivation for one level (Kitabet/A'van/Kasem)
 */
import { G, AR } from "./ManuscriptConstants";
import IstintakSteps from "./IstintakSteps";
import Stage8Names from "./Stage8Names";

const LetterWithBast = ({ letter, bastValue, color }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "2px", padding: "4px", borderRadius: "6px", background: `${color}08`, border: `1px solid ${color}20` }}>
    <span dir="rtl" lang="ar" style={{ fontFamily: AR.fontFamily, fontSize: "1.4rem", color, fontWeight: "600", padding: "4px 8px", borderRadius: "4px", background: `${color}10`, border: `1px solid ${color}20`, display: "inline-block", minWidth: "2rem", textAlign: "center" }}>{letter}</span>
    <span style={{ fontSize: "0.65rem", color: G.dim, marginTop: "3px", fontFamily: "'Inter', sans-serif", fontWeight: "500" }}>{bastValue.toLocaleString()}</span>
  </div>
);

const StageContainer = ({ number, title, titleAr, children, color }) => (
  <div style={{ marginBottom: "20px", padding: "16px", border: `2px solid ${color}40`, borderRadius: "10px", background: `${color}05` }}>
    <div style={{ fontSize: "0.7rem", color: G.dim, marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ background: color, color: "#000", padding: "2px 8px", borderRadius: "4px", fontWeight: "bold", fontSize: "0.65rem" }}>{number}</span>
      <span>{title}</span>
      <span style={{ opacity: 0.5 }}>|</span>
      <span style={{ fontFamily: AR.fontFamily, fontSize: "0.85rem" }}>{titleAr}</span>
    </div>
    {children}
  </div>
);

export default function BookDerivationStage({ data, levelName, levelNameAr, color, showFinalNames = true, isKasem = false }) {
  return (
    <div style={{ marginBottom: "40px", padding: "20px", border: `3px solid ${color}50`, borderRadius: "12px", background: `${color}08` }}>
      <h2 style={{ fontSize: "1.4rem", color, fontWeight: "bold", marginBottom: "20px", borderBottom: `2px solid ${color}40`, paddingBottom: "10px" }}>
        {levelName} ({levelNameAr}) - Complete Book Procedure
      </h2>

      {/* STEP 1: ORIGINAL NUMBER */}
      <StageContainer number="١" title="Step 1: Original Number (Satır Vahid)" titleAr="الرقم الأصلي: سطر واحد" color={color}>
        <div style={{ fontSize: "0.8rem", color: G.text, marginBottom: "12px" }}>Input: {data.letters.length} letters</div>
        <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "4px", direction: "ltr", padding: "12px", border: `1px solid ${color}30`, borderRadius: "8px", background: `${color}08`, marginBottom: "12px" }}>
          {data.letters.map((letter, i) => (
            <LetterWithBast key={i} letter={letter} bastValue={data.bastValues[i]} color={color} />
          ))}
        </div>
        <div style={{ padding: "12px", border: `2px solid ${color}40`, borderRadius: "8px", background: `${color}08`, fontSize: "1.1rem", fontWeight: "bold", color: G.green }}>
          Satır Vahid: {data.bastSum.toLocaleString()} + {data.letterCount} = {data.satirVahidTotal.toLocaleString()}
        </div>
      </StageContainer>

      {/* STEP 2: ISTINTAQ */}
      <StageContainer number="٢" title="Step 2: Istintaq Result" titleAr="الاستنطاق" color={color}>
        <IstintakSteps n={data.satirVahidTotal} msMarker={true} compact={false} />
      </StageContainer>

      {/* STEP 3: LETTER COUNT */}
      <StageContainer number="٣" title="Step 3: Letter Count" titleAr="عدد الحروف" color={color}>
        <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: G.text, padding: "12px", background: `${color}08`, borderRadius: "8px", textAlign: "center" }}>
          Seed Letters: {data.seedLetters.length}
        </div>
      </StageContainer>

      {/* STEP 4: FERD/ZEVC */}
      <StageContainer number="٤" title="Step 4: Ferd/Zevc Decision" titleAr="قرار زوج/فرد" color={color}>
        <div style={{ padding: "15px", borderRadius: "8px", fontSize: "1.1rem", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", background: data.isZevc ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)", border: `2px solid ${data.isZevc ? G.green : G.red}` }}>
          <span style={{ fontSize: "1.5rem" }}>{data.isZevc ? '✓' : '✗'}</span>
          <span style={{ color: data.isZevc ? G.green : G.red, fontSize: "1.2rem" }}>
            {data.isZevc ? 'ZEVC (زوج) - EVEN' : 'FERD (فرد) - ODD'}
          </span>
        </div>
      </StageContainer>

      {/* STEP 5: BAST LEVEL */}
      <StageContainer number="٥" title={isKasem ? "Step 5: KASEM RULE - Always 5th Bast" : "Step 5: Bast Level Selection"} titleAr={isKasem ? "قاعدة القسم: دائمًا الخامس" : "اختيار مستوى البسط"} color={color}>
        {isKasem ? (
          <div style={{ padding: "15px", background: `${color}15`, borderRadius: "8px", fontSize: "1.2rem", fontWeight: "bold", color, textAlign: "center", border: `2px solid ${color}40` }}>
            ⚠ KASEM SPECIAL RULE: Always 5th Bast (خامس)<br/>
            <span style={{ fontSize: "0.9rem", fontWeight: "normal", opacity: 0.8 }}>Regardless of Ferd/Zevc</span>
          </div>
        ) : (
          <>
            <div style={{ fontSize: "0.9rem", color: G.text, marginBottom: "10px" }}>
              <div>Manuscript Rule:</div>
              <div style={{ marginTop: "6px", marginLeft: "12px" }}>• Zevc → 4th Bast (رابع)</div>
              <div style={{ marginLeft: "12px" }}>• Ferd → 5th Bast (خامس)</div>
            </div>
            <div style={{ padding: "12px", background: `${color}08`, borderRadius: "8px", fontSize: "1.2rem", fontWeight: "bold", color: G.green, textAlign: "center", border: `2px solid ${color}40` }}>
              Selected: {data.bastLevel}{data.bastLevel === 4 ? ' (رابع)' : ' (خامس)'} Bast
            </div>
          </>
        )}
      </StageContainer>

      {/* STEP 6: INDIVIDUAL BAST */}
      <StageContainer number="٦" title="Step 6: Individual Bast of Every Letter (REVERSE ORDER)" titleAr="بسط كل حرف على حدة (الترتيب العكسي)" color={color}>
        <div style={{ fontSize: "0.8rem", color: G.dim, marginBottom: "12px" }}>
          <div style={{ padding: "8px", background: `${G.text}10`, borderRadius: "6px", border: `1px solid ${G.text}30`, marginBottom: "8px" }}>
            <strong style={{ color: G.text }}>⚠ MANUSCRIPT RULE:</strong>
            <span style={{ color: G.text, marginLeft: "8px" }}>Start from LAST letter → move backwards to first</span>
          </div>
          Processing {data.seedLetters.length} letters in reverse order with {data.bastLevel}{data.bastLevel === 4 ? ' (رابع)' : ' (خامس)'} Bast:
        </div>
        <div style={{ display: "grid", gap: "12px" }}>
          {data.seedsWithBast.map((seed, i) => (
            <div key={i} style={{ padding: "12px", border: `2px solid ${G.purple}30`, borderRadius: "8px", background: `${G.purple}05`, position: "relative" }}>
              <div style={{ fontSize: "0.75rem", color: G.dim, marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ background: color, color: "#000", padding: "1px 6px", borderRadius: "3px", fontWeight: "bold", fontSize: "0.65rem" }}>{i + 1}</span>
                {i === 0 ? (
                  <span style={{ color: G.green, fontWeight: "bold" }}>START HERE (last letter of seed)</span>
                ) : i === data.seedsWithBast.length - 1 ? (
                  <span style={{ color: G.text }}>END HERE (first letter of seed)</span>
                ) : null}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span dir="rtl" lang="ar" style={{ fontFamily: AR.fontFamily, fontSize: "1.8rem", color: G.purple, padding: "8px 16px", background: `${G.purple}15`, borderRadius: "6px", border: `1px solid ${G.purple}30` }}>{seed.letter}</span>
                <span style={{ fontSize: "1.5rem", color: G.text }}>→</span>
                <span style={{ fontSize: "1.3rem", fontWeight: "bold", color: G.green }}>{seed.bastValue.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </StageContainer>

      {/* STEP 7: ISTINTAQ EACH */}
      <StageContainer number="٧" title="Step 7: Istintaq of Each Bast" titleAr="استنطاق كل بسط" color={color}>
        <div style={{ display: "grid", gap: "12px" }}>
          {data.expansions.map((exp, idx) => (
            <div key={idx} style={{ padding: "12px", border: `2px solid ${color}30`, borderRadius: "8px", background: `${color}05` }}>
              <div style={{ fontSize: "0.75rem", color: G.dim, marginBottom: "8px" }}>Seed {idx + 1}: {exp.letter} → {exp.bastValue.toLocaleString()}</div>
              <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "4px", direction: "ltr", padding: "8px", background: `${G.purple}08`, borderRadius: "6px" }}>
                {[...exp.expansionLetters].reverse().map((l, i) => (
                  <span key={i} dir="rtl" lang="ar" style={{ fontFamily: AR.fontFamily, fontSize: "1.3rem", color: G.purple, padding: "4px 8px", background: `${G.purple}15`, borderRadius: "4px", border: `1px solid ${G.purple}25` }}>{l}</span>
                ))}
              </div>
              <div style={{ fontSize: "0.7rem", color: G.dim, marginTop: "6px" }}>Expansion: {exp.expansionLetters.length} letters</div>
            </div>
          ))}
        </div>
      </StageContainer>

      {/* STEP 8: COMPLETE SATR-I VAHID */}
      <StageContainer number="٨" title="Step 8: Complete Satr-i Vahid" titleAr="سطر واحد الكامل" color={color}>
        <div style={{ fontSize: "0.8rem", color: G.dim, marginBottom: "12px" }}>Combining ALL {data.expandedCount} letters:</div>
        <div style={{ padding: "16px", border: `3px solid ${color}50`, borderRadius: "10px", background: `${color}08`, marginBottom: "12px" }}>
          <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "4px", direction: "ltr" }}>
            {[...data.allExpansionLetters].reverse().map((l, i) => (
              <span key={i} dir="rtl" lang="ar" style={{ fontFamily: AR.fontFamily, fontSize: "1.5rem", color, padding: "6px 10px", background: `${color}20`, borderRadius: "6px", border: `2px solid ${color}40`, fontWeight: "bold" }}>{l}</span>
            ))}
          </div>
        </div>
        <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: G.green, padding: "12px", background: `${G.green}10`, borderRadius: "8px", textAlign: "center" }}>
          Total: {data.expandedCount} letters
        </div>
      </StageContainer>

      {/* STEP 9: REPEAT FERD/ZEVC */}
      <StageContainer number="٩" title="Step 9: Repeat Ferd/Zevc" titleAr="تكرار زوج/فرد" color={color}>
        <div style={{ padding: "12px", borderRadius: "8px", fontSize: "1.1rem", fontWeight: "bold", background: data.isExpandedZevc ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)", border: `2px solid ${data.isExpandedZevc ? G.green : G.red}`, textAlign: "center" }}>
          {data.expandedCount} letters → {data.isExpandedZevc ? 'ZEVC (Even)' : 'FERD (Odd)'} → Group: {data.groupSize}
        </div>
      </StageContainer>

      {/* STEP 10: FINAL NAMES (optional) */}
      {showFinalNames && (
        <StageContainer number="١٠" title="Step 10: Final Names" titleAr="الأسماء النهائية" color={color}>
          <div style={{ fontSize: "0.8rem", color: G.dim, marginBottom: "16px", padding: "10px", background: `${color}10`, borderRadius: "6px" }}>
            ✓ After ALL steps, names from {data.expandedCount} letters in groups of {data.groupSize}:
          </div>
          <Stage8Names expandedLetters={data.allExpansionLetters} groupSize={data.groupSize} names={data.names} remainder={data.remainder} supplementLetters={data.supplementLetters} color={color} />
        </StageContainer>
      )}
    </div>
  );
}