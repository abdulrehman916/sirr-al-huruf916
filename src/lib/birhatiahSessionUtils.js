// Section C reader utilities. These are user-session mechanics, not manuscript rules.
// Never infer recitation counts from Abjad, inscription, or talisman numbers.
export function clampSessionMinutes(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(180, Math.max(1, Math.round(n))) : 5;
}

export function remainingSeconds(deadlineMs, nowMs = Date.now()) {
  if (!Number.isFinite(deadlineMs)) return 0;
  return Math.max(0, Math.ceil((deadlineMs - nowMs) / 1000));
}

export function formatSessionSeconds(value) {
  const seconds = Math.max(0, Math.floor(Number(value) || 0));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rem = seconds % 60;
  return (hours ? [hours, minutes, rem] : [minutes, rem])
    .map(v => String(v).padStart(2, '0')).join(':');
}

export function sourceRecitationGoal(count, countKind) {
  // An explicit sourced category is mandatory: never silently recast a count.
  if (countKind !== 'recitation') return null;
  const n = Number(count);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

export function sourceCountLabel(countKind, language = 'ml') {
  const ml = language === 'ml';
  switch (countKind) {
    case 'recitation': return ml ? 'ഉറവിടത്തിലെ പാരായണസംഖ്യ' : 'Source recitation count';
    case 'inscription':
    case 'writing':
    case 'written':
    case 'written_count': return ml ? 'ഉറവിടത്തിലെ എഴുത്തിന്റെ എണ്ണം' : 'Source inscription count';
    case 'abjad': return ml ? 'അബ്ജദ് മൂല്യം (പാരായണസംഖ്യയല്ല)' : 'Abjad value (not a recitation count)';
    default: return ml ? 'ഉറവിടത്തിലെ എണ്ണം (തരം സ്ഥിരീകരിച്ചിട്ടില്ല)' : 'Count in source (kind not classified)';
  }
}
