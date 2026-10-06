import { Link } from "react-router-dom";
import { useNavigation } from "../context/NavigationContext";
import { useTranslation } from "@/i18n/useTranslation";
import { useAuth } from "@/lib/AuthContext";

// SVG icon system
const CARD_ICONS = {
  abjad: (color) => (
    <svg viewBox="0 0 32 32" width="26" height="26" fill="none">
      <text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle"
        fontFamily="Amiri, serif" fontWeight="700" fontSize="20" fill={color}>ح</text>
      <circle cx="16" cy="16" r="14" stroke={color} strokeWidth="0.8" strokeOpacity="0.5"/>
    </svg>
  ),
  anasir: (color) => (
    <svg viewBox="0 0 32 32" width="26" height="26" fill="none">
      <path d="M16 4 C10 4 5 10 6 16 C7 22 11 27 16 28 C21 27 25 22 26 16 C27 10 22 4 16 4Z"
        stroke={color} strokeWidth="1.2" strokeOpacity="0.8" fill="none"/>
      <path d="M8 16 Q12 10 16 16 Q20 22 24 16" stroke={color} strokeWidth="1" strokeOpacity="0.6" fill="none"/>
      <circle cx="16" cy="16" r="2.5" fill={color} fillOpacity="0.9"/>
    </svg>
  ),
  hadim: (color) => (
    <svg viewBox="0 0 32 32" width="26" height="26" fill="none">
      <polygon points="16,3 19.5,12 29,12 21.5,18 24,27 16,21.5 8,27 10.5,18 3,12 12.5,12"
        stroke={color} strokeWidth="1" strokeOpacity="0.85" fill={color} fillOpacity="0.12"/>
      <circle cx="16" cy="16" r="3" fill={color} fillOpacity="0.9"/>
    </svg>
  ),
  mizaan: (color) => (
    <svg viewBox="0 0 32 32" width="26" height="26" fill="none">
      <line x1="16" y1="4" x2="16" y2="28" stroke={color} strokeWidth="1.2" strokeOpacity="0.7"/>
      <line x1="6" y1="12" x2="26" y2="12" stroke={color} strokeWidth="1" strokeOpacity="0.6"/>
      <ellipse cx="9" cy="20" rx="5" ry="3" stroke={color} strokeWidth="0.9" strokeOpacity="0.75" fill={color} fillOpacity="0.10"/>
      <ellipse cx="23" cy="20" rx="5" ry="3" stroke={color} strokeWidth="0.9" strokeOpacity="0.75" fill={color} fillOpacity="0.10"/>
      <text x="50%" y="44%" dominantBaseline="middle" textAnchor="middle"
        fontFamily="Amiri, serif" fontWeight="700" fontSize="9" fill={color} fillOpacity="0.9">٩</text>
    </svg>
  ),
  sqayer: (color) => (
    <svg viewBox="0 0 32 32" width="26" height="26" fill="none">
      <rect x="5" y="5" width="22" height="22" rx="2" stroke={color} strokeWidth="0.9" strokeOpacity="0.7" fill="none"/>
      <line x1="5" y1="12.3" x2="27" y2="12.3" stroke={color} strokeWidth="0.5" strokeOpacity="0.45"/>
      <line x1="5" y1="19.7" x2="27" y2="19.7" stroke={color} strokeWidth="0.5" strokeOpacity="0.45"/>
      <line x1="12.3" y1="5" x2="12.3" y2="27" stroke={color} strokeWidth="0.5" strokeOpacity="0.45"/>
      <line x1="19.7" y1="5" x2="19.7" y2="27" stroke={color} strokeWidth="0.5" strokeOpacity="0.45"/>
      <circle cx="16" cy="16" r="2" fill={color} fillOpacity="0.85"/>
    </svg>
  ),
  vefkin: (color) => (
    <svg viewBox="0 0 32 32" width="26" height="26" fill="none">
      <rect x="6" y="8" width="20" height="16" rx="1.5" stroke={color} strokeWidth="1" strokeOpacity="0.75" fill="none"/>
      <line x1="6" y1="12" x2="26" y2="12" stroke={color} strokeWidth="0.6" strokeOpacity="0.5"/>
      <line x1="9" y1="16" x2="23" y2="16" stroke={color} strokeWidth="0.5" strokeOpacity="0.4"/>
      <line x1="9" y1="19" x2="20" y2="19" stroke={color} strokeWidth="0.5" strokeOpacity="0.4"/>
      <path d="M14 5 L16 8 L18 5" stroke={color} strokeWidth="0.8" strokeOpacity="0.65" fill="none"/>
    </svg>
  ),
  bast: (color) => (
    <svg viewBox="0 0 32 32" width="26" height="26" fill="none">
      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle"
        fontFamily="Amiri, serif" fontWeight="700" fontSize="16" fill={color}>بسط</text>
      <circle cx="16" cy="16" r="13" stroke={color} strokeWidth="0.8" strokeOpacity="0.55"/>
      <circle cx="16" cy="16" r="10" stroke={color} strokeWidth="0.4" strokeOpacity="0.25" strokeDasharray="2,4"/>
    </svg>
  ),
  faal: (color) => (
    <svg viewBox="0 0 32 32" width="26" height="26" fill="none">
      <text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle"
        fontFamily="Amiri, serif" fontWeight="700" fontSize="18" fill={color}>ف</text>
      <circle cx="16" cy="16" r="13" stroke={color} strokeWidth="0.8" strokeOpacity="0.55"/>
      <path d="M16 6 L16 26 M10 12 L16 16 L22 12" stroke={color} strokeWidth="0.6" strokeOpacity="0.45"/>
    </svg>
  ),
  plants: (color) => (
    <svg viewBox="0 0 32 32" width="26" height="26" fill="none">
      <path d="M16 2 Q12 8 12 14 Q12 22 16 28 Q20 22 20 14 Q20 8 16 2Z"
        stroke={color} strokeWidth="1" strokeOpacity="0.75" fill={color} fillOpacity="0.12"/>
      <path d="M8 16 Q10 12 14 12 L14 20 Q10 20 8 18Z"
        stroke={color} strokeWidth="0.8" strokeOpacity="0.70" fill={color} fillOpacity="0.08"/>
      <path d="M24 16 Q22 12 18 12 L18 20 Q22 20 24 18Z"
        stroke={color} strokeWidth="0.8" strokeOpacity="0.70" fill={color} fillOpacity="0.08"/>
      <circle cx="16" cy="16" r="1.5" fill={color} fillOpacity="0.9"/>
    </svg>
  ),
  holyNames: (color) => (
    <svg viewBox="0 0 32 32" width="26" height="26" fill="none">
      <text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle"
        fontFamily="Amiri, serif" fontWeight="700" fontSize="16" fill={color}>الله</text>
      <circle cx="16" cy="16" r="13" stroke={color} strokeWidth="0.8" strokeOpacity="0.55"/>
      <circle cx="16" cy="16" r="9" stroke={color} strokeWidth="0.4" strokeOpacity="0.25" strokeDasharray="1.5,3"/>
    </svg>
  ),
  astroClock: (color) => (
    <svg viewBox="0 0 32 32" width="26" height="26" fill="none">
      <circle cx="16" cy="16" r="13" stroke={color} strokeWidth="1" strokeOpacity="0.75" fill="none"/>
      <circle cx="16" cy="16" r="2" fill={color} fillOpacity="0.9"/>
      <line x1="16" y1="5" x2="16" y2="10" stroke={color} strokeWidth="1.2" strokeOpacity="0.8"/>
      <line x1="16" y1="14" x2="16" y2="8" stroke={color} strokeWidth="1" strokeOpacity="0.85"/>
      <line x1="16" y1="14" x2="21" y2="18" stroke={color} strokeWidth="0.8" strokeOpacity="0.65"/>
      <circle cx="16" cy="5" r="1" fill={color} fillOpacity="0.7"/>
    </svg>
  ),
  sirr: (color) => (
    <svg viewBox="0 0 32 32" width="26" height="26" fill="none">
      <text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle"
        fontFamily="Amiri, serif" fontWeight="700" fontSize="16" fill={color}>سر</text>
      <circle cx="16" cy="16" r="13" stroke={color} strokeWidth="0.8" strokeOpacity="0.55"/>
      <circle cx="16" cy="16" r="9" stroke={color} strokeWidth="0.4" strokeOpacity="0.25" strokeDasharray="1.5,3"/>
      <rect x="10" y="10" width="12" height="12" rx="1" stroke={color} strokeWidth="0.5" strokeOpacity="0.35" fill="none"/>
    </svg>
  ),
  evilJinn: (color) => (
    <svg viewBox="0 0 32 32" width="26" height="26" fill="none">
      <path d="M16 4 C10 4 6 10 6 16 C6 22 10 28 16 28 C22 28 26 22 26 16 C26 10 22 4 16 4Z"
        stroke={color} strokeWidth="1" strokeOpacity="0.75" fill="none"/>
      <path d="M12 14 Q14 12 16 14 Q18 12 20 14" stroke={color} strokeWidth="0.8" strokeOpacity="0.7" fill="none"/>
      <circle cx="12" cy="18" r="1.5" fill={color} fillOpacity="0.8"/>
      <circle cx="20" cy="18" r="1.5" fill={color} fillOpacity="0.8"/>
      <path d="M14 22 Q16 24 18 22" stroke={color} strokeWidth="0.8" strokeOpacity="0.7" fill="none"/>
    </svg>
  ),
  shop: (color) => (
    <svg viewBox="0 0 32 32" width="26" height="26" fill="none">
      <path d="M9 11 L23 11 L22 27 L10 27 Z" stroke={color} strokeWidth="1" strokeOpacity="0.75" fill={color} fillOpacity="0.10"/>
      <path d="M13 11 Q13 5 16 5 Q19 5 19 11" stroke={color} strokeWidth="1" strokeOpacity="0.7" fill="none"/>
      <line x1="9" y1="16" x2="23" y2="16" stroke={color} strokeWidth="0.5" strokeOpacity="0.4"/>
    </svg>
  ),
  resources: (color) => (
    <svg viewBox="0 0 32 32" width="26" height="26" fill="none">
      <path d="M8 5 H22 Q25 5 25 8 V24 Q25 27 22 27 H8 Z" stroke={color} strokeWidth="1" strokeOpacity="0.75" fill={color} fillOpacity="0.08"/>
      <line x1="12" y1="11" x2="22" y2="11" stroke={color} strokeWidth="0.9" strokeOpacity="0.7"/>
      <line x1="12" y1="16" x2="22" y2="16" stroke={color} strokeWidth="0.9" strokeOpacity="0.55"/>
      <line x1="12" y1="21" x2="19" y2="21" stroke={color} strokeWidth="0.9" strokeOpacity="0.45"/>
      <circle cx="9" cy="11" r="1" fill={color}/>
      <circle cx="9" cy="16" r="1" fill={color}/>
      <circle cx="9" cy="21" r="1" fill={color}/>
    </svg>
  ),
};

