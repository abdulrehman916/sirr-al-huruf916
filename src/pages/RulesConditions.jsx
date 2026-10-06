import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, ChevronLeft, ScrollText } from "lucide-react";
import { Link } from "react-router-dom";
import { RULES_DATA, RULES_STORAGE_KEY } from "@/lib/rulesContent";

const G = {
  gold: "#F5D060",
  goldDim: "rgba(212,175,55,0.55)",
  goldBorder: "rgba(212,175,55,0.40)",
  goldBorderHi: "rgba(212,175,55,0.65)",
  bg: "rgba(3,6,20,0.99)",
  bgCard: "rgba(8,16,40,0.98)",
  bgInner: "rgba(212,175,55,0.06)",
  text: "rgba(255,255,255,0.85)",
  dim: "rgba(255,255,255,0.45)",
};

const TABS = [
  { key: 'ar', label: 'Arabic', dir: 'rtl' },
  { key: 'ml', label: 'Malayalam', dir: 'ltr' },
  { key: 'en', label: 'English', dir: 'ltr' },
];

const UI_STRINGS = {
  ar: { agree: "I have read and agree to the Rules & Conditions.", continue: "Continue", back: "Back to Home" },
  ml: { agree: "I have read and agree to the Rules & Conditions.", continue: "Continue", back: "Back to Home" },
  en: { agree: "I have read and agree to the Rules & Conditions.", continue: "Continue", back: "Back to Home" },
};

export default function RulesConditions({ mode = 'view', onAccept }) {
  const [activeTab, setActiveTab] = useState('en');
  const [agreed, setAgreed] = useState(false);

  const data = RULES_DATA[activeTab];
  const isRtl = activeTab === 'ar';
  const isGate = mode === 'gate';

  const handleContinue = () => {
    if (!agreed) return;
    try { localStorage.setItem(RULES_STORAGE_KEY, 'true'); } catch {}
    if (onAccept) onAccept();
  };

  return (
    <div className="min-h-screen" style={{
      background: "linear-gradient(180deg, #020710 0%, #050d1a 30%, #08101f 65%, #0b1326 100%)",
      paddingTop: "env(safe-area-inset-top)",
    }}>
      {/* Scrollable content */}
      <div style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "24px 16px 40px",
      }}>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
            style={{ background: G.bgInner, border: `1px solid ${G.goldBorder}` }}>
            <ScrollText className="w-7 h-7" style={{ color: G.gold }} />
          </div>
          <h1 className="font-inter text-xl font-bold" style={{ color: G.gold }}>
            {isRtl ? <span className="font-amiri text-2xl">{data.title}</span> : data.title}
          </h1>
          <p className="font-inter text-[10px] uppercase tracking-[0.25em] mt-1" style={{ color: G.goldDim }}>
            Sirr al-Huruf
          </p>
        </div>

        {/* Language Tabs */}
        <div className="flex gap-2 mb-4">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="flex-1 py-2.5 rounded-xl font-inter text-xs font-bold transition-all"
              style={{
                background: activeTab === tab.key ? 'rgba(212,175,55,0.18)' : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${activeTab === tab.key ? G.goldBorderHi : 'rgba(255,255,255,0.12)'}`,
                color: activeTab === tab.key ? G.gold : 'rgba(255,255,255,0.40)',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Card */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border p-5 mb-4"
          style={{
            background: G.bgCard,
            borderColor: G.goldBorder,
            boxShadow: '0 2px 24px rgba(0,0,0,0.45)',
          }}
        >
          {/* Intro */}
          <p
            dir={TABS.find(t => t.key === activeTab).dir}
            className="text-sm leading-relaxed mb-5"
            style={{
              color: G.text,
              fontFamily: isRtl ? "'Noto Naskh Arabic', 'Amiri', serif" : "'Inter', sans-serif",
              fontSize: isRtl ? '1rem' : '0.875rem',
              lineHeight: isRtl ? 2.2 : 1.8,
              textAlign: isRtl ? 'right' : 'left',
            }}
          >
            {data.intro}
          </p>

          {/* Rules */}
          <div className="space-y-4">
            {data.rules.map((rule, idx) => (
              <div key={idx} className="rounded-xl border p-4"
                style={{ background: G.bgInner, borderColor: 'rgba(212,175,55,0.20)' }}>
                <div
                  dir={TABS.find(t => t.key === activeTab).dir}
                  className="flex gap-2"
                  style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}
                >
                  <span className="font-inter font-bold text-sm flex-shrink-0" style={{ color: G.gold }}>
                    {rule.num}
                  </span>
                  <p
                    className="flex-1"
                    style={{
                      color: G.text,
                      fontFamily: isRtl ? "'Noto Naskh Arabic', 'Amiri', serif" : "'Inter', sans-serif",
                      fontSize: isRtl ? '0.95rem' : '0.825rem',
                      lineHeight: isRtl ? 2.2 : 1.8,
                      textAlign: isRtl ? 'right' : 'left',
                      wordSpacing: isRtl ? '0.10em' : 'normal',
                    }}
                  >
                    {rule.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Gate mode: Acceptance UI */}
        {isGate && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border p-5 space-y-4"
            style={{ background: G.bgCard, borderColor: G.goldBorderHi }}
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <button
                onClick={() => setAgreed(v => !v)}
                className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all"
                style={{
                  background: agreed ? 'rgba(212,175,55,0.25)' : 'transparent',
                  borderColor: agreed ? G.gold : G.goldBorder,
                }}
              >
                {agreed && <CheckCircle className="w-4 h-4" style={{ color: G.gold }} />}
              </button>
              <span className="font-inter text-sm" style={{ color: G.text }}>
                {UI_STRINGS[activeTab].agree}
              </span>
            </label>

            <button
              onClick={handleContinue}
              disabled={!agreed}
              className="w-full py-3.5 rounded-xl font-inter font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: agreed ? 'linear-gradient(135deg, #f6d860 0%, #c98a14 100%)' : 'rgba(255,255,255,0.05)',
                color: agreed ? '#0d1b2a' : 'rgba(255,255,255,0.30)',
                boxShadow: agreed ? '0 0 24px rgba(212,175,55,0.35)' : 'none',
              }}
            >
              {UI_STRINGS[activeTab].continue}
            </button>
          </motion.div>
        )}

        {/* View mode: Back button */}
        {!isGate && (
          <div className="text-center">
            <Link to="/"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-inter text-xs font-semibold transition-all"
              style={{
                background: 'rgba(212,175,55,0.08)',
                border: `1px solid ${G.goldBorder}`,
                color: G.gold,
              }}>
              <ChevronLeft className="w-4 h-4" />
              {UI_STRINGS[activeTab].back}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}