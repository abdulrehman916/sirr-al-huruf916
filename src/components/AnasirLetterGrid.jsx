import React from "react";

export default function AnasirLetterGrid({ letterDetails }) {
  if (!letterDetails || letterDetails.length === 0) return null;

  // Group letters by element
  const grouped = letterDetails.reduce((acc, item) => {
    if (!acc[item.element]) acc[item.element] = [];
    acc[item.element].push(item.letter);
    return acc;
  }, {});

  // Bound rendered cells for long texts, without dropping any counted letters.
  const compact = letterDetails.length > 500;
  const displayLetters = (letters) => compact
    ? Array.from(letters.reduce((frequencies, letter) =>
        frequencies.set(letter, (frequencies.get(letter) || 0) + 1), new Map()),
        ([letter, count]) => ({ letter, count }))
    : letters.map(letter => ({ letter, count: null }));

  const elementColors = {
    fire: '#ef4444',
    air: '#fbbf24',
    water: '#3b82f6',
    earth: '#84cc16'
  };

  const elementNames = {
    fire: 'Fire',
    air: 'Air',
    water: 'Water',
    earth: 'Earth'
  };

  return (
    <div className="space-y-3">
      <h3 className="font-inter text-[10px] uppercase tracking-widest text-white/50 font-semibold">Letter Distribution</h3>
      
      {Object.entries(grouped).map(([element, letters]) => (
        <div key={element} className="rounded-xl border p-3"
          style={{
            background: `linear-gradient(180deg, ${elementColors[element]}10 0%, ${elementColors[element]}05 100%)`,
            borderColor: `${elementColors[element]}40`
          }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-inter text-[9px] uppercase tracking-widest font-semibold"
              style={{ color: elementColors[element] }}>
              {elementNames[element]}
            </span>
            <span className="font-amiri text-sm font-bold text-white">
              {letters.length} letters
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {displayLetters(letters).map(({ letter, count }, i) => (
              <span key={i} className="min-w-7 px-1 h-7 rounded-lg flex items-center justify-center font-amiri text-lg font-bold"
                style={{
                  background: `${elementColors[element]}20`,
                  color: '#ffffff',
                  border: `1px solid ${elementColors[element]}30`
                }}>
                {letter}{count !== null && <small className="font-inter text-[10px] ml-1">×{count}</small>}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}