const NAV_CARDS = [
  { path: "/abjad",            arabic: "أبجد",         label: "ABJAD",            subtitle: "Numerical Calculator",      iconKey: "abjad",  accent: [212, 175, 55] },
  { path: "/anasir",           arabic: "عناصر",        label: "ANASIR",           subtitle: "Elemental Analysis",        iconKey: "anasir", accent: [56, 189, 248] },
  { path: "/hadim",            arabic: "خادم",         label: "HADIM",            subtitle: "Name Generator",            iconKey: "hadim",  accent: [192, 132, 252] },
  { path: "/mizaan9",          arabic: "ميزان",        label: "MIZAAN 9",         subtitle: "Sacred Numerology",         iconKey: "mizaan", accent: [212, 175, 55] },
  { path: "/magic-sqayer",     arabic: "السحر المربع", label: "MAGIC SQAYER",     subtitle: "Sacred Vefk Construction",  iconKey: "sqayer", accent: [212, 175, 55] },
  { path: "/vefkin-yapilisi",  arabic: "طريقة الوفق",  label: "VEFK METHOD",  subtitle: "Ottoman Manuscript Method", iconKey: "vefkin", accent: [212, 175, 55] },
  { path: "/basthul-huroof-2", arabic: "بسط الحروف",   label: "BASTHUL HUROOF 2", subtitle: "Numerical Letter Table",       iconKey: "bast",   accent: [180, 140, 255] },
  { path: "/faal-hasrath",     arabic: "فأل",          label: "FAAL",             subtitle: "Sacred Omen System",        iconKey: "faal",   accent: [212, 175, 55] },
  { path: "/plants",           arabic: "نباتات",       label: "PLANTS",           subtitle: "Medicinal Dictionary",      iconKey: "plants", accent: [34, 197, 94] },
  { path: "/holy-names",       arabic: "أسماء مقدسة",  label: "HOLY NAMES",       subtitle: "Sacred Names Reference",    iconKey: "holyNames", accent: [212, 175, 55] },
  { path: "/evil-jinn",        arabic: "الجن الشرير",  label: "EVIL JINN",        subtitle: "Jinn Classification",       iconKey: "evilJinn",   accent: [239, 68, 68] },
  { path: "/astro-clock",      arabic: "الساعة الفلكية", label: "ASTRO CLOCK",      subtitle: "Celestial Time Engine",     iconKey: "astroClock", accent: [99, 179, 237] },
  { path: "/sirr",             arabic: "السر",           label: "SIRR",             subtitle: "Manuscript Knowledge",      iconKey: "sirr",   accent: [212, 175, 55] },
  { path: "/shop",             arabic: "المتجر",         label: "SHOP",             subtitle: "Premium Products & Books",  iconKey: "shop",   accent: [212, 175, 55] },
  { path: "/books",            arabic: "الكتب",          label: "BOOKS",            subtitle: "PDF Books & Study Library",    iconKey: "shop",   accent: [212, 175, 55] },
];

