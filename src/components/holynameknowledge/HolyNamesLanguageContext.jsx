import { createContext, useContext, useState } from "react";

export const HolyNamesLanguageContext = createContext({ language: "ml", setLanguage: () => {} });

export function useHolyNamesLanguagePreference() {
  const [language, setLanguageState] = useState(() => {
    try { return localStorage.getItem("holy-names-language") === "en" ? "en" : "ml"; }
    catch { return "ml"; }
  });
  const setLanguage = (nextLanguage) => {
    const normalized = nextLanguage === "en" ? "en" : "ml";
    setLanguageState(normalized);
    try { localStorage.setItem("holy-names-language", normalized); } catch { /* Keep this preference in memory when storage is unavailable. */ }
  };
  return [language, setLanguage];
}

export function useHolyNamesLanguage() {
  return useContext(HolyNamesLanguageContext);
}

export function HolyNamesLanguageToggle() {
  const { language, setLanguage } = useHolyNamesLanguage();
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border p-1" style={{ borderColor: "rgba(212,175,55,0.3)", background: "rgba(8,16,38,0.7)" }} role="group" aria-label="Holy Names language">
      {[{ id: "ml", label: "മലയാളം" }, { id: "en", label: "English" }].map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={language === option.id}
          onClick={() => setLanguage(option.id)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${option.id === "ml" ? "font-malayalam" : "font-inter"}`}
          style={{ color: language === option.id ? "#F5D060" : "rgba(255,255,255,0.62)", background: language === option.id ? "rgba(212,175,55,0.15)" : "transparent" }}
        >{option.label}</button>
      ))}
    </div>
  );
}
