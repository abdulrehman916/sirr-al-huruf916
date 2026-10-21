import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Lock, ShieldCheck, Eye, ChevronDown } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { ADMIN_CONFIG } from "@/lib/adminConfig";

/**
 * Membership tiers. Edit prices and contents here.
 * Each tier includes everything in the tiers before it.
 */
const TIERS = [
  {
    id: "talib",
    arabic: "طالب",
    name: "Talib",
    ml: "അന്വേഷകൻ",
    price: 500,
    tagline: "അക്ഷരങ്ങളുടെ ലോകത്തേക്കുള്ള ആദ്യ വാതിൽ",
    features: [
      "ഇൽമുൽ ഹുറൂഫിന്റെ അടിസ്ഥാന പാഠങ്ങൾ",
      "അബ്ജദ് കണക്കുകൂട്ടൽ: കൈകൊണ്ട് എഴുതി വിശദീകരിക്കുന്ന videos",
      "അക്ഷരങ്ങളുടെയും സംഖ്യകളുടെയും ഗുണങ്ങൾ",
      "എല്ലാ മാസവും പുതിയ പാഠങ്ങൾ",
    ],
  },
  {
    id: "murid",
    arabic: "مريد",
    name: "Murid",
    ml: "ശിഷ്യൻ",
    price: 1000,
    tagline: "ഉപരിതലത്തിനപ്പുറം, ആഴത്തിലേക്ക്",
    features: [
      "വഫ്ഖ് (മാജിക് സ്ക്വയർ) നിർമ്മാണം, ഘട്ടം ഘട്ടമായി",
      "അസ്മാഉൽ ഹുസ്നയുടെ ഗുണങ്ങൾ, കിതാബുകളിൽ പറയുന്ന രീതിയിൽ",
      "ബസ്ത്, അനാസിർ, മീസാൻ: കണക്കുകൾ കാണേണ്ട വിധം",
      "സംശയങ്ങൾക്ക് മറുപടി",
    ],
  },
  {
    id: "khass",
    arabic: "خاص",
    name: "Khass",
    ml: "തിരഞ്ഞെടുക്കപ്പെട്ടവർ",
    price: 2500,
    tagline: "കിതാബുകളിൽ മറഞ്ഞിരിക്കുന്ന ഉന്നത അറിവുകൾ",
    recommended: true,
    features: [
      "ത്വൽസമാത്തും അസ്മാ ത്വൽസമാത്തും: ഉന്നത തലം",
      "മുജർറബായ കർമ്മങ്ങളും വഫ്ഖുകളും, കിതാബുകളിൽ നിന്ന്",
      "സിഹ്ർ, ജിന്ന്: കിതാബുകൾ പറയുന്ന സംരക്ഷണ രീതികൾ",
      "Live ക്ലാസുകൾ",
    ],
  },
  {
    id: "sirr",
    arabic: "سر",
    name: "Sirr",
    ml: "രഹസ്യം",
    price: 5000,
    tagline: "ഉള്ളിലെ വൃത്തം: ഗുരുക്കന്മാർ മാത്രം കൈമാറിയത്",
    features: [
      "ഗുരുകാരണവന്മാർ കൈമാറിയ കർമ്മങ്ങൾ",
      "ഏറ്റവും powerful ആയ വിഷയങ്ങൾ, മറ്റൊരിടത്തും ഇല്ലാത്തത്",
      "നേരിട്ടുള്ള വ്യക്തിപരമായ മാർഗ്ഗനിർദ്ദേശം",
      "പരിമിതമായ അംഗങ്ങൾ മാത്രം",
    ],
  },
];

