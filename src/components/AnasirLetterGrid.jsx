import React from "react";

export default function AnasirLetterGrid({ letterDetails }) {
  if (!letterDetails || letterDetails.length === 0) return null;

  // Group letters by element
  const grouped = letterDetails.reduce((acc, item) => {
    if (!acc[item.element]) acc[item.element] = [];
    acc[item.element].push(item.letter);
    return acc;
  }, {});

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
            {letters.map((letter, i) => (
              <span key={i} className="w-7 h-7 rounded-lg flex items-center justify-center font-amiri text-lg font-bold"
                style={{
                  background: `${elementColors[element]}20`,
                  color: '#ffffff',
                  border: `1px solid ${elementColors[element]}30`
                }}>
                {letter}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}