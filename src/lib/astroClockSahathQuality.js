/**
 * SAHATH QUALITY SYSTEM — Manuscript-Based
 *
 * GLOBAL RULE: No Sahath is completely unusable. Every Sahath has suitable
 * and less suitable purposes. Quality indicates overall strength only.
 * Never use labels: Avoid, Do Not Do, Forbidden, Bad Time.
 *
 * Quality is derived from:
 * 1. Planet nature (Sa'd/Nahs) — base strength (Havâss'ın Derinlikleri)
 * 2. Friendship with the day ruler — adjustment (manuscript friendship tables)
 *
 * DISPLAY TIERS (4-level UI classification):
 * 🟢 ഉത്തമം / Excellent — Sa'd planet favorable to day ruler (internal score 5 or 4)
 * 🟡 നല്ലത് / Good — Sa'd planet, neutral to day ruler (internal score 3)
 * 🟠 ഇടത്തരം / Moderate — Mixed/Nahs planet, or Sa'd + enemy (internal score 2)
 * 🔴 ദുർബലം / Weak — Nahs planet, enemy of day ruler (internal score 1)
 *
 * The internal 1-5 manuscript score is preserved unchanged; only the
 * final score is mapped to one of these four display tiers (the two
 * green Sa'd-favorable tiers collapse into Excellent).
 *
 * Source: Havâss'ın Derinlikleri — manuscript planetary nature + friendships
 */

import { PLANET_FRIENDSHIPS } from "./astroClockPlanetFriendships.js";

// Base strength from manuscript planet nature (Sa'd Akbar → Nahs Akbar)
const PLANET_NATURE_STRENGTH = {
  jupiter: 4,  // Sa'd Akbar (Most Benefic)
  sun: 3,      // Sa'd (King of Planets)
  venus: 3,    // Sa'd (Planet of Love)
  moon: 3,     // Sa'd (Most Influential)
  mercury: 2,  // Mixed (benefic with benefics, malefic with malefics)
  mars: 2,     // Nahs (Malefic)
  saturn: 1,   // Nahs Akbar (Greater Malefic)
};

export const QUALITY_META = {
  4: { dot: "🟢", color: "#22c55e", label_en: "Excellent", label_ml: "ഉത്തമം", label_ar: "ممتاز", label_tr: "Mükemmel" },
  3: { dot: "🟡", color: "#F5D060", label_en: "Good", label_ml: "നല്ലത്", label_ar: "جيد", label_tr: "İyi" },
  2: { dot: "🟠", color: "#FB923C", label_en: "Medium", label_ml: "മിതത്തം", label_ar: "متوسط", label_tr: "Orta" },
  1: { dot: "🔴", color: "#F87171", label_en: "Weak", label_ml: "ദുർബലം", label_ar: "ضعيف", label_tr: "Zayıf" },
};

// Maps the internal 1-5 manuscript score (preserved) to the 4-level display tier.
// The two green Sa'd-favorable tiers (5 and 4) collapse into Excellent (4).
export const LEVEL_TO_TIER = { 5: 4, 4: 4, 3: 3, 2: 2, 1: 1 };

/**
 * Returns the manuscript-based quality for a Sahath.
 * @param {string} planetKey — Hour planet key (sun, moon, mars, etc.)
 * @param {string|null} dayRulerPlanet — Day ruler planet key, or null if unknown
 * @returns {object} { dot, color, label_en, label_ml, label_tr, level, tier }
 */
export function getSahathQuality(planetKey, dayRulerPlanet) {
  let strength = PLANET_NATURE_STRENGTH[planetKey] || 2;
  if (dayRulerPlanet && planetKey === dayRulerPlanet) {
    strength += 1;
  } else if (dayRulerPlanet) {
    const fr = PLANET_FRIENDSHIPS[planetKey];
    if (fr) {
      if (fr.friends.includes(dayRulerPlanet)) strength += 1;
      else if (fr.enemies.includes(dayRulerPlanet)) strength -= 1;
    }
  }
  const level = Math.max(1, Math.min(5, strength));
  const tier = LEVEL_TO_TIER[level];
  return { ...QUALITY_META[tier], level, tier };
}