const FAQS = [
  {
    q: "എങ്ങനെ ചേരാം?",
    a: "ഇഷ്ടമുള്ള തട്ടിന്റെ താഴെയുള്ള button അമർത്തുക. WhatsApp-ൽ നേരിട്ട് ഞങ്ങളുമായി ബന്ധപ്പെടാം. പണമടച്ച ശേഷം നിങ്ങൾക്ക് ഒരു access code ലഭിക്കും. അത് website-ൽ redeem ചെയ്താൽ ആ തട്ടിലെ എല്ലാ പാഠങ്ങളും തുറക്കും.",
  },
  {
    q: "മുകളിലെ തട്ട് എടുത്താൽ താഴെയുള്ളവ കിട്ടുമോ?",
    a: "അതെ. ഓരോ തട്ടിലും അതിന് താഴെയുള്ള എല്ലാ തട്ടുകളിലെയും പാഠങ്ങൾ ഉൾപ്പെടും.",
  },
  {
    q: "Videos download ചെയ്യാനോ പങ്കുവെക്കാനോ പറ്റുമോ?",
    a: "ഇല്ല. എല്ലാ videos-ഉം അംഗങ്ങൾക്ക് website-ൽ കാണാൻ മാത്രമാണ്. ഓരോ video-യിലും കാണുന്ന ആളുടെ പേര് അടയാളപ്പെടുത്തിയിരിക്കും.",
  },
  {
    q: "ഇത് എവിടെ നിന്നുള്ള അറിവാണ്?",
    a: "വർഷങ്ങളുടെ പഠനവും, ആയിരക്കണക്കിന് കിതാബുകൾ ഒത്തുനോക്കി തെറ്റുകൾ തിരുത്തിയ അറിവുമാണ്. ഓരോ പാഠവും സ്വന്തം രീതിയിൽ, മലയാളത്തിൽ, വ്യക്തമായി അവതരിപ്പിക്കുന്നു.",
  },
];

const gold = "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)";

