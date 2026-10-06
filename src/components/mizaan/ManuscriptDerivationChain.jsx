/**
 * ManuscriptDerivationChain — FULL MANUSCRIPT COMPLIANCE (pp.60–69)
 * Shows EVERY single intermediate stage BEFORE Esma-i Kitabet.
 * NO shortcuts. NO hidden stages. NO direct name generation.
 */
import { useMemo } from "react";
import { getBastLevel, istintak, generateEsmaLevel } from "../../lib/mizaanPostEngine";
import BookDerivationStage from "./BookDerivationStage";
import { AR } from "./ManuscriptConstants";

export default function ManuscriptDerivationChain({ initialLetters, element, color = "#F5D060" }) {
  // ═══════════════════════════════════════════════════════════════
  // ESMA-I KITABET CHAIN
  // ═══════════════════════════════════════════════════════════════
  const kitabet = useMemo(() => {
    // Step 1: Initial letters with First Bast
    const letters = initialLetters || [];
    const bastValues = letters.map(l => getBastLevel(l, 1));
    const bastSum = bastValues.reduce((s, v) => s + v, 0);
    const letterCount = letters.length;
    const satirVahidTotal = bastSum + letterCount;

    // Step 2: Istintak of Satır Vahid
    const seedLetters = istintak(satirVahidTotal);

    // Step 3: Ferd/Zevc
    const isZevc = seedLetters.length % 2 === 0;
    const bastLevel = isZevc ? 4 : 5;

    // Step 4: Apply Bast to each seed — MANUSCRIPT RULE: REVERSE ORDER
    const reversedSeedLetters = [...seedLetters].reverse();
    const seedsWithBast = reversedSeedLetters.map(letter => ({
      letter,
      bastValue: getBastLevel(letter, bastLevel)
    }));

    // Step 5: Istintak each Bast result
    const expansions = seedsWithBast.map(seed => ({
      letter: seed.letter,
      bastValue: seed.bastValue,
      expansionLetters: istintak(seed.bastValue)
    }));
    const allExpansionLetters = expansions.flatMap(e => e.expansionLetters);

    // Step 6: Ferd/Zevc of expanded count
    const isExpandedZevc = allExpansionLetters.length % 2 === 0;
    const groupSize = isExpandedZevc ? 4 : 5;

    return {
      letters, bastValues, bastSum, letterCount, satirVahidTotal,
      seedLetters, isZevc, bastLevel,
      seedsWithBast, expansions, allExpansionLetters,
      expandedCount: allExpansionLetters.length,
      isExpandedZevc, groupSize
    };
  }, [initialLetters]);

  // ═══════════════════════════════════════════════════════════════
  // ESMA-I A'VAN CHAIN (uses Kitabet expansion letters as input)
  // ═══════════════════════════════════════════════════════════════
  const avan = useMemo(() => {
    // Step 1: Satır Vahid of Kitabet expansion letters
    const inputLetters = kitabet.allExpansionLetters;
    const bastValues = inputLetters.map(l => getBastLevel(l, 1));
    const bastSum = bastValues.reduce((s, v) => s + v, 0);
    const letterCount = inputLetters.length;
    const satirVahidTotal = bastSum + letterCount;

    // Step 2: Istintak
    const seedLetters = istintak(satirVahidTotal);

    // Step 3: Ferd/Zevc
    const isZevc = seedLetters.length % 2 === 0;
    const bastLevel = isZevc ? 4 : 5;

    // Step 4: Apply Bast — MANUSCRIPT RULE: REVERSE ORDER
    const reversedSeedLetters = [...seedLetters].reverse();
    const seedsWithBast = reversedSeedLetters.map(letter => ({
      letter,
      bastValue: getBastLevel(letter, bastLevel)
    }));

    // Step 5: Istintak each
    const expansions = seedsWithBast.map(seed => ({
      letter: seed.letter,
      bastValue: seed.bastValue,
      expansionLetters: istintak(seed.bastValue)
    }));
    const allExpansionLetters = expansions.flatMap(e => e.expansionLetters);

    // Step 6: Ferd/Zevc
    const isExpandedZevc = allExpansionLetters.length % 2 === 0;
    const groupSize = isExpandedZevc ? 4 : 5;

    return {
      inputLetters, bastValues, bastSum, letterCount, satirVahidTotal,
      seedLetters, isZevc, bastLevel,
      seedsWithBast, expansions, allExpansionLetters,
      expandedCount: allExpansionLetters.length,
      isExpandedZevc, groupSize
    };
  }, [kitabet.allExpansionLetters]);

  // ═══════════════════════════════════════════════════════════════
  // ESMA-I KASEM CHAIN (uses A'van expansion letters as input, always 5th Bast)
  // ═══════════════════════════════════════════════════════════════
  const kasem = useMemo(() => {
    // Step 1: Satır Vahid of A'van expansion letters
    const inputLetters = avan.allExpansionLetters;
    const bastValues = inputLetters.map(l => getBastLevel(l, 1));
    const bastSum = bastValues.reduce((s, v) => s + v, 0);
    const letterCount = inputLetters.length;
    const satirVahidTotal = bastSum + letterCount;

    // Step 2: Istintak
    const seedLetters = istintak(satirVahidTotal);

    // Step 3: Ferd/Zevc (Kasem ALWAYS uses 5th Bast regardless)
    const isZevc = seedLetters.length % 2 === 0;
    const bastLevel = 5; // Kasem rule: always 5th Bast

    // Step 4: Apply Bast — MANUSCRIPT RULE: REVERSE ORDER
    const reversedSeedLetters = [...seedLetters].reverse();
    const seedsWithBast = reversedSeedLetters.map(letter => ({
      letter,
      bastValue: getBastLevel(letter, bastLevel)
    }));

    // Step 5: Istintak each
    const expansions = seedsWithBast.map(seed => ({
      letter: seed.letter,
      bastValue: seed.bastValue,
      expansionLetters: istintak(seed.bastValue)
    }));
    const allExpansionLetters = expansions.flatMap(e => e.expansionLetters);

    // Step 6: Ferd/Zevc
    const isExpandedZevc = allExpansionLetters.length % 2 === 0;
    const groupSize = isExpandedZevc ? 4 : 5;

    return {
      inputLetters, bastValues, bastSum, letterCount, satirVahidTotal,
      seedLetters, isZevc, bastLevel,
      seedsWithBast, expansions, allExpansionLetters,
      expandedCount: allExpansionLetters.length,
      isExpandedZevc, groupSize
    };
  }, [avan.allExpansionLetters]);

  // ═══════════════════════════════════════════════════════════════
  // FINAL NAMES (ONLY after showing all derivation chains above)
  // ═══════════════════════════════════════════════════════════════
  const finalNames = useMemo(() => {
    const kitabetNames = generateEsmaLevel(kitabet.allExpansionLetters, false, element);
    const avanNames = generateEsmaLevel(avan.allExpansionLetters, false, element);
    const kasemNames = generateEsmaLevel(kasem.allExpansionLetters, true, element);
    return { kitabet: kitabetNames, avan: avanNames, kasem: kasemNames };
  }, [kitabet.allExpansionLetters, avan.allExpansionLetters, kasem.allExpansionLetters, element]);

  return (
    <div style={{ fontFamily: AR.fontFamily, direction: "rtl", textAlign: "right", marginBottom: "32px" }}>
      <BookDerivationStage data={{...kitabet, names: finalNames.kitabet.names, remainder: finalNames.kitabet.remainder, supplementLetters: finalNames.kitabet.supplementLetters}} levelName="ESMA-I KITABET" levelNameAr="أسماء الكتابة" color={color} />
      <BookDerivationStage data={{...avan, names: finalNames.avan.names, remainder: finalNames.avan.remainder, supplementLetters: finalNames.avan.supplementLetters}} levelName="ESMA-I A'VAN" levelNameAr="أسماء الأعوان" color="#B2EBF2" />
      <BookDerivationStage data={{...kasem, names: finalNames.kasem.names, remainder: finalNames.kasem.remainder, supplementLetters: finalNames.kasem.supplementLetters}} levelName="ESMA-I KASEM" levelNameAr="أسماء القسم" color="#F5D060" isKasem={true} />
    </div>
  );
}