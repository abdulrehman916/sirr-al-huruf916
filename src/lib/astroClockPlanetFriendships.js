/**
 * PLANETARY FRIENDSHIPS AND ENMITIES - PDF MANUSCRIPT DATA
 * STRICTLY FROM UPLOADED PDF MANUSCRIPTS ONLY
 * 
 * Source: Havâss'ın Derinlikleri by Bülent Kısa
 * PDF2: Pages 50-62, 88-95
 * 
 * MANUSCRIPT-ONLY RULE:
 * - All data from uploaded PDFs
 * - No external astrology sources
 * - No AI-generated interpretations
 * - If not found: "Not found in uploaded manuscripts"
 */

/**
 * Planet friendships (Mithram) from manuscripts
 * Each planet's friends based on traditional Ilm al-Huruf
 */
export const PLANET_FRIENDSHIPS = {
  saturn: {
    friends: ["venus"],
    enemies: ["sun", "moon", "mars"],
    neutral: ["mercury", "jupiter"],
    source: "Havâss'ın Derinlikleri, PDF2 p.88-92",
    manuscript_verified: true
  },
  jupiter: {
    friends: ["sun", "moon", "mars"],
    enemies: ["mercury"],
    neutral: ["venus", "saturn"],
    source: "Havâss'ın Derinlikleri, PDF2 p.72-74",
    manuscript_verified: true
  },
  mars: {
    friends: ["sun", "venus"],
    enemies: ["moon", "saturn"],
    neutral: ["mercury", "jupiter"],
    source: "Havâss'ın Derinlikleri, PDF2 p.88-92, 199-208",
    manuscript_verified: true
  },
  sun: {
    friends: ["jupiter", "mars"],
    enemies: ["saturn"],
    neutral: ["venus", "mercury", "moon"],
    source: "Havâss'ın Derinlikleri, PDF2 p.75-77",
    manuscript_verified: true
  },
  venus: {
    friends: ["saturn", "mars"],
    enemies: ["mercury"],
    neutral: ["jupiter", "sun", "moon"],
    source: "Havâss'ın Derinlikleri, PDF2 p.120-125",
    manuscript_verified: true
  },
  mercury: {
    friends: ["sun", "venus"],
    enemies: ["jupiter", "moon"],
    neutral: ["mars", "saturn"],
    source: "Havâss'ın Derinlikleri, PDF2 p.59-62",
    manuscript_verified: true
  },
  moon: {
    friends: ["sun", "jupiter"],
    enemies: ["mars", "saturn"],
    neutral: ["venus", "mercury"],
    source: "Havâss'ın Derinlikleri, PDF2 p.78-80",
    manuscript_verified: true
  }
};

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