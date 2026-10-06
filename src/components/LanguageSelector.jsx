import React from 'react';
import { useI18n } from '@/i18n/I18nContext';
import useTranslation from '@/i18n/useTranslation';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'ml', labelKey: 'lang_malayalam', native: 'Malayalam' },
  { code: 'en', labelKey: 'lang_english', native: 'English' },
  { code: 'ar', labelKey: 'lang_arabic', native: 'Arabic' },
];

export default function LanguageSelector({ showTitle = true, onSelect, compact = false }) {
  const { language, setLanguage, langSet } = useI18n();
  const { t } = useTranslation();

  const handleSelect = (code) => {
    setLanguage(code);
    onSelect?.();
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            className={`px-2 py-1 text-xs rounded-md transition-all ${
              language === lang.code
                ? 'text-gold font-semibold'
                : 'opacity-50 hover:opacity-80'
            }`}
            style={{
              background: language === lang.code ? 'rgba(212,175,55,0.12)' : 'transparent',
              border: language === lang.code ? '1px solid rgba(212,175,55,0.3)' : '1px solid transparent'
            }}
          >
            {lang.native}
          </button>
        ))}
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        {showTitle && (
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4" style={{ color: 'rgba(212,175,55,0.70)' }} />
            <h3 className="font-inter text-sm font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>
              {t('lang_title')}
            </h3>
          </div>
        )}

        <div className="space-y-1">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all text-left"
              style={{
                background: language === lang.code
                  ? 'rgba(212,175,55,0.10)'
                  : 'rgba(255,255,255,0.03)',
                border: language === lang.code
                  ? '1px solid rgba(212,175,55,0.30)'
                  : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span
                className="text-sm"
                style={{ color: language === lang.code ? '#D4AF37' : 'rgba(255,255,255,0.70)' }}
                dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
              >
                {lang.native}
              </span>
              {language === lang.code && (
                <Check className="w-4 h-4" style={{ color: '#D4AF37' }} />
              )}
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}