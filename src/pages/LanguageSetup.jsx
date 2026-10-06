import React, { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import useTranslation from '@/i18n/useTranslation';
import { ArrowRight, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import AtmosphericBackground from '@/components/AtmosphericBackground';

const LANGUAGES = [
  { code: 'ml', labelKey: 'lang_malayalam', native: 'Malayalam' },
  { code: 'en', labelKey: 'lang_english', native: 'English' },
  { code: 'ar', labelKey: 'lang_arabic', native: 'Arabic' },
];

export default function LanguageSetup({ onComplete }) {
  const { setLanguage } = useI18n();
  const { t } = useTranslation();
  const [selected, setSelected] = useState(null);

  const handleConfirm = () => {
    if (selected) {
      setLanguage(selected);
      onComplete?.();
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[100dvh] px-5 text-center overflow-hidden"
      style={{ background: "linear-gradient(180deg, #020710 0%, #050d1a 45%, #08101f 100%)" }}>
      <AtmosphericBackground />
      <div className="relative z-10 w-full max-w-sm">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
          style={{ background: "linear-gradient(145deg, rgba(212,175,55,0.22), rgba(212,175,55,0.06))", border: "1px solid rgba(212,175,55,0.25)" }}>
          <Globe className="w-7 h-7" style={{ color: "#D4AF37" }} />
        </div>

        <h1 className="font-amiri font-bold text-2xl mb-2" style={{ color: "#f5ead4" }}>
          سرّ الحروف
        </h1>
        <p className="font-inter text-xs tracking-[0.2em] uppercase mb-8" style={{ color: "rgba(212,175,55,0.60)" }}>
          {t('lang_title')}
        </p>

        <div className="space-y-2 mb-8">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelected(lang.code)}
              className="w-full py-4 px-5 rounded-xl text-left transition-all"
              style={{
                background: selected === lang.code
                  ? 'rgba(212,175,55,0.12)'
                  : 'rgba(255,255,255,0.04)',
                border: selected === lang.code
                  ? '1px solid rgba(212,175,55,0.35)'
                  : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <span
                className="text-base font-medium block"
                style={{ color: selected === lang.code ? '#D4AF37' : 'rgba(255,255,255,0.75)' }}
              >
                {lang.native}
              </span>
            </button>
          ))}
        </div>

        <motion.button
          onClick={handleConfirm}
          disabled={!selected}
          className="w-full h-12 rounded-xl font-medium text-base flex items-center justify-center gap-2 transition-all"
          style={{
            background: selected
              ? 'linear-gradient(135deg, #f6d860 0%, #c9901d 100%)'
              : 'rgba(255,255,255,0.06)',
            color: selected ? '#0d1b2a' : 'rgba(255,255,255,0.25)',
            cursor: selected ? 'pointer' : 'not-allowed',
            boxShadow: selected ? '0 0 24px rgba(212,175,55,0.40)' : 'none'
          }}
        >
          {t('get_started')} <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}