const OWNER_CONTENT_CARD = {
  path: "/admin/content-studio",
  arabic: "إنشاء صفحة",
  label: "CREATE NEW PAGE",
  subtitle: "Private Social Content Studio",
  iconKey: "resources",
  accent: [45, 212, 191],
};

const CARD_SUB_KEYS = {
  "/abjad": "card_sub_abjad",
  "/anasir": "card_sub_anasir",
  "/hadim": "card_sub_hadim",
  "/mizaan9": "card_sub_mizaan",
  "/magic-sqayer": "card_sub_sqayer",
  "/vefkin-yapilisi": "card_sub_vefkin",
  "/basthul-huroof-2": "card_sub_bast",
  "/faal-hasrath": "card_sub_faal",
  "/plants": "card_sub_plants",
  "/holy-names": "card_sub_holy_names",
  "/evil-jinn": "card_sub_evil_jinn",
  "/astro-clock": "card_sub_astro",
  "/sirr": "card_sub_sirr",
  "/shop": "card_sub_shop",
};

function IconOrb({ iconKey, accent }) {
  const [r, g, b] = accent;
  const color = `rgb(${r},${g},${b})`;
  const renderIcon = CARD_ICONS[iconKey];
  const iconEl = renderIcon ? renderIcon(color) : <span className="font-amiri text-2xl" style={{ color }}>{iconKey}</span>;
  
  return (
    <div className="mb-3 flex items-center justify-center w-14 h-14 rounded-xl relative"
      style={{
        background: `linear-gradient(145deg, rgba(${r},${g},${b},0.20) 0%, rgba(${r},${g},${b},0.07) 100%)`,
        border: `1px solid rgba(${r},${g},${b},0.38)`,
        boxShadow: `0 0 20px rgba(${r},${g},${b},0.25), inset 0 1px 0 rgba(${r},${g},${b},0.18)`,
      }}>
      {iconEl}
    </div>
  );
}

