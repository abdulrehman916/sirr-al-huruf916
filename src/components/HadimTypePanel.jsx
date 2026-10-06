/**
 * HadimTypePanel
 * Displays one Hadim type result (Ulvi / Sufli / Sherli):
 *  - Original value + reduction formula
 *  - Positional step grid (Units → Thousands)
 *  - A) Separated ceremonial letters
 *  - B) Joined ceremonial form
 *  - Final Hadim Name (joined + ائيل)
 */
export default function HadimTypePanel({ typeData, isGrand }) {
  const { typeLabel, subtract, reduced, boosted, adjusted, original, istintaq } = typeData;
  const { steps, separatedLetters, joinedCeremonial, hadimName } = istintaq;

  const THEMES = {
    ULVI: {
      label: "ULVI HADIM", arabic: "علوي",
      border: "rgba(212,175,55,0.50)", bg: "rgba(212,175,55,0.08)",
      glow: "0 0 28px rgba(212,175,55,0.28)",
      nameBg: "rgba(212,175,55,0.14)", nameBorder: "rgba(212,175,55,0.45)",
      nameGlow: "0 0 32px rgba(212,175,55,0.60)",
      accent: "rgba(212,175,55,0.90)", accentDim: "rgba(212,175,55,0.50)",
      stepBg: "rgba(212,175,55,0.12)", stepBorder: "rgba(212,175,55,0.35)",
      formulaBg: "rgba(212,175,55,0.06)", formulaBorder: "rgba(212,175,55,0.22)",
    },
    SUFLI: {
      label: "SUFLI HADIM", arabic: "سفلي",
      border: "rgba(220,38,38,0.50)", bg: "rgba(220,38,38,0.07)",
      glow: "0 0 28px rgba(220,38,38,0.22)",
      nameBg: "rgba(220,38,38,0.14)", nameBorder: "rgba(220,38,38,0.45)",
      nameGlow: "0 0 32px rgba(220,38,38,0.55)",
      accent: "rgba(252,165,165,0.90)", accentDim: "rgba(252,165,165,0.50)",
      stepBg: "rgba(220,38,38,0.12)", stepBorder: "rgba(220,38,38,0.35)",
      formulaBg: "rgba(220,38,38,0.06)", formulaBorder: "rgba(220,38,38,0.22)",
    },
    SHERLI: {
      label: "SHERLI HADIM", arabic: "شرلي",
      border: "rgba(168,85,247,0.50)", bg: "rgba(168,85,247,0.07)",
      glow: "0 0 28px rgba(168,85,247,0.22)",
      nameBg: "rgba(168,85,247,0.14)", nameBorder: "rgba(168,85,247,0.45)",
      nameGlow: "0 0 32px rgba(168,85,247,0.55)",
      accent: "rgba(216,180,254,0.90)", accentDim: "rgba(216,180,254,0.50)",
      stepBg: "rgba(168,85,247,0.12)", stepBorder: "rgba(168,85,247,0.35)",
      formulaBg: "rgba(168,85,247,0.06)", formulaBorder: "rgba(168,85,247,0.22)",
    },
  };

  const t = THEMES[typeLabel] || THEMES.ULVI;

  return (
    <div className="rounded-xl border p-3 space-y-2.5"
      style={{ background: t.bg, borderColor: t.border, boxShadow: t.glow }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="font-inter text-[9px] font-bold uppercase tracking-widest block" style={{ color: t.accent }}>{t.label}</span>
          <span className="font-amiri text-[11px]" style={{ color: t.accentDim }}>{t.arabic}</span>
        </div>
        {isGrand && (
          <span className="font-inter text-[7px] uppercase tracking-widest px-1.5 py-0.5 rounded-full" style={{ background: t.stepBg, color: t.accent, border: `1px solid ${t.stepBorder}` }}>Grand</span>
        )}
      </div>

      {/* Formula */}
      <div className="rounded-lg px-3 py-2 text-center"
        style={{ background: t.formulaBg, border: `1px solid ${t.formulaBorder}` }}>
        {boosted ? (
          <span className="font-inter text-[10px]" style={{ color: t.accentDim }}>
            ({original} + 361 = {adjusted}) − {subtract} = <strong style={{ color: t.accent }}>{reduced}</strong>
          </span>
        ) : (
          <span className="font-inter text-[10px]" style={{ color: t.accentDim }}>
            {original} − {subtract} = <strong style={{ color: t.accent }}>{reduced}</strong>
          </span>
        )}
      </div>

      {/* Positional steps */}
      {steps.length > 0 && (
        <div className="flex flex-wrap gap-1.5 justify-center">
          {[...steps].reverse().map((step, i) => (
            <div key={i} className="rounded-lg px-2 py-1.5 text-center min-w-[42px]"
              style={{ background: t.stepBg, border: `1px solid ${t.stepBorder}` }}>
              <div className="font-amiri text-sm font-bold" style={{ color: t.accent }}>{step.letters || '—'}</div>
              <div className="font-inter text-[7px] uppercase" style={{ color: t.accentDim }}>{step.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Ceremonial letters */}
      <div className="space-y-1.5">
        <div className="rounded-lg px-3 py-1.5" style={{ background: t.formulaBg, border: `1px solid ${t.formulaBorder}` }}>
          <span className="font-inter text-[8px] uppercase tracking-widest block mb-0.5" style={{ color: t.accentDim }}>A) Separated</span>
          <span className="font-amiri text-base" dir="rtl" style={{ color: t.accent }}>{separatedLetters || '—'}</span>
        </div>
        <div className="rounded-lg px-3 py-1.5" style={{ background: t.formulaBg, border: `1px solid ${t.formulaBorder}` }}>
          <span className="font-inter text-[8px] uppercase tracking-widest block mb-0.5" style={{ color: t.accentDim }}>B) Joined</span>
          <span className="font-amiri text-base" dir="rtl" style={{ color: t.accent }}>{joinedCeremonial || '—'}</span>
        </div>
      </div>

      {/* Final Hadim Name */}
      <div className="rounded-xl px-4 py-3 text-center"
        style={{ background: t.nameBg, border: `1px solid ${t.nameBorder}`, boxShadow: t.nameGlow }}>
        <span className="font-inter text-[7px] uppercase tracking-widest block mb-1" style={{ color: t.accentDim }}>Hadim Name</span>
        <span className="font-amiri text-xl font-bold" dir="rtl" style={{ color: t.accent }}>{hadimName}</span>
      </div>
    </div>
  );
}