// ═══════════════════════════════════════════════════════════════
// SHARED ASTRO DATA HOOK — computes all live data ONCE
// All sections consume this single source of truth — zero duplication
// Does NOT modify any calculation engine — read-only consumer
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useMemo } from "react";
import {
  getCurrentPlanetaryHour, getDayRuler, getActiveWeekday,
  getAllPlanetaryHours, PLANET_INFO, DAY_INFO, WEEKDAY_ANALYSIS, PLANET_SEQUENCE,
} from "@/lib/astroClockLiveEngine";
import { calculateSunriseSunset, getUserLocation, getTzOffsetHours } from "@/lib/astroClockSunriseSunset";
import { calculateMoonPosition, calculateMoonTransits, getMoonPhaseDescription } from "@/lib/astroClockMoonPosition";
import { AY_MANAZILLERI, PLANETARY_DAY_RULERS } from "@/lib/astroClockData";
import { ZODIAC_SIGNS } from "@/lib/astroClockZodiacData";
import { PLANET_FRIENDSHIPS } from "@/lib/astroClockPlanetFriendships";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";
import { subscribeLocation } from "@/lib/astroClockGeolocation";

// Turkish name maps (from manuscript PLANETARY_DAY_RULERS)
export const PLANET_TR = {
  sun: "Güneş", moon: "Ay", mars: "Mars", mercury: "Merkür",
  jupiter: "Jüpiter", venus: "Venüs", saturn: "Satürn",
};
export const DAY_TR = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
// Arabic name maps (GLOBAL UI LANGUAGE RULE — Turkish is internal-only, never shown to users)
export const PLANET_AR = {
  sun: "الشمس", moon: "القمر", mars: "المريخ", mercury: "عطارد",
  jupiter: "المشتري", venus: "الزهرة", saturn: "زحل",
};
export const DAY_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
export const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

// Moon dignity — Western dignity (home/exalted/debilitated/fall) is NOT found in
// the uploaded manuscripts. Removed per manuscript-only rule (audit 2026-07-28).
// moonDignity resolves to null → Moon Center shows no dignity (NOT YET IMPLEMENTED).
export const MOON_DIGNITY = {};

// Purpose → planet/day mapping for Smart Search
export const PURPOSE_MAP = {
  love: { planets: ["venus"], dayKeys: ["fri"], keywords: { en: ["love", "romance", "attraction"], ml: ["പ്രണയം", "പ്രേമം", "ആകർഷണം"], tr: ["aşk", "çekim"] } },
  marriage: { planets: ["jupiter", "venus"], dayKeys: ["thu", "fri"], keywords: { en: ["marriage", "wedding", "union"], ml: ["വിവാഹം", "വിവാഹ", "ദാമ്പത്യം"], tr: ["evlilik", "nikah"] } },
  business: { planets: ["mercury"], dayKeys: ["wed"], keywords: { en: ["business", "trade", "commerce", "money"], ml: ["വ്യാപാരം", "വാണിജ്യം", "പണം"], tr: ["ticaret", "iş"] } },
  travel: { planets: ["moon"], dayKeys: ["mon"], keywords: { en: ["travel", "journey", "trip"], ml: ["യാത്ര", "യാത്രകൾ"], tr: ["seyahat", "yolculuk"] } },
  healing: { planets: ["sun", "moon"], dayKeys: ["sun", "mon"], keywords: { en: ["healing", "health", "cure", "medicine"], ml: ["ചികിത്സ", "ആരോഗ്യം", "വൈദ്യം"], tr: ["şifa", "sağlık"] } },
  knowledge: { planets: ["mercury", "jupiter"], dayKeys: ["wed", "thu"], keywords: { en: ["knowledge", "learning", "study", "wisdom"], ml: ["ജ്ഞാനം", "പഠനം", "വിദ്യ"], tr: ["bilgi", "ilim"] } },
  protection: { planets: ["mars", "saturn"], dayKeys: ["tue", "sat"], keywords: { en: ["protection", "defense", "shield"], ml: ["സംരക്ഷണം", "പ്രതിരോധം"], tr: ["koruma", "savunma"] } },
  wealth: { planets: ["jupiter", "sun"], dayKeys: ["thu", "sun"], keywords: { en: ["wealth", "prosperity", "abundance", "rizq"], ml: ["ഐശ്വര്യം", "സമ്പത്ത്", "റിസ്ഖ്"], tr: ["zenginlik", "bolluk"] } },
  courage: { planets: ["mars"], dayKeys: ["tue"], keywords: { en: ["courage", "strength", "victory", "enemy"], ml: ["ധൈര്യം", "ശക്തി", "വിജയം"], tr: ["cesaret", "güç"] } },
  spiritual: { planets: ["jupiter", "saturn"], dayKeys: ["thu", "sat"], keywords: { en: ["spiritual", "prayer", "meditation", "divine"], ml: ["ആത്മികം", "പ്രാർത്ഥന", "ധ്യാനം"], tr: ["manevi", "dua"] } },
};

