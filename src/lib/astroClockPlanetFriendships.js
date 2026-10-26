/**
 * PLANETARY FRIENDSHIPS AND ENMITIES — Kashf al-Haqa'iq p.265
 *
 *   الاول الكواكب المتحابة السعيدة وهي الشمس والقمر والزهرة والمشتري
 *   الثانية هي الكواكب المتباغضة النحيسة وهي المريخ وزحل
 *   عطارد ممتزج نحس مع النحس وسعد مع السعد
 *
 * Two groups and one that mixes:
 *   - the loving, fortunate four — Sun, Moon, Venus, Jupiter — are
 *     friends of one another;
 *   - the hateful, nahs two — Mars and Saturn. The owner's reading
 *     (26 Oct 2026): they are companions of each other for nahs work,
 *     and set against the fortunate four, so no good work is done
 *     with them;
 *   - Mercury takes the nature of what it is with: nahs with the nahs,
 *     fortunate with the fortunate. So it is a friend to both groups
 *     and an enemy of neither.
 *
 * This replaces the earlier table, which cited Hâvâss'ın Derinlikleri
 * II pp.88-92 for a friend/enemy/neutral list. Those pages were read
 * and hold no such list; the table matched none of the three books.
 */
const FORTUNATE = ["sun", "moon", "venus", "jupiter"];
const NAHS = ["mars", "saturn"];
const SRC = "Kashf al-Haqa'iq p.265";
const row = (planet) => {
  if (planet === "mercury") {
    return { friends: [...FORTUNATE, ...NAHS], enemies: [], neutral: [], group: "mixed" };
  }
  const own = FORTUNATE.includes(planet) ? FORTUNATE : NAHS;
  const other = own === FORTUNATE ? NAHS : FORTUNATE;
  return {
    friends: [...own.filter((p) => p !== planet), "mercury"],
    enemies: [...other],
    neutral: [],
    group: own === FORTUNATE ? "fortunate" : "nahs",
  };
};

export const PLANET_FRIENDSHIPS = Object.fromEntries(
  ["saturn", "jupiter", "mars", "sun", "venus", "mercury", "moon"].map((p) => [
    p, { ...row(p), source: SRC, manuscript_verified: true },
  ])
);

/**
 * Get planet friendship data with manuscript validation
 * @param {string} planetKey - Planet name
 * @returns {object} Friendship data with source
 */
export function getPlanetFriendships(planetKey) {
  const friendships = PLANET_FRIENDSHIPS[planetKey.toLowerCase()];
  
  if (!friendships) {
    return {
      found: false,
      message: "Not found in uploaded manuscripts",
      message_ml: "ഹസ്തലിഖിതങ്ങളിൽ കാണുന്നില്ല",
      manuscript_verified: false
    };
  }
  
  return {
    found: true,
    planet: planetKey,
    ...friendships,
    manuscript_verified: true
  };
}

/**
 * Get all planet relationships
 * @returns {array} All planet friendship data
 */
export function getAllPlanetFriendships() {
  return Object.keys(PLANET_FRIENDSHIPS).map(key => ({
    planet: key,
    ...PLANET_FRIENDSHIPS[key]
  }));
}

export default {
  PLANET_FRIENDSHIPS,
  getPlanetFriendships,
  getAllPlanetFriendships
};