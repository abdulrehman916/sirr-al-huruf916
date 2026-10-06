import { Moon } from "lucide-react";
import { G, T, Box } from "../v3/shared";
import SourcesCollapse from "./SourcesCollapse";
import { analyzeMoonCompatibility, findNextSuitableMoonTime } from "@/lib/ritualTimingEngineV3";

// CARD 4 — MOON ANALYSIS (optional, user-enabled)
// Moon only: current moon + mansion, Purpose compatibility, and the Final Moon
// Verdict, plus the next suitable moon. No weekday/planet analysis (those live
// on Cards 1/3). All from imported book rules — "No matching rule found in the
// imported sources." when no moon rule exists (never invented).
export default function Card4MoonAnalysis({ analysis, open, onToggle, lang }) {
  const moon = analysis?.moonPhase || {};
  const moonReq = analysis?.moonReq || {};
  const req = analysis?.req || {};
  const citations = analysis?.moonCitations || [];
  const mc = analyzeMoonCompatibility({ moonReq, moonPhase: moon, moonCitations: citations });
  const future = mc.hasMoonRules ? findNextSuitableMoonTime({ req, moonReq, fromDate: new Date() }) : null;
  const moonTxt = [moon.moonSign, moon.phaseName, moon.moonIllumination != null ? `${Math.round(moon.moonIllumination)}%` : ""].filter(Boolean).join(" · ");

  const purposeCompat = mc.hasMoonRules ? (mc.compatible ? { c: "#4ADE80", t: T("Compatible", "അനുയോജ്യം", lang) } : { c: "#F87171", t: T("Not Compatible", "അനുയോജ്യമല്ല", lang) }) : { c: "#94A3B8", t: T("No Moon rule", "ചന്ദ്ര നിയമമില്ല", lang) };
  const finalVerdict = !mc.hasMoonRules
    ? { c: "#94A3B8", t: T("No Moon restriction — timing based on Day + Saat + Kawkab only.", "ചന്ദ്ര നിയന്ത്രണമില്ല — സമയം ദിവസം + സാഅത്ത് + കൗകബ് മാത്രം അടിസ്ഥാനമാക്കി.", lang) }
    : mc.compatible
      ? { c: "#4ADE80", t: T("Moon conditions are compatible with this ritual.", "ചന്ദ്ര വ്യവസ്ഥകൾ ഈ കർമ്മവുമായി അനുയോജ്യമാണ്.", lang) }
      : { c: "#F87171", t: T("Moon conditions are NOT compatible with this ritual.", "ചന്ദ്ര വ്യവസ്ഥകൾ ഈ കർമ്മവുമായി അനുയോജ്യമല്ല.", lang) };

  const Dim = ({ label, compat, detail }) => (
    <div className="rounded-lg p-2.5" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
      <p className="font-inter text-[9px] uppercase tracking-wider mb-0.5" style={{ color: G.dim }}>{label}</p>
      <p className="font-inter text-xs font-bold" style={{ color: compat.c }}>{compat.t}</p>
      {detail && <p className={lang === "ml" ? "font-malayalam text-[10px] mt-0.5" : "font-inter text-[10px] mt-0.5"} style={{ color: "rgba(255,255,255,0.62)" }}>{detail}</p>}
    </div>
  );

  return (
    <Box number={4} titleEn="Moon Analysis" titleMl="ചന്ദ്ര വിശകലനം" icon={Moon} lang={lang}>
      {!open ? (
        <button onClick={onToggle} className="w-full rounded-xl p-3 text-left" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
          <p className="font-inter text-xs font-bold" style={{ color: G.text }}>{T("Open Moon Module", "ചന്ദ്ര മൊഡ്യൂൾ തുറക്കുക", lang)}</p>
        </button>
      ) : (
        <div className="space-y-2.5">
          <div className="rounded-xl p-3" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
            <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Current Moon / Mansion", "നിലവിലെ ചന്ദ്രൻ / നക്ഷത്രം", lang)}</p>
            <p className="font-amiri text-base font-bold" style={{ color: "#fff" }} dir="rtl">{moon.moonMansionArabic ? `${moon.moonMansionArabic} (${moon.moonMansion || "—"})` : (moon.moonMansion || "—")}</p>
            <p className="font-inter text-[10px]" style={{ color: G.dim }}>{moonTxt || "—"}</p>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Dim label={T("Purpose Compatibility", "ലക്ഷ്യ പൊരുത്തം", lang)} compat={purposeCompat} detail={mc.hasMoonRules && mc.checks?.length ? mc.checks.map(c => `${c.status === "pass" ? "✓" : "✗"} ${c.label}: ${c.current}`).join(" · ") : ""} />
            <div className="rounded-xl p-3" style={{ background: `${finalVerdict.c}12`, border: `1px solid ${finalVerdict.c}45` }}>
              <p className="font-inter text-[9px] uppercase tracking-wider mb-0.5" style={{ color: G.dim }}>{T("Final Moon Verdict", "അന്തിമ ചന്ദ്ര വിധി", lang)}</p>
              <p className={lang === "ml" ? "font-malayalam text-sm font-bold" : "font-inter text-sm font-bold"} style={{ color: finalVerdict.c }}>{finalVerdict.t}</p>
            </div>
          </div>

          {future && (
            <p className={lang === "ml" ? "font-malayalam text-[11px]" : "font-inter text-[11px]"} style={{ color: "rgba(255,255,255,0.72)" }}>
              {T("Next suitable moon", "അടുത്ത അനുയോജ്യ ചന്ദ്രൻ", lang)}: {future.date} · {future.moonMansionArabic || future.moonMansion || "—"}
            </p>
          )}
          <SourcesCollapse sources={citations} lang={lang} />
          <button onClick={onToggle} className="font-inter text-[10px]" style={{ color: G.dim }}>{T("Close", "അടയ്ക്കുക", lang)}</button>
        </div>
      )}
    </Box>
  );
}