export function useAstroData() {
  const { customDate } = useAstroClockLanguage();
  const [tick, setTick] = useState(0);
  const [locTick, setLocTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  // Location reactivity — recompute immediately when GPS/manual location changes.
  useEffect(() => {
    const unsub = subscribeLocation(() => setLocTick((t) => t + 1));
    return unsub;
  }, []);

  return useMemo(() => {
    const now = customDate || new Date();
    const loc = getUserLocation();
    // Authoritative offset: IANA timezone (DST-aware for the selected date via the
    // browser Intl tz database) wins; falls back to the stored numeric offset
    // (longitude-based solar offset for free-form coords / legacy records).
    // This makes GPS and manual presets resolve through the same path → identical
    // results for the same coordinates and date, with correct DST everywhere.
    const ianaOffset = loc.tz ? getTzOffsetHours(loc.tz, now) : null;
    const effectiveTz = (typeof ianaOffset === "number" && isFinite(ianaOffset)) ? ianaOffset : loc.timezone;
    const sun = calculateSunriseSunset(now, loc.lat, loc.lng, effectiveTz);
    const sr = sun.sunrise ?? 6.5;
    const ss = sun.sunset ?? 18.25;

    // Timezone correction — shifts now to location's local time (DST-correct)
    const tzDiffMs = (effectiveTz * 60 + now.getTimezoneOffset()) * 60 * 1000;
    const localNow = new Date(now.getTime() + tzDiffMs);

    const activeDayIndex = getActiveWeekday(localNow, sr, ss);
    const dayRuler = getDayRuler(activeDayIndex);
    const currentHour = getCurrentPlanetaryHour(localNow, sr, ss);
    const allHours = getAllPlanetaryHours(localNow, sr, ss);

    const currentHourDec = localNow.getHours() + localNow.getMinutes() / 60;
    const isNight = currentHourDec < sr || currentHourDec >= ss;

    // Moon
    let moonPosition = null, moonTransits = null, moonPhaseDesc = null;
    try {
      moonPosition = calculateMoonPosition(now);
      moonTransits = calculateMoonTransits(now);
      moonPhaseDesc = getMoonPhaseDescription(moonPosition.phase, moonPosition.isWaxing);
    } catch (_) { moonPosition = null; }

    const moonZodiacKey = moonPosition?.zodiacSign?.name_en?.toLowerCase();
    const moonZodiacFull = ZODIAC_SIGNS[moonZodiacKey] || null;
    const moonDignity = MOON_DIGNITY[moonZodiacKey] || null;
    const currentMansion = moonPosition?.mansion;
    // Lunar day (tithi) = Moon age in days since conjunction, from mean elongation D.
    // Source: Kashf al-Haqa'iq principle_004 (pp.65-66) — "astronomical, not sighting-based";
    // Havâss PDF2 p.63 — lunar month = crescent→full→crescent (synodic cycle).
    // D≈0 → day 1 (new moon), D≈180 → day ~15 (full), D≈360 → day 30/1 (next conjunction).
    const lunarDay = moonPosition ? Math.floor((parseFloat(moonPosition.elongation) / 360) * 29.53) + 1 : null;

    return {
      now, localNow, location: loc,
      sunrise: sr, sunset: ss,
      activeDayIndex, dayKey: DAY_KEYS[activeDayIndex],
      dayRuler, dayInfo: DAY_INFO[activeDayIndex],
      weekdayAnalysis: WEEKDAY_ANALYSIS[activeDayIndex],
      currentHour, allHours,
      isNight, laylNahar: isNight ? "Layl" : "Nahar",
      moonPosition, moonTransits, moonPhaseDesc,
      moonZodiacFull, moonDignity,
      currentMansion, lunarDay,
      planetInfo: PLANET_INFO,
      planetFriendships: PLANET_FRIENDSHIPS,
      manazil: AY_MANAZILLERI,
      planetaryDayRulers: PLANETARY_DAY_RULERS,
      planetSequence: PLANET_SEQUENCE,
      zodiacSigns: ZODIAC_SIGNS,
    };
  }, [tick, customDate, locTick]);
}