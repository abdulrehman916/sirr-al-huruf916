import { useEffect, useRef, useState } from 'react';
import { useHolyNamesLanguage } from './HolyNamesLanguageContext';
import {
  clampSessionMinutes, formatSessionSeconds, remainingSeconds, sourceRecitationGoal,
} from '@/lib/birhatiahSessionUtils';

// Optional, strictly user-operated reading aid. No new ritual number/time is prescribed.
// Counter is manual; time is a personal countdown and is never sourced from Abjad.
export default function BirhatiahSessionTools({ sourceCount, sourceCountKind }) {
  const { language } = useHolyNamesLanguage();
  const ml = language === 'ml';
  const [repetitions, setRepetitions] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(300);
  const [running, setRunning] = useState(false);
  const deadline = useRef(null);
  const sourceGoal = sourceRecitationGoal(sourceCount, sourceCountKind);

  useEffect(() => {
    if (!running) return undefined;
    const interval = setInterval(() => {
      const next = remainingSeconds(deadline.current);
      setSeconds(next);
      if (next === 0) {
        deadline.current = null;
        setRunning(false);
      }
    }, 250);
    return () => clearInterval(interval);
  }, [running]);

  const start = () => {
    const duration = seconds > 0 ? seconds : minutes * 60;
    setSeconds(duration);
    deadline.current = Date.now() + duration * 1000;
    setRunning(true);
  };
  const pause = () => {
    if (running) setSeconds(remainingSeconds(deadline.current));
    deadline.current = null;
    setRunning(false);
  };
  const resetTime = () => {
    deadline.current = null;
    setRunning(false);
    setSeconds(minutes * 60);
  };
  const updateMinutes = (event) => {
    const next = clampSessionMinutes(event.target.value);
    setMinutes(next);
    setSeconds(next * 60);
  };

  return (
    <section className="rounded-xl border border-yellow-500/25 bg-black/20 p-3 space-y-3" data-testid="birhatiah-session-tools" data-timer-kind="personal-session">
      <h4 className="text-sm font-semibold text-yellow-100">{ml ? 'വ്യക്തിഗത പാരായണ കൗണ്ടറും ടൈമറും' : 'Personal reading counter and timer'}</h4>
      <p className="text-xs text-white/60 leading-relaxed">
        {ml
          ? 'ഇത് നിങ്ങൾക്ക് ഉപയോഗിക്കാനുള്ള ഐച്ഛിക ഉപകരണമാണ്. ടൈമറിന്റെ സമയം ഗ്രന്ഥം നിർദേശിച്ച മുഹൂർത്തമല്ല. അബ്ജദ് മൂല്യമോ എഴുതേണ്ട എണ്ണമോ സ്വയം ഓതൽഎണ്ണമാക്കുന്നില്ല. കാർഡ് അടച്ചാൽ ഈ സെഷന്റെ എണ്ണങ്ങൾ നിലനിൽക്കണമെന്നില്ല.'
          : 'An optional personal aid. The timer duration is not a source-prescribed clock hour. Abjad values and inscription counts are never treated as recitation targets. Session values may reset when the card closes.'}
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <div className="rounded-lg border border-yellow-500/15 p-3 min-w-32">
          <p className="text-xs text-white/55">{ml ? 'കൈകൊണ്ട് എണ്ണിയത്' : 'Manually counted'}</p>
          <p className="text-2xl font-mono text-yellow-100 tabular-nums" aria-live="polite">{repetitions}</p>
          {sourceGoal != null && <p className="text-xs text-white/60">{ml ? 'രേഖയിലെ ഓതൽലക്ഷ്യം' : 'Sourced reading target'}: {sourceGoal}</p>}
          {sourceGoal != null && <p className="text-xs text-white/50">{Math.min(100, Math.round(repetitions / sourceGoal * 100))}%</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded-lg bg-yellow-500/20 border border-yellow-400/30 px-4 py-2 text-yellow-100 font-semibold" onClick={() => setRepetitions(v => Math.min(Number.MAX_SAFE_INTEGER, v + 1))} aria-label={ml ? 'ഒന്ന് കൂട്ടുക' : 'Add one reading'}>+1</button>
          <button type="button" className="rounded-lg border border-white/20 px-3 py-2 text-white/85" onClick={() => setRepetitions(v => Math.max(0, v - 1))} aria-label={ml ? 'ഒന്ന് കുറയ്ക്കുക' : 'Subtract one reading'}>−1</button>
          <button type="button" className="rounded-lg border border-white/20 px-3 py-2 text-white/75" onClick={() => setRepetitions(0)}>{ml ? 'എണ്ണം പുനഃക്രമീകരിക്കുക' : 'Reset count'}</button>
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-3 border-t border-yellow-500/15 pt-3">
        <label className="text-xs text-white/70 space-y-1">
          <span className="block">{ml ? 'സ്വന്തമായി തിരഞ്ഞെടുക്കുന്ന മിനിറ്റ് (1–180)' : 'Personal duration in minutes (1–180)'}</span>
          <input type="number" min="1" max="180" step="1" value={minutes} disabled={running}
            onChange={updateMinutes} className="w-24 rounded-lg border border-white/20 bg-black/20 px-2 py-2 text-white" />
        </label>
        <div className="space-y-1">
          <p className="text-xs text-white/55">{ml ? 'ശേഷിക്കുന്ന സമയം' : 'Time remaining'}</p>
          <p className="font-mono text-2xl tabular-nums text-yellow-100" role="timer" aria-live="off">{formatSessionSeconds(seconds)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded-lg bg-yellow-500/20 border border-yellow-400/30 px-3 py-2 text-yellow-100" onClick={running ? pause : start}>
            {running ? (ml ? 'നിർത്തിവയ്ക്കുക' : 'Pause') : (ml ? 'ആരംഭിക്കുക' : 'Start')}
          </button>
          <button type="button" className="rounded-lg border border-white/20 px-3 py-2 text-white/85" onClick={resetTime}>
            {ml ? 'സമയം റീസെറ്റ്' : 'Reset timer'}
          </button>
        </div>
      </div>
      {!running && seconds === 0 && <p className="text-xs text-yellow-100" role="status">{ml ? 'തിരഞ്ഞെടുത്ത സമയം പൂർത്തിയായി' : 'Personal timer finished'}</p>}
    </section>
  );
}