function CardInner({ card }) {
  const { t } = useTranslation();
  const [r, g, b] = card.accent;
  return (
    <>
      <IconOrb iconKey={card.iconKey} accent={card.accent} />
      <p className="font-amiri font-bold leading-tight mb-0.5"
        style={{ fontSize:"clamp(1.2rem,5vw,1.5rem)", color:"#f5ead4", letterSpacing:"0.01em" }}>
        {card.arabic}
      </p>
      <p className="font-inter font-bold tracking-[0.22em] uppercase"
        style={{ fontSize:"7px", color:`rgba(${r},${g},${b},0.88)`, marginTop:1 }}>
        {card.label}
      </p>
      <div className="my-2.5 rounded-full"
        style={{ width:28, height:0.5, background:`linear-gradient(90deg,transparent,rgba(${r},${g},${b},0.55),transparent)` }} />
      <p className="font-inter leading-relaxed text-center"
        style={{ fontSize:"9px", color:"rgba(255,255,255,0.32)", letterSpacing:"0.04em" }}>
        {t(CARD_SUB_KEYS[card.path] || "", card.subtitle)}
      </p>
    </>
  );
}

export default function CardsSection() {
  const { startNav } = useNavigation();
  const { role } = useAuth();
  const visibleCards = role === "owner" ? [...NAV_CARDS, OWNER_CONTENT_CARD] : NAV_CARDS;
  
  return (
    <div className="relative z-20 w-full px-2 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4" style={{
      marginBottom: "20px",
      width: "100%",
      maxWidth: "1400px",
      margin: "0 auto",
      paddingLeft: "8px",
      paddingRight: "8px",
    }}>
      {visibleCards.map((card) => {
        const [r, g, b] = card.accent;
        return (
          <div key={card.path}>
            <Link to={card.path} onClick={startNav}
              className="block rounded-2xl border flex flex-col items-center justify-center text-center"
              style={{
                background: `linear-gradient(155deg,rgba(${r},${g},${b},0.13) 0%,rgba(8,16,42,0.92) 55%,rgba(${r},${g},${b},0.05) 100%)`,
                borderColor: `rgba(${r},${g},${b},0.32)`,
                boxShadow: `0 0 28px rgba(${r},${g},${b},0.14),0 6px 24px rgba(0,0,0,0.55),inset 0 1px 0 rgba(${r},${g},${b},0.18)`,
                minHeight: "clamp(160px, 18vh, 200px)",
                padding: "clamp(16px, 2vh, 24px) clamp(12px, 1.5vw, 20px)",
                WebkitTapHighlightColor: "transparent",
                touchAction: "manipulation",
                position: "relative",
                overflow: "hidden",
              }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1,
                background: `linear-gradient(90deg,transparent 5%,rgba(${r},${g},${b},0.50) 50%,transparent 95%)` }} />
              <CardInner card={card} />
            </Link>
          </div>
        );
      })}
    </div>
  );
}
