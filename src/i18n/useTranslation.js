import translations from '@/i18n/translations';
import { useI18n } from '@/i18n/I18nContext';

/**
 * useTranslation — returns a t(key, fallback?) function
 * Usage: const { t } = useTranslation();  →  t('welcome_title')
 * For missing keys, returns fallback or key itself.
 */
function useTranslation() {
  const { language } = useI18n();

  function t(key, fallback) {
    const entry = translations[key];
    if (!entry) return fallback || key;
    return entry[language] || entry['en'] || fallback || key;
  }

  return { t, language };
}

export { useTranslation };
export default useTranslation;