function joinLink(tier) {
  const text =
    `Assalamu alaikum. Sirr Al-Huruf website-ൽ നിന്നാണ്. ` +
    `എനിക്ക് ${tier.name} (${tier.arabic}) membership എടുക്കണം, ₹${tier.price.toLocaleString("en-IN")}/മാസം.`;
  return `https://wa.me/${ADMIN_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

function TierCard({ tier, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="relative flex flex-col rounded-2xl p-6"
      style={{
        background: tier.recommended
          ? "linear-gradient(180deg, rgba(212,175,55,0.14), rgba(13,27,42,0.92))"
          : "rgba(13,27,42,0.78)",
        border: `1px solid ${tier.recommended ? "rgba(246,216,96,0.55)" : "rgba(212,175,55,0.18)"}`,
        boxShadow: tier.recommended ? "0 0 48px rgba(212,175,55,0.18)" : "none",
      }}
    >
      {tier.recommended && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 font-inter text-[10px] font-bold uppercase tracking-[0.16em]"
          style={{ background: gold, color: "#0d1b2a" }}
        >
          ഏറ്റവും ജനപ്രിയം
        </span>
      )}

      <div className="mb-1 flex items-baseline justify-between gap-3">
        <span className="font-amiri text-5xl leading-none" style={{ color: "#f6d860" }}>{tier.arabic}</span>
        <span className="font-inter text-xs uppercase tracking-[0.2em]" style={{ color: "rgba(148,163,184,0.7)" }}>
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <h3 className="mt-2 font-inter text-lg font-semibold" style={{ color: "#f5ecd4" }}>
        {tier.name} <span style={{ color: "rgba(245,236,212,0.6)" }}>· {tier.ml}</span>
      </h3>
      <p className="mt-1 text-sm" style={{ color: "rgba(245,236,212,0.7)" }}>{tier.tagline}</p>

      <div className="mt-5 flex items-baseline gap-1">
        <span className="font-inter text-3xl font-bold" style={{ color: "#f5ecd4" }}>
          ₹{tier.price.toLocaleString("en-IN")}
        </span>
        <span className="text-sm" style={{ color: "rgba(148,163,184,0.8)" }}>/ മാസം</span>
      </div>

      {index > 0 && (
        <p className="mt-4 text-xs font-semibold" style={{ color: "#f6d860" }}>
          {TIERS[index - 1].name}-ലെ എല്ലാം, കൂടാതെ:
        </p>
      )}
      <ul className="mt-3 flex-1 space-y-2.5">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: "rgba(245,236,212,0.88)" }}>
            <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "#f6d860" }} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <a
        href={joinLink(tier)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 block rounded-xl px-4 py-3 text-center font-inter text-sm font-bold transition-transform hover:scale-[1.02]"
        style={
          tier.recommended
            ? { background: gold, color: "#0d1b2a" }
            : { border: "1px solid rgba(246,216,96,0.5)", color: "#f6d860" }
        }
      >
        {tier.name} തിരഞ്ഞെടുക്കുക
      </a>
    </motion.div>
  );
}

function Faq({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b" style={{ borderColor: "rgba(212,175,55,0.14)" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
        style={{ color: "#f5ecd4" }}
      >
        <span className="font-semibold">{item.q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} style={{ color: "#f6d860" }} />
      </button>
      {open && <p className="pb-4 text-sm leading-relaxed" style={{ color: "rgba(245,236,212,0.75)" }}>{item.a}</p>}
    </div>
  );
}

export default function MembershipPage() {
  return (
    <PageLayout>
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-28 pt-10 sm:px-6">
        {/* Hero */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
          <p className="font-amiri text-4xl sm:text-5xl" style={{ color: "#f6d860" }}>سرّ الحروف</p>
          <p className="mt-2 font-inter text-[11px] uppercase tracking-[0.3em]" style={{ color: "rgba(148,163,184,0.7)" }}>
            Membership
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl text-2xl font-semibold leading-snug sm:text-3xl" style={{ color: "#f5ecd4" }}>
            ഓരോ അക്ഷരത്തിനുള്ളിലും ഒരു രഹസ്യമുണ്ട്.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed" style={{ color: "rgba(245,236,212,0.75)" }}>
            ബാഇന്റെ ഒരു പുള്ളിയിൽ എല്ലാ രഹസ്യങ്ങളും ഒളിഞ്ഞിരിക്കുന്നു എന്നാണ് പഴമക്കാർ പറഞ്ഞത്. വർഷങ്ങളുടെ യാത്രയിൽ,
            ആയിരക്കണക്കിന് കിതാബുകൾ ഒത്തുനോക്കി, തട്ടിപ്പുകളും സത്യവും വേർതിരിച്ചറിഞ്ഞ് ശേഖരിച്ച ആ അറിവുകൾ,
            പടിപടിയായി, ഇപ്പോൾ നിങ്ങൾക്കായി തുറക്കുന്നു.
          </p>
        </motion.section>

        {/* Path */}
        <div className="mx-auto mt-10 flex max-w-xl items-center justify-center gap-2 font-amiri text-2xl" style={{ color: "rgba(246,216,96,0.85)" }}>
          {TIERS.map((t, i) => (
            <span key={t.id} className="flex items-center gap-2">
              {t.arabic}
              {i < TIERS.length - 1 && <span className="font-inter text-sm" style={{ color: "rgba(148,163,184,0.5)" }}>→</span>}
            </span>
          ))}
        </div>
        <p className="mt-2 text-center text-xs" style={{ color: "rgba(148,163,184,0.7)" }}>
          അന്വേഷകനിൽ നിന്ന് രഹസ്യത്തിലേക്കുള്ള നാല് പടികൾ
        </p>

        {/* Tiers */}
        <section className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((tier, i) => <TierCard key={tier.id} tier={tier} index={i} />)}
        </section>

        {/* Trust */}
        <section className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "കിതാബുകളിലെ സത്യം", text: "ഊഹങ്ങളല്ല, തട്ടിപ്പുകളല്ല. കിതാബുകളിൽ പറയുന്നത്, ഒത്തുനോക്കി ഉറപ്പാക്കിയത്." },
            { icon: Lock, title: "അംഗങ്ങൾക്ക് മാത്രം", text: "Videos website-ൽ കാണാൻ മാത്രം. Download ചെയ്യാനോ പങ്കുവെക്കാനോ ഇല്ല." },
            { icon: Eye, title: "സ്വന്തം അവതരണം", text: "കൈകൊണ്ട് എഴുതിയ കണക്കുകൾ, മലയാളത്തിൽ, വ്യക്തമായി." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl p-5" style={{ background: "rgba(13,27,42,0.6)", border: "1px solid rgba(212,175,55,0.12)" }}>
              <Icon className="h-5 w-5" style={{ color: "#f6d860" }} />
              <p className="mt-3 font-semibold" style={{ color: "#f5ecd4" }}>{title}</p>
              <p className="mt-1 text-sm" style={{ color: "rgba(245,236,212,0.7)" }}>{text}</p>
            </div>
          ))}
        </section>

        {/* FAQ */}
        <section className="mx-auto mt-14 max-w-3xl">
          <h2 className="mb-2 text-center text-xl font-semibold" style={{ color: "#f5ecd4" }}>സംശയങ്ങൾ</h2>
          {FAQS.map((f) => <Faq key={f.q} item={f} />)}
        </section>

        <footer className="mt-14 text-center">
          <p className="font-amiri text-xl" style={{ color: "rgba(245,236,212,0.82)" }}>سرّ الحروف</p>
          <p className="mt-1 text-sm" style={{ color: "rgba(148,163,184,0.7)" }}>കേട്ടതിലും കണ്ടതിലും അപ്പുറം…</p>
        </footer>
      </div>
    </PageLayout>
  );
}
